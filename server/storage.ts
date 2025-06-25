import { 
  users, 
  userMetrics,
  type User, 
  type UpsertUser, 
  type UserMetrics,
  type InsertUserMetrics 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations for Google OAuth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User metrics operations
  getUserMetrics(userId: string): Promise<UserMetrics | undefined>;
  saveUserMetrics(metrics: InsertUserMetrics): Promise<UserMetrics>;
  getLatestUserMetrics(userId: string): Promise<UserMetrics | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations for Google OAuth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // User metrics operations
  async getUserMetrics(userId: string): Promise<UserMetrics | undefined> {
    const [metrics] = await db
      .select()
      .from(userMetrics)
      .where(eq(userMetrics.userId, userId))
      .orderBy(userMetrics.createdAt)
      .limit(1);
    return metrics;
  }

  async saveUserMetrics(metrics: InsertUserMetrics): Promise<UserMetrics> {
    const [savedMetrics] = await db
      .insert(userMetrics)
      .values(metrics)
      .returning();
    return savedMetrics;
  }

  async getLatestUserMetrics(userId: string): Promise<UserMetrics | undefined> {
    const [metrics] = await db
      .select()
      .from(userMetrics)
      .where(eq(userMetrics.userId, userId))
      .orderBy(userMetrics.createdAt)
      .limit(1);
    return metrics;
  }
}

export const storage = new DatabaseStorage();
