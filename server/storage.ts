import {
  users,
  type User,
  type UpsertUser,
  userMetrics,
  type UserMetrics,
  type InsertUserMetrics,
  userCredits,
  type UserCredits,
  type InsertUserCredits,
  creditTransactions,
  type CreditTransaction,
  type InsertCreditTransaction,
  userReferrals,
  type UserReferral,
  type InsertUserReferral,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

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
  
  // Credit system operations
  getUserCredits(userId: string): Promise<UserCredits | undefined>;
  createUserCredits(userId: string): Promise<UserCredits>;
  updateUserCredits(userId: string, balance: number, totalEarned?: number, totalSpent?: number): Promise<UserCredits>;
  addCreditTransaction(transaction: InsertCreditTransaction): Promise<CreditTransaction>;
  getCreditTransactions(userId: string): Promise<CreditTransaction[]>;
  
  // Referral system operations
  createReferralCode(userId: string): Promise<string>;
  processReferral(referralCode: string, newUserId: string): Promise<UserReferral | null>;
  getReferralsByUser(userId: string): Promise<UserReferral[]>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  
  // Membership operations
  upgradeToPro(userId: string, durationDays: number): Promise<User>;
  checkMembershipStatus(userId: string): Promise<{ level: "free" | "pro"; isActive: boolean; expiresAt?: Date }>;
  
  // Admin operations
  addCreditsToAllUsers(amount: number, description: string): Promise<number>;
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

    // Create initial credits for new users
    if (isNewUser) {
      try {
        await this.createUserCredits(user.id);
      } catch (error) {
        console.error('Failed to create initial credits for user:', error);
      }
    }
    
    // Add to Brevo if this is a new user with email
    if (isNewUser && user.email) {
      try {
        const { brevoService } = await import("./brevoService");
        await brevoService.addContactToList({
          email: user.email,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          gaResourceName: '', // Will be updated later when they select GA resource
        });
        console.log('Added new user to Brevo:', user.email);
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

    // Note: Brevo service temporarily disabled due to IP whitelist requirements

    return savedMetrics;
  }

  async getLatestUserMetrics(userId: string): Promise<UserMetrics | undefined> {
    const [metrics] = await db
      .select()
      .from(userMetrics)
      .where(eq(userMetrics.userId, userId))
      .orderBy(desc(userMetrics.createdAt))
      .limit(1);
    return metrics;
  }

  // Credit system operations
  async getUserCredits(userId: string): Promise<UserCredits | undefined> {
    const [credits] = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId));
    return credits;
  }

  async createUserCredits(userId: string): Promise<UserCredits> {
    const [credits] = await db
      .insert(userCredits)
      .values({
        userId,
        balance: 5,
        totalEarned: 5,
        totalSpent: 0,
      })
      .returning();
    
    // Add initial registration credit transaction
    await this.addCreditTransaction({
      userId,
      type: "earn",
      amount: 5,
      source: "registration",
      description: "Welcome bonus",
    });
    
    return credits;
  }

  async updateUserCredits(userId: string, balance: number, totalEarned?: number, totalSpent?: number): Promise<UserCredits> {
    const updateData: any = { balance, updatedAt: new Date() };
    if (totalEarned !== undefined) updateData.totalEarned = totalEarned;
    if (totalSpent !== undefined) updateData.totalSpent = totalSpent;
    
    const [credits] = await db
      .update(userCredits)
      .set(updateData)
      .where(eq(userCredits.userId, userId))
      .returning();
    return credits;
  }

  async addCreditTransaction(transaction: InsertCreditTransaction): Promise<CreditTransaction> {
    const [newTransaction] = await db
      .insert(creditTransactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getCreditTransactions(userId: string): Promise<CreditTransaction[]> {
    return await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .orderBy(desc(creditTransactions.createdAt));
  }

  // Referral system operations
  async createReferralCode(userId: string): Promise<string> {
    const referralCode = `ref_${userId.slice(0, 8)}_${Date.now().toString(36)}`;
    return referralCode;
  }

  async processReferral(referralCode: string, newUserId: string): Promise<UserReferral | null> {
    // Find the referrer
    const [existingReferral] = await db
      .select()
      .from(userReferrals)
      .where(eq(userReferrals.referralCode, referralCode));
    
    if (!existingReferral) {
      // Create new referral record if referral code is valid format
      const referrerId = this.extractUserIdFromReferralCode(referralCode);
      if (!referrerId) return null;
      
      // Check if referrer exists
      const referrer = await this.getUser(referrerId);
      if (!referrer) return null;
      
      // Create referral record
      const [referral] = await db
        .insert(userReferrals)
        .values({
          referrerId,
          referredUserId: newUserId,
          referralCode,
          creditAwarded: false,
        })
        .returning();
      
      // Award credit to referrer and referred user
      await this.awardReferralCredit(referrerId, newUserId);
      
      return referral;
    }
    
    return null;
  }

  private extractUserIdFromReferralCode(referralCode: string): string | null {
    const match = referralCode.match(/^ref_([a-zA-Z0-9]{8})_/);
    return match ? match[1] : null;
  }

  private async awardReferralCredit(referrerId: string, referredUserId: string): Promise<void> {
    // Award 5 credits to referrer
    const referrerCredits = await this.getUserCredits(referrerId);
    if (referrerCredits) {
      await this.updateUserCredits(
        referrerId,
        referrerCredits.balance + 5,
        referrerCredits.totalEarned + 5,
        referrerCredits.totalSpent
      );
      
      await this.addCreditTransaction({
        userId: referrerId,
        type: "earn",
        amount: 5,
        source: "referral",
        referralUserId: referredUserId,
        description: "Referral bonus - referring someone",
      });
    }
    
    // Award 5 credits to referred user
    const referredCredits = await this.getUserCredits(referredUserId);
    if (referredCredits) {
      await this.updateUserCredits(
        referredUserId,
        referredCredits.balance + 5,
        referredCredits.totalEarned + 5,
        referredCredits.totalSpent
      );
      
      await this.addCreditTransaction({
        userId: referredUserId,
        type: "earn",
        amount: 5,
        source: "referral",
        referralUserId: referrerId,
        description: "Referral bonus - being referred",
      });
    }
    
    // Mark referral as credited
    await db
      .update(userReferrals)
      .set({ creditAwarded: true })
      .where(eq(userReferrals.referredUserId, referredUserId));
  }

  async getReferralsByUser(userId: string): Promise<UserReferral[]> {
    return await db
      .select()
      .from(userReferrals)
      .where(eq(userReferrals.referrerId, userId))
      .orderBy(desc(userReferrals.createdAt));
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const userId = this.extractUserIdFromReferralCode(referralCode);
    if (!userId) return undefined;
    return await this.getUser(userId);
  }

  // Admin operations
  async upgradeToPro(userId: string, durationDays: number): Promise<User> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);
    
    const [user] = await db
      .update(users)
      .set({
        membershipLevel: "pro",
        membershipExpires: expiresAt,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }

  async checkMembershipStatus(userId: string): Promise<{ level: "free" | "pro"; isActive: boolean; expiresAt?: Date }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return { level: "free", isActive: true };
    }
    
    const now = new Date();
    const level = user.membershipLevel as "free" | "pro";
    
    if (level === "free") {
      return { level: "free", isActive: true };
    }
    
    // Check if Pro membership is still active
    const isActive = user.membershipExpires ? user.membershipExpires > now : false;
    
    // If Pro membership expired, downgrade to free
    if (!isActive && user.membershipLevel === "pro") {
      await db
        .update(users)
        .set({
          membershipLevel: "free",
          membershipExpires: null,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
      
      return { level: "free", isActive: true };
    }
    
    return { 
      level, 
      isActive, 
      expiresAt: user.membershipExpires || undefined 
    };
  }

  async addCreditsToAllUsers(amount: number, description: string): Promise<number> {
    // Get all users
    const allUsers = await db.select().from(users);
    let updatedCount = 0;
    
    for (const user of allUsers) {
      try {
        // Get or create user credits
        let userCredit = await this.getUserCredits(user.id);
        if (!userCredit) {
          userCredit = await this.createUserCredits(user.id);
        }
        
        // Update credits
        await this.updateUserCredits(
          user.id,
          userCredit.balance + amount,
          userCredit.totalEarned + amount,
          userCredit.totalSpent
        );
        
        // Add transaction
        await this.addCreditTransaction({
          userId: user.id,
          type: "earn",
          amount,
          source: "admin_bonus",
          description,
        });
        
        updatedCount++;
      } catch (error) {
        console.error(`Failed to add credits to user ${user.id}:`, error);
      }
    }
    
    return updatedCount;
  }
}

export const storage = new DatabaseStorage();
