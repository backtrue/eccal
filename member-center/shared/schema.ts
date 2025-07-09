import { pgTable, text, timestamp, integer, boolean, json, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// 用戶基本資料表
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Google OAuth ID
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  locale: text("locale").default("zh-TW"),
  timezone: text("timezone").default("Asia/Taipei"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 會員等級管理
export const userMemberships = pgTable("user_memberships", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  level: text("level").notNull(), // free, pro, enterprise
  expiresAt: timestamp("expires_at"),
  features: json("features"), // 會員功能權限
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 積分系統
export const userCredits = pgTable("user_credits", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  balance: integer("balance").default(0),
  totalEarned: integer("total_earned").default(0),
  totalSpent: integer("total_spent").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 積分交易記錄
export const creditTransactions = pgTable("credit_transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // earn, spend, refund
  amount: integer("amount").notNull(),
  description: text("description"),
  sourceType: text("source_type"), // referral, welcome, upgrade, etc.
  sourceId: text("source_id"), // 相關記錄 ID
  createdAt: timestamp("created_at").defaultNow(),
});

// 推薦系統
export const userReferrals = pgTable("user_referrals", {
  id: text("id").primaryKey(),
  referrerId: text("referrer_id").references(() => users.id).notNull(),
  refereeId: text("referee_id").references(() => users.id).notNull(),
  referralCode: text("referral_code").notNull(),
  rewardAmount: integer("reward_amount").default(0),
  status: text("status").default("pending"), // pending, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// 網站權限管理
export const sitePermissions = pgTable("site_permissions", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  siteDomain: text("site_domain").notNull(), // eccal.thinkwithblack.com, etc.
  permissions: json("permissions"), // 網站特定權限
  lastAccessAt: timestamp("last_access_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 用戶偏好設置
export const userPreferences = pgTable("user_preferences", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  language: text("language").default("zh-TW"),
  timezone: text("timezone").default("Asia/Taipei"),
  notifications: json("notifications"), // 通知設置
  privacy: json("privacy"), // 隱私設置
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 註冊網站管理
export const registeredSites = pgTable("registered_sites", {
  id: text("id").primaryKey(),
  domain: text("domain").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  apiKey: text("api_key").notNull().unique(),
  apiSecret: text("api_secret").notNull(),
  allowedOrigins: json("allowed_origins"), // CORS 設置
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// API 使用記錄
export const apiUsage = pgTable("api_usage", {
  id: text("id").primaryKey(),
  siteId: text("site_id").references(() => registeredSites.id).notNull(),
  userId: text("user_id").references(() => users.id),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  statusCode: integer("status_code").notNull(),
  responseTime: integer("response_time"), // ms
  createdAt: timestamp("created_at").defaultNow(),
});

// 用戶會話管理
export const userSessions = pgTable("user_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  siteId: text("site_id").references(() => registeredSites.id),
  token: text("token").notNull(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod 驗證 schemas
export const insertUserSchema = createInsertSchema(users);
export const insertUserMembershipSchema = createInsertSchema(userMemberships);
export const insertUserCreditsSchema = createInsertSchema(userCredits);
export const insertCreditTransactionSchema = createInsertSchema(creditTransactions);
export const insertUserReferralSchema = createInsertSchema(userReferrals);
export const insertSitePermissionSchema = createInsertSchema(sitePermissions);
export const insertUserPreferencesSchema = createInsertSchema(userPreferences);
export const insertRegisteredSiteSchema = createInsertSchema(registeredSites);
export const insertApiUsageSchema = createInsertSchema(apiUsage);
export const insertUserSessionSchema = createInsertSchema(userSessions);

// 類型定義
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserMembership = typeof userMemberships.$inferSelect;
export type InsertUserMembership = z.infer<typeof insertUserMembershipSchema>;
export type UserCredits = typeof userCredits.$inferSelect;
export type InsertUserCredits = z.infer<typeof insertUserCreditsSchema>;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = z.infer<typeof insertCreditTransactionSchema>;
export type UserReferral = typeof userReferrals.$inferSelect;
export type InsertUserReferral = z.infer<typeof insertUserReferralSchema>;
export type SitePermission = typeof sitePermissions.$inferSelect;
export type InsertSitePermission = z.infer<typeof insertSitePermissionSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type RegisteredSite = typeof registeredSites.$inferSelect;
export type InsertRegisteredSite = z.infer<typeof insertRegisteredSiteSchema>;
export type ApiUsage = typeof apiUsage.$inferSelect;
export type InsertApiUsage = z.infer<typeof insertApiUsageSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;

// 會員等級枚舉
export enum MembershipLevel {
  FREE = "free",
  PRO = "pro",
  ENTERPRISE = "enterprise"
}

// 積分交易類型
export enum CreditTransactionType {
  EARN = "earn",
  SPEND = "spend",
  REFUND = "refund"
}

// 推薦狀態
export enum ReferralStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

// 用戶會話資料介面
export interface UserSessionData {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  membership: {
    level: MembershipLevel;
    expiresAt?: Date;
    features: any;
  };
  credits: {
    balance: number;
    totalEarned: number;
    totalSpent: number;
  };
  preferences: {
    language: string;
    timezone: string;
    notifications: any;
    privacy: any;
  };
}

// API 回應格式
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 跨網站認證 Token 結構
export interface CrossSiteToken {
  sub: string; // 用戶 ID
  email: string;
  name: string;
  avatar?: string;
  membership: MembershipLevel;
  credits: number;
  site: string; // 網站域名
  exp: number; // 過期時間
  iat: number; // 簽發時間
}