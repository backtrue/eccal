
import { eq, and } from "drizzle-orm";
import { sharedDb } from "./shared-db";
import { 
  sharedUsers, 
  sharedUserCredits, 
  sharedCreditTransactions,
  sharedUserReferrals,
  appUsageRecords,
  type SharedUser,
  type InsertSharedUser,
  type InsertSharedCreditTransaction,
  type InsertAppUsageRecord
} from "./auth-schema";

export class SharedAuthService {
  // 用戶管理
  static async createUser(userData: InsertSharedUser): Promise<SharedUser> {
    const [user] = await sharedDb.insert(sharedUsers).values(userData).returning();
    
    // 初始化積分
    await sharedDb.insert(sharedUserCredits).values({
      userId: user.id,
      balance: 5,
      totalEarned: 5,
      totalSpent: 0,
    });

    // 記錄註冊積分
    await sharedDb.insert(sharedCreditTransactions).values({
      userId: user.id,
      type: "earn",
      amount: 5,
      source: "registration",
      description: "新用戶註冊獎勵",
    });

    return user;
  }

  static async getUserById(userId: string): Promise<SharedUser | null> {
    const [user] = await sharedDb.select().from(sharedUsers).where(eq(sharedUsers.id, userId));
    return user || null;
  }

  static async getUserByEmail(email: string): Promise<SharedUser | null> {
    const [user] = await sharedDb.select().from(sharedUsers).where(eq(sharedUsers.email, email));
    return user || null;
  }

  static async updateUser(userId: string, updates: Partial<InsertSharedUser>): Promise<SharedUser> {
    const [user] = await sharedDb
      .update(sharedUsers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(sharedUsers.id, userId))
      .returning();
    return user;
  }

  // 積分系統
  static async getUserCredits(userId: string) {
    const [credits] = await sharedDb
      .select()
      .from(sharedUserCredits)
      .where(eq(sharedUserCredits.userId, userId));
    return credits;
  }

  static async spendCredits(userId: string, amount: number, source: string, appName?: string): Promise<boolean> {
    const credits = await this.getUserCredits(userId);
    if (!credits || credits.balance < amount) {
      return false;
    }

    // 扣除積分
    await sharedDb
      .update(sharedUserCredits)
      .set({ 
        balance: credits.balance - amount,
        totalSpent: credits.totalSpent + amount,
        updatedAt: new Date()
      })
      .where(eq(sharedUserCredits.userId, userId));

    // 記錄交易
    await sharedDb.insert(sharedCreditTransactions).values({
      userId,
      type: "spend",
      amount,
      source,
      appName,
      description: `${appName || 'App'} 功能使用`,
    });

    return true;
  }

  static async earnCredits(userId: string, amount: number, source: string, appName?: string): Promise<void> {
    const credits = await this.getUserCredits(userId);
    if (!credits) return;

    // 增加積分
    await sharedDb
      .update(sharedUserCredits)
      .set({ 
        balance: credits.balance + amount,
        totalEarned: credits.totalEarned + amount,
        updatedAt: new Date()
      })
      .where(eq(sharedUserCredits.userId, userId));

    // 記錄交易
    await sharedDb.insert(sharedCreditTransactions).values({
      userId,
      type: "earn",
      amount,
      source,
      appName,
      description: `${appName || 'App'} 積分獎勵`,
    });
  }

  // App 使用記錄
  static async recordAppUsage(data: InsertAppUsageRecord): Promise<void> {
    // 檢查是否已有記錄
    const [existing] = await sharedDb
      .select()
      .from(appUsageRecords)
      .where(
        and(
          eq(appUsageRecords.userId, data.userId),
          eq(appUsageRecords.appName, data.appName),
          eq(appUsageRecords.feature, data.feature || "")
        )
      );

    if (existing) {
      // 更新使用次數和最後使用時間
      await sharedDb
        .update(appUsageRecords)
        .set({
          usageCount: existing.usageCount + 1,
          lastUsedAt: new Date(),
        })
        .where(eq(appUsageRecords.id, existing.id));
    } else {
      // 新增記錄
      await sharedDb.insert(appUsageRecords).values(data);
    }
  }

  // 推薦系統
  static async createReferral(referrerId: string, referredUserId: string, sourceApp: string): Promise<string> {
    const referralCode = `REF_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    await sharedDb.insert(sharedUserReferrals).values({
      referrerId,
      referredUserId,
      referralCode,
      sourceApp,
      creditAwarded: false,
    });

    return referralCode;
  }

  // 檢查會員資格
  static async checkMembershipStatus(userId: string): Promise<{
    level: string;
    isActive: boolean;
    expiresAt?: Date;
  }> {
    const user = await this.getUserById(userId);
    if (!user) {
      return { level: "free", isActive: false };
    }

    const isProActive = user.membershipLevel === "pro" && 
      (!user.membershipExpires || user.membershipExpires > new Date());

    return {
      level: user.membershipLevel,
      isActive: user.membershipLevel === "free" || isProActive,
      expiresAt: user.membershipExpires || undefined,
    };
  }
}
