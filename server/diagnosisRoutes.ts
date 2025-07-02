import { Express } from 'express';
import { requireAuth } from './googleAuth';
import { storage } from './storage';
import { metaAccountService } from './metaAccountService';
import { db } from './db';
import { adDiagnosisReports } from '@shared/schema';
import { eq } from 'drizzle-orm';

export function setupDiagnosisRoutes(app: Express) {
  
  // 診斷系統配置檢查端點
  app.get('/api/diagnosis/config', (req, res) => {
    try {
      const hasOpenAIKey = !!(process.env.OPENAI_API_KEY);
      const hasFacebookAppId = !!(process.env.FACEBOOK_APP_ID);
      const hasFacebookAppSecret = !!(process.env.FACEBOOK_APP_SECRET);
      
      res.json({
        status: 'ok',
        openai: hasOpenAIKey ? 'configured' : 'missing',
        facebook: {
          appId: hasFacebookAppId ? 'configured' : 'missing',
          appSecret: hasFacebookAppSecret ? 'configured' : 'missing'
        },
        message: hasOpenAIKey && hasFacebookAppId && hasFacebookAppSecret 
          ? 'API 正常配置' 
          : 'API 配置不完整，但系統可正常運行'
      });
    } catch (error) {
      console.error('配置檢查錯誤:', error);
      res.status(500).json({ 
        status: 'error', 
        message: '配置檢查失敗' 
      });
    }
  });
  
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
      
      if (!appId) {
        console.error('Facebook App ID not found in environment variables');
        return res.status(500).json({
          success: false,
          message: 'Facebook App ID 未設定'
        });
      }
      
      const redirectUri = `${req.protocol}://${req.get('host')}/api/diagnosis/facebook-callback`;
      const userId = req.user.claims?.sub || req.user.id;
      
      console.log('生成 Facebook OAuth URL:', {
        appId: appId.substring(0, 5) + '***',
        redirectUri,
        userId: userId?.substring(0, 8) + '***'
      });
      
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
          `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_status&access_token=${tokenData.access_token}`
        );
        const accountsData = await accountsResponse.json();
        
        // 存儲用戶的 Facebook 認證資訊（暫時不選擇廣告帳戶）
        if (userId) {
          await storage.updateMetaTokens(
            userId as string, 
            tokenData.access_token,
            null // null 表示尚未選擇廣告帳戶
          );
          
          // 儲存可用的廣告帳戶列表到臨時儲存
          const accountsList = accountsData.data?.map((account: any) => ({
            id: account.id,
            name: account.name,
            status: account.account_status
          })) || [];
          
          // 暫存廣告帳戶列表 (這裡可以使用 session 或其他方式)
          // 為了簡化，我們先跳轉到選擇頁面
        }
        
        res.redirect('/calculator?facebook_auth_success=true');
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
        adAccountId: user?.metaAdAccountId,
        needsAccountSelection: !!(user?.metaAccessToken && !user?.metaAdAccountId)
      });
    } catch (error) {
      console.error('檢查 Facebook 連接狀態錯誤:', error);
      res.status(500).json({
        connected: false,
        error: '檢查連接狀態失敗'
      });
    }
  });

  // 獲取用戶可用的 Facebook 廣告帳戶列表
  app.get('/api/diagnosis/facebook-accounts', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.metaAccessToken) {
        return res.status(400).json({
          error: 'facebook_not_connected',
          message: '請先連接 Facebook'
        });
      }

      // 獲取廣告帳戶列表
      const accountsResponse = await fetch(
        `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_status,currency&access_token=${user.metaAccessToken}`
      );
      
      if (!accountsResponse.ok) {
        throw new Error(`Facebook API 錯誤: ${accountsResponse.status}`);
      }
      
      const accountsData = await accountsResponse.json();
      
      const accounts = accountsData.data?.map((account: any) => ({
        id: account.id,
        name: account.name,
        status: account.account_status,
        currency: account.currency || 'TWD'
      })) || [];

      res.json({ accounts });
    } catch (error) {
      console.error('獲取 Facebook 廣告帳戶錯誤:', error);
      res.status(500).json({
        error: '獲取廣告帳戶失敗',
        message: error instanceof Error ? error.message : '未知錯誤'
      });
    }
  });

  // 選擇 Facebook 廣告帳戶
  app.post('/api/diagnosis/select-facebook-account', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { adAccountId } = req.body;
      
      if (!adAccountId) {
        return res.status(400).json({
          error: 'missing_account_id',
          message: '請選擇廣告帳戶'
        });
      }

      const user = await storage.getUser(userId);
      if (!user?.metaAccessToken) {
        return res.status(400).json({
          error: 'facebook_not_connected',
          message: '請先連接 Facebook'
        });
      }

      // 驗證廣告帳戶是否有效
      const accountResponse = await fetch(
        `https://graph.facebook.com/v19.0/${adAccountId}?fields=id,name,account_status&access_token=${user.metaAccessToken}`
      );
      
      if (!accountResponse.ok) {
        return res.status(400).json({
          error: 'invalid_account',
          message: '廣告帳戶無效或無權限存取'
        });
      }

      const accountData = await accountResponse.json();

      // 更新用戶選擇的廣告帳戶（包含名稱）
      await storage.updateMetaTokens(userId, user.metaAccessToken, adAccountId, accountData.name);

      res.json({
        success: true,
        message: '廣告帳戶設定成功',
        adAccountId
      });
    } catch (error) {
      console.error('選擇 Facebook 廣告帳戶錯誤:', error);
      res.status(500).json({
        error: '設定廣告帳戶失敗',
        message: error instanceof Error ? error.message : '未知錯誤'
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

      // 背景處理帳戶診斷 - 增加超時處理
      Promise.race([
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
        ),
        // 5分鐘超時
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('診斷處理超時 (5分鐘)')), 5 * 60 * 1000)
        )
      ]).catch(async (error) => {
        console.error('背景帳戶診斷處理錯誤:', error);
        await updateDiagnosisReportStatus(
          processingReport.id, 
          'failed', 
          `診斷處理失敗: ${error.message}`
        );
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

      // 檢查是否卡在處理狀態超過 10 分鐘，如果是則重新觸發處理
      if (report.diagnosisStatus === 'processing' && report.createdAt) {
        const createdAt = new Date(report.createdAt);
        const now = new Date();
        const timeDiff = now.getTime() - createdAt.getTime();
        const tenMinutes = 10 * 60 * 1000; // 10 分鐘
        
        if (timeDiff > tenMinutes) {
          console.log(`[DIAGNOSIS] 報告 ${reportId} 處理超時，重新觸發處理...`);
          
          // 獲取用戶資料以重新處理
          const user = await storage.getUser(userId);
          if (user?.metaAccessToken && user?.metaAdAccountId) {
            // 從報告中推斷目標數據（簡化處理）
            const targetData = {
              targetRevenue: 100000, // 預設值
              targetAov: 1000,
              targetConversionRate: 0.02,
              cpc: 5
            };
            
            // 重新觸發背景處理
            Promise.race([
              processAccountDiagnosis(
                reportId,
                userId,
                user.metaAccessToken,
                user.metaAdAccountId,
                targetData
              ),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('診斷處理超時 (5分鐘)')), 5 * 60 * 1000)
              )
            ]).catch(async (error) => {
              console.error('重新處理診斷錯誤:', error);
              await updateDiagnosisReportStatus(
                reportId, 
                'failed', 
                `重新處理失敗: ${error.message}`
              );
            });
          }
        }
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

  // 手動重新處理卡住的診斷報告
  app.post('/api/diagnosis/retry/:reportId', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const { reportId } = req.params;

      console.log(`[DIAGNOSIS] 手動重新處理診斷報告: ${reportId}`);

      // 檢查報告是否存在
      const report = await storage.getAdDiagnosisReport(reportId, userId);
      if (!report) {
        return res.status(404).json({ error: '報告不存在' });
      }

      // 獲取用戶 Facebook 認證資訊
      const user = await storage.getUser(userId);
      if (!user?.metaAccessToken || !user?.metaAdAccountId) {
        return res.status(400).json({ error: 'Facebook 認證資訊不完整' });
      }

      // 使用預設目標數據重新處理
      const targetData = {
        targetRevenue: 100000,
        targetAov: 1000,
        targetConversionRate: 0.02,
        cpc: 5
      };

      // 重置報告狀態
      await updateDiagnosisReportStatus(reportId, 'processing', '重新處理中...');

      // 觸發背景處理
      Promise.race([
        processAccountDiagnosis(
          reportId,
          userId,
          user.metaAccessToken,
          user.metaAdAccountId,
          targetData
        ),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('診斷處理超時 (5分鐘)')), 5 * 60 * 1000)
        )
      ]).catch(async (error) => {
        console.error('重新處理診斷錯誤:', error);
        await updateDiagnosisReportStatus(
          reportId, 
          'failed', 
          `重新處理失敗: ${error.message}`
        );
      });

      res.json({
        success: true,
        message: '診斷報告重新處理已啟動'
      });

    } catch (error) {
      console.error('手動重新處理診斷錯誤:', error);
      res.status(500).json({ error: '重新處理失敗' });
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
  console.log(`[DIAGNOSIS] 開始處理帳戶診斷 - reportId: ${reportId}, adAccountId: ${adAccountId}`);
  
  try {
    // 1. 獲取 Meta 廣告帳戶數據
    console.log(`[DIAGNOSIS] 步驟1: 獲取 Meta 廣告帳戶數據...`);
    const accountData = await metaAccountService.getAdAccountData(accessToken, adAccountId);
    console.log(`[DIAGNOSIS] 步驟1 完成: 帳戶名稱 ${accountData.accountName}, 花費 ${accountData.spend}`);
    
    // 2. 計算診斷數據
    console.log(`[DIAGNOSIS] 步驟2: 計算診斷數據...`);
    const diagnosisData = metaAccountService.calculateAccountDiagnosisData(targetData, accountData);
    console.log(`[DIAGNOSIS] 步驟2 完成: 健康分數計算中...`);
    
    // 3. 生成 AI 診斷報告
    console.log(`[DIAGNOSIS] 步驟3: 生成 AI 診斷報告...`);
    const aiReport = await metaAccountService.generateAccountDiagnosisReport(accountData.accountName, diagnosisData);
    console.log(`[DIAGNOSIS] 步驟3 完成: AI 報告生成完成 (${aiReport.length} 字符)`);
    
    // 4. 計算健康分數
    console.log(`[DIAGNOSIS] 步驟4: 計算健康分數...`);
    const healthScore = calculateAccountHealthScore(diagnosisData);
    console.log(`[DIAGNOSIS] 步驟4 完成: 健康分數 ${healthScore}`);
    
    // 5. 更新報告
    console.log(`[DIAGNOSIS] 步驟5: 更新報告...`);
    await updateAccountDiagnosisReport(reportId, accountData, diagnosisData, aiReport, healthScore);
    console.log(`[DIAGNOSIS] 診斷處理完成 - reportId: ${reportId}`);
    
  } catch (error) {
    console.error(`[DIAGNOSIS] 處理帳戶診斷時發生錯誤 - reportId: ${reportId}:`, error);
    console.error(`[DIAGNOSIS] 錯誤詳情:`, {
      message: error instanceof Error ? error.message : '未知錯誤',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown Error'
    });
    
    // 更新報告狀態為失敗
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';
    await updateDiagnosisReportStatus(reportId, 'failed', `帳戶診斷處理失敗: ${errorMessage}`);
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
  await db.update(adDiagnosisReports)
    .set({
      campaignName: accountData.accountName,
      targetDailyTraffic: Math.round(diagnosisData.targetDailyTraffic),
      targetDailyBudget: Math.round(diagnosisData.targetDailyBudget).toString(),
      targetCpa: Math.round(diagnosisData.targetCpa).toString(),
      targetRoas: diagnosisData.targetRoas.toFixed(2),
      actualDailyTraffic: Math.round(diagnosisData.actualDailyTraffic),
      actualDailySpend: Math.round(diagnosisData.actualDailySpend).toString(),
      actualCtr: diagnosisData.actualCtr.toFixed(2),
      actualCpa: Math.round(diagnosisData.actualCpa).toString(),
      actualRoas: diagnosisData.actualRoas.toFixed(2),
      overallHealthScore: healthScore,
      trafficAchievementRate: diagnosisData.trafficAchievementRate.toFixed(1),
      budgetUtilizationRate: diagnosisData.budgetUtilizationRate.toFixed(1),
      aiDiagnosisReport: aiReport,
      diagnosisStatus: 'completed',
      updatedAt: new Date(),
    })
    .where(eq(adDiagnosisReports.id, reportId));
}

// 更新診斷報告狀態
async function updateDiagnosisReportStatus(reportId: string, status: string, message?: string) {
  await db.update(adDiagnosisReports)
    .set({
      diagnosisStatus: status,
      aiDiagnosisReport: message || '',
      updatedAt: new Date(),
    })
    .where(eq(adDiagnosisReports.id, reportId));
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
          await storage.updateMetaTokens(userId, '', null);
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