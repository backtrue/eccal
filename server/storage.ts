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
    // Check if user already exists
    const existingUser = await this.getUser(userData.id);
    const isNewUser = !existingUser;

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

    // If this is a new user and they have an email, add them to Brevo
    if (isNewUser && user.email) {
      try {
        await brevoService.addContactToList({
          email: user.email,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          gaResourceName: '', // Will be updated later when they select GA resource
        });
      } catch (error) {
        console.error('Failed to add user to Brevo:', error);
        // Don't fail the user creation if Brevo fails
      }
    }

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

    // Update Brevo with GA resource name when user saves metrics
    if (metrics.userId && metrics.gaResourceName) {
      try {
        const user = await this.getUser(metrics.userId);
        if (user?.email) {
          await brevoService.addContactToList({
            email: user.email,
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
            gaResourceName: metrics.gaResourceName,
          });
        }
      } catch (error) {
        console.error('Failed to update Brevo with GA resource name:', error);
        // Don't fail the metrics save if Brevo fails
      }
    }

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
