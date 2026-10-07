import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { ORDER_STATUSES } from "@/lib/order-status";

export const DOC_TYPES = ["paper", "proposal", "slides", "figure"] as const;

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  title: text("title").notNull(),
  docType: text("doc_type", { enum: DOC_TYPES }).notNull(),
  wordCount: integer("word_count").notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
  requirements: text("requirements").notNull().default(""),
  status: text("status", { enum: ORDER_STATUSES }).notNull().default("submitted"),
  draft: text("draft"),
  reviewNote: text("review_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Order = typeof orders.$inferSelect;
