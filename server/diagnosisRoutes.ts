import { Express } from 'express';
import { requireAuth } from './googleAuth';
import { storage } from './storage';
import { metaService } from './metaService';

export function setupDiagnosisRoutes(app: Express) {
  // 檢查 Facebook API 配置
  app.get('/api/diagnosis/check-facebook-config', async (req, res) => {
    try {
      const hasAppId = !!process.env.FACEBOOK_APP_ID;
      const hasAppSecret = !!process.env.FACEBOOK_APP_SECRET;
      const hasAccessToken = !!process.env.FACEBOOK_ACCESS_TOKEN;
      
      if (!hasAppId || !hasAppSecret || !hasAccessToken) {
        return res.json({
          success: false,
          message: 'Facebook API 配置不完整，請檢查環境變數設定'
        });
      }
      
      res.json({
        success: true,
        message: 'Facebook API 配置正常'
      });
    } catch (error) {
      console.error('Facebook 配置檢查錯誤:', error);
      res.status(500).json({
        success: false,
        message: '配置檢查失敗'
      });
    }
  });

  // 觸發廣告健診
  app.post('/api/diagnosis/analyze', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const {
        campaignId,
        targetRevenue,
        targetAov,
        targetConversionRate,
        cpc
      } = req.body;

      // 驗證必要參數
      if (!campaignId || !targetRevenue || !targetAov || !targetConversionRate || !cpc) {
        return res.status(400).json({ 
          error: 'missing_parameters',
          message: '缺少必要參數'
        });
      }

      // 使用系統配置的 Facebook Access Token
      const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
      if (!accessToken) {
        return res.status(400).json({
          error: 'facebook_config_missing',
          message: 'Facebook API 配置不完整'
        });
      }

      // 更新報告狀態為處理中
      const processingReport = await storage.createAdDiagnosisReport({
        userId,
        campaignId,
        campaignName: '處理中...',
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

      // 背景處理診斷
      processDiagnosis(
        processingReport.id,
        userId,
        campaignId,
        accessToken,
        {
          targetRevenue,
          targetAov,
          targetConversionRate,
          cpc
        }
      ).catch(error => {
        console.error('背景診斷處理錯誤:', error);
      });

      res.json({
        success: true,
        reportId: processingReport.id,
        message: '診斷已開始，請稍後查看結果'
      });

    } catch (error) {
      console.error('廣告診斷錯誤:', error);
      res.status(500).json({ error: '診斷處理失敗' });
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

// 背景處理診斷邏輯
async function processDiagnosis(
  reportId: string,
  userId: string,
  campaignId: string,
  accessToken: string,
  targetData: {
    targetRevenue: number;
    targetAov: number;
    targetConversionRate: number;
    cpc: number;
  }
) {
  try {
    // 1. 獲取 Meta 廣告數據
    const metaData = await metaService.getCampaignData(accessToken, campaignId);
    
    // 2. 計算診斷數據
    const diagnosisData = metaService.calculateDiagnosisData(targetData, metaData);
    
    // 3. 生成 AI 診斷報告
    const aiReport = await metaService.generateDiagnosisReport(metaData.campaignName, diagnosisData);
    
    // 4. 計算健康分數
    const healthScore = calculateHealthScore(diagnosisData);
    
    // 5. 更新報告
    await updateDiagnosisReport(reportId, metaData, diagnosisData, aiReport, healthScore);
    
  } catch (error) {
    console.error('處理診斷時發生錯誤:', error);
    // 更新報告狀態為失敗
    await updateDiagnosisReportStatus(reportId, 'failed', '診斷處理失敗');
  }
}

// 更新診斷報告
async function updateDiagnosisReport(
  reportId: string,
  metaData: any,
  diagnosisData: any,
  aiReport: string,
  healthScore: number
) {
  // 使用 SQL 直接更新，因為 storage 接口可能還沒完全實現
  // 實際部署時應該使用 storage.updateAdDiagnosisReport
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
    metaData.campaignName,
    diagnosisData.targetDailyTraffic,
    diagnosisData.targetDailyBudget,
    diagnosisData.targetCpa,
    diagnosisData.targetRoas,
    diagnosisData.actualDailyTraffic,
    diagnosisData.actualDailySpend,
    diagnosisData.actualCtr,
    diagnosisData.actualCpa,
    diagnosisData.actualRoas,
    healthScore,
    diagnosisData.trafficAchievementRate,
    diagnosisData.budgetUtilizationRate,
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

// 計算健康分數
function calculateHealthScore(diagnosisData: any): number {
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