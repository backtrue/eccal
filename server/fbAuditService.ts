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
  purchaseValue: number;
  clicks: number;
  impressions: number;
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

      const fields = [
        'spend',
        'actions',
        'action_values',
        'clicks',
        'impressions'
      ].join(',');

      // 確保廣告帳戶 ID 格式正確，避免重複 act_ 前綴
      const accountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
      const url = `${this.baseUrl}/${accountId}/insights?fields=${fields}&time_range={"since":"${since}","until":"${until}"}&access_token=${accessToken}`;
      
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
      
      if (!data.data || data.data.length === 0) {
        throw new Error('No data available for the specified date range');
      }

      const insights = data.data[0];
      
      // 提取購買數據
      const purchasesValue = this.extractActionValue(insights.actions || [], 'purchase');
      const purchases = typeof purchasesValue === 'string' ? parseInt(purchasesValue) : purchasesValue || 0;
      
      const purchaseValueRaw = this.extractActionValue(insights.action_values || [], 'purchase');
      const purchaseValue = parseFloat(typeof purchaseValueRaw === 'string' ? purchaseValueRaw : purchaseValueRaw?.toString() || '0');

      return {
        accountId: adAccountId,
        accountName: `Ad Account ${adAccountId}`,
        spend: parseFloat(insights.spend || '0'),
        purchases,
        purchaseValue,
        clicks: parseInt(insights.clicks || '0'),
        impressions: parseInt(insights.impressions || '0'),
        dateRange: { since, until }
      };
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
    const dailySpend = adData.spend / 28; // 28天平均
    const purchases = adData.purchases;
    const roas = adData.purchaseValue > 0 ? adData.purchaseValue / adData.spend : 0;
    const ctr = adData.impressions > 0 ? (adData.clicks / adData.impressions) * 100 : 0;

    return {
      dailySpend: Math.round(dailySpend * 100) / 100,
      purchases,
      roas: Math.round(roas * 100) / 100,
      ctr: Math.round(ctr * 10000) / 100 // 轉換為百分比，保留2位小數
    };
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

      if (!planResult) {
        throw new Error('Plan result not found');
      }

      const targetDailySpend = parseFloat(planResult.dailyAdBudget);
      const targetPurchases = Math.round(planResult.requiredOrders / 30); // 月訂單數轉換為日均
      const targetRoas = parseFloat(planResult.targetRoas);
      
      // 獲取產業平均 CTR
      const industry = await db.query.industryTypes.findFirst({
        where: eq(industryTypes.id, industryType)
      });
      const targetCtr = industry ? parseFloat(industry.averageCtr) : 1.5; // 預設 1.5%

      const comparisons: HealthCheckComparison[] = [
        {
          metric: 'dailySpend',
          target: targetDailySpend,
          actual: actualMetrics.dailySpend,
          status: actualMetrics.dailySpend >= targetDailySpend * 0.8 ? 'achieved' : 'not_achieved'
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
          comparison.advice = await this.generateAIAdvice(
            comparison.metric,
            comparison.target,
            comparison.actual,
            industryType
          );
        }
      }

      return comparisons;
    } catch (error) {
      console.error('Error comparing with targets:', error);
      throw error;
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

請用繁體中文，提供 2-3 點簡潔、可執行的初步優化建議。每個建議控制在50字以內，直接提供具體行動方案。`;

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
        actualImpressions: adAccountData.impressions,
        actualClicks: adAccountData.clicks,
        actualPurchaseValue: adAccountData.purchaseValue.toString(),
        
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
          { id: 'fashion', name: '服飾配件', nameEn: 'Fashion & Accessories', averageRoas: '3.5', averageCtr: '1.8' },
          { id: 'beauty', name: '美妝保養', nameEn: 'Beauty & Skincare', averageRoas: '4.2', averageCtr: '2.1' },
          { id: 'food', name: '食品飲料', nameEn: 'Food & Beverage', averageRoas: '3.8', averageCtr: '1.6' },
          { id: 'health', name: '健康保健', nameEn: 'Health & Wellness', averageRoas: '4.5', averageCtr: '1.9' },
          { id: 'home', name: '居家生活', nameEn: 'Home & Living', averageRoas: '3.2', averageCtr: '1.4' },
          { id: 'electronics', name: '3C電子', nameEn: 'Electronics', averageRoas: '2.8', averageCtr: '1.2' },
          { id: 'sports', name: '運動休閒', nameEn: 'Sports & Recreation', averageRoas: '3.6', averageCtr: '1.7' },
          { id: 'baby', name: '母嬰用品', nameEn: 'Baby & Kids', averageRoas: '4.0', averageCtr: '2.0' }
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