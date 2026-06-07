import { db, messageJobsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

// In-memory map of active timers per job ID
const activeTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function startJob(jobId: string) {
  stopJob(jobId); // clear any existing timer first

  const run = async () => {
    const jobs = await db
      .select()
      .from(messageJobsTable)
      .where(eq(messageJobsTable.id, jobId))
      .limit(1);

    const job = jobs[0];
    if (!job || job.status !== "running") return;

    try {
      const res = await fetch(`https://discord.com/api/v10/channels/${job.channelId}/messages`, {
        method: "POST",
        headers: {
          Authorization: job.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: job.message }),
      });

      if (!res.ok) {
        const body = await res.text();
        logger.warn({ jobId, status: res.status, body }, "Message send failed");
        // Mark failed if 401/403
        if (res.status === 401 || res.status === 403) {
          await db
            .update(messageJobsTable)
            .set({ status: "failed" })
            .where(eq(messageJobsTable.id, jobId));
          stopJob(jobId);
          return;
        }
      } else {
        const newSentCount = job.sentCount + 1;
        const isDone =
          job.repeatCount > 0 && newSentCount >= job.repeatCount;

        await db
          .update(messageJobsTable)
          .set({
            sentCount: newSentCount,
            status: isDone ? "completed" : "running",
          })
          .where(eq(messageJobsTable.id, jobId));

        if (isDone) {
          stopJob(jobId);
          return;
        }
      }
    } catch (err) {
      logger.error({ err, jobId }, "Job execution error");
    }

    // Schedule next run
    const timer = setTimeout(run, job.intervalSeconds * 1000);
    activeTimers.set(jobId, timer);
  };

  // Get job to find delay
  db.select()
    .from(messageJobsTable)
    .where(eq(messageJobsTable.id, jobId))
    .limit(1)
    .then(async (jobs) => {
      const job = jobs[0];
      if (!job) return;
      await db
        .update(messageJobsTable)
        .set({ status: "running" })
        .where(eq(messageJobsTable.id, jobId));
      const timer = setTimeout(run, job.delaySeconds * 1000);
      activeTimers.set(jobId, timer);
    })
    .catch((err) => logger.error({ err, jobId }, "Failed to start job"));
}

export function stopJob(jobId: string) {
  const timer = activeTimers.get(jobId);
  if (timer) {
    clearTimeout(timer);
    activeTimers.delete(jobId);
  }
}

export function getActiveJobIds(): string[] {
  return Array.from(activeTimers.keys());
}
