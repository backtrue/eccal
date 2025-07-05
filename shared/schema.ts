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
  // Meta/Facebook Ad Account Integration
  metaAccessToken: varchar("meta_access_token"),
  metaAdAccountId: varchar("meta_ad_account_id"),
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

// Campaign Plans - Core table for campaign planning
export const campaignPlans = pgTable("campaign_plans", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  
  // Campaign Timeline
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalDays: integer("total_days").notNull(),
  
  // Target Metrics
  targetRevenue: decimal("target_revenue", { precision: 15, scale: 2 }).notNull(),
  targetAov: decimal("target_aov", { precision: 10, scale: 2 }).notNull(),
  targetConversionRate: decimal("target_conversion_rate", { precision: 8, scale: 4 }).notNull(), // e.g., 2.5000 for 2.5%
  costPerClick: decimal("cost_per_click", { precision: 8, scale: 2 }).notNull(),
  
  // Calculated Results
  totalBudget: decimal("total_budget", { precision: 15, scale: 2 }),
  totalTraffic: integer("total_traffic"),
  totalOrders: integer("total_orders"),
  
  // Campaign Status
  status: varchar("status", { length: 20 }).default("draft").notNull(), // draft, active, completed, paused
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Campaign Periods - Budget allocation by period
export const campaignPeriods = pgTable("campaign_periods", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  campaignId: text("campaign_id").notNull().references(() => campaignPlans.id, { onDelete: "cascade" }),
  
  // Period Info
  name: varchar("name").notNull(), // "preheat", "launch", "main", "final", "repurchase"
  displayName: varchar("display_name").notNull(), // "預熱期", "啟動期", etc.
  orderIndex: integer("order_index").notNull(), // for sorting
  
  // Period Timeline
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  durationDays: integer("duration_days").notNull(),
  
  // Budget Allocation
  budgetAmount: decimal("budget_amount", { precision: 15, scale: 2 }).notNull(),
  budgetPercentage: decimal("budget_percentage", { precision: 5, scale: 2 }).notNull(), // e.g., 25.50 for 25.5%
  dailyBudget: decimal("daily_budget", { precision: 10, scale: 2 }).notNull(),
  
  // Traffic Allocation
  trafficAmount: integer("traffic_amount").notNull(),
  trafficPercentage: decimal("traffic_percentage", { precision: 5, scale: 2 }).notNull(),
  dailyTraffic: integer("daily_traffic").notNull(),
  
  // Expected Results
  expectedOrders: integer("expected_orders").notNull(),
  expectedRevenue: decimal("expected_revenue", { precision: 15, scale: 2 }).notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily Budget Breakdown - Day-by-day allocation
export const dailyBudgets = pgTable("daily_budgets", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  campaignId: text("campaign_id").notNull().references(() => campaignPlans.id, { onDelete: "cascade" }),
  periodId: text("period_id").notNull().references(() => campaignPeriods.id, { onDelete: "cascade" }),
  
  // Daily Info
  date: timestamp("date").notNull(),
  dayOfCampaign: integer("day_of_campaign").notNull(), // 1, 2, 3, etc.
  
  // Budget & Traffic
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  traffic: integer("traffic").notNull(),
  expectedOrders: integer("expected_orders").notNull(),
  expectedRevenue: decimal("expected_revenue", { precision: 12, scale: 2 }).notNull(),
  
  // Status tracking (for live campaigns)
  actualSpend: decimal("actual_spend", { precision: 10, scale: 2 }),
  actualTraffic: integer("actual_traffic"),
  actualOrders: integer("actual_orders"),
  actualRevenue: decimal("actual_revenue", { precision: 12, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Campaign Templates - Reusable campaign structures
export const campaignTemplates = pgTable("campaign_templates", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id").references(() => users.id), // null for system templates
  name: varchar("name").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false).notNull(),
  
  // Template Structure (JSON)
  periodStructure: jsonb("period_structure").notNull(), // predefined period allocations
  defaultSettings: jsonb("default_settings"), // default CPC, conversion rates, etc.
  
  // Usage Stats
  useCount: integer("use_count").default(0).notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Saved projects for PDCA cycle - Plan phase results stored here
export const savedProjects = pgTable("saved_projects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id").notNull().references(() => users.id),
  projectName: varchar("project_name").notNull(),
  projectType: varchar("project_type").notNull(), // e.g., "budget_calculator", "campaign_planner", etc.
  projectData: jsonb("project_data").notNull(), // flexible JSON storage for project-specific data
  lastCalculationResult: jsonb("last_calculation_result"), // store last calculation results
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// PDCA Plan Results - Calculator outcomes for future Check/Act phases
export const planResults = pgTable("plan_results", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id").notNull().references(() => users.id),
  planName: varchar("plan_name").notNull(), // e.g., "10月預算", "Q4廣告計畫"
  
  // Original Input Data
  targetRevenue: decimal("target_revenue", { precision: 15, scale: 2 }).notNull(),
  averageOrderValue: decimal("average_order_value", { precision: 10, scale: 2 }).notNull(),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 4 }).notNull(),
  cpc: decimal("cpc", { precision: 6, scale: 2 }).notNull(),
  
  // Calculated Results
  requiredOrders: integer("required_orders").notNull(),
  monthlyTraffic: integer("monthly_traffic").notNull(),
  dailyTraffic: integer("daily_traffic").notNull(),
  monthlyAdBudget: decimal("monthly_ad_budget", { precision: 12, scale: 2 }).notNull(),
  dailyAdBudget: decimal("daily_ad_budget", { precision: 10, scale: 2 }).notNull(),
  targetRoas: decimal("target_roas", { precision: 5, scale: 2 }).notNull(),
  
  // Data Source Info
  gaPropertyId: varchar("ga_property_id"), // Google Analytics property used
  gaPropertyName: varchar("ga_property_name"),
  dataSource: varchar("data_source").default("manual").notNull(), // "manual", "google_analytics"
  
  // PDCA Integration
  pdcaPhase: varchar("pdca_phase").default("plan").notNull(), // "plan", "check", "act"
  isActive: boolean("is_active").default(true).notNull(), // for current active plan
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Facebook Ad Diagnosis Reports
export const adDiagnosisReports = pgTable("ad_diagnosis_reports", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id").notNull().references(() => users.id),
  campaignId: varchar("campaign_id").notNull(), // Facebook Campaign ID
  campaignName: varchar("campaign_name").notNull(),
  
  // Target data from calculator
  targetDailyTraffic: integer("target_daily_traffic").notNull(),
  targetDailyBudget: decimal("target_daily_budget", { precision: 10, scale: 2 }).notNull(),
  targetCpa: decimal("target_cpa", { precision: 10, scale: 2 }).notNull(),
  targetRoas: decimal("target_roas", { precision: 5, scale: 2 }).notNull(),
  
  // Actual Facebook ad data
  actualDailyTraffic: integer("actual_daily_traffic").notNull(),
  actualDailySpend: decimal("actual_daily_spend", { precision: 10, scale: 2 }).notNull(),
  actualCtr: decimal("actual_ctr", { precision: 5, scale: 4 }).notNull(), // Click-through rate
  actualCpa: decimal("actual_cpa", { precision: 10, scale: 2 }).notNull(),
  actualRoas: decimal("actual_roas", { precision: 5, scale: 2 }).notNull(),
  
  // Diagnosis results
  overallHealthScore: integer("overall_health_score").notNull(), // 0-100
  trafficAchievementRate: decimal("traffic_achievement_rate", { precision: 5, scale: 2 }).notNull(),
  budgetUtilizationRate: decimal("budget_utilization_rate", { precision: 5, scale: 2 }).notNull(),
  
  // AI generated report
  aiDiagnosisReport: text("ai_diagnosis_report").notNull(), // Markdown format
  diagnosisStatus: varchar("diagnosis_status").default("completed").notNull(), // completed, processing, failed
  
  // High-performing ads data (JSON array)
  topPerformingAds: jsonb("top_performing_ads"), // Array of high-performing ads with CTR > average and impressions > 500
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUserMetrics = typeof userMetrics.$inferInsert;
export type UserMetrics = typeof userMetrics.$inferSelect;

// Plan Results types for PDCA integration
export type InsertPlanResult = typeof planResults.$inferInsert;
export type PlanResult = typeof planResults.$inferSelect;
export type UserCredits = typeof userCredits.$inferSelect;
export type InsertUserCredits = typeof userCredits.$inferInsert;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = typeof creditTransactions.$inferInsert;
export type UserReferral = typeof userReferrals.$inferSelect;
export type InsertUserReferral = typeof userReferrals.$inferInsert;
export type SavedProject = typeof savedProjects.$inferSelect;
export type InsertSavedProject = typeof savedProjects.$inferInsert;
export type AdDiagnosisReport = typeof adDiagnosisReports.$inferSelect;
export type InsertAdDiagnosisReport = typeof adDiagnosisReports.$inferInsert;

// Campaign Planner Types
export type CampaignPlan = typeof campaignPlans.$inferSelect;
export type InsertCampaignPlan = typeof campaignPlans.$inferInsert;
export type CampaignPeriod = typeof campaignPeriods.$inferSelect;
export type InsertCampaignPeriod = typeof campaignPeriods.$inferInsert;
export type DailyBudget = typeof dailyBudgets.$inferSelect;
export type InsertDailyBudget = typeof dailyBudgets.$inferInsert;
export type CampaignTemplate = typeof campaignTemplates.$inferSelect;
export type InsertCampaignTemplate = typeof campaignTemplates.$inferInsert;

// Campaign Planner Zod Schemas
export const insertCampaignPlanSchema = createInsertSchema(campaignPlans, {
  targetRevenue: z.number().min(0.01, "目標營收必須大於0"),
  targetAov: z.number().min(0.01, "目標客單價必須大於0"),
  targetConversionRate: z.number().min(0.01).max(100, "轉換率必須介於0.01%到100%之間"),
  costPerClick: z.number().min(0.01, "每次點擊成本必須大於0"),
});

export const insertCampaignPeriodSchema = createInsertSchema(campaignPeriods);
export const insertDailyBudgetSchema = createInsertSchema(dailyBudgets);
export const insertCampaignTemplateSchema = createInsertSchema(campaignTemplates);

export type InsertCampaignPlanType = z.infer<typeof insertCampaignPlanSchema>;
export type InsertCampaignPeriodType = z.infer<typeof insertCampaignPeriodSchema>;
export type InsertDailyBudgetType = z.infer<typeof insertDailyBudgetSchema>;
export type InsertCampaignTemplateType = z.infer<typeof insertCampaignTemplateSchema>;
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
export type SystemLog = typeof systemLogs.$inferSelect;
export type InsertSystemLog = typeof systemLogs.$inferInsert;
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
export type SystemLogType = typeof systemLogs.$inferSelect;
export type InsertSystemLogType = typeof systemLogs.$inferInsert;
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

// Knowledge base tables for storing educational content
export const knowledgeCategories = pgTable("knowledge_categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name").notNull(),
  description: text("description"),
  parentId: text("parent_id"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const knowledgeDocuments = pgTable("knowledge_documents", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  categoryId: text("category_id").notNull().references(() => knowledgeCategories.id),
  tags: text("tags").array(), // Array of tags for easy searching
  source: varchar("source"), // Original file name or source
  documentType: varchar("document_type", { enum: ["lecture", "guide", "reference", "case_study"] }).notNull(),
  wordCount: integer("word_count"),
  language: varchar("language", { length: 10 }).default("zh-TW"),
  isPublished: boolean("is_published").default(true),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const knowledgeSearchIndex = pgTable("knowledge_search_index", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  documentId: text("document_id").notNull().references(() => knowledgeDocuments.id, { onDelete: 'cascade' }),
  keywords: text("keywords").array(), // Extracted keywords for search
  concepts: text("concepts").array(), // Main concepts covered
  difficulty: varchar("difficulty", { enum: ["beginner", "intermediate", "advanced"] }),
  estimatedReadTime: integer("estimated_read_time"), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
});

export type KnowledgeCategory = typeof knowledgeCategories.$inferSelect;
export type InsertKnowledgeCategory = typeof knowledgeCategories.$inferInsert;
export type KnowledgeDocument = typeof knowledgeDocuments.$inferSelect;
export type InsertKnowledgeDocument = typeof knowledgeDocuments.$inferInsert;
export type KnowledgeSearchIndex = typeof knowledgeSearchIndex.$inferSelect;
export type InsertKnowledgeSearchIndex = typeof knowledgeSearchIndex.$inferInsert;
