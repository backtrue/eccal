import OpenAI from "openai";
import { db } from "./db";
import { 
  fbHealthChecks, 
  industryTypes, 
  planResults,
  type FbHealthCheck, 
  type InsertFbHealthCheck,
  type IndustryType 
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface FbAdAccountData {
  accountId: string;
  accountName: string;
  spend: number;
  purchases: number;
  roas: number;
  ctr: number;
  dateRange: {
    since: string;
    until: string;
  };
}

export interface HealthCheckMetrics {
  dailySpend: number;
  purchases: number;
  roas: number;
  ctr: number;
}

export interface HealthCheckComparison {
  metric: string;
  target: number;
  actual: number;
  status: 'achieved' | 'not_achieved';
  advice?: string;
}

export class FbAuditService {
  private openai: OpenAI;
  private readonly baseUrl = 'https://graph.facebook.com/v19.0';

  constructor() {
    this.openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });
  }

  /**
   * 獲取使用者的 Facebook 廣告帳號列表
   */
  async getAdAccounts(accessToken: string): Promise<Array<{id: string, name: string}>> {
    try {
      const url = `${this.baseUrl}/me/adaccounts?fields=id,name,account_status&access_token=${accessToken}`;
      console.log('Facebook API 請求 URL:', url.replace(accessToken, accessToken.substring(0, 20) + '...'));
      
      const response = await fetch(url);
      
      console.log('Facebook API 回應狀態:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Facebook API 錯誤詳情:', errorText);
        throw new Error(`Facebook API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Facebook API 原始回應:', {
        dataExists: !!data.data,
        totalAccounts: data.data?.length || 0,
        accounts: data.data?.map((acc: any) => ({
          id: acc.id,
          name: acc.name,
          status: acc.account_status
        })) || []
      });
      
      const activeAccounts = data.data
        .filter((account: any) => account.account_status === 1) // 只返回啟用的帳號
        .map((account: any) => ({
          id: account.id,
          name: account.name
        }));
        
      console.log('過濾後的啟用帳戶:', {
        activeCount: activeAccounts.length,
        accounts: activeAccounts
      });
      
      return activeAccounts;
    } catch (error) {
      console.error('Error fetching ad accounts:', error);
      throw error;
    }
  }

  /**
   * 獲取廣告帳號過去28天的數據
   */
  async getAdAccountData(accessToken: string, adAccountId: string): Promise<FbAdAccountData> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 28);

      const since = startDate.toISOString().split('T')[0];
      const until = endDate.toISOString().split('T')[0];

      // 確保廣告帳戶 ID 格式正確，避免重複 act_ 前綴
      const accountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
      
      // 只拉取 purchase 相關欄位
      const fields = [
        'spend',                    // 花費
        'actions',                  // 只取 purchase 動作
        'action_values',            // 購買價值數據（用於手動計算 ROAS）
        'outbound_clicks_ctr',      // 外連點擊率
        'purchase_roas'             // 購買 ROAS
      ].join(',');
      
      // 使用 filtering 參數只拉取 purchase action_type
      const filtering = encodeURIComponent(JSON.stringify([{
        "field": "action_type",
        "operator": "IN", 
        "value": ["purchase"]
      }]));
      
      const url = `${this.baseUrl}/${accountId}/insights?fields=${fields}&filtering=${filtering}&time_range={"since":"${since}","until":"${until}"}&access_token=${accessToken}`;
      
      console.log('Facebook API URL:', url);
      console.log('Ad Account ID:', adAccountId);
      console.log('Access Token length:', accessToken.length);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Facebook API error ${response.status}:`, errorText);
        throw new Error(`Facebook API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Facebook API raw data:', JSON.stringify(data, null, 2));
      console.log('Facebook API response headers:', Object.fromEntries(response.headers));
      
      if (!data.data || data.data.length === 0) {
        console.log('No Facebook data available for date range:', { since, until });
        throw new Error(`No advertising data found for account ${adAccountId} in the specified date range (${since} to ${until}). Please check if the account has active campaigns with data.`);
      }

      const insights = data.data[0];
      console.log('=== Facebook API 原始數據 ===');
      console.log('完整 insights:', JSON.stringify(insights, null, 2));
      console.log('actions 陣列:', insights.actions);
      console.log('purchase_roas:', insights.purchase_roas);
      console.log('outbound_clicks_ctr:', insights.outbound_clicks_ctr);
      console.log('spend:', insights.spend);
      
      // 按照用戶指示：直接使用 Facebook API 的正確欄位
      const spend = parseFloat(insights.spend || '0');
      
      // 1. 購買數：從 actions 陣列找 action_type = 'purchase'
      const purchaseAction = insights.actions?.find((action: any) => action.action_type === 'purchase');
      const purchases = purchaseAction ? parseInt(purchaseAction.value) : 0;
      console.log('Purchase action found:', purchaseAction);
      console.log('Final purchases count:', purchases);
      
      // 2. ROAS：只使用 purchase_roas 欄位
      let roas = 0;
      console.log('purchase_roas 原始數據:', insights.purchase_roas);
      
      if (insights.purchase_roas !== undefined && insights.purchase_roas !== null) {
        if (Array.isArray(insights.purchase_roas) && insights.purchase_roas.length > 0) {
          const roasValue = insights.purchase_roas[0]?.value;
          if (!isNaN(parseFloat(roasValue))) {
            roas = parseFloat(roasValue);
          }
        } else if (typeof insights.purchase_roas === 'string' || typeof insights.purchase_roas === 'number') {
          if (!isNaN(parseFloat(insights.purchase_roas.toString()))) {
            roas = parseFloat(insights.purchase_roas.toString());
          }
        }
      }
      
      // 如果 purchase_roas 沒有數據，手動計算：購買價值 / 廣告花費
      if (roas === 0 && spend > 0) {
        const purchaseValue = this.extractActionValue(insights.action_values || [], 'purchase');
        if (purchaseValue) {
          const purchaseValueNum = parseFloat(purchaseValue.toString());
          if (!isNaN(purchaseValueNum) && purchaseValueNum > 0) {
            roas = purchaseValueNum / spend;
            console.log('手動計算 ROAS:', { purchaseValue: purchaseValueNum, spend, roas });
          }
        }
      }
      
      console.log('purchase_roas 最終值:', roas);
      
      // 3. CTR：確保正確解析 outbound_clicks_ctr，避免 NaN
      let ctr = 0;
      console.log('CTR 原始數據類型和值:', typeof insights.outbound_clicks_ctr, insights.outbound_clicks_ctr);
      
      if (insights.outbound_clicks_ctr !== undefined && insights.outbound_clicks_ctr !== null) {
        if (Array.isArray(insights.outbound_clicks_ctr) && insights.outbound_clicks_ctr.length > 0) {
          const ctrValue = insights.outbound_clicks_ctr[0]?.value;
          ctr = !isNaN(parseFloat(ctrValue)) ? parseFloat(ctrValue) : 0;
        } else if (typeof insights.outbound_clicks_ctr === 'string' || typeof insights.outbound_clicks_ctr === 'number') {
          ctr = !isNaN(parseFloat(insights.outbound_clicks_ctr.toString())) ? parseFloat(insights.outbound_clicks_ctr.toString()) : 0;
        }
      }
      console.log('CTR 最終值:', ctr);

      // 調試資料
      console.log('Facebook API 計算結果:', {
        spend,
        purchases,
        ctr,
        roas
      });

      const result: FbAdAccountData = {
        accountId: adAccountId,
        accountName: `Ad Account ${adAccountId}`,
        spend,
        purchases: Number(purchases), // 確保是數字類型
        roas,
        ctr,
        dateRange: { since, until }
      };
      
      console.log('Processed ad account data:', result);
      return result;
    } catch (error) {
      console.error('Error fetching ad account data:', error);
      throw error;
    }
  }

  /**
   * 從 Facebook actions 數組中提取特定動作的值
   */
  private extractActionValue(actions: any[], actionType: string): string | number {
    const action = actions.find(a => a.action_type === actionType);
    return action ? action.value : 0;
  }

  /**
   * 計算健檢指標
   */
  calculateMetrics(adData: FbAdAccountData): HealthCheckMetrics {
    console.log('calculateMetrics 輸入資料:', adData);
    
    // 按照用戶指示：直接使用 Facebook API 數據
    const dailySpend = adData.spend / 28; // spend 除以 28 天
    const purchases = adData.purchases / 28; // 改為日均購買數（總購買數 ÷ 28 天）
    const roas = adData.roas;            // 直接使用 purchase_roas
    const ctr = adData.ctr;              // 直接使用 outbound_clicks_ctr

    const result = {
      dailySpend: Math.round(dailySpend * 100) / 100,  // 四捨五入到小數點後2位
      purchases: Math.round(purchases),                 // 購買數為整數
      roas: Math.round(roas * 100) / 100,              // ROAS 保留2位小數
      ctr: Math.round(ctr * 100) / 100                 // CTR 保留2位小數
    };
    
    console.log('calculateMetrics 計算結果:', result);
    return result;
  }

  /**
   * 比較實際值與目標值
   */
  async compareWithTargets(
    actualMetrics: HealthCheckMetrics,
    planResultId: string,
    industryType: string
  ): Promise<HealthCheckComparison[]> {
    try {
      // 從預算計劃獲取目標值
      const planResult = await db.query.planResults.findFirst({
        where: eq(planResults.id, planResultId)
      });
      
      console.log('Plan result query for ID:', planResultId);
      console.log('Found plan result:', planResult);

      if (!planResult) {
        throw new Error('Plan result not found');
      }

      const targetDailySpend = parseFloat(planResult.dailyAdBudget.toString());
      const targetPurchases = Math.round(planResult.requiredOrders / 30); // 月訂單數轉換為日均
      const targetRoas = parseFloat(planResult.targetRoas.toString());
      const targetCtr = 1.5; // 預設 1.5%

      console.log('===== 目標值直接顯示 =====');
      console.log('目標日均花費:', targetDailySpend);
      console.log('目標購買數:', targetPurchases);
      console.log('目標 ROAS:', targetRoas);
      console.log('目標 CTR:', targetCtr);
      
      console.log('=== 目標值詳細資訊 ===');
      console.log('原始 planResult 資料:', {
        dailyAdBudget: planResult.dailyAdBudget,
        dailyAdBudgetType: typeof planResult.dailyAdBudget,
        requiredOrders: planResult.requiredOrders,
        targetRoas: planResult.targetRoas,
        targetRoasType: typeof planResult.targetRoas
      });
      console.log('計算後的目標值:', {
        targetDailySpend,
        targetDailySpendType: typeof targetDailySpend,
        targetPurchases,
        targetRoas,
        targetRoasType: typeof targetRoas,
        targetCtr
      });

      // 使用真實的資料庫目標值
      const comparisons: HealthCheckComparison[] = [
        {
          metric: 'dailySpend',
          target: targetDailySpend,
          actual: actualMetrics.dailySpend,
          status: actualMetrics.dailySpend >= targetDailySpend ? 'achieved' : 'not_achieved'
        },
        {
          metric: 'purchases',
          target: targetPurchases,
          actual: actualMetrics.purchases,
          status: actualMetrics.purchases >= targetPurchases ? 'achieved' : 'not_achieved'
        },
        {
          metric: 'roas',
          target: targetRoas,
          actual: actualMetrics.roas,
          status: actualMetrics.roas >= targetRoas ? 'achieved' : 'not_achieved'
        },
        {
          metric: 'ctr',
          target: targetCtr,
          actual: actualMetrics.ctr,
          status: actualMetrics.ctr >= targetCtr ? 'achieved' : 'not_achieved'
        }
      ];

      // 為未達標指標生成 AI 建議
      for (const comparison of comparisons) {
        if (comparison.status === 'not_achieved') {
          if (comparison.metric === 'dailySpend') {
            comparison.advice = await this.generateDailySpendAdvice(
              comparison.target,
              comparison.actual
            );
          } else {
            comparison.advice = await this.generateAIAdvice(
              comparison.metric,
              comparison.target,
              comparison.actual,
              industryType
            );
          }
        }
      }

      console.log('compareWithTargets 最終比較結果:', comparisons);
      return comparisons;
    } catch (error) {
      console.error('Error comparing with targets:', error);
      throw error;
    }
  }

  /**
   * 生成日均花費建議 (使用 ChatGPT 4o mini)
   */
  private async generateDailySpendAdvice(target: number, actual: number): Promise<string> {
    try {
      console.log('=== ChatGPT 日均花費建議生成開始 ===');
      console.log('目標花費:', target);
      console.log('實際花費:', actual);
      
      const prompt = `你是一位擁有超過十年經驗的 Facebook 電商廣告專家『小黑老師』。目前的廣告活動『日均花費』目標為 ${target.toLocaleString()} 元，實際花費為 ${actual.toLocaleString()} 元，尚未完全達到預算目標。請基於『成交的基礎是足夠的流量，流量的基礎是足夠的預算花費』這個核心邏輯，提供明確的廣告操作建議，確保預算能順利花出，以爭取最大的曝光與流量機會。

請使用以下格式回答，用小黑老師的親切語調：

<div style="background: #f8f9fa; padding: 16px; border-left: 4px solid #007bff; margin: 16px 0;">
<h3 style="color: #007bff; margin-top: 0;">小黑老師的建議</h3>
<p>同學，我看了一下你的「日均花費」，目標 ${target.toLocaleString()} 元，實際只花了 ${actual.toLocaleString()} 元...</p>

<h4 style="color: #495057; margin-top: 20px;">🎯 檢查受眾規模</h4>
<p style="margin-bottom: 16px;">你設定的受眾池是不是太小了？建議適度放寬興趣、行為標籤，或使用類似受眾來擴大觸及範圍。</p>

<h4 style="color: #495057;">💰 提高出價策略</h4>
<p style="margin-bottom: 16px;">如果使用手動出價可能太低，建議改用「最低成本」出價策略，讓系統自動找到最有效率的花費方式。</p>

<h4 style="color: #495057;">🔄 檢視素材疲勞度</h4>
<p style="margin-bottom: 16px;">檢查廣告頻率是否超過 3，如果有廣告疲勞請立即更換新的素材，用新鮮感刺激點擊。</p>

<p style="margin-top: 20px; font-weight: bold; color: #007bff;">記住，預算是你獲取流量的彈藥，彈藥沒打完，就別輕易斷定戰場的勝敗。</p>
</div>`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
        temperature: 0.7,
      });

      const result = response.choices[0].message.content || '暫無建議';
      console.log('=== ChatGPT 日均花費建議生成完成 ===');
      console.log('建議內容長度:', result.length);
      
      return result;
    } catch (error) {
      console.error('ChatGPT 日均花費建議生成錯誤:', error);
      return '無法生成建議，請稍後再試';
    }
  }

  /**
   * 生成 AI 建議
   */
  private async generateAIAdvice(
    metric: string,
    target: number,
    actual: number,
    industryType: string
  ): Promise<string> {
    try {
      const metricNames = {
        dailySpend: '日均花費',
        purchases: '購買數',
        roas: 'ROAS',
        ctr: '連結點擊率'
      };

      const prompt = `你是一位專業的 Facebook 電商廣告顧問。針對 ${industryType} 產業，此廣告帳號的「${metricNames[metric as keyof typeof metricNames]}」未達標。

目標值：${target}
實際值：${actual}

請用繁體中文，提供 2-3 點簡潔、可執行的初步優化建議。每個建議控制在50字以內，直接提供具體行動方案。

請使用 HTML 格式輸出，使用 <ul> 和 <li> 標籤來組織建議清單。`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.7,
      });

      return response.choices[0].message.content || '暫無建議';
    } catch (error) {
      console.error('Error generating AI advice:', error);
      return '無法生成建議，請稍後再試';
    }
  }

  /**
   * 儲存健檢結果
   */
  async saveHealthCheck(
    userId: string,
    adAccountData: FbAdAccountData,
    metrics: HealthCheckMetrics,
    comparisons: HealthCheckComparison[],
    planResultId: string,
    industryType: string
  ): Promise<FbHealthCheck> {
    try {
      const healthCheckData: InsertFbHealthCheck = {
        userId,
        adAccountId: adAccountData.accountId,
        adAccountName: adAccountData.accountName,
        planResultId,
        industryType,
        
        // 實際數據
        actualDailySpend: metrics.dailySpend.toString(),
        actualPurchases: metrics.purchases,
        actualRoas: metrics.roas.toString(),
        actualCtr: metrics.ctr.toString(),
        actualImpressions: 0, // 不再需要
        actualClicks: 0, // 不再需要  
        actualPurchaseValue: '0', // 不再需要
        
        // 目標數據
        targetDailySpend: comparisons.find(c => c.metric === 'dailySpend')?.target.toString() || '0',
        targetPurchases: comparisons.find(c => c.metric === 'purchases')?.target || 0,
        targetRoas: comparisons.find(c => c.metric === 'roas')?.target.toString() || '0',
        targetCtr: comparisons.find(c => c.metric === 'ctr')?.target.toString() || '0',
        
        // 健檢結果
        spendStatus: comparisons.find(c => c.metric === 'dailySpend')?.status || 'not_achieved',
        purchaseStatus: comparisons.find(c => c.metric === 'purchases')?.status || 'not_achieved',
        roasStatus: comparisons.find(c => c.metric === 'roas')?.status || 'not_achieved',
        ctrStatus: comparisons.find(c => c.metric === 'ctr')?.status || 'not_achieved',
        
        // AI 建議
        spendAdvice: comparisons.find(c => c.metric === 'dailySpend')?.advice,
        purchaseAdvice: comparisons.find(c => c.metric === 'purchases')?.advice,
        roasAdvice: comparisons.find(c => c.metric === 'roas')?.advice,
        ctrAdvice: comparisons.find(c => c.metric === 'ctr')?.advice,
        
        // 元數據
        dataStartDate: new Date(adAccountData.dateRange.since),
        dataEndDate: new Date(adAccountData.dateRange.until),
      };

      const [result] = await db
        .insert(fbHealthChecks)
        .values(healthCheckData)
        .returning();

      return result;
    } catch (error) {
      console.error('Error saving health check:', error);
      throw error;
    }
  }

  /**
   * 獲取使用者的健檢歷史
   */
  async getHealthCheckHistory(userId: string): Promise<FbHealthCheck[]> {
    try {
      return await db.query.fbHealthChecks.findMany({
        where: eq(fbHealthChecks.userId, userId),
        orderBy: desc(fbHealthChecks.createdAt),
        limit: 10
      });
    } catch (error) {
      console.error('Error fetching health check history:', error);
      throw error;
    }
  }

  /**
   * 獲取產業類型列表
   */
  async getIndustryTypes(): Promise<IndustryType[]> {
    try {
      return await db.query.industryTypes.findMany({
        orderBy: industryTypes.name
      });
    } catch (error) {
      console.error('Error fetching industry types:', error);
      throw error;
    }
  }

  /**
   * 初始化產業類型數據
   */
  async initializeIndustryTypes(): Promise<void> {
    try {
      const existingTypes = await this.getIndustryTypes();
      
      if (existingTypes.length === 0) {
        const defaultIndustries = [
          { name: '服飾配件', nameEn: 'Fashion & Accessories', averageRoas: '3.5', averageCtr: '1.8' },
          { name: '美妝保養', nameEn: 'Beauty & Skincare', averageRoas: '4.2', averageCtr: '2.1' },
          { name: '食品飲料', nameEn: 'Food & Beverage', averageRoas: '3.8', averageCtr: '1.6' },
          { name: '健康保健', nameEn: 'Health & Wellness', averageRoas: '4.5', averageCtr: '1.9' },
          { name: '居家生活', nameEn: 'Home & Living', averageRoas: '3.2', averageCtr: '1.4' },
          { name: '3C電子', nameEn: 'Electronics', averageRoas: '2.8', averageCtr: '1.2' },
          { name: '運動休閒', nameEn: 'Sports & Recreation', averageRoas: '3.6', averageCtr: '1.7' },
          { name: '母嬰用品', nameEn: 'Baby & Kids', averageRoas: '4.0', averageCtr: '2.0' }
        ];

        await db.insert(industryTypes).values(defaultIndustries);
        console.log('Industry types initialized successfully');
      }
    } catch (error) {
      console.error('Error initializing industry types:', error);
      throw error;
    }
  }
}

export const fbAuditService = new FbAuditService();