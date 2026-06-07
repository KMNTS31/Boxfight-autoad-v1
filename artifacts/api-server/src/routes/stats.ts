import { Router } from "express";
import { db, authorizedUsersTable, storedTokensTable, messageJobsTable } from "@workspace/db";
import { eq, count, sum } from "drizzle-orm";
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

// GET /api/stats
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const [authUsers] = await db.select({ count: count() }).from(authorizedUsersTable);
    const [tokens] = await db.select({ count: count() }).from(storedTokensTable);
    const [activeJobs] = await db
      .select({ count: count() })
      .from(messageJobsTable)
      .where(eq(messageJobsTable.status, "running"));
    const [msgSent] = await db
      .select({ total: sum(messageJobsTable.sentCount) })
      .from(messageJobsTable);

    res.json({
      totalAuthorizedUsers: authUsers.count,
      totalTokens: tokens.count,
      activeJobs: activeJobs.count,
      totalMessagesSent: Number(msgSent.total ?? 0),
    });
  } catch (err) {
    logger.error({ err }, "Stats error");
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
