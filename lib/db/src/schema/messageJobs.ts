import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const messageJobsTable = pgTable("message_jobs", {
  id: text("id").primaryKey(),
  userDiscordId: text("user_discord_id").notNull(),
  channelId: text("channel_id").notNull(),
  message: text("message").notNull(),
  delaySeconds: integer("delay_seconds").notNull().default(0),
  intervalSeconds: integer("interval_seconds").notNull().default(60),
  repeatCount: integer("repeat_count").notNull().default(1),
  sentCount: integer("sent_count").notNull().default(0),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  discordUserId: text("discord_user_id"),
  discordUsername: text("discord_username"),
  token: text("token").notNull(),
});

export const insertMessageJobSchema = createInsertSchema(messageJobsTable).omit({
  sentCount: true,
  createdAt: true,
});
export type InsertMessageJob = z.infer<typeof insertMessageJobSchema>;
export type MessageJob = typeof messageJobsTable.$inferSelect;
