import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  coins: integer("coins").notNull(),
  freeSpins: integer("free_spins").notNull(),
});

export const spins = pgTable("spins", {
  id: serial("id").primaryKey(),
  result: text("result").notNull(),
  coinDelta: integer("coin_delta").notNull(),
  freeSpinDelta: integer("free_spin_delta").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Spin = typeof spins.$inferSelect;
export type InsertSpin = typeof spins.$inferInsert;
