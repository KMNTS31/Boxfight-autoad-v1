import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const storedTokensTable = pgTable("stored_tokens", {
  id: serial("id").primaryKey(),
  discordUserId: text("discord_user_id").notNull(),
  discordUsername: text("discord_username").notNull(),
  discordAvatar: text("discord_avatar"),
  token: text("token").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
  addedByDiscordId: text("added_by_discord_id").notNull(),
  addedByUsername: text("added_by_username").notNull(),
  lastValidated: timestamp("last_validated"),
});

export const insertStoredTokenSchema = createInsertSchema(storedTokensTable).omit({
  id: true,
  addedAt: true,
});
export type InsertStoredToken = z.infer<typeof insertStoredTokenSchema>;
export type StoredToken = typeof storedTokensTable.$inferSelect;
