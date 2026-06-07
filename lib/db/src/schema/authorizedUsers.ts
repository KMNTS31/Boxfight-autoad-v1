import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const authorizedUsersTable = pgTable("authorized_users", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").notNull().unique(),
  username: text("username").notNull(),
  avatar: text("avatar"),
  authorizedBy: text("authorized_by").notNull(),
  authorizedAt: timestamp("authorized_at").defaultNow().notNull(),
  notes: text("notes"),
});

export const insertAuthorizedUserSchema = createInsertSchema(authorizedUsersTable).omit({
  id: true,
  authorizedAt: true,
});
export type InsertAuthorizedUser = z.infer<typeof insertAuthorizedUserSchema>;
export type AuthorizedUser = typeof authorizedUsersTable.$inferSelect;
