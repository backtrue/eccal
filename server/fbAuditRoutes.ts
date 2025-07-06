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

  // 流式廣告健檢 (Server-Sent Events)
  app.post('/api/fbaudit/check-stream', requireJWTAuth, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { adAccountId, planResultId, industryType, locale = 'zh-TW' } = req.body;

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

      // 設置 SSE headers
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      // 發送初始狀態
      res.write(`data: ${JSON.stringify({ type: 'status', message: '開始獲取廣告數據...' })}\n\n`);

      // 獲取廣告帳號數據
      const adAccountData = await fbAuditService.getAdAccountData(
        user.metaAccessToken, 
        adAccountId
      );

      res.write(`data: ${JSON.stringify({ type: 'status', message: '計算實際指標...' })}\n\n`);

      // 計算實際指標
      const actualMetrics = fbAuditService.calculateMetrics(adAccountData);

      res.write(`data: ${JSON.stringify({ type: 'status', message: '準備比較目標值...' })}\n\n`);

      // 獲取目標值並逐個生成建議
      const comparisons = await fbAuditService.compareWithTargetsStreaming(
        actualMetrics,
        planResultId,
        industryType,
        user.metaAccessToken,
        adAccountId,
        locale,
        (progress) => {
          // 發送進度更新
          res.write(`data: ${JSON.stringify(progress)}\n\n`);
        }
      );

      // 儲存健檢結果
      const healthCheck = await fbAuditService.saveHealthCheck(
        user.id,
        adAccountData,
        actualMetrics,
        comparisons,
        planResultId,
        industryType
      );

      // 發送最終結果
      res.write(`data: ${JSON.stringify({ 
        type: 'complete', 
        data: {
          healthCheckId: healthCheck.id,
          adAccountData,
          actualMetrics,
          comparisons
        }
      })}\n\n`);

      res.end();
    } catch (error) {
      console.error('Error in streaming health check:', error);
      res.write(`data: ${JSON.stringify({ 
        type: 'error', 
        error: error instanceof Error ? error.message : 'Failed to perform health check'
      })}\n\n`);
      res.end();
    }
  });

  // 執行廣告健檢
  app.post('/api/fbaudit/check', requireJWTAuth, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { adAccountId, planResultId, industryType, locale = 'zh-TW' } = req.body;

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
        industryType,
        user.metaAccessToken,
        adAccountId,
        locale
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

  // 測試 Facebook API 原始資料端點
  app.get('/api/fbaudit/test-api/:accountId', requireJWTAuth, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { accountId } = req.params;

      if (!user.metaAccessToken) {
        return res.status(400).json({ 
          success: false, 
          error: 'Facebook access token not found' 
        });
      }

      console.log('Testing Facebook API with account:', accountId);
      console.log('Access token length:', user.metaAccessToken.length);

      // 測試基本欄位
      const testFields = ['spend', 'impressions', 'clicks', 'actions', 'action_values'];
      const since = '2024-12-01';
      const until = '2024-12-28';
      
      const formattedAccountId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
      const url = `https://graph.facebook.com/v19.0/${formattedAccountId}/insights?fields=${testFields.join(',')}&time_range={"since":"${since}","until":"${until}"}&access_token=${user.metaAccessToken}`;
      
      console.log('Test API URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('Test API response:', JSON.stringify(data, null, 2));
      
      res.json({ 
        success: true, 
        url,
        response: data
      });
    } catch (error) {
      console.error('Error testing Facebook API:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to test API'
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

  // 提交健檢 NPS 評分
  app.put('/api/fbaudit/check/:id/rating', requireJWTAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { npsScore, npsComment } = req.body;
      const userId = req.user.id;

      console.log('=== 提交 NPS 評分 ===');
      console.log('健檢 ID:', id);
      console.log('用戶 ID:', userId);
      console.log('評分:', npsScore);
      console.log('評論:', npsComment);

      // 驗證評分範圍
      if (!npsScore || npsScore < 1 || npsScore > 10) {
        return res.status(400).json({
          success: false,
          error: 'NPS 評分必須是 1-10 之間的整數'
        });
      }

      // 更新健檢記錄的評分
      const result = await db
        .update(fbHealthChecks)
        .set({
          npsScore: parseInt(npsScore),
          npsComment: npsComment || null,
          npsSubmittedAt: new Date(),
          updatedAt: new Date()
        })
        .where(
          and(
            eq(fbHealthChecks.id, id),
            eq(fbHealthChecks.userId, userId)
          )
        )
        .returning({ id: fbHealthChecks.id });

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          error: '找不到該健檢記錄或無權限修改'
        });
      }

      console.log('NPS 評分提交成功');
      
      res.json({
        success: true,
        message: 'NPS 評分提交成功',
        data: {
          healthCheckId: id,
          npsScore: parseInt(npsScore),
          npsComment: npsComment || null
        }
      });
    } catch (error) {
      console.error('提交 NPS 評分錯誤:', error);
      res.status(500).json({
        success: false,
        error: '提交評分失敗，請稍後再試'
      });
    }
  });

  // 測試 Hero Post 查找功能
  app.get('/api/fbaudit/test-hero-posts/:accountId', requireJWTAuth, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { accountId } = req.params;
      
      if (!user.metaAccessToken) {
        return res.status(400).json({ 
          success: false, 
          error: 'Facebook access token not found' 
        });
      }

      console.log('測試 Hero Post 查找，帳戶ID:', accountId);
      const heroPosts = await fbAuditService.getHeroPosts(user.metaAccessToken, accountId);
      
      res.json({
        success: true,
        accountId,
        heroPostsCount: heroPosts.length,
        heroPosts
      });
    } catch (error) {
      console.error('測試 Hero Post 錯誤:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error', 
        details: error.message 
      });
    }
  });
}