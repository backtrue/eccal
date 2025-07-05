import { Express, Request, Response } from "express";
import { fbAuditService } from "./fbAuditService";
import { requireJWTAuth } from "./jwtAuth";
import { db } from "./db";
import { planResults, fbHealthChecks } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export function setupFbAuditRoutes(app: Express) {
  
  // 獲取使用者的 Facebook 廣告帳號列表
  app.get('/api/fbaudit/accounts', requireJWTAuth, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      console.log('FB帳戶API調用 - 用戶資料:', {
        userId: user.id,
        email: user.email,
        hasMetaToken: !!user.metaAccessToken,
        metaTokenPrefix: user.metaAccessToken ? user.metaAccessToken.substring(0, 20) + '...' : null
      });
      
      if (!user.metaAccessToken) {
        console.log('錯誤：用戶沒有 Facebook access token');
        return res.status(400).json({ 
          success: false, 
          error: 'Facebook access token not found. Please connect your Facebook account first.' 
        });
      }

      console.log('開始調用 Facebook Marketing API 獲取廣告帳戶');
      const accounts = await fbAuditService.getAdAccounts(user.metaAccessToken);
      console.log('Facebook API 返回結果:', {
        accountsCount: accounts?.length || 0,
        accounts: accounts
      });
      
      res.json({ 
        success: true, 
        data: accounts 
      });
    } catch (error) {
      console.error('Error fetching ad accounts:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch ad accounts' 
      });
    }
  });

  // 獲取使用者的預算計劃列表
  app.get('/api/fbaudit/plans', requireJWTAuth, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      console.log('載入預算計劃 - 用戶資料:', {
        userId: user.id,
        email: user.email
      });
      
      const plans = await db.query.planResults.findMany({
        where: eq(planResults.userId, user.id),
        orderBy: (planResults, { desc }) => [desc(planResults.createdAt)],
        columns: {
          id: true,
          planName: true,
          targetRoas: true,
          dailyAdBudget: true,
          requiredOrders: true,
          createdAt: true
        }
      });

      console.log('找到的預算計劃:', {
        plansCount: plans.length,
        plans: plans.map(p => ({ id: p.id, name: p.planName, roas: p.targetRoas }))
      });

      res.json({ 
        success: true, 
        data: plans 
      });
    } catch (error) {
      console.error('Error fetching plans:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch plans' 
      });
    }
  });

  // 獲取產業類型列表
  app.get('/api/fbaudit/industries', async (req: Request, res: Response) => {
    try {
      const industries = await fbAuditService.getIndustryTypes();
      
      res.json({ 
        success: true, 
        data: industries 
      });
    } catch (error) {
      console.error('Error fetching industries:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch industries' 
      });
    }
  });

  // 執行廣告健檢
  app.post('/api/fbaudit/check', requireJWTAuth, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { adAccountId, planResultId, industryType } = req.body;

      if (!user.metaAccessToken) {
        return res.status(400).json({ 
          success: false, 
          error: 'Facebook access token not found' 
        });
      }

      if (!adAccountId || !planResultId || !industryType) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required parameters' 
        });
      }

      // 獲取廣告帳號數據
      const adAccountData = await fbAuditService.getAdAccountData(
        user.metaAccessToken, 
        adAccountId
      );

      // 計算實際指標
      const actualMetrics = fbAuditService.calculateMetrics(adAccountData);
      console.log('Calculated actual metrics:', actualMetrics);

      // 與目標值比較並生成建議
      const comparisons = await fbAuditService.compareWithTargets(
        actualMetrics,
        planResultId,
        industryType
      );
      console.log('Generated comparisons:', comparisons);

      // 儲存健檢結果
      const healthCheck = await fbAuditService.saveHealthCheck(
        user.id,
        adAccountData,
        actualMetrics,
        comparisons,
        planResultId,
        industryType
      );

      res.json({ 
        success: true, 
        data: {
          healthCheckId: healthCheck.id,
          adAccountData,
          actualMetrics,
          comparisons,
          summary: {
            totalMetrics: comparisons.length,
            achievedMetrics: comparisons.filter(c => c.status === 'achieved').length,
            notAchievedMetrics: comparisons.filter(c => c.status === 'not_achieved').length
          }
        }
      });
    } catch (error) {
      console.error('Error performing health check:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to perform health check'
      });
    }
  });

  // 獲取健檢歷史
  app.get('/api/fbaudit/history', requireJWTAuth, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      const history = await fbAuditService.getHealthCheckHistory(user.id);
      
      res.json({ 
        success: true, 
        data: history 
      });
    } catch (error) {
      console.error('Error fetching health check history:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch health check history' 
      });
    }
  });

  // 獲取特定健檢詳情
  app.get('/api/fbaudit/check/:id', requireJWTAuth, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      
      const healthCheck = await db.query.fbHealthChecks.findFirst({
        where: (fbHealthChecks, { eq, and }) => and(
          eq(fbHealthChecks.id, id),
          eq(fbHealthChecks.userId, user.id)
        )
      });

      if (!healthCheck) {
        return res.status(404).json({ 
          success: false, 
          error: 'Health check not found' 
        });
      }

      res.json({ 
        success: true, 
        data: healthCheck 
      });
    } catch (error) {
      console.error('Error fetching health check details:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch health check details' 
      });
    }
  });

  // 刪除健檢記錄
  app.delete('/api/fbaudit/check/:id', requireJWTAuth, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      
      const result = await db.delete(fbHealthChecks)
        .where(and(
          eq(fbHealthChecks.id, id),
          eq(fbHealthChecks.userId, user.id)
        ))
        .returning({ id: fbHealthChecks.id });

      if (result.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Health check not found' 
        });
      }

      res.json({ 
        success: true, 
        message: 'Health check deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting health check:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete health check' 
      });
    }
  });

  // 初始化產業類型數據 (僅供管理員使用)
  app.post('/api/fbaudit/init-industries', async (req: Request, res: Response) => {
    try {
      await fbAuditService.initializeIndustryTypes();
      
      res.json({ 
        success: true, 
        message: 'Industry types initialized successfully' 
      });
    } catch (error) {
      console.error('Error initializing industry types:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to initialize industry types' 
      });
    }
  });
}