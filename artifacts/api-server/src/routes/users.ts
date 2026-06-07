import { Router } from "express";
import { db, authorizedUsersTable } from "@workspace/db";
import { eq, ilike, or } from "drizzle-orm";
import { logger } from "../lib/logger";

const ADMIN_IDS = ["1474928810888532061", "1487904327816446233", "1505595777286672485"];

const router = Router();

function requireAdmin(req: any, res: any, next: any) {
  const user = req.session?.user;
  if (!user || !ADMIN_IDS.includes(user.id)) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

function requireAuth(req: any, res: any, next: any) {
  const user = req.session?.user;
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

// GET /api/users/authorized
router.get("/users/authorized", requireAuth, requireAdmin, async (req, res) => {
  try {
    const search = req.query.search as string | undefined;
    let users;
    if (search) {
      users = await db
        .select()
        .from(authorizedUsersTable)
        .where(
          or(
            ilike(authorizedUsersTable.username, `%${search}%`),
            ilike(authorizedUsersTable.discordId, `%${search}%`)
          )
        );
    } else {
      users = await db.select().from(authorizedUsersTable);
    }
    res.json(
      users.map((u) => ({
        ...u,
        authorizedAt: u.authorizedAt.toISOString(),
      }))
    );
  } catch (err) {
    logger.error({ err }, "List authorized users error");
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/users/authorized
router.post("/users/authorized", requireAuth, requireAdmin, async (req, res) => {
  try {
    const sessionUser = (req.session as any).user;
    const { discordId, username, avatar, notes } = req.body as {
      discordId: string;
      username?: string;
      avatar?: string;
      notes?: string;
    };

    if (!discordId) {
      res.status(400).json({ error: "discordId is required" });
      return;
    }

    const [created] = await db
      .insert(authorizedUsersTable)
      .values({
        discordId,
        username: username || discordId,
        avatar: avatar ?? null,
        authorizedBy: sessionUser.username,
        notes: notes ?? null,
      })
      .onConflictDoNothing()
      .returning();

    if (!created) {
      res.status(409).json({ error: "User already authorized" });
      return;
    }

    res.status(201).json({
      ...created,
      authorizedAt: created.authorizedAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "Add authorized user error");
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/users/authorized/:discordId
router.delete("/users/authorized/:discordId", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { discordId } = req.params;
    await db
      .delete(authorizedUsersTable)
      .where(eq(authorizedUsersTable.discordId, discordId));
    res.json({ success: true, message: "User removed" });
  } catch (err) {
    logger.error({ err }, "Remove authorized user error");
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
