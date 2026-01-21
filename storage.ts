import { db } from "./db";
import { spins, users, type Spin, type InsertSpin, type User } from "@shared/schema";
import { desc, sql } from "drizzle-orm";

export class DatabaseStorage {
  async getUser(): Promise<User> {
    const [user] = await db.select().from(users).limit(1);
    if (!user) {
      const [newUser] = await db
        .insert(users)
        .values({ coins: 10000, freeSpins: 0 })
        .returning();
      return newUser;
    }
    return user;
  }

  async updateUserBalance(coinDelta: number, freeSpinDelta: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        coins: sql`${users.coins} + ${coinDelta}`,
        freeSpins: sql`${users.freeSpins} + ${freeSpinDelta}`,
      })
      .returning();
    return user;
  }

  async topUp(amount: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ coins: sql`${users.coins} + ${amount}` })
      .returning();
    return user;
  }

  async withdraw(amount: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ coins: sql`${users.coins} - ${amount}` })
      .returning();
    return user;
  }

  async createSpin(insertSpin: InsertSpin): Promise<Spin> {
    const [spin] = await db.insert(spins).values(insertSpin).returning();
    return spin;
  }

  async getTotalSpinCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(spins);
    return Number(result?.count || 0);
  }

  async getSpins(): Promise<Spin[]> {
    return await db
      .select()
      .from(spins)
      .orderBy(desc(spins.createdAt))
      .limit(10);
  }
}

export const storage = new DatabaseStorage();
