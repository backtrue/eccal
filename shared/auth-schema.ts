
import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// 共享會員系統 - 核心用戶表
export const sharedUsers = pgTable("shared_users", {
  id: varchar("id").primaryKey().notNull(), // Google user ID
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  googleAccessToken: varchar("google_access_token"),
  googleRefreshToken: varchar("google_refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  membershipLevel: varchar("membership_level", { length: 10 }).default("free").notNull(),
  membershipExpires: timestamp("membership_expires"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 共享積分系統
export const sharedUserCredits = pgTable("shared_user_credits", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id").notNull().references(() => sharedUsers.id),
  balance: integer("balance").notNull().default(5),
  totalEarned: integer("total_earned").notNull().default(5),
  totalSpent: integer("total_spent").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 共享積分交易記錄
export const sharedCreditTransactions = pgTable("shared_credit_transactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id").notNull().references(() => sharedUsers.id),
  type: varchar("type").notNull(), // "earn" or "spend"
  amount: integer("amount").notNull(),
  source: varchar("source").notNull(), // "registration", "referral", "app_usage", "admin_bonus"
  appName: varchar("app_name"), // 記錄是哪個 app 產生的交易
  referralUserId: varchar("referral_user_id").references(() => sharedUsers.id),
  description: varchar("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 共享推薦系統
export const sharedUserReferrals = pgTable("shared_user_referrals", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  referrerId: varchar("referrer_id").notNull().references(() => sharedUsers.id),
  referredUserId: varchar("referred_user_id").notNull().references(() => sharedUsers.id),
  referralCode: varchar("referral_code").notNull().unique(),
  creditAwarded: boolean("credit_awarded").notNull().default(false),
  sourceApp: varchar("source_app"), // 記錄推薦來源 app
  createdAt: timestamp("created_at").defaultNow(),
});

// 跨 App 使用記錄
export const appUsageRecords = pgTable("app_usage_records", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id").notNull().references(() => sharedUsers.id),
  appName: varchar("app_name").notNull(), // "eccal", "your_new_app", etc.
  appVersion: varchar("app_version"),
  feature: varchar("feature"), // "calculator", "campaign_planner", etc.
  usageCount: integer("usage_count").default(1),
  lastUsedAt: timestamp("last_used_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Session storage table (共享)
export const sharedSessions = pgTable(
  "shared_sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_shared_session_expire").on(table.expire)],
);

// Types
export type SharedUser = typeof sharedUsers.$inferSelect;
export type InsertSharedUser = typeof sharedUsers.$inferInsert;
export type SharedUserCredits = typeof sharedUserCredits.$inferSelect;
export type InsertSharedUserCredits = typeof sharedUserCredits.$inferInsert;
export type SharedCreditTransaction = typeof sharedCreditTransactions.$inferSelect;
export type InsertSharedCreditTransaction = typeof sharedCreditTransactions.$inferInsert;
export type SharedUserReferral = typeof sharedUserReferrals.$inferSelect;
export type InsertSharedUserReferral = typeof sharedUserReferrals.$inferInsert;
export type AppUsageRecord = typeof appUsageRecords.$inferSelect;
export type InsertAppUsageRecord = typeof appUsageRecords.$inferInsert;

// Schemas
export const insertSharedUserSchema = createInsertSchema(sharedUsers);
export const insertSharedUserCreditsSchema = createInsertSchema(sharedUserCredits);
export const insertSharedCreditTransactionSchema = createInsertSchema(sharedCreditTransactions);
export const insertSharedUserReferralSchema = createInsertSchema(sharedUserReferrals);
export const insertAppUsageRecordSchema = createInsertSchema(appUsageRecords);
