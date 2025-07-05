import { Express } from 'express';
import { requireJWTAuth, jwtUtils } from './jwtAuth';
import { storage } from './storage';
import { metaAccountService } from './metaAccountService';
import { db } from './db';
import { adDiagnosisReports } from '@shared/schema';
import { eq } from 'drizzle-orm';

export function setupDiagnosisRoutes(app: Express) {

  // Facebook OAuth 授權 URL - 提前設置，避免被其他中間件攔截
  app.get('/api/diagnosis/facebook-auth-url', (req: any, res) => {
    try {
      const appId = process.env.FACEBOOK_APP_ID;

      if (!appId) {
        console.error('Facebook App ID not found in environment variables');
        return res.status(500).json({
          success: false,
          message: 'Facebook App ID 未設定'
        });
      }

      const redirectUri = `https://${req.get('host')}/api/diagnosis/facebook-callback`;
      // 對於未認證用戶，使用臨時狀態
      const userId = req.user?.id || 'anonymous';

      console.log('生成 Facebook OAuth URL:', {
        appId: appId.substring(0, 5) + '***',
        redirectUri,
        userIdMask: userId.substring(0, 8) + '***'
      });

      const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?` +
        `client_id=${appId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=ads_read,ads_management&` +
        `response_type=code&` +
        `state=${userId}`;

      // 直接重定向到 Facebook OAuth 頁面
      res.redirect(authUrl);
    } catch (error) {
      console.error('生成 Facebook 授權 URL 錯誤:', error);
      res.status(500).json({
        success: false,
        message: '生成授權 URL 失敗'
      });
    }
  });

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
      const host = req.get('host') || 'localhost:5000';
      const baseUrl = host.includes('localhost') ? `http://${host}` : `https://${host}`;
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



  // Facebook OAuth 回調處理
  app.get('/api/diagnosis/facebook-callback', async (req, res) => {
    try {
      const { code, state: userId, error } = req.query;

      console.log('Facebook OAuth 回調:', { 
        code: code ? 'present' : 'missing', 
        userId, 
        error,
        fullQuery: req.query 
      });

      if (error) {
        console.error('Facebook OAuth 錯誤:', error);
        return res.redirect('/calculator?error=facebook_auth_error');
      }

      if (!code) {
        console.error('Facebook OAuth 缺少授權碼');
        return res.redirect('/calculator?error=facebook_auth_denied');
      }

      // 交換 access token
      const tokenUrl = 'https://graph.facebook.com/v19.0/oauth/access_token';
      const redirectUri = `https://${req.get('host')}/api/diagnosis/facebook-callback`;

      console.log('交換 Facebook 存取權杖:', { redirectUri });

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
      console.log('Facebook 權杖回應:', { 
        success: !!tokenData.access_token, 
        error: tokenData.error 
      });

      if (tokenData.access_token) {
        // 對於未認證的用戶，需要創建 JWT 認證
        if (userId === 'anonymous') {
          // 先獲取用戶資訊
          const userInfoResponse = await fetch(
            `https://graph.facebook.com/v19.0/me?fields=id,name,email&access_token=${tokenData.access_token}`
          );
          const userInfo = await userInfoResponse.json();
          
          console.log('Facebook 用戶資訊:', { 
            id: userInfo.id, 
            name: userInfo.name, 
            email: userInfo.email 
          });

          // 創建或更新用戶
          const user = await storage.upsertUser({
            id: userInfo.id, // 使用 Facebook ID 作為用戶 ID
            email: userInfo.email || `${userInfo.id}@facebook.com`,
            firstName: userInfo.name?.split(' ')[0] || 'Facebook',
            lastName: userInfo.name?.split(' ').slice(1).join(' ') || 'User',
            profileImageUrl: `https://graph.facebook.com/${userInfo.id}/picture?type=large`,
            metaAccessToken: tokenData.access_token,
            metaAdAccountId: null
          });

          // 生成 JWT 認證
          const jwt = jwtUtils.generateToken(user);
          
          // 設定 JWT Cookie
          res.cookie('auth_token', jwt, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
          });

          console.log('為新用戶創建 JWT 認證:', user.id);
        } else {
          // 更新現有用戶的 Facebook 認證
          await storage.updateMetaTokens(
            userId as string, 
            tokenData.access_token,
            null
          );
          console.log('更新現有用戶的 Facebook 認證:', userId);
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
  app.get('/api/diagnosis/facebook-status', requireJWTAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      let adAccountName = '';

      // 如果有 access token 和 account ID，嘗試獲取帳戶名稱
      if (user?.metaAccessToken && user?.metaAdAccountId) {
        try {
          const accountData = await metaAccountService.getAdAccountData(user.metaAccessToken, user.metaAdAccountId);
          adAccountName = accountData.accountName;
        } catch (error) {
          console.log('無法獲取帳戶名稱:', error);
          // 如果獲取失敗，使用帳戶 ID 作為顯示名稱
          adAccountName = user.metaAdAccountId;
        }
      }

      res.json({
        connected: !!(user?.metaAccessToken),
        adAccountId: user?.metaAdAccountId,
        adAccountName,
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
  app.get('/api/diagnosis/facebook-accounts', requireJWTAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
  app.post('/api/diagnosis/select-facebook-account', requireJWTAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  // 檢查 Facebook 連接狀態
  app.get('/api/diagnosis/facebook-connection', requireJWTAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      const connected = !!(user?.metaAccessToken && user?.metaAdAccountId);
      
      res.json({
        connected,
        accountId: user?.metaAdAccountId || null,
        accountName: connected ? '已連接廣告帳戶' : null
      });
    } catch (error) {
      console.error('檢查 Facebook 連接狀態錯誤:', error);
      res.status(500).json({
        error: 'connection_check_failed',
        message: '檢查連接狀態失敗'
      });
    }
  });

  // 觸發廣告帳戶健診 (修正路徑為 /analyze)
  app.post('/api/diagnosis/analyze', requireJWTAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
  app.get('/api/diagnosis/report/:reportId', requireJWTAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
  app.get('/api/diagnosis/reports', requireJWTAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const reports = await storage.getUserAdDiagnosisReports(userId);
      res.json(reports);
    } catch (error) {
      console.error('獲取診斷報告列表錯誤:', error);
      res.status(500).json({ error: '獲取報告列表失敗' });
    }
  });

  // 手動重新處理卡住的診斷報告
  app.post('/api/diagnosis/retry/:reportId', requireJWTAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  // 刪除診斷報告
  app.delete('/api/diagnosis/reports/:reportId', requireJWTAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { reportId } = req.params;

      console.log(`[DIAGNOSIS] 刪除診斷報告: ${reportId} by user: ${userId}`);

      // 檢查報告是否存在且屬於該用戶
      const report = await storage.getAdDiagnosisReport(reportId, userId);
      if (!report) {
        return res.status(404).json({ error: '報告不存在或無權限訪問' });
      }

      // 執行刪除操作
      const success = await storage.deleteAdDiagnosisReport(reportId, userId);

      if (success) {
        console.log(`[DIAGNOSIS] 成功刪除診斷報告: ${reportId}`);
        res.json({
          success: true,
          message: '診斷報告已成功刪除'
        });
      } else {
        res.status(500).json({ error: '刪除失敗' });
      }

    } catch (error) {
      console.error('刪除診斷報告錯誤:', error);
      res.status(500).json({ error: '刪除操作失敗' });
    }
  });

  // 檢查 Facebook 連接狀態
  app.get('/api/diagnosis/facebook-connection', requireJWTAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      const hasAccessToken = !!(user?.metaAccessToken);
      const hasSelectedAccount = !!(user?.metaAdAccountId);
      
      console.log(`[FACEBOOK_CONNECTION] User ${userId} - Token: ${hasAccessToken}, Account: ${hasSelectedAccount}`);
      
      res.json({
        connected: hasAccessToken,
        accountId: user?.metaAdAccountId || null,
        accountName: user?.metaAdAccountId ? `廣告帳戶 ${user.metaAdAccountId}` : null,
        hasAccessToken,
        hasSelectedAccount
      });
    } catch (error) {
      console.error('檢查 Facebook 連接狀態錯誤:', error);
      res.status(500).json({ error: '檢查連接狀態失敗' });
    }
  });

  // 診斷 Facebook 權限和廣告帳戶存取
  app.get('/api/diagnosis/facebook-permissions', requireJWTAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.metaAccessToken) {
        return res.json({
          success: false,
          message: '未找到 Facebook access token',
          permissions: [],
          adAccounts: []
        });
      }

      console.log(`[FACEBOOK_PERMISSIONS] 檢查用戶 ${userId} 的 Facebook 權限`);

      // 檢查 access token 權限
      const permissionsResponse = await fetch(
        `https://graph.facebook.com/v19.0/me/permissions?access_token=${user.metaAccessToken}`
      );
      
      const permissionsData = await permissionsResponse.json();
      
      // 檢查 access token 詳細信息
      const tokenInfoResponse = await fetch(
        `https://graph.facebook.com/v19.0/me?fields=id,name,email&access_token=${user.metaAccessToken}`
      );
      
      const tokenInfoData = await tokenInfoResponse.json();
      
      // 嘗試獲取廣告帳戶
      const adAccountsResponse = await fetch(
        `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_status,business&access_token=${user.metaAccessToken}`
      );
      
      const adAccountsData = await adAccountsResponse.json();
      
      const hasAdsPermissions = permissionsData.data?.some((p: any) => 
        ['ads_read', 'ads_management'].includes(p.permission) && p.status === 'granted'
      );

      console.log(`[FACEBOOK_PERMISSIONS] 結果:`, {
        hasToken: true,
        hasAdsPermissions,
        adAccountsCount: adAccountsData.data?.length || 0,
        permissions: permissionsData.data?.map((p: any) => `${p.permission}:${p.status}`)
      });
      
      res.json({
        success: true,
        tokenInfo: tokenInfoData,
        permissions: permissionsData.data || [],
        adAccounts: adAccountsData.data || [],
        hasAdsPermissions,
        summary: {
          tokenValid: !tokenInfoData.error,
          adsPermissionsGranted: hasAdsPermissions,
          adAccountsAccessible: (adAccountsData.data?.length || 0) > 0,
          totalAdAccounts: adAccountsData.data?.length || 0
        }
      });
      
    } catch (error) {
      console.error('Facebook 權限檢查錯誤:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Facebook 權限檢查失敗'
      });
    }
  });

  // 獲取 Facebook OAuth 授權 URL (不需要JWT認證)
  app.get('/api/diagnosis/facebook-auth-url', async (req: any, res) => {
    try {
      // 強制使用 HTTPS
      const baseUrl = `https://${req.get('host')}`;
      const redirectUri = `${baseUrl}/api/diagnosis/facebook-callback`;
      
      // 生成隨機 state 用於安全驗證
      const state = Math.random().toString(36).substring(2, 15);
      
      const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?` +
        `client_id=${process.env.FACEBOOK_APP_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=ads_read,ads_management,business_management&` +
        `response_type=code&` +
        `state=${state}`;

      console.log(`[FACEBOOK_AUTH] Generated auth URL for user ${req.user.id}`);
      console.log(`[FACEBOOK_AUTH] Redirect URI: ${redirectUri}`);
      console.log(`[FACEBOOK_AUTH] Full auth URL: ${authUrl}`);
      res.json({ authUrl });
    } catch (error) {
      console.error('生成 Facebook 授權 URL 錯誤:', error);
      res.status(500).json({ error: '生成授權連結失敗' });
    }
  });

  // Facebook OAuth 回調處理 (獨立於JWT認證)
  app.get('/api/diagnosis/facebook-callback', async (req, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code) {
        console.error('[FACEBOOK_CALLBACK] No authorization code received');
        return res.status(400).send('授權失敗：未收到授權碼');
      }

      console.log(`[FACEBOOK_CALLBACK] Processing callback with state: ${state}`);

      // 交換 access token - 強制使用 HTTPS
      const baseUrl = `https://${req.get('host')}`;
      const redirectUri = `${baseUrl}/api/diagnosis/facebook-callback`;
      
      console.log(`[FACEBOOK_CALLBACK] Using redirect URI: ${redirectUri}`);
      
      const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?` +
        `client_id=${process.env.FACEBOOK_APP_ID}&` +
        `client_secret=${process.env.FACEBOOK_APP_SECRET}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `code=${code}`;

      console.log(`[FACEBOOK_CALLBACK] Requesting token from Facebook API`);
      
      const tokenResponse = await fetch(tokenUrl);
      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        console.error('Facebook token exchange error:', tokenData.error);
        return res.status(400).send(`授權失敗：${tokenData.error.message}`);
      }

      console.log(`[FACEBOOK_CALLBACK] Token exchange successful`);

      // 獲取用戶基本信息
      const userInfoResponse = await fetch(`https://graph.facebook.com/me?access_token=${tokenData.access_token}&fields=id,name,email,picture`);
      const userData = await userInfoResponse.json();

      // 創建臨時 JWT token 包含 Facebook access token
      const tempUserData = {
        id: `facebook_${userData.id}`,
        email: userData.email || `facebook_${userData.id}@temp.com`,
        firstName: userData.name || 'Facebook User',
        lastName: '',
        profileImageUrl: userData.picture?.data?.url || null,
        metaAccessToken: tokenData.access_token,
        metaAccountId: null
      };

      // 生成 JWT token
      const jwtToken = jwtUtils.generateToken(tempUserData);
      
      // 設置 JWT cookie
      res.cookie('auth_token', jwtToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      console.log(`[FACEBOOK_CALLBACK] JWT token created for user ${tempUserData.id}, redirecting to calculator`);
      
      // 重定向回計算器頁面
      res.redirect('/calculator?facebook_auth_success=true');
    } catch (error) {
      console.error('Facebook OAuth 回調錯誤:', error);
      res.status(500).send('授權處理失敗');
    }
  });

  // 檢查 Facebook token 是否存在 (使用 JWT)
  app.get('/api/diagnosis/facebook-token-check', requireJWTAuth, async (req: any, res) => {
    try {
      const user = req.user;
      const hasToken = !!(user?.metaAccessToken);
      res.json({ 
        hasToken,
        token: hasToken ? 'exists' : null
      });
    } catch (error) {
      res.status(500).json({ error: '檢查 token 失敗' });
    }
  });

  // 獲取 Facebook 廣告帳戶列表 (使用 JWT 中的 token)
  app.get('/api/diagnosis/facebook-accounts-list', requireJWTAuth, async (req: any, res) => {
    try {
      const user = req.user;
      const accessToken = user?.metaAccessToken;
      
      if (!accessToken) {
        return res.status(401).json({ error: '請先授權 Facebook 帳戶' });
      }

      console.log(`[FACEBOOK_ACCOUNTS] Fetching accounts with JWT token`);

      // 調用 Facebook API 獲取廣告帳戶
      const response = await fetch(`https://graph.facebook.com/v19.0/me/adaccounts?` +
        `fields=id,name,account_status,currency,timezone_name&` +
        `access_token=${accessToken}`);

      const data = await response.json();

      if (data.error) {
        console.error('Facebook API error:', data.error);
        return res.status(400).json({ error: `Facebook API 錯誤: ${data.error.message}` });
      }

      // 只返回啟用的廣告帳戶
      const activeAccounts = data.data?.filter((account: any) => 
        account.account_status === 1 || account.account_status === 2
      ) || [];

      const accounts = activeAccounts.map((account: any) => ({
        id: account.id,
        name: account.name,
        currency: account.currency,
        timezone: account.timezone_name
      }));

      console.log(`[FACEBOOK_ACCOUNTS] Found ${accounts.length} active accounts`);
      res.json({ accounts });
    } catch (error) {
      console.error('獲取 Facebook 廣告帳戶錯誤:', error);
      res.status(500).json({ error: '獲取廣告帳戶失敗' });
    }
  });

  // 選擇 Facebook 廣告帳戶 (使用 JWT 認證)
  app.post('/api/diagnosis/facebook-select-account', requireJWTAuth, async (req: any, res) => {
    try {
      const { accountId } = req.body;
      const user = req.user;

      if (!accountId) {
        return res.status(400).json({ error: '請選擇廣告帳戶' });
      }

      if (!user?.metaAccessToken) {
        return res.status(401).json({ error: '請先授權 Facebook 帳戶' });
      }

      // 更新 JWT token 中的選擇帳戶
      const updatedUserData = {
        ...user,
        metaAccountId: accountId
      };

      // 生成新的 JWT token
      const jwtToken = jwtUtils.generateToken(updatedUserData);
      
      // 設置更新後的 JWT cookie
      res.cookie('auth_token', jwtToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      console.log(`[FACEBOOK_SELECT] Account ${accountId} selected for user ${user.id}`);

      res.json({
        success: true,
        message: '廣告帳戶選擇成功',
        accountId
      });
    } catch (error) {
      console.error('選擇廣告帳戶錯誤:', error);
      res.status(500).json({ error: '選擇廣告帳戶失敗' });
    }
  });

  // 開始 Facebook 廣告診斷分析 (使用 JWT 認證)
  app.post('/api/diagnosis/analyze', requireJWTAuth, async (req: any, res) => {
    try {
      const calculationData = req.body;
      const user = req.user;
      const accessToken = user?.metaAccessToken;
      const selectedAccount = user?.metaAccountId;

      if (!accessToken || !selectedAccount) {
        return res.status(401).json({ error: '請先連接 Facebook 廣告帳戶並選擇帳戶' });
      }

      console.log(`[FACEBOOK_ANALYZE] Starting analysis for account ${selectedAccount}`);

      // 使用 metaAccountService 獲取真實廣告數據並生成診斷報告
      const metaData = await metaAccountService.getAdAccountData(accessToken, selectedAccount);
      
      // 計算診斷數據
      const diagnosisData = metaAccountService.calculateAccountDiagnosisData(
        calculationData,
        metaData
      );

      // 生成 AI 診斷報告
      const report = await metaAccountService.generateAccountDiagnosisReport(
        metaData.accountName,
        diagnosisData,
        metaData
      );

      // 存儲診斷報告
      const savedReport = await storage.createAdDiagnosisReport({
        userId: user.id,
        accountName: metaData.accountName,
        healthScore: parseInt(report.healthScore) || 0,
        recommendations: JSON.stringify(report.recommendations),
        metrics: JSON.stringify({
          targetOrders: diagnosisData.targetRevenue / calculationData.targetAov,
          actualOrders: metaData.purchases,
          targetBudget: calculationData.targetRevenue / calculationData.targetRoas,
          actualBudget: metaData.spend,
          targetTraffic: (calculationData.targetRevenue / calculationData.targetAov) / (calculationData.targetConversionRate / 100),
          actualTraffic: metaData.clicks,
          targetRoas: calculationData.targetRoas,
          actualRoas: metaData.purchaseValue > 0 ? metaData.purchaseValue / metaData.spend : 0
        })
      });

      res.json({
        success: true,
        reportId: savedReport.id,
        healthScore: parseInt(report.healthScore) || 0,
        recommendations: report.recommendations
      });
    } catch (error) {
      console.error('診斷分析錯誤:', error);
      res.status(500).json({ error: '診斷分析失敗' });
    }
  });

  // Meta OAuth 模擬端點 (實際部署時需要真實 OAuth 流程)
  app.post('/api/diagnosis/connect-meta', requireJWTAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
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

    // 2. 計算診斷數據和四大核心指標比較
    console.log(`[DIAGNOSIS] 步驟2: 計算四大核心指標對比數據...`);
    
    // 計算目標指標
    const targetOrders = Math.round(targetData.targetRevenue / targetData.targetAov);
    const targetTraffic = Math.round(targetOrders / (targetData.targetConversionRate / 100));
    const targetDailyBudget = Math.round((targetTraffic * targetData.cpc) / 30);
    const targetRoas = targetData.targetRevenue / (targetDailyBudget * 30);
    
    // 計算實際指標 (從 Facebook 數據)
    const actualOrders = accountData.purchases || 0;
    const actualTraffic = accountData.linkClicks || 0;
    const actualDailyBudget = accountData.spend / 30;
    const actualRoas = actualOrders > 0 ? accountData.purchaseValue / accountData.spend : 0;
    
    const diagnosisData = {
      comparison: {
        targetOrders,
        actualOrders,
        targetBudget: targetDailyBudget * 30,
        actualBudget: accountData.spend,
        targetTraffic,
        actualTraffic,
        targetRoas,
        actualRoas
      },
      achievementRates: {
        ordersRate: actualOrders / targetOrders * 100,
        budgetEfficiency: targetDailyBudget > 0 ? actualDailyBudget / targetDailyBudget * 100 : 0,
        trafficRate: actualTraffic / targetTraffic * 100,
        roasRate: targetRoas > 0 ? actualRoas / targetRoas * 100 : 0
      }
    };
    
    console.log(`[DIAGNOSIS] 步驟2 完成: 四大指標對比完成`, diagnosisData);

    // 3. 計算健康分數 (基於四大核心指標)
    console.log(`[DIAGNOSIS] 步驟3: 計算健康分數...`);
    const healthScore = calculateFourMetricsHealthScore(diagnosisData);
    console.log(`[DIAGNOSIS] 步驟3 完成: 健康分數 ${healthScore}`);

    // 4. 生成 AI 診斷報告 (基於四大核心指標)
    console.log(`[DIAGNOSIS] 步驟4: 生成 AI 診斷報告...`);
    const aiReport = await generateFourMetricsAIReport(accountData.accountName, diagnosisData, accountData);
    console.log(`[DIAGNOSIS] 步驟4 完成: AI 報告生成完成 (${aiReport.length} 字符)`);

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
      topPerformingAds: accountData.topPerformingAds || [],
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

// 基於四大核心指標的健康分數計算
function calculateFourMetricsHealthScore(diagnosisData: any): number {
  const { achievementRates } = diagnosisData;
  
  // 權重配置 (四大核心指標)
  const weights = {
    orders: 0.30,      // 訂單數達成率
    budget: 0.25,      // 預算效率
    traffic: 0.25,     // 流量達成率
    roas: 0.20         // ROAS 達成率
  };

  // 計算各項分數 (0-100)
  const ordersScore = Math.min(achievementRates.ordersRate, 150); // 最高150%
  const budgetScore = 100 - Math.abs(achievementRates.budgetEfficiency - 100); // 接近100%最好
  const trafficScore = Math.min(achievementRates.trafficRate, 150); // 最高150%
  const roasScore = Math.min(achievementRates.roasRate, 150); // 最高150%

  // 加權計算總分
  const totalScore = 
    ordersScore * weights.orders +
    budgetScore * weights.budget +
    trafficScore * weights.traffic +
    roasScore * weights.roas;

  return Math.round(Math.max(0, Math.min(100, totalScore)));
}

// 基於四大核心指標的 AI 診斷報告生成
async function generateFourMetricsAIReport(
  accountName: string, 
  diagnosisData: any, 
  accountData: any
): Promise<string> {
  const { comparison, achievementRates } = diagnosisData;
  
  const prompt = `作為 Facebook 廣告專家，請基於以下四大核心指標分析廣告帳戶表現：

廣告帳戶：${accountName}

四大核心指標對比：
1. 訂單數對比：
   - 目標訂單數：${comparison.targetOrders} 筆
   - 實際訂單數：${comparison.actualOrders} 筆
   - 達成率：${achievementRates.ordersRate.toFixed(1)}%

2. 預算效率：
   - 目標月預算：NT$ ${comparison.targetBudget.toLocaleString()}
   - 實際月花費：NT$ ${comparison.actualBudget.toLocaleString()}
   - 預算效率：${achievementRates.budgetEfficiency.toFixed(1)}%

3. 流量表現：
   - 目標流量：${comparison.targetTraffic.toLocaleString()} 人次
   - 實際流量：${comparison.actualTraffic.toLocaleString()} 人次
   - 流量達成率：${achievementRates.trafficRate.toFixed(1)}%

4. ROAS 表現：
   - 目標 ROAS：${comparison.targetRoas.toFixed(1)}x
   - 實際 ROAS：${comparison.actualRoas.toFixed(1)}x
   - ROAS 達成率：${achievementRates.roasRate.toFixed(1)}%

請提供：
1. 四大指標的整體分析
2. 每個指標的具體問題診斷
3. 實用的改進建議
4. 優先改善順序

請用繁體中文回答，語調專業且具體。`;

  try {
    const response = await metaAccountService['openai'].chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || '無法生成診斷報告';
  } catch (error) {
    console.error('AI 診斷報告生成失敗:', error);
    return '系統暫時無法生成 AI 診斷報告，請稍後再試。';
  }
}

// 計算帳戶健康分數 (原有邏輯，保持向後兼容)
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

  // 獲取單個診斷報告詳情
  app.get('/api/diagnosis/report/:id', requireJWTAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const report = await storage.getDiagnosisReport(id, userId);

      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      res.json(report);
    } catch (error) {
      console.error('Get diagnosis report error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}