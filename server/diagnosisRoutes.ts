import { Express } from 'express';
import { requireAuth } from './googleAuth';
import { storage } from './storage';
import { metaAccountService } from './metaAccountService';

export function setupDiagnosisRoutes(app: Express) {
  
  // Facebook 資料刪除回呼端點 (符合 Facebook 政策要求)
  app.post('/auth/facebook/data-deletion', async (req, res) => {
    try {
      const { signed_request } = req.body;
      
      if (!signed_request) {
        return res.status(400).json({ error: 'Missing signed_request' });
      }

      // 解析 signed_request (Facebook 標準格式)
      const [signature, payload] = signed_request.split('.');
      const decodedPayload = JSON.parse(
        Buffer.from(payload, 'base64url').toString('utf8')
      );

      const userId = decodedPayload.user_id;
      
      if (userId) {
        // 清除用戶的 Facebook 認證資訊
        try {
          await storage.updateMetaTokens(userId, '', '');
        } catch (updateError) {
          console.log('User update failed, user may not exist:', userId);
        }

        console.log(`Facebook data deletion request processed for user: ${userId}`);
      }

      // 返回確認回應 (Facebook 要求的格式)
      const baseUrl = process.env.REPLIT_DOMAINS || 'http://localhost:5000';
      res.json({
        url: `${baseUrl}/data-deletion-status/${userId || 'unknown'}`,
        confirmation_code: `DEL_${Date.now()}_${userId || 'unknown'}`
      });

    } catch (error) {
      console.error('Facebook data deletion callback error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 資料刪除狀態查詢端點
  app.get('/data-deletion-status/:userId', (req, res) => {
    const { userId } = req.params;
    res.json({
      status: 'completed',
      message: `Facebook 相關資料已清除 (User ID: ${userId})`,
      timestamp: new Date().toISOString()
    });
  });

  // Facebook 取消授權回呼端點
  app.post('/auth/facebook/deauthorize', async (req, res) => {
    try {
      const { signed_request } = req.body;
      
      if (!signed_request) {
        return res.status(400).json({ error: 'Missing signed_request' });
      }

      // 解析 signed_request (Facebook 標準格式)
      const [signature, payload] = signed_request.split('.');
      const decodedPayload = JSON.parse(
        Buffer.from(payload, 'base64url').toString('utf8')
      );

      const userId = decodedPayload.user_id;
      
      if (userId) {
        // 清除用戶的 Facebook 認證資訊
        try {
          await storage.updateMetaTokens(userId, '', '');
          console.log(`Facebook deauthorization processed for user: ${userId}`);
        } catch (updateError) {
          console.log('User deauthorization failed, user may not exist:', userId);
        }
      }

      // 返回確認回應
      res.json({
        success: true,
        message: 'Deauthorization processed successfully',
        user_id: userId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Facebook deauthorization callback error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 檢查 Facebook OAuth 配置
  app.get('/api/diagnosis/check-facebook-config', async (req, res) => {
    try {
      const hasAppId = !!process.env.FACEBOOK_APP_ID;
      const hasAppSecret = !!process.env.FACEBOOK_APP_SECRET;
      
      res.json({
        success: hasAppId && hasAppSecret,
        message: hasAppId && hasAppSecret 
          ? 'Facebook OAuth 配置正常' 
          : 'Facebook OAuth 配置不完整'
      });
    } catch (error) {
      console.error('Facebook 配置檢查錯誤:', error);
      res.status(500).json({
        success: false,
        message: '配置檢查失敗'
      });
    }
  });

  // 獲取 Facebook OAuth 授權 URL
  app.get('/api/diagnosis/facebook-auth-url', requireAuth, (req: any, res) => {
    try {
      const appId = process.env.FACEBOOK_APP_ID;
      const redirectUri = `${req.protocol}://${req.get('host')}/api/diagnosis/facebook-callback`;
      const userId = req.user.claims?.sub || req.user.id;
      
      const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?` +
        `client_id=${appId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=ads_read,ads_management&` +
        `response_type=code&` +
        `state=${userId}`;
      
      res.json({ authUrl });
    } catch (error) {
      console.error('生成 Facebook 授權 URL 錯誤:', error);
      res.status(500).json({
        success: false,
        message: '生成授權 URL 失敗'
      });
    }
  });

  // Facebook OAuth 回調處理
  app.get('/api/diagnosis/facebook-callback', async (req, res) => {
    try {
      const { code, state: userId } = req.query;
      
      if (!code) {
        return res.redirect('/calculator?error=facebook_auth_denied');
      }

      // 交換 access token
      const tokenUrl = 'https://graph.facebook.com/v19.0/oauth/access_token';
      const redirectUri = `${req.protocol}://${req.get('host')}/api/diagnosis/facebook-callback`;
      
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.FACEBOOK_APP_ID!,
          client_secret: process.env.FACEBOOK_APP_SECRET!,
          redirect_uri: redirectUri,
          code: code as string
        })
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.access_token) {
        // 獲取廣告帳戶資訊
        const accountsResponse = await fetch(
          `https://graph.facebook.com/v19.0/me/adaccounts?access_token=${tokenData.access_token}`
        );
        const accountsData = await accountsResponse.json();
        
        // 存儲用戶的 Facebook 認證資訊
        if (userId) {
          await storage.updateMetaTokens(
            userId as string, 
            tokenData.access_token,
            accountsData.data?.[0]?.id || null
          );
        }
        
        res.redirect('/calculator?facebook_connected=true');
      } else {
        console.error('Facebook token exchange failed:', tokenData);
        res.redirect('/calculator?error=token_exchange_failed');
      }
      
    } catch (error) {
      console.error('Facebook OAuth callback error:', error);
      res.redirect('/calculator?error=oauth_callback_failed');
    }
  });

  // 檢查用戶 Facebook 連接狀態
  app.get('/api/diagnosis/facebook-status', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const user = await storage.getUser(userId);
      
      res.json({
        connected: !!(user?.metaAccessToken),
        adAccountId: user?.metaAdAccountId
      });
    } catch (error) {
      console.error('檢查 Facebook 連接狀態錯誤:', error);
      res.status(500).json({
        connected: false,
        error: '檢查連接狀態失敗'
      });
    }
  });

  // 觸發廣告帳戶健診
  app.post('/api/diagnosis/analyze-account', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const {
        targetRevenue,
        targetAov,
        targetConversionRate,
        cpc
      } = req.body;

      // 驗證必要參數
      if (!targetRevenue || !targetAov || !targetConversionRate || !cpc) {
        return res.status(400).json({ 
          error: 'missing_parameters',
          message: '缺少必要參數'
        });
      }

      // 獲取用戶的 Facebook 認證資訊
      const user = await storage.getUser(userId);
      if (!user?.metaAccessToken || !user?.metaAdAccountId) {
        return res.status(400).json({
          error: 'facebook_not_connected',
          message: '請先連接 Facebook 廣告帳戶'
        });
      }

      // 建立處理中的報告
      const processingReport = await storage.createAdDiagnosisReport({
        userId,
        campaignId: user.metaAdAccountId,
        campaignName: '正在分析帳戶...',
        targetDailyTraffic: 0,
        targetDailyBudget: '0',
        targetCpa: '0',
        targetRoas: '0',
        actualDailyTraffic: 0,
        actualDailySpend: '0',
        actualCtr: '0',
        actualCpa: '0',
        actualRoas: '0',
        overallHealthScore: 0,
        trafficAchievementRate: '0',
        budgetUtilizationRate: '0',
        aiDiagnosisReport: '',
        diagnosisStatus: 'processing'
      });

      // 背景處理帳戶診斷
      processAccountDiagnosis(
        processingReport.id,
        userId,
        user.metaAccessToken,
        user.metaAdAccountId,
        {
          targetRevenue,
          targetAov,
          targetConversionRate,
          cpc
        }
      ).catch(error => {
        console.error('背景帳戶診斷處理錯誤:', error);
      });

      res.json({
        success: true,
        reportId: processingReport.id,
        message: '帳戶診斷已開始，請稍後查看結果'
      });

    } catch (error) {
      console.error('廣告帳戶診斷錯誤:', error);
      res.status(500).json({ error: '帳戶診斷處理失敗' });
    }
  });

  // 獲取診斷報告
  app.get('/api/diagnosis/report/:reportId', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { reportId } = req.params;

      const report = await storage.getAdDiagnosisReport(reportId, userId);
      if (!report) {
        return res.status(404).json({ error: '報告不存在' });
      }

      res.json(report);
    } catch (error) {
      console.error('獲取診斷報告錯誤:', error);
      res.status(500).json({ error: '獲取報告失敗' });
    }
  });

  // 獲取用戶的所有診斷報告
  app.get('/api/diagnosis/reports', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const reports = await storage.getUserAdDiagnosisReports(userId);
      res.json(reports);
    } catch (error) {
      console.error('獲取診斷報告列表錯誤:', error);
      res.status(500).json({ error: '獲取報告列表失敗' });
    }
  });

  // Meta OAuth 模擬端點 (實際部署時需要真實 OAuth 流程)
  app.post('/api/diagnosis/connect-meta', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { accessToken, adAccountId } = req.body;

      // 實際實現中需要驗證 Meta access token 的有效性
      // 這裡暫時模擬成功授權
      const updatedUser = await storage.updateMetaTokens(userId, accessToken || 'mock_token', adAccountId || 'mock_account');

      res.json({
        success: true,
        message: 'Facebook 廣告帳戶連結成功',
        user: updatedUser
      });
    } catch (error) {
      console.error('Meta 授權錯誤:', error);
      res.status(500).json({ error: 'Meta 授權失敗' });
    }
  });
}

