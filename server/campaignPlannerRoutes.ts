import type { Express } from "express";
import { requireAuth } from "./googleAuth";
import { campaignPlannerService } from "./campaignPlannerService";
import { storage } from "./storage";
import { insertCampaignPlanSchema } from "@shared/schema";
import { z } from "zod";

// Campaign Planner API 路由
export function setupCampaignPlannerRoutes(app: Express) {
  
  // 1. 建立新的活動計畫 - 核心 API
  app.post('/api/v2/campaign-planner/create', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      
      if (!userId) {
        return res.status(401).json({ error: "用戶未認證" });
      }

      // 驗證輸入資料
      const schema = z.object({
        name: z.string().min(1, "活動名稱不能為空"),
        startDate: z.string().min(1, "請選擇活動開始日期"),
        endDate: z.string().min(1, "請選擇活動結束日期"),
        targetRevenue: z.number().min(1, "目標營收必須大於0"),
        targetAov: z.number().min(1, "目標客單價必須大於0"),
        targetConversionRate: z.number().min(0.01).max(100, "轉換率必須介於0.01%到100%之間"),
        costPerClick: z.number().min(0.01, "每次點擊成本必須大於0"),
      });

      const validatedData = schema.parse(req.body);

      // 檢查會員權限
      const membershipStatus = await storage.checkMembershipStatus(userId);
      const user = await storage.getUser(userId);
      const currentUsage = user?.campaignPlannerUsage || 0;

      // 免費會員限制檢查
      if (membershipStatus.level === 'free' && currentUsage >= 3) {
        return res.status(403).json({ 
          error: "免費會員限制",
          message: "您已使用完 3 次免費額度，請升級至 Pro 會員享受無限使用。",
          canUpgrade: true
        });
      }

      // 建立活動計畫
      const result = await campaignPlannerService.calculateCampaignBudget({
        userId,
        ...validatedData
      });

      // 更新使用次數（只有免費會員）
      if (membershipStatus.level === 'free') {
        await storage.incrementCampaignPlannerUsage(userId);
      }

      res.json({
        success: true,
        data: result,
        usage: {
          current: membershipStatus.level === 'free' ? currentUsage + 1 : -1,
          limit: membershipStatus.level === 'free' ? 3 : -1,
          membershipLevel: membershipStatus.level
        }
      });

    } catch (error: any) {
      console.error('Campaign planner creation error:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: "輸入資料無效", 
          details: error.errors 
        });
      }
      
      res.status(500).json({ 
        error: "系統錯誤", 
        message: "活動計畫建立失敗，請稍後再試" 
      });
    }
  });

  // 2. 取得使用者的活動計畫列表
  app.get('/api/v2/campaign-planner/plans', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      
      if (!userId) {
        return res.status(401).json({ error: "用戶未認證" });
      }

      const plans = await campaignPlannerService.getUserCampaignPlans(userId);
      
      res.json({
        success: true,
        data: plans
      });

    } catch (error) {
      console.error('Error fetching campaign plans:', error);
      res.status(500).json({ 
        error: "取得活動計畫失敗" 
      });
    }
  });

  // 3. 取得活動計畫詳細資料
  app.get('/api/v2/campaign-planner/plans/:campaignId', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { campaignId } = req.params;
      
      if (!userId) {
        return res.status(401).json({ error: "用戶未認證" });
      }

      const planDetails = await campaignPlannerService.getCampaignPlanDetails(campaignId, userId);
      
      if (!planDetails) {
        return res.status(404).json({ error: "活動計畫不存在" });
      }
      
      res.json({
        success: true,
        data: planDetails
      });

    } catch (error) {
      console.error('Error fetching campaign plan details:', error);
      res.status(500).json({ 
        error: "取得活動計畫詳細資料失敗" 
      });
    }
  });

  // 4. 刪除活動計畫
  app.delete('/api/v2/campaign-planner/plans/:campaignId', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { campaignId } = req.params;
      
      if (!userId) {
        return res.status(401).json({ error: "用戶未認證" });
      }

      const success = await campaignPlannerService.deleteCampaignPlan(campaignId, userId);
      
      if (!success) {
        return res.status(404).json({ error: "活動計畫不存在或無權限刪除" });
      }
      
      res.json({
        success: true,
        message: "活動計畫已刪除"
      });

    } catch (error) {
      console.error('Error deleting campaign plan:', error);
      res.status(500).json({ 
        error: "刪除活動計畫失敗" 
      });
    }
  });

  // 5. 取得使用狀態（向後相容）
  app.get('/api/campaign-planner/usage', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const user = await storage.getUser(userId);
      const membershipStatus = await storage.checkMembershipStatus(userId);
      
      const usage = user?.campaignPlannerUsage || 0;
      const limit = membershipStatus.level === 'pro' ? -1 : 3;
      const canUse = membershipStatus.level === 'pro' || usage < limit;
      
      res.json({
        usage,
        limit,
        canUse,
        membershipStatus
      });
    } catch (error) {
      console.error('Error fetching campaign planner usage:', error);
      res.status(500).json({ message: 'Failed to fetch usage data' });
    }
  });

  // 6. 健康檢查
  app.get('/api/v2/campaign-planner/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'campaign-planner-v2',
      timestamp: new Date().toISOString()
    });
  });
}