import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  decimal,
  numeric,
  boolean,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Google OAuth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // Google user ID
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  googleAccessToken: varchar("google_access_token"),
  googleRefreshToken: varchar("google_refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  membershipLevel: varchar("membership_level", { length: 10 }).default("free").notNull(), // "free" or "pro"
  membershipExpires: timestamp("membership_expires"), // null for free, date for pro
  campaignPlannerUsage: integer("campaign_planner_usage").default(0).notNull(), // Track usage count
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Store user's e-commerce metrics
export const userMetrics = pgTable("user_metrics", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  averageOrderValue: decimal("average_order_value", { precision: 10, scale: 2 }),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 4 }), // e.g., 0.0125 for 1.25%
  dataSource: varchar("data_source", { length: 50 }), // 'google_analytics', 'google_ads', etc.
  gaResourceName: varchar("ga_resource_name", { length: 255 }), // Store GA resource name for Brevo
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  rawData: jsonb("raw_data"), // Store the original API response
  createdAt: timestamp("created_at").defaultNow(),
});

// Credit system tables
export const userCredits = pgTable("user_credits", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id").notNull().references(() => users.id),
  balance: integer("balance").notNull().default(5), // starting with 5 credits
  totalEarned: integer("total_earned").notNull().default(5), // total credits earned
  totalSpent: integer("total_spent").notNull().default(0), // total credits spent
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const creditTransactions = pgTable("credit_transactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // "earn" or "spend"
  amount: integer("amount").notNull(),
  source: varchar("source").notNull(), // "registration", "referral", "calculation", "admin_bonus"
  referralUserId: varchar("referral_user_id").references(() => users.id), // who referred this user (for referral credits)
  description: varchar("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Referral system
export const userReferrals = pgTable("user_referrals", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  referrerId: varchar("referrer_id").notNull().references(() => users.id), // who made the referral
  referredUserId: varchar("referred_user_id").notNull().references(() => users.id), // who was referred
  referralCode: varchar("referral_code").notNull().unique(), // unique referral code
  creditAwarded: boolean("credit_awarded").notNull().default(false), // whether credit was given
  createdAt: timestamp("created_at").defaultNow(),
});

// Saved projects for reusable calculations
export const savedProjects = pgTable("saved_projects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id").notNull().references(() => users.id),
  projectName: varchar("project_name").notNull(),
  projectType: varchar("project_type").notNull(), // e.g., "campaign_planner", "budget_calculator", etc.
  projectData: jsonb("project_data").notNull(), // flexible JSON storage for project-specific data
  lastCalculationResult: jsonb("last_calculation_result"), // store last calculation results
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUserMetrics = typeof userMetrics.$inferInsert;
export type UserMetrics = typeof userMetrics.$inferSelect;
export type UserCredits = typeof userCredits.$inferSelect;
export type InsertUserCredits = typeof userCredits.$inferInsert;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = typeof creditTransactions.$inferInsert;
export type UserReferral = typeof userReferrals.$inferSelect;
export type InsertUserReferral = typeof userReferrals.$inferInsert;
export type SavedProject = typeof savedProjects.$inferSelect;
export type InsertSavedProject = typeof savedProjects.$inferInsert;
export type UserBehavior = typeof userBehavior.$inferSelect;
export type InsertUserBehavior = typeof userBehavior.$inferInsert;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;
export type ApiUsage = typeof apiUsage.$inferSelect;
export type InsertApiUsage = typeof apiUsage.$inferInsert;
export type ExportJob = typeof exportJobs.$inferSelect;
export type InsertExportJob = typeof exportJobs.$inferInsert;
export type SeoSettings = typeof seoSettings.$inferSelect;
export type InsertSeoSettings = typeof seoSettings.$inferInsert;
export type AdminSettings = typeof adminSettings.$inferSelect;
export type InsertAdminSettings = typeof adminSettings.$inferInsert;



// SEO settings table for admin management
export const seoSettings = pgTable("seo_settings", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  page: varchar("page", { length: 100 }).notNull().unique(), // e.g., "home", "calculator", "campaign-planner"
  title: varchar("title", { length: 200 }),
  description: varchar("description", { length: 500 }),
  keywords: varchar("keywords", { length: 300 }),
  ogTitle: varchar("og_title", { length: 200 }),
  ogDescription: varchar("og_description", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// System logs table for monitoring
export const systemLogs = pgTable("system_logs", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  level: varchar("level", { length: 20 }).notNull(), // "info", "warn", "error"
  message: text("message").notNull(),
  userId: varchar("user_id").references(() => users.id),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  endpoint: varchar("endpoint", { length: 200 }),
  responseTime: integer("response_time"), // milliseconds
  statusCode: integer("status_code"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin settings table
export const adminSettings = pgTable("admin_settings", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  description: varchar("description", { length: 300 }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SeoSetting = typeof seoSettings.$inferSelect;
export type InsertSeoSetting = typeof seoSettings.$inferInsert;
export type AdminSetting = typeof adminSettings.$inferSelect;
export type InsertAdminSetting = typeof adminSettings.$inferInsert;

// User behavior tracking table
export const userBehavior = pgTable("user_behavior", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"),
  action: varchar("action", { length: 100 }).notNull(), // "page_view", "calculation", "login", "logout"
  page: varchar("page", { length: 100 }),
  feature: varchar("feature", { length: 100 }), // "calculator", "campaign_planner", etc.
  duration: integer("duration"), // seconds spent on page/feature
  metadata: jsonb("metadata"), // additional data like calculation inputs
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Announcements system table
export const announcements = pgTable("announcements", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 20 }).default("info").notNull(), // "info", "warning", "success", "error"
  isActive: boolean("is_active").default(true).notNull(),
  targetAudience: varchar("target_audience", { length: 20 }).default("all").notNull(), // "all", "free", "pro"
  priority: integer("priority").default(0).notNull(), // higher number = higher priority
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// API usage tracking table
export const apiUsage = pgTable("api_usage", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").references(() => users.id),
  service: varchar("service", { length: 50 }).notNull(), // "google_analytics", "google_oauth", etc.
  endpoint: varchar("endpoint", { length: 200 }),
  method: varchar("method", { length: 10 }),
  statusCode: integer("status_code"),
  responseTime: integer("response_time"),
  quotaUsed: integer("quota_used").default(1).notNull(),
  errorMessage: text("error_message"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Data export jobs table
export const exportJobs = pgTable("export_jobs", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // "users", "calculations", "behavior", "full"
  status: varchar("status", { length: 20 }).default("pending").notNull(), // "pending", "processing", "completed", "failed"
  fileName: varchar("file_name", { length: 200 }),
  fileSize: integer("file_size"),
  downloadUrl: varchar("download_url", { length: 500 }),
  filters: jsonb("filters"), // export criteria
  progress: integer("progress").default(0).notNull(), // 0-100
  errorMessage: text("error_message"),
  expiresAt: timestamp("expires_at"), // when download link expires
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Marketing plans database tables
export const marketingPlans = pgTable("marketing_plans", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  fileName: varchar("file_name").notNull(),
  fileSize: integer("file_size"),
  fileType: varchar("file_type"),
  status: varchar("status", { enum: ["processing", "completed", "failed"] }).default("processing"),
  errorMessage: text("error_message"),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const planAnalysisItems = pgTable("plan_analysis_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  planId: text("plan_id").notNull().references(() => marketingPlans.id, { onDelete: 'cascade' }),
  phase: varchar("phase", { enum: ["pre_heat", "campaign", "repurchase"] }).notNull(),
  strategySummary: text("strategy_summary").notNull(),
  isApproved: boolean("is_approved").default(false),
});

export type MarketingPlan = typeof marketingPlans.$inferSelect;
export type InsertMarketingPlan = typeof marketingPlans.$inferInsert;
export type PlanAnalysisItem = typeof planAnalysisItems.$inferSelect;
export type InsertPlanAnalysisItem = typeof planAnalysisItems.$inferInsert;