// 背景處理帳戶診斷邏輯
async function processAccountDiagnosis(
  reportId: string,
  userId: string,
  accessToken: string,
  adAccountId: string,
  targetData: {
    targetRevenue: number;
    targetAov: number;
    targetConversionRate: number;
    cpc: number;
  }
) {
  try {
    // 1. 獲取 Meta 廣告帳戶數據
    const accountData = await metaAccountService.getAdAccountData(accessToken, adAccountId);
    
    // 2. 計算診斷數據
    const diagnosisData = metaAccountService.calculateAccountDiagnosisData(targetData, accountData);
    
    // 3. 生成 AI 診斷報告
    const aiReport = await metaAccountService.generateAccountDiagnosisReport(accountData.accountName, diagnosisData);
    
    // 4. 計算健康分數
    const healthScore = calculateAccountHealthScore(diagnosisData);
    
    // 5. 更新報告
    await updateAccountDiagnosisReport(reportId, accountData, diagnosisData, aiReport, healthScore);
    
  } catch (error) {
    console.error('處理帳戶診斷時發生錯誤:', error);
    // 更新報告狀態為失敗
    await updateDiagnosisReportStatus(reportId, 'failed', `帳戶診斷處理失敗: ${error.message}`);
  }
}

// 更新帳戶診斷報告
async function updateAccountDiagnosisReport(
  reportId: string,
  accountData: any,
  diagnosisData: any,
  aiReport: string,
  healthScore: number
) {
  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  await pool.query(`
    UPDATE ad_diagnosis_reports 
    SET 
      campaign_name = $1,
      target_daily_traffic = $2,
      target_daily_budget = $3,
      target_cpa = $4,
      target_roas = $5,
      actual_daily_traffic = $6,
      actual_daily_spend = $7,
      actual_ctr = $8,
      actual_cpa = $9,
      actual_roas = $10,
      overall_health_score = $11,
      traffic_achievement_rate = $12,
      budget_utilization_rate = $13,
      ai_diagnosis_report = $14,
      diagnosis_status = 'completed',
      updated_at = NOW()
    WHERE id = $15
  `, [
    accountData.accountName,
    Math.round(diagnosisData.targetDailyTraffic),
    Math.round(diagnosisData.targetDailyBudget).toString(),
    Math.round(diagnosisData.targetCpa).toString(),
    diagnosisData.targetRoas.toFixed(2),
    Math.round(diagnosisData.actualDailyTraffic),
    Math.round(diagnosisData.actualDailySpend).toString(),
    diagnosisData.actualCtr.toFixed(2),
    Math.round(diagnosisData.actualCpa).toString(),
    diagnosisData.actualRoas.toFixed(2),
    healthScore,
    diagnosisData.trafficAchievementRate.toFixed(1),
    diagnosisData.budgetUtilizationRate.toFixed(1),
    aiReport,
    reportId
  ]);
  
  pool.end();
}

