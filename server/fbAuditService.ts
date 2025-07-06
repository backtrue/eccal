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
      for (const comparison of comparisons) {
        if (comparison.status === 'not_achieved') {
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
      
      // 獲取廣告組合數據
      const fields = [
        'adset_id',
        'adset_name', 
        'spend',
        'actions'
      ].join(',');
      
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
          // 計算購買數
          const purchaseAction = item.actions?.find((action: any) => action.action_type === 'purchase');
          const purchases = purchaseAction ? parseInt(purchaseAction.value) : 0;
          
          // 計算內容瀏覽數
          const viewContentAction = item.actions?.find((action: any) => action.action_type === 'view_content');
          const viewContent = viewContentAction ? parseInt(viewContentAction.value) : 0;
          
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
        .filter((item: any) => item.viewContent > 0) // 只保留有內容瀏覽數的廣告組合
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
      
      const prompt = `你是一位擁有超過十年經驗的 Facebook 電商廣告專家『小黑老師』。目前的廣告活動『購買數』目標為 ${target} 次，實際達成了 ${actual} 次，成效有點落後。請基於『分析並加碼成效好的廣告組合』這個核心邏輯，提供下一步的操作建議，目的是複製成功經驗，趕快挽救頹勢。

請用小黑老師親切直接的語調，參考以下結構：

1. 開頭分析現況（目標vs實際）
2. 核心策略說明（加碼成效好的廣告組合）
3. 具體數據分析和建議（結合以下廣告組合數據）
4. 操作步驟建議
5. 結尾鼓勵

廣告組合數據：
${adSetRecommendation}

請直接輸出HTML格式，保持小黑老師的專業和親切語調。`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
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
   * 生成日均花費建議 (使用 ChatGPT 4o mini)
   */
  private async generateDailySpendAdvice(target: number, actual: number): Promise<string> {
    try {
      console.log('=== ChatGPT 日均花費建議生成開始 ===');
      console.log('目標花費:', target);
      console.log('實際花費:', actual);
      
      const shortfall = target - actual;
      
      const prompt = `你是一位擁有超過十年經驗的 Facebook 電商廣告專家『小黑老師』。請用親切、直接的語調，針對日均花費未達標的情況提供建議。

參考這個範本格式，但不要完全照抄，要依據實際數據來調整：

「看到你今天的日均目標是 ${target.toLocaleString()} 元，結果只花了 ${actual.toLocaleString()} 元，少了快 ${shortfall.toLocaleString()} 元，這種情況我最有感。

很多人以為「花不到錢」是好事，代表效率高，但其實完全不是。
你要知道，成交的基礎是足夠的流量，而流量的基礎就是預算要花得出去。
你今天沒花到，代表什麼？代表你的曝光量、點擊數、甚至進站流量，全都會少一截。

而最常見的三個「沒花完」原因是這些：

第一，你的受眾太窄，系統找不到人投，當然投不出去。
第二，你的出價太低，尤其是用手動出價的時候，根本搶不到量。
第三，素材吸引力不足，CTR 掉到 0.3% 以下，系統也不想幫你推。

那要怎麼處理？
我會這樣拆：

👉 如果是受眾太窄，就放寬條件，先看一下目前受眾潛在觸及數是不是低於 20 萬？加點興趣標籤或拉寬年齡帶。
👉 如果是手動出價，記得檢查競價建議區間，不要硬壓在理想的CPA或CPC。你可以往中上值多加個 5～10%。
👉 如果是素材問題，這時候就要回頭看連結點擊率了。低於 1% 基本就要換素材，或至少換圖片與標題文案嘗試不同版本組合。

而最保險的做法，是先把廣告預算設成「每日花費上限」，不要用總預算分配，讓系統有機會「完整花完再來談效益」。

記住，你今天花不完，等於漏水的水龍頭，前面流量進不來，後面的轉換根本沒得跑。
所以別再等「花完再來看數據」，你得先讓錢跑出去，系統才會回你訊號。

請務必記得：廣告不是省錢比賽，是搶曝光的戰爭。花不出去，就等於沒參加比賽。」

請用類似的語調和架構，但要根據實際數據調整，保持小黑老師的親切直接風格。回答時直接輸出HTML格式，不要用markdown包裝。`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
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