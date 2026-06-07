import { Router } from "express";
import { db, authorizedUsersTable, storedTokensTable, messageJobsTable } from "@workspace/db";
import { eq, count, sum, ne } from "drizzle-orm";
import { logger } from "../lib/logger";

const ADMIN_IDS = ["1474928810888532061", "1487904327816446233", "1505595777286672485"];

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const user = req.session?.user;
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

// GET /api/stats — public fields for all auth users, extended fields for admins
router.get("/stats", requireAuth, async (req, res) => {
  try {
    const sessionUser = (req.session as any).user;
    const isAdmin = ADMIN_IDS.includes(sessionUser.id);

    const [authUsers] = await db.select({ count: count() }).from(authorizedUsersTable);
    const [activeJobs] = await db
      .select({ count: count() })
      .from(messageJobsTable)
      .where(eq(messageJobsTable.status, "running"));
    const [msgSent] = await db.select({ total: sum(messageJobsTable.sentCount) }).from(messageJobsTable);

    const base = {
      totalAuthorizedUsers: authUsers.count,
      activeJobs: activeJobs.count,
      totalMessagesSent: Number(msgSent.total ?? 0),
    };

    if (!isAdmin) {
      res.json(base);
      return;
    }

    // Admin-only extended stats
    const [tokens] = await db.select({ count: count() }).from(storedTokensTable);
    const [pendingJobs] = await db
      .select({ count: count() })
      .from(messageJobsTable)
      .where(eq(messageJobsTable.status, "pending"));
    const [stoppedJobs] = await db
      .select({ count: count() })
      .from(messageJobsTable)
      .where(eq(messageJobsTable.status, "stopped"));
    const [completedJobs] = await db
      .select({ count: count() })
      .from(messageJobsTable)
      .where(eq(messageJobsTable.status, "completed"));
    const [totalJobs] = await db.select({ count: count() }).from(messageJobsTable);

    res.json({
      ...base,
      totalTokens: tokens.count,
      totalJobs: totalJobs.count,
      pendingJobs: pendingJobs.count,
      stoppedJobs: stoppedJobs.count,
      completedJobs: completedJobs.count,
    });
  } catch (err) {
    logger.error({ err }, "Stats error");
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
