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
      
      // 使用 actions 但透過 action_breakdowns 限制只拉取 purchase 相關數據
      const fields = [
        'spend',                    // 花費
        'actions',                  // 行動數據（只拉取 purchase）
        'action_values',            // 行動價值（只拉取 purchase_roas）
        'outbound_clicks_ctr'       // 外連點擊率
      ].join(',');
      
      // 簡化 API 調用，移除可能有問題的 filtering，改用後端篩選
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
      console.log('Facebook API raw data:', JSON.stringify(data, null, 2));
      console.log('Facebook API response headers:', Object.fromEntries(response.headers));
      
      if (!data.data || data.data.length === 0) {
        console.log('No Facebook data available for date range:', { since, until });
        throw new Error(`No advertising data found for account ${adAccountId} in the specified date range (${since} to ${until}). Please check if the account has active campaigns with data.`);
      }

      const insights = data.data[0];
      console.log('=== Facebook API 原始數據（優化後）===');
      console.log('完整 insights:', JSON.stringify(insights, null, 2));
      console.log('purchase:', insights.purchase);
      console.log('purchase_roas:', insights.purchase_roas);
      console.log('outbound_clicks_ctr:', insights.outbound_clicks_ctr);
      console.log('spend:', insights.spend);
      
      // 使用篩選後的 actions 陣列解析購買數據
      const spend = parseFloat(insights.spend || '0');
      
      // 從篩選後的 actions 陣列中解析購買數
      let purchases = 0;
      if (insights.actions && Array.isArray(insights.actions)) {
        const purchaseAction = insights.actions.find((action: any) => action.action_type === 'purchase');
        if (purchaseAction && purchaseAction.value) {
          purchases = parseInt(purchaseAction.value);
        }
      }
      
      // 從篩選後的 action_values 陣列中解析 ROAS
      let roas = 0;
      if (insights.action_values && Array.isArray(insights.action_values)) {
        const roasAction = insights.action_values.find((action: any) => action.action_type === 'purchase_roas');
        if (roasAction && roasAction.value) {
          roas = parseFloat(roasAction.value);
        }
      }
      
      console.log('Parsed purchases (篩選後的 actions):', purchases);
      console.log('Parsed ROAS (篩選後的 action_values):', roas);
      
      // 如果 ROAS 沒有數據，手動計算：購買價值 / 廣告花費
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
   * 流式比較實際值與目標值 (逐個生成AI建議)
   */
  async compareWithTargetsStreaming(
    actualMetrics: HealthCheckMetrics,
    planResultId: string,
    industryType: string,
    accessToken?: string,
    adAccountId?: string,
    onProgress?: (progress: any) => void
  ): Promise<HealthCheckComparison[]> {
    try {
      // 從預算計劃獲取目標值
      const planResult = await db.query.planResults.findFirst({
        where: eq(planResults.id, planResultId)
      });
      
      if (!planResult) {
        throw new Error('Plan result not found');
      }

      const targetDailySpend = parseFloat(planResult.dailyAdBudget.toString());
      const targetPurchases = Math.round(planResult.requiredOrders / 30);
      const targetRoas = parseFloat(planResult.targetRoas.toString());
      const targetCtr = 1.5;

      // 建立初始比較結果
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

      // 先發送基本比較結果
      onProgress?.({
        type: 'comparisons',
        data: comparisons
      });

      // 逐個為未達標指標生成 AI 建議
      for (const comparison of comparisons) {
        if (comparison.status === 'not_achieved') {
          onProgress?.({
            type: 'generating',
            metric: comparison.metric,
            message: `正在生成 ${comparison.metric} 的 AI 建議...`
          });

          if (comparison.metric === 'dailySpend' && accessToken && adAccountId) {
            comparison.advice = await this.generateDailySpendAdvice(
              comparison.target,
              comparison.actual,
              accessToken,
              adAccountId
            );
          } else if (comparison.metric === 'purchases' && accessToken && adAccountId) {
            comparison.advice = await this.generatePurchaseAdvice(
              accessToken,
              adAccountId,
              comparison.target,
              comparison.actual
            );
          } else if (comparison.metric === 'roas' && accessToken && adAccountId) {
            comparison.advice = await this.generateROASAdvice(
              accessToken,
              adAccountId,
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

          // 發送更新後的比較結果
          onProgress?.({
            type: 'advice_complete',
            metric: comparison.metric,
            advice: comparison.advice
          });
        }
      }

      return comparisons;
    } catch (error) {
      console.error('Error in streaming comparison:', error);
      throw error;
    }
  }

  /**
   * 比較實際值與目標值
   */
  async compareWithTargets(
    actualMetrics: HealthCheckMetrics,
    planResultId: string,
    industryType: string,
    accessToken?: string,
    adAccountId?: string
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
      console.log('開始為未達標指標生成 AI 建議...');
      for (const comparison of comparisons) {
        console.log(`檢查指標: ${comparison.metric}, 狀態: ${comparison.status}, 目標: ${comparison.target}, 實際: ${comparison.actual}`);
        
        if (comparison.status === 'not_achieved') {
          console.log(`指標 ${comparison.metric} 未達標，開始生成建議...`);
          
          if (comparison.metric === 'dailySpend') {
            comparison.advice = await this.generateDailySpendAdvice(
              comparison.target,
              comparison.actual
            );
          } else if (comparison.metric === 'purchases' && accessToken && adAccountId) {
            // 購買數未達標時調用新的購買建議函數
            comparison.advice = await this.generatePurchaseAdvice(
              accessToken,
              adAccountId,
              comparison.target,
              comparison.actual
            );
          } else if (comparison.metric === 'roas' && accessToken && adAccountId) {
            // ROAS 未達標時調用新的 ROAS 建議函數
            comparison.advice = await this.generateROASAdvice(
              accessToken,
              adAccountId,
              comparison.target,
              comparison.actual
            );
          } else if (comparison.metric === 'ctr' && accessToken && adAccountId) {
            // CTR 未達標時調用新的 CTR 建議函數
            console.log('開始生成 CTR 建議，參數:', { accessToken: accessToken?.length, adAccountId, target: comparison.target, actual: comparison.actual });
            comparison.advice = await this.generateCTRAdvice(
              accessToken,
              adAccountId,
              comparison.target,
              comparison.actual
            );
            console.log('CTR 建議生成完成，長度:', comparison.advice?.length);
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
   * 獲取廣告組合數據 (過去7天，計算購買轉換率)
   */
  async getAdSetInsights(accessToken: string, adAccountId: string): Promise<Array<{
    adSetId: string;
    adSetName: string;
    purchases: number;
    viewContent: number;
    conversionRate: number;
    spend: number;
  }>> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7); // 過去7天

      const since = startDate.toISOString().split('T')[0];
      const until = endDate.toISOString().split('T')[0];

      const accountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
      
      // 獲取廣告組合數據 - 只拉取必要欄位
      const fields = [
        'adset_id',
        'adset_name', 
        'spend',
        'actions'             // 限制 actions 只包含 purchase 和 view_content
      ].join(',');
      
      // 簡化購買建議 API 調用
      const url = `${this.baseUrl}/${accountId}/insights?fields=${fields}&level=adset&time_range={"since":"${since}","until":"${until}"}&access_token=${accessToken}`;
      
      console.log('=== 獲取廣告組合數據 ===');
      console.log('API URL:', url.replace(accessToken, accessToken.substring(0, 20) + '...'));
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`獲取廣告組合數據失敗 ${response.status}:`, errorText);
        throw new Error(`Facebook API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('廣告組合原始數據:', JSON.stringify(data, null, 2));
      
      if (!data.data || data.data.length === 0) {
        console.log('沒有找到廣告組合數據');
        return [];
      }

      const adSetData = data.data
        .filter((item: any) => item.adset_name && item.adset_name !== '(not set)') // 過濾有效廣告組合
        .map((item: any) => {
          // 從篩選後的 actions 陣列中解析購買數和內容瀏覽數
          let purchases = 0;
          let viewContent = 0;
          
          if (item.actions && Array.isArray(item.actions)) {
            const purchaseAction = item.actions.find((action: any) => action.action_type === 'purchase');
            if (purchaseAction && purchaseAction.value) {
              purchases = parseInt(purchaseAction.value);
            }
            
            const viewContentAction = item.actions.find((action: any) => action.action_type === 'view_content');
            if (viewContentAction && viewContentAction.value) {
              viewContent = parseInt(viewContentAction.value);
            }
          }
          
          // 計算轉換率 (purchase/view_content)
          const conversionRate = viewContent > 0 ? (purchases / viewContent) * 100 : 0;
          
          return {
            adSetId: item.adset_id,
            adSetName: item.adset_name,
            purchases,
            viewContent,
            conversionRate,
            spend: parseFloat(item.spend || '0')
          };
        })
        .filter((item: any) => item.viewContent > 0) // 只保留有瀏覽數的廣告組合
        .sort((a: any, b: any) => b.conversionRate - a.conversionRate); // 按轉換率排序

      console.log('處理後的廣告組合數據:', adSetData.slice(0, 3));
      
      return adSetData;
    } catch (error) {
      console.error('獲取廣告組合數據錯誤:', error);
      return [];
    }
  }

  /**
   * 生成購買數建議 (使用 ChatGPT 4o mini)
   */
  async generatePurchaseAdvice(accessToken: string, adAccountId: string, target: number, actual: number): Promise<string> {
    try {
      console.log('=== ChatGPT 購買數建議生成開始 ===');
      console.log('目標購買數:', target);
      console.log('實際購買數:', actual);
      
      // 獲取前三名轉換率最高的廣告組合
      const topAdSets = await this.getAdSetInsights(accessToken, adAccountId);
      const top3AdSets = topAdSets.slice(0, 3);
      
      console.log('前三名廣告組合:', top3AdSets);
      
      let adSetRecommendation = '';
      if (top3AdSets.length > 0) {
        adSetRecommendation = `
根據過去7天的數據分析，這是你轉換率最高的前三個廣告組合：

${top3AdSets.map((adSet, index) => 
  `${index + 1}. 【${adSet.adSetName}】
   - 轉換率：${adSet.conversionRate.toFixed(2)}%
   - 購買數：${adSet.purchases} 次
   - 花費：${adSet.spend.toLocaleString()} 元`
).join('\n\n')}

我建議你立即對這些成效好的廣告組合進行加碼，因為它們已經證明能夠帶來轉換。`;
      } else {
        adSetRecommendation = '目前沒有找到足夠的廣告組合數據，建議先確認廣告是否正常運行。';
      }
      
      const prompt = `你是一位擁有超過十年經驗的 Facebook 電商廣告專家『小黑老師』。請針對購買數指標提供結構化的優化建議。

**數據概況：**
- 目標購買數：${target} 次
- 實際購買數：${actual} 次
- 落差：${target - actual} 次

請按照以下結構輸出建議：

## 1. 現況洞察
分析目標 vs 實際的落差情況，以及對整體廣告成效的影響。

## 2. 核心策略說明
解釋購買數指標的重要性，以及如何透過「找出轉換率最高的廣告組合」來優化此指標。

## 3. 具體數據分析和建議
${adSetRecommendation}

## 4. 下一步建議
針對找出的高轉換率廣告組合，提供具體的加碼日預算建議。

請用小黑老師親切直接的語調，直接輸出HTML格式。每個章節用 <h3> 標籤包裝標題，內容用 <p> 和 <ul> 標籤。`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,  // 增加 token 限制確保完整輸出
        temperature: 0.7,
      });

      let result = response.choices[0].message.content || '暫無建議';
      
      // 移除 markdown 代碼塊標記
      result = result.replace(/```html\s*/g, '').replace(/```\s*$/g, '').trim();
      
      console.log('=== ChatGPT 購買數建議生成完成 ===');
      console.log('建議內容長度:', result.length);
      
      return result;
    } catch (error) {
      console.error('ChatGPT 購買數建議生成錯誤:', error);
      return '無法生成購買數建議，請稍後再試';
    }
  }

  /**
   * 獲取 ROAS 最高的廣告組合數據 (過去7天)
   */
  async getTopROASAdSets(accessToken: string, adAccountId: string): Promise<Array<{
    adSetName: string;
    roas: number;
    purchases: number;
    spend: number;
  }>> {
    try {
      // 確保廣告帳戶 ID 格式正確，避免重複 act_ 前綴
      const accountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
      
      // 計算日期範圍（過去7天）
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      
      const since = startDate.toISOString().split('T')[0];
      const until = endDate.toISOString().split('T')[0];
      
      // 簡化 ROAS 查詢，移除複雜的 filtering
      const roasUrl = `${this.baseUrl}/${accountId}/insights?` +
        `level=adset&` +
        `fields=adset_name,website_purchase_roas,actions,spend&` +
        `time_range={"since":"${since}","until":"${until}"}&` +
        `limit=100&` +
        `access_token=${accessToken}`;

      console.log('獲取 ROAS 廣告組合數據 URL:', roasUrl);

      const response = await fetch(roasUrl);
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Facebook API 錯誤:', data);
        return [];
      }

      console.log('ROAS 廣告組合原始數據:', data);

      if (!data.data || data.data.length === 0) {
        console.log('沒有找到 ROAS 廣告組合數據');
        return [];
      }

      // 處理並排序數據（使用篩選後的 actions 陣列）
      const processedData = data.data
        .filter((item: any) => item.website_purchase_roas && parseFloat(item.website_purchase_roas || '0') > 0)
        .map((item: any) => {
          // 從篩選後的 actions 陣列中解析購買數
          let purchases = 0;
          if (item.actions && Array.isArray(item.actions)) {
            const purchaseAction = item.actions.find((action: any) => action.action_type === 'purchase');
            if (purchaseAction && purchaseAction.value) {
              purchases = parseInt(purchaseAction.value);
            }
          }
          
          return {
            adSetName: item.adset_name,
            roas: parseFloat(item.website_purchase_roas[0]?.value || '0'),
            purchases,
            spend: parseFloat(item.spend || '0')
          };
        })
        .sort((a, b) => b.roas - a.roas) // 按 ROAS 降序排列
        .slice(0, 3); // 取前三名

      console.log('處理後的 ROAS 廣告組合數據:', processedData);
      return processedData;

    } catch (error) {
      console.error('獲取 ROAS 廣告組合數據錯誤:', error);
      return [];
    }
  }

  /**
   * 獲取 Hero Post 廣告（過去7天曝光超過500的最高CTR廣告）
   */
  async getHeroPosts(accessToken: string, adAccountId: string): Promise<Array<{
    adName: string;
    ctr: number;
    outboundCtr: number;
    purchases: number;
    spend: number;
    impressions: number;
  }>> {
    try {
      // 確保廣告帳戶 ID 格式正確
      const accountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
      
      // 計算日期範圍（過去7天）
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      
      const since = startDate.toISOString().split('T')[0];
      const until = endDate.toISOString().split('T')[0];
      
      // 獲取廣告層級數據（只拉取 Hero Post 需要的欄位，限制 actions 只包含 purchase）
      // 簡化 Hero Post 查詢，移除複雜的 filtering
      const heroUrl = `${this.baseUrl}/${accountId}/insights?` +
        `level=ad&` +
        `fields=ad_name,ctr,outbound_clicks_ctr,spend,impressions,actions&` +
        `time_range={"since":"${since}","until":"${until}"}&` +
        `limit=100&` +
        `access_token=${accessToken}`;
      
      console.log('獲取 Hero Post 數據 URL:', heroUrl.replace(accessToken, accessToken.substring(0, 20) + '...'));
      
      const response = await fetch(heroUrl);
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Facebook API 錯誤:', data);
        return [];
      }

      console.log('Hero Post 原始數據:', JSON.stringify(data, null, 2));

      if (!data.data || data.data.length === 0) {
        console.log('沒有找到 Hero Post 數據');
        console.log('API 回應狀態:', response.status);
        console.log('API 回應頭:', response.headers);
        return [];
      }

      console.log(`找到 ${data.data.length} 筆原始廣告數據`);

      // 第一步：檢查有廣告名稱的數據
      const withNames = data.data.filter((item: any) => item.ad_name && item.ad_name !== '(not set)');
      console.log(`有廣告名稱的數據：${withNames.length} 筆`);

      // 第二步：處理數據（修復 outbound_clicks_ctr 陣列解析）
      const mapped = withNames.map((item: any) => {
        const ctr = parseFloat(item.ctr || '0');
        
        // 修復：outbound_clicks_ctr 是陣列格式，需要提取 value
        let outboundCtr = 0;
        if (item.outbound_clicks_ctr && Array.isArray(item.outbound_clicks_ctr)) {
          const outboundAction = item.outbound_clicks_ctr.find((action: any) => action.action_type === 'outbound_click');
          if (outboundAction && outboundAction.value) {
            outboundCtr = parseFloat(outboundAction.value);
          }
        } else if (item.outbound_clicks_ctr) {
          outboundCtr = parseFloat(item.outbound_clicks_ctr);
        }
        
        const spend = parseFloat(item.spend || '0');
        const impressions = parseInt(item.impressions || '0');
        
        // 從篩選後的 actions 陣列中解析購買數
        let purchases = 0;
        if (item.actions && Array.isArray(item.actions)) {
          const purchaseAction = item.actions.find((action: any) => action.action_type === 'purchase');
          if (purchaseAction && purchaseAction.value) {
            purchases = parseInt(purchaseAction.value);
          }
        }
        
        console.log(`廣告 ${item.ad_name} 數據解析:`, {
          ctr,
          outboundCtr,
          purchases,
          spend,
          impressions
        });
        
        return {
          adName: item.ad_name,
          ctr,
          outboundCtr,
          purchases,
          spend,
          impressions
        };
      });

      // 第三步：檢查曝光和連外CTR條件
      const withImpressions = mapped.filter((item: any) => item.impressions >= 500);
      console.log(`曝光 >= 500 的廣告：${withImpressions.length} 筆`);
      
      const withOutboundCtr = mapped.filter((item: any) => item.outboundCtr > 0);
      console.log(`有連外CTR的廣告：${withOutboundCtr.length} 筆`);
      
      const qualified = mapped.filter((item: any) => item.impressions >= 500 && item.outboundCtr > 0);
      console.log(`符合條件（曝光>=500 且 連外CTR>0）的廣告：${qualified.length} 筆`);

      // 第四步：按連外點擊率排序並取前三名
      const processedData = qualified
        .sort((a: any, b: any) => b.outboundCtr - a.outboundCtr)
        .slice(0, 3);
        
      console.log(`排序後取前3名：${processedData.length} 筆`);

      console.log('處理後的 Hero Post 數據:', processedData);
      console.log(`最終篩選出 ${processedData.length} 個 Hero Post`);
      
      // 如果沒有找到 Hero Post，記錄詳細原因並嘗試降低門檻
      if (processedData.length === 0) {
        console.log('沒有找到符合條件的 Hero Post，嘗試降低門檻...');
        console.log('原始數據樣本（前5筆）:');
        data.data.slice(0, 5).forEach((item: any, index: number) => {
          console.log(`樣本 ${index + 1}:`, {
            ad_name: item.ad_name,
            ctr: item.ctr,
            impressions: item.impressions,
            spend: item.spend
          });
        });
        
        // 降低門檻：只要有連外CTR且曝光超過100即可
        console.log('嘗試降低門檻到曝光 >= 100...');
        const fallbackData = mapped
          .filter((item: any) => item.impressions >= 100 && item.outboundCtr > 0)
          .sort((a: any, b: any) => b.outboundCtr - a.outboundCtr)
          .slice(0, 3);
          
        console.log(`降低門檻（曝光>=100）後找到 ${fallbackData.length} 個 Hero Post`);
        
        // 如果還是找不到，再次降低門檻
        if (fallbackData.length === 0) {
          console.log('嘗試降低門檻到曝光 >= 10...');
          const veryLowThreshold = mapped
            .filter((item: any) => item.impressions >= 10 && item.outboundCtr > 0)
            .sort((a: any, b: any) => b.outboundCtr - a.outboundCtr)
            .slice(0, 3);
          console.log(`極低門檻（曝光>=10）後找到 ${veryLowThreshold.length} 個 Hero Post`);
          
          if (veryLowThreshold.length > 0) {
            veryLowThreshold.forEach((item: any, index: number) => {
              console.log(`低門檻 Hero Post ${index + 1}:`, item);
            });
          }
          
          return veryLowThreshold;
        }
        
        return fallbackData;
      }
      
      return processedData;

    } catch (error) {
      console.error('獲取 Hero Post 數據錯誤:', error);
      return [];
    }
  }

  /**
   * 生成 ROAS 建議 (使用 ChatGPT 4o mini)
   */
  async generateROASAdvice(accessToken: string, adAccountId: string, target: number, actual: number): Promise<string> {
    try {
      console.log('=== ChatGPT ROAS 建議生成開始 ===');
      console.log('目標 ROAS:', target);
      console.log('實際 ROAS:', actual);
      
      // 獲取前三名 ROAS 最高的廣告組合
      const topROASAdSets = await this.getTopROASAdSets(accessToken, adAccountId);
      
      console.log('前三名 ROAS 廣告組合:', topROASAdSets);
      
      let adSetRecommendation = '';
      if (topROASAdSets.length > 0) {
        adSetRecommendation = `
根據過去7天的數據分析，這是你 ROAS 最高的前三個廣告組合：

${topROASAdSets.map((adSet, index) => 
  `${index + 1}. 【${adSet.adSetName}】
   - ROAS：${adSet.roas.toFixed(2)}x
   - 購買數：${adSet.purchases} 次
   - 花費：${adSet.spend.toLocaleString()} 元`
).join('\n\n')}

我建議你立即對這些 ROAS 表現最好的廣告組合進行加碼，因為它們已經證明能夠帶來高投資報酬率。`;
      } else {
        adSetRecommendation = '目前沒有找到足夠的廣告組合 ROAS 數據，建議先確認廣告是否正常運行並有購買轉換數據。';
      }
      
      const prompt = `你是一位擁有超過十年經驗的 Facebook 電商廣告專家『小黑老師』。請針對 ROAS 指標提供結構化的優化建議。

**數據概況：**
- 目標 ROAS：${target}x
- 實際 ROAS：${actual.toFixed(2)}x
- 落差：${(target - actual).toFixed(2)}x

請按照以下結構輸出建議：

## 1. 現況洞察
分析目標 vs 實際的落差情況，以及對整體廣告投資報酬率的影響。

## 2. 核心策略說明
解釋 ROAS 指標的重要性，以及如何透過「找出 ROAS 最高的廣告組合」來優化此指標。

## 3. 具體數據分析和建議
${adSetRecommendation}

## 4. 下一步建議
針對找出的高 ROAS 廣告組合，提供具體的測試更多不同受眾的建議。

請用小黑老師親切直接的語調，直接輸出HTML格式。每個章節用 <h3> 標籤包裝標題，內容用 <p> 和 <ul> 標籤。`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,  // 增加 token 限制確保完整輸出
      });

      let advice = response.choices[0].message.content || '';
      
      // 清理 markdown 格式
      advice = advice.replace(/```html/g, '').replace(/```/g, '');
      
      console.log('生成的 ROAS 建議:', advice);
      return advice;

    } catch (error) {
      console.error('生成 ROAS 建議錯誤:', error);
      return '無法生成 ROAS 建議，請稍後再試';
    }
  }

  /**
   * 生成 CTR 建議 (使用 ChatGPT 4o mini)
   */
  async generateCTRAdvice(accessToken: string, adAccountId: string, target: number, actual: number): Promise<string> {
    try {
      console.log('=== CTR 建議生成開始 ===');
      console.log('目標 CTR:', target, '%');
      console.log('實際 CTR:', actual, '%');
      console.log('廣告帳戶ID:', adAccountId);
      console.log('Access Token 長度:', accessToken ? accessToken.length : 'undefined');
      
      // 獲取前三名 Hero Post
      console.log('開始查找 Hero Post...');
      const heroPosts = await this.getHeroPosts(accessToken, adAccountId);
      
      console.log('=== Hero Post 查找結果詳細分析 ===');
      console.log('Hero Post 查找結果:', JSON.stringify(heroPosts, null, 2));
      console.log('Hero Post 數量:', heroPosts.length);
      console.log('Hero Post 類型:', typeof heroPosts);
      console.log('是否為陣列:', Array.isArray(heroPosts));
      
      let heroPostRecommendation = '';
      if (heroPosts.length > 0) {
        console.log('✅ 找到 Hero Post，開始生成推薦內容...');
        heroPostRecommendation = `
✨ 根據過去7天的數據分析，發現你的 ${heroPosts.length} 個 Hero Post 廣告（高連外點擊率）：

${heroPosts.map((hero, index) => 
  `🎯 Hero Post ${index + 1}：【${hero.adName}】
   📊 連外點擊率：${hero.outboundCtr.toFixed(2)}%（表現優異！）
   🎯 整體點擊率：${hero.ctr.toFixed(2)}%
   🛒 購買轉換：${hero.purchases} 次
   💰 廣告花費：$${hero.spend.toFixed(2)}
   👁️ 曝光次數：${hero.impressions.toLocaleString()}`
).join('\n\n')}

🚀 立即行動建議：
1. 【加碼投放】：對這些 Hero Post 增加預算，擴大受眾觸及
2. 【創意複製】：分析這些廣告的創意元素，套用到新廣告中
3. 【ASC 放大】：使用廣告組合簡化功能，讓 Facebook 自動放大這些高效廣告
4. 【受眾測試】：拿這些 Hero Post 去測試更多不同的受眾組合
`;
      } else {
        console.log('❌ 沒有找到 Hero Post，使用備用建議...');
        heroPostRecommendation = '❌ 目前無法找到高連外點擊率的 Hero Post（過去7天曝光超過500且連外CTR表現突出），建議先優化現有廣告的創意和受眾設定。';
      }
      
      console.log('=== Hero Post 推薦內容 ===');
      console.log('推薦內容長度:', heroPostRecommendation.length);
      console.log('推薦內容預覽:', heroPostRecommendation.substring(0, 200) + '...');

      // 構建結構化的 CTR 建議提示
      const prompt = `你是一位擁有超過十年經驗的 Facebook 電商廣告專家『小黑老師』。請針對連結點擊率指標提供結構化的優化建議。

**數據概況：**
- 目標 CTR：${target.toFixed(2)}%
- 實際 CTR：${actual.toFixed(2)}%
- 落差：${(target - actual).toFixed(2)}%

請按照以下結構輸出建議：

## 1. 現況洞察
分析目標 vs 實際的落差情況，以及對整體廣告點擊成效的影響。

## 2. 核心策略說明
解釋連結點擊率指標的重要性，以及如何透過「找出連外點擊率最高的三個廣告（Hero Post）」來優化此指標。

## 3. 具體數據分析和建議
${heroPostRecommendation}

## 4. 下一步建議
針對找出的高 CTR 廣告（Hero Post），提供具體的類似受眾投放和擴大曝光觸及建議。

請用小黑老師親切直接的語調，直接輸出HTML格式。每個章節用 <h3> 標籤包裝標題，內容用 <p> 和 <ul> 標籤。`;

      const messages = [
        {
          role: 'system',
          content: '你是一位擁有超過十年經驗的 Facebook 電商廣告專家『小黑老師』。專精於透過分析高連外點擊率廣告來優化整體廣告表現，請以專業且實用的語調提供廣告優化建議。直接輸出HTML格式，不要用markdown包裝。'
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      console.log('=== 發送 CTR 建議請求到 ChatGPT ===');
      console.log('prompt 完整內容:', prompt);
      console.log('prompt 長度:', prompt.length);
      console.log('請求內容:', JSON.stringify(messages, null, 2));

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          max_tokens: 2000,  // 增加 token 限制確保完整輸出
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ChatGPT API 錯誤:', response.status, errorText);
        throw new Error(`ChatGPT API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('ChatGPT CTR 建議回應完整數據:', JSON.stringify(data, null, 2));

      let advice = data.choices[0].message.content || '';
      
      console.log('=== 最終 CTR 建議內容分析 ===');
      console.log('建議長度:', advice.length);
      console.log('建議內容完整版:', advice);
      console.log('是否包含 Hero Post:', advice.includes('Hero Post'));
      console.log('是否包含連外點擊率:', advice.includes('連外點擊率'));
      console.log('是否包含廣告名稱:', advice.includes('【'));
      console.log('Hero Post 推薦內容長度:', heroPostRecommendation.length);
      console.log('Hero Post 是否為空:', heroPostRecommendation.trim() === '');
      console.log('=== CTR 建議生成完成 ===');
      
      return advice;

    } catch (error) {
      console.error('生成 CTR 建議錯誤:', error);
      return '抱歉，無法生成 CTR 建議。請稍後再試。';
    }
  }

  /**
   * 獲取預算沒花完的廣告活動 (過去7天)
   */
  async getUnderSpentCampaigns(accessToken: string, adAccountId: string): Promise<Array<{
    campaignName: string;
    budgetUsed: number;
    dailyBudget: number;
    utilizationRate: number;
  }>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 1);
      
      const since = startDate.toISOString().split('T')[0];
      const until = endDate.toISOString().split('T')[0];
      
      const campaignUrl = `${this.baseUrl}/${adAccountId}/insights?` +
        `level=campaign&` +
        `fields=campaign_name,spend,daily_budget&` +
        `time_range={"since":"${since}","until":"${until}"}&` +
        `limit=50&` +
        `access_token=${accessToken}`;
      
      console.log('獲取廣告活動預算使用數據 URL:', campaignUrl.replace(accessToken, accessToken.substring(0, 20) + '...'));
      
      const response = await fetch(campaignUrl);
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Facebook API 錯誤:', data);
        return [];
      }
      
      if (!data.data || data.data.length === 0) {
        console.log('沒有找到廣告活動數據');
        return [];
      }
      
      // 計算預算使用率並找出沒花完的廣告活動
      const underSpentCampaigns = data.data
        .filter((item: any) => item.campaign_name && item.daily_budget && parseFloat(item.daily_budget) > 0)
        .map((item: any) => {
          const dailyBudget = parseFloat(item.daily_budget) / 100; // Facebook API 回傳的是分為單位
          const totalSpend = parseFloat(item.spend || '0');
          const avgDailySpend = totalSpend / 7; // 過去7天平均每日花費
          const utilizationRate = (avgDailySpend / dailyBudget) * 100;
          
          return {
            campaignName: item.campaign_name,
            budgetUsed: avgDailySpend,
            dailyBudget: dailyBudget,
            utilizationRate: utilizationRate
          };
        })
        .filter(campaign => campaign.utilizationRate < 90) // 使用率低於90%的算作沒花完
        .sort((a, b) => a.utilizationRate - b.utilizationRate) // 按使用率從低到高排序
        .slice(0, 3); // 只取前三個
      
      console.log('找到的預算沒花完廣告活動:', underSpentCampaigns);
      return underSpentCampaigns;
      
    } catch (error) {
      console.error('獲取廣告活動預算數據錯誤:', error);
      return [];
    }
  }

  /**
   * 生成日均花費建議 (使用 ChatGPT 4o mini)
   */
  private async generateDailySpendAdvice(target: number, actual: number, accessToken: string, adAccountId: string): Promise<string> {
    try {
      console.log('=== ChatGPT 日均花費建議生成開始 ===');
      console.log('目標花費:', target);
      console.log('實際花費:', actual);
      
      const shortfall = target - actual;
      
      // 獲取預算沒花完的廣告活動數據
      const underSpentCampaigns = await this.getUnderSpentCampaigns(accessToken, adAccountId);
      
      let campaignData = '';
      if (underSpentCampaigns.length > 0) {
        campaignData = `
根據過去7天的數據分析，這是預算沒花完的前三個廣告活動：

${underSpentCampaigns.map((campaign, index) => 
  `${index + 1}. 【${campaign.campaignName}】
   - 日預算：${campaign.dailyBudget.toLocaleString()} 元
   - 實際平均花費：${campaign.budgetUsed.toLocaleString()} 元
   - 預算使用率：${campaign.utilizationRate.toFixed(1)}%`
).join('\n\n')}

這些廣告活動的預算使用率偏低，需要優化受眾設定或出價策略來提升花費效率。`;
      } else {
        campaignData = '目前所有廣告活動的預算使用率都正常（超過90%），問題可能是整體廣告帳戶的日預算設定太少，建議增加總預算。';
      }
      
      const prompt = `你是一位擁有超過十年經驗的 Facebook 電商廣告專家『小黑老師』。請針對日均花費指標提供結構化的優化建議。

**數據概況：**
- 目標日均花費：${target.toLocaleString()} 元
- 實際日均花費：${actual.toLocaleString()} 元
- 落差：${shortfall.toLocaleString()} 元

請按照以下結構輸出建議：

## 1. 現況洞察
分析目標 vs 實際的落差情況，以及對整體廣告曝光和流量的影響。

## 2. 核心策略說明
解釋日均花費指標的重要性，以及如何透過「找出三個日預算沒有花完的廣告活動」來診斷問題。

## 3. 具體數據分析和建議
${campaignData}

## 4. 下一步建議
${underSpentCampaigns.length > 0 ? 
  '針對預算沒花完的廣告活動，提供增加受眾、調整出價等具體建議來有效花完預算。' : 
  '由於所有廣告活動預算使用率正常，建議整體增加廣告帳戶的日預算設定。'}

請用小黑老師親切直接的語調，直接輸出HTML格式。每個章節用 <h3> 標籤包裝標題，內容用 <p> 和 <ul> 標籤。`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,  // 增加 token 限制確保完整輸出
        temperature: 0.7,
      });

      let result = response.choices[0].message.content || '暫無建議';
      
      // 移除 markdown 代碼塊標記
      result = result.replace(/```html\s*/g, '').replace(/```\s*$/g, '').trim();
      
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