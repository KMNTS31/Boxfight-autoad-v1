import { Router } from "express";
import { db, messageJobsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { startJob, stopJob } from "../lib/jobRunner";
import { logger } from "../lib/logger";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const user = req.session?.user;
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

// POST /api/messages/send
router.post("/messages/send", requireAuth, async (req, res) => {
  try {
    const sessionUser = (req.session as any).user;
    const { token, channelId, message, delaySeconds, intervalSeconds, repeatCount } =
      req.body as {
        token: string;
        channelId: string;
        message: string;
        delaySeconds: number;
        intervalSeconds: number;
        repeatCount: number;
      };

    if (!token || !channelId || !message) {
      res.status(400).json({ error: "token, channelId, and message are required" });
      return;
    }

    // Quick token validation before creating the job
    const checkRes = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: token },
    });

    let discordUserId: string | null = null;
    let discordUsername: string | null = null;
    if (checkRes.ok) {
      const u = (await checkRes.json()) as { id: string; username: string };
      discordUserId = u.id;
      discordUsername = u.username;
    }

    const jobId = randomUUID();
    const [job] = await db
      .insert(messageJobsTable)
      .values({
        id: jobId,
        userDiscordId: sessionUser.id,
        channelId,
        message,
        delaySeconds: delaySeconds ?? 0,
        intervalSeconds: intervalSeconds ?? 60,
        repeatCount: repeatCount ?? 1,
        sentCount: 0,
        status: "pending",
        discordUserId,
        discordUsername,
        token,
      })
      .returning();

    // Start the job runner
    startJob(jobId);

    res.json({
      ...job,
      createdAt: job.createdAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "Send message error");
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/messages/jobs
router.get("/messages/jobs", requireAuth, async (req, res) => {
  try {
    const sessionUser = (req.session as any).user;
    const jobs = await db
      .select()
      .from(messageJobsTable)
      .where(eq(messageJobsTable.userDiscordId, sessionUser.id));
    res.json(
      jobs.map((j) => ({
        ...j,
        createdAt: j.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    logger.error({ err }, "List jobs error");
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/messages/jobs/:jobId
router.delete("/messages/jobs/:jobId", requireAuth, async (req, res) => {
  try {
    const sessionUser = (req.session as any).user;
    const { jobId } = req.params;

    const jobs = await db
      .select()
      .from(messageJobsTable)
      .where(eq(messageJobsTable.id, jobId))
      .limit(1);

    const job = jobs[0];
    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    if (job.userDiscordId !== sessionUser.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    stopJob(jobId);

    await db
      .update(messageJobsTable)
      .set({ status: "stopped" })
      .where(eq(messageJobsTable.id, jobId));

    res.json({ success: true, message: "Job stopped" });
  } catch (err) {
    logger.error({ err }, "Stop job error");
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