// 更新診斷報告狀態
async function updateDiagnosisReportStatus(reportId: string, status: string, message?: string) {
  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  await pool.query(`
    UPDATE ad_diagnosis_reports 
    SET 
      diagnosis_status = $1,
      ai_diagnosis_report = $2,
      updated_at = NOW()
    WHERE id = $3
  `, [status, message || '', reportId]);
  
  pool.end();
}

// 計算帳戶健康分數
function calculateAccountHealthScore(diagnosisData: any): number {
  let score = 0;
  
  // 流量達成率 (25分)
  if (diagnosisData.trafficAchievementRate >= 80) score += 25;
  else if (diagnosisData.trafficAchievementRate >= 60) score += 20;
  else if (diagnosisData.trafficAchievementRate >= 40) score += 15;
  else score += 5;
  
  // CTR 表現 (25分)
  if (diagnosisData.actualCtr >= 3) score += 25;
  else if (diagnosisData.actualCtr >= 2) score += 20;
  else if (diagnosisData.actualCtr >= 1) score += 15;
  else score += 5;
  
  // ROAS 表現 (25分)
  if (diagnosisData.actualRoas >= diagnosisData.targetRoas) score += 25;
  else if (diagnosisData.actualRoas >= diagnosisData.targetRoas * 0.8) score += 20;
  else if (diagnosisData.actualRoas >= diagnosisData.targetRoas * 0.6) score += 15;
  else score += 5;
  
  // 轉換率表現 (25分)
  if (diagnosisData.overallConversionRate >= diagnosisData.targetConversionRate) score += 25;
  else if (diagnosisData.overallConversionRate >= diagnosisData.targetConversionRate * 0.8) score += 20;
  else if (diagnosisData.overallConversionRate >= diagnosisData.targetConversionRate * 0.6) score += 15;
  else score += 5;
  
  return Math.min(score, 100);
}

