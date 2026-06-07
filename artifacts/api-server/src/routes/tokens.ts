import { Router } from "express";
import { db, storedTokensTable } from "@workspace/db";
import { eq } from "drizzle-orm";
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

// POST /api/tokens/validate
router.post("/tokens/validate", requireAuth, async (req, res) => {
  try {
    const sessionUser = (req.session as any).user;
    const { token } = req.body as { token: string };

    if (!token) {
      res.status(400).json({ error: "token is required" });
      return;
    }

    // Validate against Discord API using the user token
    const discordRes = await fetch("https://discord.com/api/v10/users/@me", {
      headers: {
        Authorization: token,
      },
    });

    if (!discordRes.ok) {
      res.json({
        valid: false,
        message: "Invalid token — Discord rejected it",
      });
      return;
    }

    const discordUser = (await discordRes.json()) as {
      id: string;
      username: string;
      discriminator: string;
      avatar: string | null;
    };

    // Upsert the token in the DB
    const existing = await db
      .select()
      .from(storedTokensTable)
      .where(eq(storedTokensTable.discordUserId, discordUser.id))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(storedTokensTable)
        .set({
          token,
          discordUsername: discordUser.username,
          discordAvatar: discordUser.avatar,
          addedByDiscordId: sessionUser.id,
          addedByUsername: sessionUser.username,
          lastValidated: new Date(),
        })
        .where(eq(storedTokensTable.discordUserId, discordUser.id));
    } else {
      await db.insert(storedTokensTable).values({
        discordUserId: discordUser.id,
        discordUsername: discordUser.username,
        discordAvatar: discordUser.avatar ?? null,
        token,
        addedByDiscordId: sessionUser.id,
        addedByUsername: sessionUser.username,
        lastValidated: new Date(),
      });
    }

    res.json({
      valid: true,
      discordUserId: discordUser.id,
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      avatar: discordUser.avatar,
      message: "Token is valid",
    });
  } catch (err) {
    logger.error({ err }, "Token validate error");
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/tokens (admin only)
router.get("/tokens", requireAuth, requireAdmin, async (req, res) => {
  try {
    const tokens = await db.select().from(storedTokensTable);
    res.json(
      tokens.map((t) => ({
        ...t,
        addedAt: t.addedAt.toISOString(),
        lastValidated: t.lastValidated?.toISOString() ?? null,
      }))
    );
  } catch (err) {
    logger.error({ err }, "List tokens error");
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
