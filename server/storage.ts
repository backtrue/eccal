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
  savedProjects,
  type SavedProject,
  type InsertSavedProject,
  seoSettings,
  type SeoSetting,
  type InsertSeoSetting,
  systemLogs,
  type SystemLogType,
  type InsertSystemLogType,
  adminSettings,
  type AdminSetting,
  type InsertAdminSetting,
  userBehavior,
  type UserBehavior,
  type InsertUserBehavior,
  announcements,
  type Announcement,
  type InsertAnnouncement,
  apiUsage,
  type ApiUsage,
  type InsertApiUsage,
  exportJobs,
  type ExportJob,
  type InsertExportJob,
  marketingPlans,
  type MarketingPlan,
  type InsertMarketingPlan,
  planAnalysisItems,
  type PlanAnalysisItem,
  type InsertPlanAnalysisItem,
  knowledgeCategories,
  type KnowledgeCategory,
  type InsertKnowledgeCategory,
  knowledgeDocuments,
  type KnowledgeDocument,
  type InsertKnowledgeDocument,
  knowledgeSearchIndex,
  type KnowledgeSearchIndex,
  type InsertKnowledgeSearchIndex,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, count, avg, sum, inArray, gte, lt } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations for Google OAuth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getFirstUser(): Promise<User | undefined>;
  
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
  
  // Campaign Planner usage tracking
  incrementCampaignPlannerUsage(userId: string): Promise<User>;
  getCampaignPlannerUsage(userId: string): Promise<number>;
  
  // Admin operations
  addCreditsToAllUsers(amount: number, description: string): Promise<number>;
  
  // Saved projects operations
  saveProject(userId: string, projectName: string, projectType: string, projectData: any, calculationResult?: any): Promise<SavedProject>;
  getUserProjects(userId: string): Promise<SavedProject[]>;
  getProject(projectId: string, userId: string): Promise<SavedProject | undefined>;
  updateProject(projectId: string, userId: string, updates: Partial<{ projectName: string; projectData: any; lastCalculationResult: any }>): Promise<SavedProject>;
  deleteProject(projectId: string, userId: string): Promise<boolean>;

  // Admin operations for management dashboard
  getAllUsers(limit?: number, offset?: number): Promise<{ users: User[], total: number }>;
  getUserStats(): Promise<{
    totalUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    activeUsersToday: number;
    activeUsersThisWeek: number;
    retention7Days: number;
    retention30Days: number;
    totalCreditsDistributed: number;
    totalProMembers: number;
    arpu: number;
  }>;
  updateUserMembership(userId: string, membershipLevel: string, expiresAt?: Date): Promise<User>;
  batchUpdateUserMembership(userIds: string[], membershipLevel: string, expiresAt?: Date): Promise<number>;
  batchAddCredits(userIds: string[], amount: number, description: string): Promise<number>;

  // SEO management operations
  getSeoSettings(): Promise<SeoSetting[]>;
  updateSeoSetting(page: string, updates: Partial<SeoSetting>): Promise<SeoSetting>;

  // System monitoring operations
  addSystemLog(log: InsertSystemLogType): Promise<SystemLogType>;
  getSystemLogs(level?: string, limit?: number): Promise<SystemLogType[]>;
  getSystemStats(): Promise<{
    totalErrors: number;
    errorsToday: number;
    avgResponseTime: number;
    topErrorEndpoints: { endpoint: string; count: number }[];
  }>;

  // User behavior tracking operations
  trackUserBehavior(behavior: InsertUserBehavior): Promise<UserBehavior>;
  getUserBehaviorStats(): Promise<{
    mostUsedFeatures: { feature: string; count: number }[];
    averagePageDuration: number;
    conversionFunnel: { step: string; users: number; rate: number }[];
    dailyActiveUsers: { date: string; users: number }[];
  }>;

  // Announcements management
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  getActiveAnnouncements(userMembershipLevel?: string): Promise<Announcement[]>;
  getAllAnnouncements(): Promise<Announcement[]>;
  updateAnnouncement(id: number, updates: Partial<Announcement>): Promise<Announcement>;
  deleteAnnouncement(id: number): Promise<boolean>;

  // API usage tracking and rate limiting
  trackApiUsage(usage: InsertApiUsage): Promise<ApiUsage>;
  getApiUsageStats(service?: string): Promise<{
    totalRequests: number;
    requestsToday: number;
    avgResponseTime: number;
    errorRate: number;
    quotaUsage: { service: string; used: number; limit: number }[];
    topUsers: { userId: string; requests: number }[];
  }>;
  checkRateLimit(userId: string, service: string, timeWindow: number, maxRequests: number): Promise<boolean>;

  // Data export operations
  createExportJob(job: InsertExportJob): Promise<ExportJob>;
  getExportJobs(userId?: string): Promise<ExportJob[]>;
  updateExportJob(id: number, updates: Partial<ExportJob>): Promise<ExportJob>;
  generateCsvExport(type: string, filters?: any): Promise<string>;

  // Maintenance mode and system settings
  setMaintenanceMode(enabled: boolean, message?: string): Promise<void>;
  getMaintenanceMode(): Promise<{ enabled: boolean; message?: string }>;
  getSystemSettings(): Promise<Record<string, any>>;

  // Marketing plans operations
  createMarketingPlan(plan: Omit<InsertMarketingPlan, 'id' | 'createdAt'>): Promise<MarketingPlan>;
  updateMarketingPlanStatus(planId: string, status: 'completed' | 'failed', errorMessage?: string): Promise<void>;
  saveAnalysisItems(planId: string, items: Array<Omit<InsertPlanAnalysisItem, 'id' | 'planId'>>): Promise<void>;
  getMarketingPlans(): Promise<MarketingPlan[]>;
  getAnalysisItemsForPlan(planId: string): Promise<PlanAnalysisItem[]>;
  updateAnalysisItemPhase(itemId: string, newPhase: 'pre_heat' | 'campaign' | 'repurchase'): Promise<void>;
  approveAnalysisItem(itemId: string, isApproved: boolean): Promise<void>;

  // Knowledge base operations
  createKnowledgeCategory(category: Omit<InsertKnowledgeCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<KnowledgeCategory>;
  getAllKnowledgeCategories(): Promise<KnowledgeCategory[]>;
  createKnowledgeDocument(document: Omit<InsertKnowledgeDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<KnowledgeDocument>;
  getAllKnowledgeDocuments(): Promise<KnowledgeDocument[]>;
  getKnowledgeDocumentsByCategory(categoryId: string): Promise<KnowledgeDocument[]>;
  searchKnowledgeDocuments(query: string, tags?: string[]): Promise<KnowledgeDocument[]>;
  updateKnowledgeDocument(documentId: string, updates: Partial<InsertKnowledgeDocument>): Promise<KnowledgeDocument>;
  createSearchIndex(index: Omit<InsertKnowledgeSearchIndex, 'id' | 'createdAt'>): Promise<KnowledgeSearchIndex>;
}

export class DatabaseStorage implements IStorage {
  // User operations for Google OAuth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getFirstUser(): Promise<User | undefined> {
    const [user] = await db.select().from(users).limit(1);
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
    // Check how many successful referrals the referrer has made
    const referrerReferrals = await db
      .select()
      .from(userReferrals)
      .where(eq(userReferrals.referrerId, referrerId));
    
    const referralCount = referrerReferrals.length;
    
    // Calculate referrer reward: 50 base points + 50 bonus for first 3 referrals
    let referrerReward = 50; // Base reward
    if (referralCount <= 3) {
      referrerReward += 50; // Bonus for first 3 referrals (total 100 points)
    }
    
    // Award credits to referrer
    const referrerCredits = await this.getUserCredits(referrerId);
    if (referrerCredits) {
      // 使用原子操作更新推薦者積分
      await db
        .update(userCredits)
        .set({
          balance: sql`${userCredits.balance} + ${referrerReward}`,
          totalEarned: sql`${userCredits.totalEarned} + ${referrerReward}`,
          updatedAt: new Date()
        })
        .where(eq(userCredits.userId, referrerId));
      
      const bonusText = referralCount <= 3 ? " (含前3人加碼獎勵)" : "";
      await this.addCreditTransaction({
        userId: referrerId,
        type: "earn",
        amount: referrerReward,
        source: "referral",
        referralUserId: referredUserId,
        description: `推薦獎勵 - 第${referralCount}位推薦${bonusText}`,
      });
    }
    
    // Award 30 credits to referred user (welcome bonus)
    const referredCredits = await this.getUserCredits(referredUserId);
    if (referredCredits) {
      // 使用原子操作更新被推薦者積分
      await db
        .update(userCredits)
        .set({
          balance: sql`${userCredits.balance} + 30`,
          totalEarned: sql`${userCredits.totalEarned} + 30`,
          updatedAt: new Date()
        })
        .where(eq(userCredits.userId, referredUserId));
      
      await this.addCreditTransaction({
        userId: referredUserId,
        type: "earn",
        amount: 30,
        source: "referral",
        referralUserId: referrerId,
        description: "推薦獎勵 - 被推薦獎勵",
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

  async incrementCampaignPlannerUsage(userId: string): Promise<User> {
    // 使用 SQL 的原子操作，直接在資料庫層級增加數值
    const [user] = await db
      .update(users)
      .set({
        campaignPlannerUsage: sql`${users.campaignPlannerUsage} + 1`, // 使用 SQL 表達式
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();

    return user;
  }

  async getCampaignPlannerUsage(userId: string): Promise<number> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user?.campaignPlannerUsage || 0;
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
        
        // 使用原子操作更新所有用戶積分
        await db
          .update(userCredits)
          .set({
            balance: sql`${userCredits.balance} + ${amount}`,
            totalEarned: sql`${userCredits.totalEarned} + ${amount}`,
            updatedAt: new Date()
          })
          .where(eq(userCredits.userId, user.id));
        
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

  // Saved projects operations
  async saveProject(userId: string, projectName: string, projectType: string, projectData: any, calculationResult?: any): Promise<SavedProject> {
    const [project] = await db
      .insert(savedProjects)
      .values({
        userId,
        projectName,
        projectType,
        projectData,
        lastCalculationResult: calculationResult || null,
      })
      .returning();
    return project;
  }

  async getUserProjects(userId: string): Promise<SavedProject[]> {
    return await db
      .select()
      .from(savedProjects)
      .where(eq(savedProjects.userId, userId))
      .orderBy(desc(savedProjects.updatedAt));
  }

  async getProject(projectId: string, userId: string): Promise<SavedProject | undefined> {
    const [project] = await db
      .select()
      .from(savedProjects)
      .where(and(eq(savedProjects.id, projectId), eq(savedProjects.userId, userId)));
    return project;
  }

  async updateProject(projectId: string, userId: string, updates: Partial<{ projectName: string; projectData: any; lastCalculationResult: any }>): Promise<SavedProject> {
    const [project] = await db
      .update(savedProjects)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(savedProjects.id, projectId), eq(savedProjects.userId, userId)))
      .returning();
    return project;
  }

  async deleteProject(projectId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(savedProjects)
      .where(and(eq(savedProjects.id, projectId), eq(savedProjects.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  // Admin operations for management dashboard
  async getAllUsers(limit: number = 50, offset: number = 0): Promise<{ users: User[], total: number }> {
    const [users_result, total_result] = await Promise.all([
      db.select().from(users)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(users)
    ]);
    
    return {
      users: users_result,
      total: total_result[0].count as number
    };
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    activeUsersToday: number;
    activeUsersThisWeek: number;
    retention7Days: number;
    retention30Days: number;
    totalCreditsDistributed: number;
    totalProMembers: number;
    arpu: number;
  }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersToday,
      newUsersWeek,
      newUsersMonth,
      totalCredits,
      proMembers
    ] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(users).where(gte(users.createdAt, today)),
      db.select({ count: count() }).from(users).where(gte(users.createdAt, weekAgo)),
      db.select({ count: count() }).from(users).where(gte(users.createdAt, monthAgo)),
      db.select({ total: sum(creditTransactions.amount) }).from(creditTransactions),
      db.select({ count: count() }).from(users).where(eq(users.membershipLevel, 'pro'))
    ]);

    // Calculate retention rates (simplified)
    const retention7Days = totalUsers[0].count > 0 ? (newUsersWeek[0].count / totalUsers[0].count) * 100 : 0;
    const retention30Days = totalUsers[0].count > 0 ? (newUsersMonth[0].count / totalUsers[0].count) * 100 : 0;

    return {
      totalUsers: totalUsers[0].count as number,
      newUsersToday: newUsersToday[0].count as number,
      newUsersThisWeek: newUsersWeek[0].count as number,
      newUsersThisMonth: newUsersMonth[0].count as number,
      activeUsersToday: newUsersToday[0].count as number,
      activeUsersThisWeek: newUsersWeek[0].count as number,
      retention7Days: retention7Days as number,
      retention30Days: retention30Days as number,
      totalCreditsDistributed: Number(totalCredits[0].total) || 0,
      totalProMembers: proMembers[0].count as number,
      arpu: 0
    };
  }

  async updateUserMembership(userId: string, membershipLevel: string, expiresAt?: Date): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        membershipLevel,
        membershipExpires: expiresAt,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async batchUpdateUserMembership(userIds: string[], membershipLevel: string, expiresAt?: Date): Promise<number> {
    const result = await db
      .update(users)
      .set({
        membershipLevel,
        membershipExpires: expiresAt,
        updatedAt: new Date()
      })
      .where(inArray(users.id, userIds));
    return result.rowCount || 0;
  }

  async batchAddCredits(userIds: string[], amount: number, description: string): Promise<number> {
    let totalUpdated = 0;
    
    for (const userId of userIds) {
      const existingCredit = await this.getUserCredits(userId);
      if (existingCredit) {
        // 使用原子操作更新管理員發放積分
        await db
          .update(userCredits)
          .set({
            balance: sql`${userCredits.balance} + ${amount}`,
            totalEarned: sql`${userCredits.totalEarned} + ${amount}`,
            updatedAt: new Date()
          })
          .where(eq(userCredits.userId, userId));
        await this.addCreditTransaction({
          userId,
          amount,
          type: 'admin_grant',
          source: 'admin_panel',
          description,
          createdAt: new Date()
        });
        totalUpdated++;
      }
    }
    
    return totalUpdated;
  }

  // SEO management operations
  async getSeoSettings(): Promise<SeoSetting[]> {
    return await db.select().from(seoSettings).orderBy(seoSettings.page);
  }

  async updateSeoSetting(page: string, updates: Partial<SeoSetting>): Promise<SeoSetting> {
    const [setting] = await db
      .update(seoSettings)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(seoSettings.page, page))
      .returning();
    return setting;
  }

  // System monitoring operations
  async addSystemLog(log: InsertSystemLogType): Promise<SystemLogType> {
    const [systemLog] = await db
      .insert(systemLogs)
      .values(log)
      .returning();
    return systemLog;
  }

  async getSystemLogs(level?: string, limit: number = 100): Promise<SystemLogType[]> {
    if (level) {
      return await db.select().from(systemLogs)
        .where(eq(systemLogs.level, level))
        .orderBy(desc(systemLogs.createdAt))
        .limit(limit);
    }
    
    return await db.select().from(systemLogs)
      .orderBy(desc(systemLogs.createdAt))
      .limit(limit);
  }

  async getSystemStats(): Promise<{
    totalErrors: number;
    errorsToday: number;
    avgResponseTime: number;
    topErrorEndpoints: { endpoint: string; count: number }[];
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalErrors,
      errorsToday,
      avgResponse
    ] = await Promise.all([
      db.select({ count: count() }).from(systemLogs).where(eq(systemLogs.level, 'error')),
      db.select({ count: count() }).from(systemLogs)
        .where(and(eq(systemLogs.level, 'error'), gte(systemLogs.createdAt, today))),
      db.select({ avg: avg(systemLogs.responseTime) }).from(systemLogs)
        .where(sql`${systemLogs.responseTime} IS NOT NULL`)
    ]);

    const topErrors = await db.select({
      endpoint: systemLogs.endpoint,
      count: count()
    })
    .from(systemLogs)
    .where(eq(systemLogs.level, 'error'))
    .groupBy(systemLogs.endpoint)
    .orderBy(desc(count()))
    .limit(5);

    return {
      totalErrors: totalErrors[0].count as number,
      errorsToday: errorsToday[0].count as number,
      avgResponseTime: Number(avgResponse[0].avg) || 0,
      topErrorEndpoints: topErrors.map(e => ({
        endpoint: e.endpoint || 'Unknown',
        count: e.count as number
      }))
    };
  }

  // User behavior tracking operations
  async trackUserBehavior(behavior: InsertUserBehavior): Promise<UserBehavior> {
    const [userBehaviorRecord] = await db
      .insert(userBehavior)
      .values(behavior)
      .returning();
    return userBehaviorRecord;
  }

  async getUserBehaviorStats(): Promise<{
    mostUsedFeatures: { feature: string; count: number }[];
    averagePageDuration: number;
    conversionFunnel: { step: string; users: number; rate: number }[];
    dailyActiveUsers: { date: string; users: number }[];
  }> {
    const [
      featureStats,
      avgDuration,
      dailyUsers
    ] = await Promise.all([
      // Most used features
      db.select({
        feature: userBehavior.feature,
        count: count()
      })
      .from(userBehavior)
      .where(sql`${userBehavior.feature} IS NOT NULL`)
      .groupBy(userBehavior.feature)
      .orderBy(desc(count()))
      .limit(10),
      
      // Average page duration
      db.select({ avg: avg(userBehavior.duration) })
      .from(userBehavior)
      .where(sql`${userBehavior.duration} IS NOT NULL`),
      
      // Daily active users (last 30 days)
      db.select({
        date: sql`DATE(${userBehavior.createdAt})`.as('date'),
        users: count(sql`DISTINCT ${userBehavior.userId}`)
      })
      .from(userBehavior)
      .where(gte(userBehavior.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)))
      .groupBy(sql`DATE(${userBehavior.createdAt})`)
      .orderBy(sql`DATE(${userBehavior.createdAt})`)
    ]);

    // Simple conversion funnel
    const totalUsers = await db.select({ count: count(sql`DISTINCT ${userBehavior.userId}`) }).from(userBehavior);
    const calculatorUsers = await db.select({ count: count(sql`DISTINCT ${userBehavior.userId}`) })
      .from(userBehavior)
      .where(eq(userBehavior.feature, 'calculator'));
    const plannerUsers = await db.select({ count: count(sql`DISTINCT ${userBehavior.userId}`) })
      .from(userBehavior)
      .where(eq(userBehavior.feature, 'campaign_planner'));

    const total = totalUsers[0].count as number;
    const calculator = calculatorUsers[0].count as number;
    const planner = plannerUsers[0].count as number;

    return {
      mostUsedFeatures: featureStats.map(f => ({
        feature: f.feature || 'Unknown',
        count: f.count as number
      })),
      averagePageDuration: Number(avgDuration[0].avg) || 0,
      conversionFunnel: [
        { step: 'Visit', users: total, rate: 100 },
        { step: 'Calculator', users: calculator, rate: total > 0 ? (calculator / total) * 100 : 0 },
        { step: 'Campaign Planner', users: planner, rate: total > 0 ? (planner / total) * 100 : 0 }
      ],
      dailyActiveUsers: dailyUsers.map(d => ({
        date: d.date as string,
        users: d.users as number
      }))
    };
  }

  // Announcements management
  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [newAnnouncement] = await db
      .insert(announcements)
      .values(announcement)
      .returning();
    return newAnnouncement;
  }

  async getActiveAnnouncements(userMembershipLevel?: string): Promise<Announcement[]> {
    const now = new Date();
    
    // 使用 Drizzle ORM 的參數化查詢，完全避免 SQL Injection 風險
    if (userMembershipLevel) {
      return await db.select().from(announcements)
        .where(and(
          eq(announcements.isActive, true),
          sql`(${announcements.startDate} IS NULL OR ${announcements.startDate} <= ${now})`,
          sql`(${announcements.endDate} IS NULL OR ${announcements.endDate} >= ${now})`,
          sql`(${announcements.targetAudience} = 'all' OR ${announcements.targetAudience} = ${userMembershipLevel})`
        ))
        .orderBy(desc(announcements.priority), desc(announcements.createdAt));
    } else {
      return await db.select().from(announcements)
        .where(and(
          eq(announcements.isActive, true),
          sql`(${announcements.startDate} IS NULL OR ${announcements.startDate} <= ${now})`,
          sql`(${announcements.endDate} IS NULL OR ${announcements.endDate} >= ${now})`,
          eq(announcements.targetAudience, 'all')
        ))
        .orderBy(desc(announcements.priority), desc(announcements.createdAt));
    }
  }

  async getAllAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements)
      .orderBy(desc(announcements.createdAt));
  }

  async updateAnnouncement(id: number, updates: Partial<Announcement>): Promise<Announcement> {
    const [announcement] = await db
      .update(announcements)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(announcements.id, id))
      .returning();
    return announcement;
  }

  async deleteAnnouncement(id: number): Promise<boolean> {
    const result = await db
      .delete(announcements)
      .where(eq(announcements.id, id));
    return (result.rowCount || 0) > 0;
  }

  // API usage tracking and rate limiting
  async trackApiUsage(usage: InsertApiUsage): Promise<ApiUsage> {
    const [apiUsageRecord] = await db
      .insert(apiUsage)
      .values(usage)
      .returning();
    return apiUsageRecord;
  }

  async getApiUsageStats(service?: string): Promise<{
    totalRequests: number;
    requestsToday: number;
    avgResponseTime: number;
    errorRate: number;
    quotaUsage: { service: string; used: number; limit: number }[];
    topUsers: { userId: string; requests: number }[];
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const baseQuery = service 
      ? db.select().from(apiUsage).where(eq(apiUsage.service, service))
      : db.select().from(apiUsage);

    const [
      totalRequests,
      requestsToday,
      avgResponse,
      errorRate,
      serviceQuotas,
      topUsers
    ] = await Promise.all([
      db.select({ count: count() }).from(apiUsage),
      db.select({ count: count() }).from(apiUsage).where(gte(apiUsage.createdAt, today)),
      db.select({ avg: avg(apiUsage.responseTime) }).from(apiUsage)
        .where(sql`${apiUsage.responseTime} IS NOT NULL`),
      db.select({ 
        total: count(),
        errors: count(sql`CASE WHEN ${apiUsage.statusCode} >= 400 THEN 1 END`)
      }).from(apiUsage),
      db.select({
        service: apiUsage.service,
        used: sum(apiUsage.quotaUsed)
      })
      .from(apiUsage)
      .groupBy(apiUsage.service)
      .orderBy(desc(sum(apiUsage.quotaUsed))),
      db.select({
        userId: apiUsage.userId,
        requests: count()
      })
      .from(apiUsage)
      .where(sql`${apiUsage.userId} IS NOT NULL`)
      .groupBy(apiUsage.userId)
      .orderBy(desc(count()))
      .limit(10)
    ]);

    const totalReq = totalRequests[0].count as number;
    const errorReq = errorRate[0].errors as number;

    return {
      totalRequests: totalReq,
      requestsToday: requestsToday[0].count as number,
      avgResponseTime: Number(avgResponse[0].avg) || 0,
      errorRate: totalReq > 0 ? (errorReq / totalReq) * 100 : 0,
      quotaUsage: serviceQuotas.map(q => ({
        service: q.service,
        used: Number(q.used),
        limit: 1000 // Default limit, can be made configurable
      })),
      topUsers: topUsers.map(u => ({
        userId: u.userId || 'Unknown',
        requests: u.requests as number
      }))
    };
  }

  async checkRateLimit(userId: string, service: string, timeWindow: number, maxRequests: number): Promise<boolean> {
    const since = new Date(Date.now() - timeWindow * 1000);
    const [result] = await db.select({ count: count() })
      .from(apiUsage)
      .where(and(
        eq(apiUsage.userId, userId),
        eq(apiUsage.service, service),
        gte(apiUsage.createdAt, since)
      ));
    
    return (result.count as number) < maxRequests;
  }

  // Data export operations
  async createExportJob(job: InsertExportJob): Promise<ExportJob> {
    const [exportJob] = await db
      .insert(exportJobs)
      .values(job)
      .returning();
    return exportJob;
  }

  async getExportJobs(userId?: string): Promise<ExportJob[]> {
    if (userId) {
      return await db.select().from(exportJobs)
        .where(eq(exportJobs.userId, userId))
        .orderBy(desc(exportJobs.createdAt));
    }
    return await db.select().from(exportJobs)
      .orderBy(desc(exportJobs.createdAt));
  }

  async updateExportJob(id: number, updates: Partial<ExportJob>): Promise<ExportJob> {
    const [job] = await db
      .update(exportJobs)
      .set(updates)
      .where(eq(exportJobs.id, id))
      .returning();
    return job;
  }

  async generateCsvExport(type: string, filters?: any): Promise<string> {
    let csvContent = '';
    
    switch (type) {
      case 'users':
        const allUsers = await db.select().from(users);
        csvContent = 'ID,Email,First Name,Last Name,Membership Level,Created At\n';
        csvContent += allUsers.map(user => 
          `"${user.id}","${user.email || ''}","${user.firstName || ''}","${user.lastName || ''}","${user.membershipLevel}","${user.createdAt}"`
        ).join('\n');
        break;
        
      case 'behavior':
        const behaviors = await db.select().from(userBehavior).limit(10000);
        csvContent = 'ID,User ID,Action,Page,Feature,Duration,Created At\n';
        csvContent += behaviors.map(b => 
          `"${b.id}","${b.userId || ''}","${b.action}","${b.page || ''}","${b.feature || ''}","${b.duration || ''}","${b.createdAt}"`
        ).join('\n');
        break;
        
      case 'api_usage':
        const apiUsages = await db.select().from(apiUsage).limit(10000);
        csvContent = 'ID,User ID,Service,Endpoint,Status Code,Response Time,Created At\n';
        csvContent += apiUsages.map(a => 
          `"${a.id}","${a.userId || ''}","${a.service}","${a.endpoint || ''}","${a.statusCode || ''}","${a.responseTime || ''}","${a.createdAt}"`
        ).join('\n');
        break;
        
      default:
        csvContent = 'Type,Data\n"error","Invalid export type"';
    }
    
    return csvContent;
  }

  // Maintenance mode and system settings
  async setMaintenanceMode(enabled: boolean, message?: string): Promise<void> {
    await db.insert(adminSettings)
      .values({
        key: 'maintenance_mode',
        value: JSON.stringify({ enabled, message }),
        description: 'System maintenance mode setting'
      })
      .onConflictDoUpdate({
        target: adminSettings.key,
        set: {
          value: JSON.stringify({ enabled, message }),
          updatedAt: new Date()
        }
      });
  }

  async getMaintenanceMode(): Promise<{ enabled: boolean; message?: string }> {
    const [setting] = await db.select()
      .from(adminSettings)
      .where(eq(adminSettings.key, 'maintenance_mode'));
    
    if (!setting) {
      return { enabled: false };
    }
    
    try {
      return JSON.parse(setting.value || '{"enabled": false}');
    } catch {
      return { enabled: false };
    }
  }

  async getSystemSettings(): Promise<Record<string, any>> {
    const settings = await db.select().from(adminSettings);
    const result: Record<string, any> = {};
    
    settings.forEach(setting => {
      try {
        result[setting.key] = JSON.parse(setting.value || 'null');
      } catch {
        result[setting.key] = setting.value;
      }
    });
    
    return result;
  }

  // Marketing plans operations
  async createMarketingPlan(plan: Omit<InsertMarketingPlan, 'id' | 'createdAt'>): Promise<MarketingPlan> {
    const [marketingPlan] = await db
      .insert(marketingPlans)
      .values(plan)
      .returning();
    return marketingPlan;
  }

  async updateMarketingPlanStatus(planId: string, status: 'completed' | 'failed', errorMessage?: string): Promise<void> {
    await db
      .update(marketingPlans)
      .set({
        status,
        errorMessage,
        completedAt: new Date(),
      })
      .where(eq(marketingPlans.id, planId));
  }

  async saveAnalysisItems(planId: string, items: Array<Omit<InsertPlanAnalysisItem, 'id' | 'planId'>>): Promise<void> {
    if (items.length === 0) return;

    const itemsWithPlanId = items.map(item => ({
      ...item,
      planId,
    }));

    await db
      .insert(planAnalysisItems)
      .values(itemsWithPlanId);
  }

  async getMarketingPlans(): Promise<MarketingPlan[]> {
    return await db
      .select()
      .from(marketingPlans)
      .orderBy(desc(marketingPlans.createdAt));
  }

  async getAnalysisItemsForPlan(planId: string): Promise<PlanAnalysisItem[]> {
    return await db
      .select()
      .from(planAnalysisItems)
      .where(eq(planAnalysisItems.planId, planId));
  }

  async updateAnalysisItemPhase(itemId: string, newPhase: 'pre_heat' | 'campaign' | 'repurchase'): Promise<void> {
    await db
      .update(planAnalysisItems)
      .set({ phase: newPhase })
      .where(eq(planAnalysisItems.id, itemId));
  }

  async approveAnalysisItem(itemId: string, isApproved: boolean): Promise<void> {
    await db
      .update(planAnalysisItems)
      .set({ isApproved })
      .where(eq(planAnalysisItems.id, itemId));
  }

  // Knowledge base operations implementation
  async createKnowledgeCategory(category: Omit<InsertKnowledgeCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<KnowledgeCategory> {
    const [newCategory] = await db
      .insert(knowledgeCategories)
      .values(category)
      .returning();
    return newCategory;
  }

  async getAllKnowledgeCategories(): Promise<KnowledgeCategory[]> {
    return await db
      .select()
      .from(knowledgeCategories)
      .orderBy(knowledgeCategories.sortOrder, knowledgeCategories.name);
  }

  async createKnowledgeDocument(document: Omit<InsertKnowledgeDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<KnowledgeDocument> {
    const [newDocument] = await db
      .insert(knowledgeDocuments)
      .values(document)
      .returning();
    return newDocument;
  }

  async getAllKnowledgeDocuments(): Promise<KnowledgeDocument[]> {
    return await db
      .select()
      .from(knowledgeDocuments)
      .orderBy(desc(knowledgeDocuments.createdAt));
  }

  async getKnowledgeDocumentsByCategory(categoryId: string): Promise<KnowledgeDocument[]> {
    return await db
      .select()
      .from(knowledgeDocuments)
      .where(eq(knowledgeDocuments.categoryId, categoryId))
      .orderBy(desc(knowledgeDocuments.createdAt));
  }

  async searchKnowledgeDocuments(query: string, tags?: string[]): Promise<KnowledgeDocument[]> {
    let searchConditions = sql`${knowledgeDocuments.title} ILIKE ${`%${query}%`} OR ${knowledgeDocuments.content} ILIKE ${`%${query}%`}`;
    
    if (tags && tags.length > 0) {
      searchConditions = sql`${searchConditions} OR ${knowledgeDocuments.tags} && ${tags}`;
    }

    return await db
      .select()
      .from(knowledgeDocuments)
      .where(searchConditions)
      .orderBy(desc(knowledgeDocuments.createdAt));
  }

  async updateKnowledgeDocument(documentId: string, updates: Partial<InsertKnowledgeDocument>): Promise<KnowledgeDocument> {
    const [updatedDocument] = await db
      .update(knowledgeDocuments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(knowledgeDocuments.id, documentId))
      .returning();
    return updatedDocument;
  }

  async createSearchIndex(index: Omit<InsertKnowledgeSearchIndex, 'id' | 'createdAt'>): Promise<KnowledgeSearchIndex> {
    const [newIndex] = await db
      .insert(knowledgeSearchIndex)
      .values(index)
      .returning();
    return newIndex;
  }
}

export const storage = new DatabaseStorage();