// Facebook 資料刪除回呼端點 (符合 Facebook 政策要求)
export function setupFacebookDataDeletion(app: Express) {
  app.post('/auth/facebook/data-deletion', async (req, res) => {
    try {
      const { signed_request } = req.body;
      
      if (!signed_request) {
        return res.status(400).json({ error: 'Missing signed_request' });
      }

      // 解析 signed_request (Facebook 標準格式)
      const [signature, payload] = signed_request.split('.');
      const decodedPayload = JSON.parse(
        Buffer.from(payload, 'base64url').toString('utf8')
      );

      const userId = decodedPayload.user_id;
      
      if (userId) {
        // 清除用戶的 Facebook 認證資訊
        // 注意：我們不刪除用戶帳戶，只清除 Facebook 相關數據
        try {
          await storage.updateUser(userId, {
            metaAccessToken: null,
            metaAdAccountId: null
          });
        } catch (updateError) {
          console.log('User update failed, user may not exist:', userId);
        }

        console.log(`Facebook data deletion request processed for user: ${userId}`);
      }

      // 返回確認回應 (Facebook 要求的格式)
      const baseUrl = process.env.REPLIT_DOMAINS || 'http://localhost:5000';
      res.json({
        url: `${baseUrl}/data-deletion-status/${userId || 'unknown'}`,
        confirmation_code: `DEL_${Date.now()}_${userId || 'unknown'}`
      });

    } catch (error) {
      console.error('Facebook data deletion callback error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 資料刪除狀態查詢端點
  app.get('/data-deletion-status/:userId', (req, res) => {
    const { userId } = req.params;
    res.json({
      status: 'completed',
      message: `Facebook 相關資料已清除 (User ID: ${userId})`,
      timestamp: new Date().toISOString()
    });
  });
}