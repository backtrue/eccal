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
import { businessTermsDictionary, fbAuditTerms, getCorrectJapaneseTerm } from "./businessTermsDictionary";
import { convertCurrency, detectFacebookAccountCurrency, EXCHANGE_RATES } from "@shared/currency";

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
  currencyConversionInfo?: {
    originalAmount: number;
    originalCurrency: string;
    convertedAmount: number;
    targetCurrency: string;
    conversionRate: number;
  } | null;
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
   * 獲取使用者的 Facebook 廣告帳號列表（支援分頁）
   */
  async getAdAccounts(accessToken: string): Promise<Array<{id: string, name: string}>> {
    try {
      const allAccounts: Array<{id: string, name: string}> = [];
      let nextPageUrl = `${this.baseUrl}/me/adaccounts?fields=id,name,account_status&limit=100&access_token=${accessToken}`;
      
      console.log('開始獲取 Facebook 廣告帳戶 (支援分頁)');
      let pageCount = 0;
      
      while (nextPageUrl && pageCount < 10) { // 限制最多 10 頁避免無限循環
        pageCount++;
        console.log(`正在獲取第 ${pageCount} 頁:`, nextPageUrl.replace(accessToken, accessToken.substring(0, 20) + '...'));
        
        const response = await fetch(nextPageUrl);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Facebook API 錯誤詳情:', errorText);
          throw new Error(`Facebook API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        console.log(`第 ${pageCount} 頁回應:`, {
          dataExists: !!data.data,
          pageAccounts: data.data?.length || 0,
          hasNextPage: !!data.paging?.next,
          accounts: data.data?.map((acc: any) => ({
            id: acc.id,
            name: acc.name,
            status: acc.account_status
          })) || []
        });
        
        if (data.data && Array.isArray(data.data)) {
          // 只收集啟用的帳戶
          const activePageAccounts = data.data
            .filter((account: any) => account.account_status === 1)
            .map((account: any) => ({
              id: account.id,
              name: account.name
            }));
          
          allAccounts.push(...activePageAccounts);
          console.log(`第 ${pageCount} 頁新增 ${activePageAccounts.length} 個啟用帳戶，總計: ${allAccounts.length}`);
        }
        
        // 檢查是否有下一頁
        nextPageUrl = data.paging?.next || null;
        
        // 如果沒有更多頁面，跳出循環
        if (!nextPageUrl) {
          console.log('已獲取所有頁面，結束分頁查詢');
          break;
        }
      }
      
      console.log('最終結果 - 所有啟用帳戶:', {
        totalPages: pageCount,
        totalActiveAccounts: allAccounts.length,
        accounts: allAccounts
      });
      
      return allAccounts;
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
      // 修正日期計算：確保包含今天的數據
      const now = new Date();
      
      // Facebook API 的 until 是 exclusive，所以要用明天的日期才能包含今天
      const endDate = new Date(now);
      endDate.setDate(now.getDate() + 1);  // 明天（確保今天被包含）
      
      // 開始日期：28天前（包含今天，所以實際是29天範圍）
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - 28);

      const since = startDate.toISOString().split('T')[0];
      const until = endDate.toISOString().split('T')[0];
      
      console.log('=== 日期範圍計算 ===');
      console.log('今天:', now.toISOString().split('T')[0]);
      console.log('開始日期 (since):', since);
      console.log('結束日期 (until):', until);
      console.log('實際包含天數:', Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)), '天');
      console.log('說明: until 是 exclusive，設定為明天可確保包含今天的數據');
      
      // 計算實際包含的日期範圍說明
      const actualDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      console.log(`實際數據範圍: ${since} 到 ${now.toISOString().split('T')[0]} (${actualDays} 天，包含今天)`);

      // 確保廣告帳戶 ID 格式正確，避免重複 act_ 前綴
      const accountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
      
      // 使用完整的 Facebook Insights API 欄位，確保能抓取所有購買數據
      const fields = [
        'spend',                    // 花費
        'actions',                  // 行動數據（包含所有轉換）
        'action_values',            // 行動價值（包含購買金額）
        'outbound_clicks_ctr',      // 外連點擊率
        'impressions',              // 曝光數
        'clicks',                   // 點擊數
        'inline_link_clicks'        // 連結點擊數
      ].join(',');
      
      // 修正 API 調用：添加重要參數確保數據完整性
      const apiParams = new URLSearchParams({
        fields: fields,
        time_range: JSON.stringify({ since, until }),
        level: 'account',              // 帳戶層級聚合
        attribution_spec: JSON.stringify([{
          event_type: 'click_through',
          window_days: 7
        }, {
          event_type: 'view_through', 
          window_days: 1
        }]),                           // 7天點擊 + 1天瀏覽歸因
        access_token: accessToken
      });
      
      const url = `${this.baseUrl}/${accountId}/insights?${apiParams.toString()}`;
      
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

      // 檢查是否有多筆數據需要聚合
      console.log('=== Facebook API 完整回應分析 ===');
      console.log('回傳數據筆數:', data.data.length);
      console.log('完整 data.data:', JSON.stringify(data.data, null, 2));
      
      // 聚合所有數據（如果有多筆的話）
      let totalSpend = 0;
      let totalPurchases = 0;
      let totalImpressions = 0;
      let totalClicks = 0;
      let allActions: any[] = [];
      let allActionValues: any[] = [];
      
      for (let i = 0; i < data.data.length; i++) {
        const insights = data.data[i];
        console.log(`=== 第 ${i + 1} 筆數據 ===`);
        console.log('單筆 insights:', JSON.stringify(insights, null, 2));
        
        // 累加數值
        totalSpend += parseFloat(insights.spend || '0');
        totalImpressions += parseInt(insights.impressions || '0');
        totalClicks += parseInt(insights.clicks || '0');
        
        // 收集所有 actions 和 action_values
        if (insights.actions && Array.isArray(insights.actions)) {
          allActions = allActions.concat(insights.actions);
          console.log(`第 ${i + 1} 筆 actions:`, insights.actions);
        }
        
        if (insights.action_values && Array.isArray(insights.action_values)) {
          allActionValues = allActionValues.concat(insights.action_values);
          console.log(`第 ${i + 1} 筆 action_values:`, insights.action_values);
        }
      }
      
      console.log('=== 聚合後的原始數據 ===');
      console.log('累計花費:', totalSpend);
      console.log('所有 actions:', allActions);
      console.log('所有 action_values:', allActionValues);
      
      // 從聚合的 actions 中計算總購買數
      const purchaseActions = allActions.filter(action => action.action_type === 'purchase');
      console.log('所有 purchase actions:', purchaseActions);
      
      let purchases = 0;
      purchaseActions.forEach(action => {
        const value = parseInt(action.value || '0');
        purchases += value;
        console.log('累加購買數:', value, '總計:', purchases);
      });
      
      const spend = totalSpend;
      
      // 從聚合的 action_values 中計算 ROAS
      const roasActions = allActionValues.filter(action => action.action_type === 'purchase_roas');
      console.log('所有 ROAS actions:', roasActions);
      
      let totalRoasValue = 0;
      let roasCount = 0;
      roasActions.forEach(action => {
        const value = parseFloat(action.value || '0');
        if (value > 0) {
          totalRoasValue += value;
          roasCount++;
        }
      });
      
      let roas = roasCount > 0 ? totalRoasValue / roasCount : 0;
      console.log('聚合 ROAS 計算:', { totalRoasValue, roasCount, averageRoas: roas });
      
      // 如果沒有 ROAS 數據，手動計算：購買價值 / 廣告花費
      if (roas === 0 && spend > 0) {
        const purchaseValueActions = allActionValues.filter(action => action.action_type === 'purchase');
        let totalPurchaseValue = 0;
        purchaseValueActions.forEach(action => {
          totalPurchaseValue += parseFloat(action.value || '0');
        });
        
        if (totalPurchaseValue > 0) {
          roas = totalPurchaseValue / spend;
          console.log('手動計算 ROAS:', { totalPurchaseValue, spend, calculatedRoas: roas });
        }
      }
      
      console.log('最終購買數據:', { purchases, spend, roas });
      
      // 計算 CTR：從聚合數據或 API 提供的 CTR 數據
      let ctr = 0;
      
      // 嘗試從第一筆數據獲取 CTR（通常 Facebook 會提供聚合的 CTR）
      if (data.data.length > 0) {
        const firstInsight = data.data[0];
        console.log('CTR 原始數據:', firstInsight.outbound_clicks_ctr);
        
        if (firstInsight.outbound_clicks_ctr !== undefined && firstInsight.outbound_clicks_ctr !== null) {
          if (Array.isArray(firstInsight.outbound_clicks_ctr) && firstInsight.outbound_clicks_ctr.length > 0) {
            const ctrValue = firstInsight.outbound_clicks_ctr[0]?.value;
            ctr = !isNaN(parseFloat(ctrValue)) ? parseFloat(ctrValue) : 0;
          } else if (typeof firstInsight.outbound_clicks_ctr === 'string' || typeof firstInsight.outbound_clicks_ctr === 'number') {
            ctr = !isNaN(parseFloat(firstInsight.outbound_clicks_ctr.toString())) ? parseFloat(firstInsight.outbound_clicks_ctr.toString()) : 0;
          }
        }
      }
      
      // 如果沒有 CTR 數據，手動計算：總點擊數 / 總曝光數
      if (ctr === 0 && totalImpressions > 0) {
        ctr = (totalClicks / totalImpressions) * 100;
        console.log('手動計算 CTR:', { totalClicks, totalImpressions, calculatedCtr: ctr });
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
    locale: string = 'zh-TW',
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

      // 以預算計劃的幣值為基準
      const planCurrency = planResult.currency || 'TWD';
      const facebookCurrency = detectFacebookAccountCurrency(adAccountId || '');
      
      // 目標值直接使用計劃中的原始值
      const targetDailySpend = parseFloat(planResult.dailyAdBudget.toString());
      const targetPurchases = Math.round(planResult.requiredOrders / 30);
      const targetRoas = parseFloat(planResult.targetRoas.toString());
      const targetCtr = 1.5;
      
      // 如果Facebook帳戶幣值與計劃幣值不同，需要轉換實際值
      let convertedActualSpend = actualMetrics.dailySpend;
      let currencyConversionInfo = null;
      
      if (facebookCurrency !== planCurrency) {
        const originalActualSpend = actualMetrics.dailySpend;
        convertedActualSpend = convertCurrency(originalActualSpend, facebookCurrency, planCurrency);
        
        currencyConversionInfo = {
          originalAmount: originalActualSpend,
          originalCurrency: facebookCurrency,
          convertedAmount: convertedActualSpend,
          targetCurrency: planCurrency,
          conversionRate: convertedActualSpend / originalActualSpend
        };
        
        console.log('幣值轉換資訊:', {
          planCurrency,
          facebookCurrency,
          originalActualSpend,
          convertedActualSpend,
          conversionRate: convertedActualSpend / originalActualSpend
        });
      }
      
      // 更新實際指標以使用轉換後的值
      const adjustedActualMetrics = {
        ...actualMetrics,
        dailySpend: convertedActualSpend
      };

      // 建立初始比較結果，使用調整後的實際指標
      const comparisons: HealthCheckComparison[] = [
        {
          metric: 'dailySpend',
          target: targetDailySpend,
          actual: adjustedActualMetrics.dailySpend,
          status: adjustedActualMetrics.dailySpend >= targetDailySpend ? 'achieved' : 'not_achieved',
          currencyConversionInfo: currencyConversionInfo
        },
        {
          metric: 'purchases',
          target: targetPurchases,
          actual: adjustedActualMetrics.purchases,
          status: adjustedActualMetrics.purchases >= targetPurchases ? 'achieved' : 'not_achieved'
        },
        {
          metric: 'roas',
          target: targetRoas,
          actual: adjustedActualMetrics.roas,
          status: adjustedActualMetrics.roas >= targetRoas ? 'achieved' : 'not_achieved'
        },
        {
          metric: 'ctr',
          target: targetCtr,
          actual: adjustedActualMetrics.ctr,
          status: adjustedActualMetrics.ctr >= targetCtr ? 'achieved' : 'not_achieved'
        }
      ];

      // 先發送基本比較結果
      onProgress?.({
        type: 'comparisons',
        data: comparisons
      });

      // 為所有指標生成 AI 建議（達標改為鼓勵加碼，未達標為改善建議）
      for (const comparison of comparisons) {
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
            adAccountId,
            locale,
            comparison.status === 'achieved' // 傳遞達標狀態
          );
        } else if (comparison.metric === 'purchases' && accessToken && adAccountId) {
          comparison.advice = await this.generatePurchaseAdvice(
            accessToken,
            adAccountId,
            comparison.target,
            comparison.actual,
            locale,
            comparison.status === 'achieved'
          );
        } else if (comparison.metric === 'roas' && accessToken && adAccountId) {
          comparison.advice = await this.generateROASAdvice(
            accessToken,
            adAccountId,
            comparison.target,
            comparison.actual,
            locale,
            comparison.status === 'achieved'
          );
        } else {
          comparison.advice = await this.generateAIAdvice(
            comparison.metric,
            comparison.target,
            comparison.actual,
            industryType,
            locale,
            comparison.status === 'achieved'
          );
        }

        // 發送更新後的比較結果
        onProgress?.({
          type: 'advice_complete',
          metric: comparison.metric,
          advice: comparison.advice
        });
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
    adAccountId?: string,
    locale: string = 'zh-TW'
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

      // 檢測計劃和 Facebook 廣告帳戶的幣值
      const planCurrency = planResult.currency || 'TWD'; // 預設為 TWD
      const fbAccountCurrency = detectFacebookAccountCurrency(adAccountId || ''); // 通常是 USD

      console.log('===== 幣值轉換資訊 =====');
      console.log('計劃幣值:', planCurrency);
      console.log('FB 帳戶幣值:', fbAccountCurrency);
      console.log('原始 actualMetrics.dailySpend:', actualMetrics.dailySpend);

      // 進行幣值轉換：將 Facebook 實際值轉換為計劃幣值
      let convertedDailySpend = actualMetrics.dailySpend;
      let currencyConversionInfo = null;

      if (planCurrency !== fbAccountCurrency) {
        const originalAmount = actualMetrics.dailySpend;
        convertedDailySpend = convertCurrency(originalAmount, fbAccountCurrency, planCurrency);
        
        const conversionRate = EXCHANGE_RATES[fbAccountCurrency as keyof typeof EXCHANGE_RATES]?.[planCurrency as keyof typeof EXCHANGE_RATES['TWD']] || 1;
        
        currencyConversionInfo = {
          originalAmount,
          originalCurrency: fbAccountCurrency,
          convertedAmount: convertedDailySpend,
          targetCurrency: planCurrency,
          conversionRate
        };

        console.log('幣值轉換完成:', {
          原始金額: originalAmount,
          原始幣值: fbAccountCurrency,
          轉換後金額: convertedDailySpend,
          目標幣值: planCurrency,
          轉換率: conversionRate
        });
      }

      console.log('===== 目標值直接顯示 =====');
      console.log('目標日均花費:', targetDailySpend);
      console.log('目標購買數:', targetPurchases);
      console.log('目標 ROAS:', targetRoas);
      console.log('目標 CTR:', targetCtr);
      console.log('轉換後實際日均花費:', convertedDailySpend);

      // 使用轉換後的實際值進行比較
      const comparisons: HealthCheckComparison[] = [
        {
          metric: 'dailySpend',
          target: targetDailySpend,
          actual: convertedDailySpend,
          status: convertedDailySpend >= targetDailySpend ? 'achieved' : 'not_achieved',
          currencyConversionInfo
        },
        {
          metric: 'purchases',
          target: targetPurchases,
          actual: actualMetrics.purchases,
          status: actualMetrics.purchases >= targetPurchases ? 'achieved' : 'not_achieved',
          currencyConversionInfo: null
        },
        {
          metric: 'roas',
          target: targetRoas,
          actual: actualMetrics.roas,
          status: actualMetrics.roas >= targetRoas ? 'achieved' : 'not_achieved',
          currencyConversionInfo: null
        },
        {
          metric: 'ctr',
          target: targetCtr,
          actual: actualMetrics.ctr,
          status: actualMetrics.ctr >= targetCtr ? 'achieved' : 'not_achieved',
          currencyConversionInfo: null
        }
      ];

      // 為所有指標生成 AI 建議（達標改為鼓勵加碼，未達標為改善建議）
      console.log('開始為所有指標生成 AI 建議...');
      for (const comparison of comparisons) {
        console.log(`檢查指標: ${comparison.metric}, 狀態: ${comparison.status}, 目標: ${comparison.target}, 實際: ${comparison.actual}`);
        
        const isAchieved = comparison.status === 'achieved';
        console.log(`指標 ${comparison.metric} ${isAchieved ? '已達標' : '未達標'}，開始生成建議...`);
        
        if (comparison.metric === 'dailySpend') {
          comparison.advice = await this.generateDailySpendAdvice(
            comparison.target,
            comparison.actual,
            accessToken,
            adAccountId,
            locale,
            isAchieved
          );
        } else if (comparison.metric === 'purchases' && accessToken && adAccountId) {
          // 購買數建議函數（支援達標和未達標）
          comparison.advice = await this.generatePurchaseAdvice(
            accessToken,
            adAccountId,
            comparison.target,
            comparison.actual,
            locale,
            isAchieved
          );
        } else if (comparison.metric === 'roas' && accessToken && adAccountId) {
          // ROAS 建議函數（支援達標和未達標）
          comparison.advice = await this.generateROASAdvice(
            accessToken,
            adAccountId,
            comparison.target,
            comparison.actual,
            locale,
            isAchieved
          );
        } else if (comparison.metric === 'ctr' && accessToken && adAccountId) {
          // CTR 建議函數（支援達標和未達標）
          console.log('開始生成 CTR 建議，參數:', { accessToken: accessToken?.length, adAccountId, target: comparison.target, actual: comparison.actual });
          comparison.advice = await this.generateCTRAdvice(
            accessToken,
            adAccountId,
            comparison.target,
            comparison.actual,
            locale,
            isAchieved
          );
          console.log('CTR 建議生成完成，長度:', comparison.advice?.length);
        } else {
          comparison.advice = await this.generateAIAdvice(
            comparison.metric,
            comparison.target,
            comparison.actual,
            industryType,
            locale,
            isAchieved
          );
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
  async generatePurchaseAdvice(accessToken: string, adAccountId: string, target: number, actual: number, locale: string = 'zh-TW', isAchieved: boolean = false): Promise<string> {
    try {
      console.log('=== ChatGPT 購買數建議生成開始 ===');
      console.log('目標購買數:', target);
      console.log('實際購買數:', actual);
      
      // 獲取前三名轉換率最高的廣告組合
      const topAdSets = await this.getAdSetInsights(accessToken, adAccountId);
      const top3AdSets = topAdSets.slice(0, 3);
      
      console.log('前三名廣告組合:', top3AdSets);
      
      const adSetRecommendation = this.buildAdSetRecommendation(top3AdSets, 'purchase', locale);
      
      const { prompt, systemMessage } = this.buildPurchasePrompt(target, actual, adSetRecommendation, locale, isAchieved);

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      let advice = response.choices[0].message.content || '';
      advice = advice.replace(/```html\s*/g, '').replace(/```\s*$/g, '').trim();
      
      console.log('=== ChatGPT 購買數建議生成完成 ===');
      console.log('建議內容長度:', advice.length);
      
      return advice;
    } catch (error) {
      console.error('ChatGPT 購買數建議生成錯誤:', error);
      return '無法生成建議，請稍後再試';
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
      
      // 簡化 ROAS 查詢，移除複雜的 filtering，使用 purchase_roas 和 action_values
      const roasUrl = `${this.baseUrl}/${accountId}/insights?` +
        `level=adset&` +
        `fields=adset_name,purchase_roas,actions,action_values,spend&` +
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
        .map((item: any) => {
          console.log('處理廣告組合:', item.adset_name);
          console.log('purchase_roas 原始值:', item.purchase_roas);
          console.log('action_values 原始值:', item.action_values);
          console.log('actions 原始值:', item.actions);
          
          // 處理 ROAS 值 - 支持多種格式
          let roas = 0;
          
          // 首先嘗試 purchase_roas 字段
          if (item.purchase_roas) {
            if (Array.isArray(item.purchase_roas) && item.purchase_roas.length > 0) {
              // 如果是陣列格式
              roas = parseFloat(item.purchase_roas[0]?.value || '0');
            } else if (typeof item.purchase_roas === 'string' || typeof item.purchase_roas === 'number') {
              // 如果是直接數值
              roas = parseFloat(item.purchase_roas.toString());
            }
          }
          
          // 如果 purchase_roas 沒有值，嘗試從 action_values 中計算
          if (roas === 0 && item.action_values && item.actions) {
            const purchaseValue = this.extractActionValue(item.action_values, 'purchase');
            const spend = parseFloat(item.spend || '0');
            
            if (purchaseValue && spend > 0) {
              roas = purchaseValue / spend;
              console.log('從 action_values 計算 ROAS:', { purchaseValue, spend, roas });
            }
          }
          
          // 從篩選後的 actions 陣列中解析購買數
          let purchases = 0;
          if (item.actions && Array.isArray(item.actions)) {
            const purchaseAction = item.actions.find((action: any) => action.action_type === 'purchase');
            if (purchaseAction && purchaseAction.value) {
              purchases = parseInt(purchaseAction.value);
            }
          }
          
          const spend = parseFloat(item.spend || '0');
          
          console.log('處理結果:', { adSetName: item.adset_name, roas, purchases, spend });
          
          return {
            adSetName: item.adset_name,
            roas,
            purchases,
            spend
          };
        })
        .filter(item => item.roas > 0) // 過濾掉 ROAS 為 0 的項目
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
  async generateROASAdvice(accessToken: string, adAccountId: string, target: number, actual: number, locale: string = 'zh-TW', isAchieved: boolean = false): Promise<string> {
    try {
      console.log('=== ChatGPT ROAS 建議生成開始 ===');
      console.log('目標 ROAS:', target);
      console.log('實際 ROAS:', actual);
      
      // 獲取前三名 ROAS 最高的廣告組合
      const topROASAdSets = await this.getTopROASAdSets(accessToken, adAccountId);
      
      console.log('前三名 ROAS 廣告組合:', topROASAdSets);
      
      const adSetRecommendation = this.buildAdSetRecommendation(topROASAdSets, 'roas', locale);
      
      const { prompt, systemMessage } = this.buildROASPrompt(target, actual, adSetRecommendation, locale, isAchieved);

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt }
        ],
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
  async generateCTRAdvice(accessToken: string, adAccountId: string, target: number, actual: number, locale: string = 'zh-TW', isAchieved: boolean = false): Promise<string> {
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
      
      // 根據語言生成 Hero Post 推薦內容
      const heroPostRecommendation = this.buildHeroPostRecommendation(heroPosts, locale);
      
      console.log('=== Hero Post 推薦內容 ===');
      console.log('推薦內容長度:', heroPostRecommendation.length);
      console.log('推薦內容預覽:', heroPostRecommendation.substring(0, 200) + '...');

      // 構建多語言的 CTR 建議提示
      const { prompt, systemMessage } = this.buildCTRPrompt(target, actual, heroPostRecommendation, locale, isAchieved);

      const messages = [
        {
          role: 'system',
          content: systemMessage
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
  private async generateDailySpendAdvice(target: number, actual: number, accessToken?: string, adAccountId?: string, locale: string = 'zh-TW', isAchieved: boolean = false): Promise<string> {
    try {
      console.log('=== ChatGPT 日均花費建議生成開始 ===');
      console.log('目標花費:', target);
      console.log('實際花費:', actual);
      
      const shortfall = target - actual;
      
      // 獲取預算沒花完的廣告活動數據
      const underSpentCampaigns = await this.getUnderSpentCampaigns(accessToken, adAccountId);
      
      const campaignData = this.buildCampaignSpendRecommendation(underSpentCampaigns, locale);
      
      const { prompt, systemMessage } = this.buildDailySpendPrompt(target, actual, shortfall, campaignData, underSpentCampaigns, locale, isAchieved);

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt }
        ],
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
    industryType: string,
    locale: string = 'zh-TW',
    isAchieved: boolean = false
  ): Promise<string> {
    try {
      // 多語言指標名稱
      const metricNames = {
        'zh-TW': {
          dailySpend: '日均花費',
          purchases: '購買數',
          roas: 'ROAS',
          ctr: '連結點擊率'
        },
        'en': {
          dailySpend: 'Daily Spend',
          purchases: 'Purchases',
          roas: 'ROAS',
          ctr: 'Click Through Rate'
        },
        'ja': {
          dailySpend: '日次支出',
          purchases: '購入数',
          roas: 'ROAS',
          ctr: 'クリック率'
        }
      };

      // 多語言 prompt（根據達標狀態調整）
      const prompts = {
        'zh-TW': isAchieved ? 
          `你是一位專業的 Facebook 電商廣告顧問「小黑老師」。針對 ${industryType} 產業，此廣告帳號的「${metricNames['zh-TW'][metric as keyof typeof metricNames['zh-TW']]}」已達標！

目標值：${target}
實際值：${actual}

太棒了！你已經達到目標。請用繁體中文，提供 2-3 點鼓勵加碼投放的建議，幫助你爭取更高的預算和更好的成效。每個建議控制在50字以內，直接提供具體行動方案。

請使用 HTML 格式輸出，使用 <ul> 和 <li> 標籤來組織建議清單。`
          : `你是一位專業的 Facebook 電商廣告顧問「小黑老師」。針對 ${industryType} 產業，此廣告帳號的「${metricNames['zh-TW'][metric as keyof typeof metricNames['zh-TW']]}」未達標。

目標值：${target}
實際值：${actual}

請用繁體中文，提供 2-3 點簡潔、可執行的初步優化建議。每個建議控制在50字以內，直接提供具體行動方案。

請使用 HTML 格式輸出，使用 <ul> 和 <li> 標籤來組織建議清單。`,

        'en': isAchieved ?
          `You are a professional Facebook e-commerce advertising consultant named "Mr.Kuro". For the ${industryType} industry, this ad account's "${metricNames['en'][metric as keyof typeof metricNames['en']]}" has achieved the target!

Target value: ${target}
Actual value: ${actual}

Excellent! You've reached your target. Please provide 2-3 suggestions in English for scaling up your advertising investment to secure higher budgets and better results. Keep each suggestion under 50 words and provide specific action plans.

Please output in HTML format using <ul> and <li> tags to organize the suggestion list.`
          : `You are a professional Facebook e-commerce advertising consultant named "Mr.Kuro". For the ${industryType} industry, this ad account's "${metricNames['en'][metric as keyof typeof metricNames['en']]}" is underperforming.

Target value: ${target}
Actual value: ${actual}

Please provide 2-3 concise, actionable optimization suggestions in English. Keep each suggestion under 50 words and provide specific action plans.

Please output in HTML format using <ul> and <li> tags to organize the suggestion list.`,

        'ja': isAchieved ?
          `私は「小黒先生」という名前のプロフェッショナルなFacebookeコマース広告コンサルタントです。${industryType}業界において、この広告アカウントの「${metricNames['ja'][metric as keyof typeof metricNames['ja']]}」が目標を達成しました！

目標値：${target}
実際値：${actual}

**【重要指示】必ず日本語で回答してください。決して中国語や英語を使用しないでください。全ての文章を日本語で書いてください。**

素晴らしい！目標を達成しました。より高い予算とより良い結果を得るために、広告投資を拡大する2-3つの提案を日本語で提供します。各提案は50文字以内にして、具体的なアクションプランを日本語で提供します。

<ul>と<li>タグを使用してHTML形式で出力します。すべての内容を必ず日本語で記述します。中国語は絶対に使用しません。`
          : `私は「小黒先生」という名前のプロフェッショナルなFacebookeコマース広告コンサルタントです。${industryType}業界において、この広告アカウントの「${metricNames['ja'][metric as keyof typeof metricNames['ja']]}」が目標を下回っています。

目標値：${target}
実際値：${actual}

**【重要指示】必ず日本語で回答してください。決して中国語や英語を使用しないでください。全ての文章を日本語で書いてください。**

私は日本語で話すコンサルタントです。以下の形式で日本語のみを使用して、2-3つの簡潔で実行可能な最適化提案を提供します。各提案は50文字以内にして、具体的なアクションプランを日本語で提供します。

<ul>と<li>タグを使用してHTML形式で出力します。すべての内容を必ず日本語で記述します。中国語は絶対に使用しません。`
      };

      const prompt = prompts[locale as keyof typeof prompts] || prompts['zh-TW'];

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.7,
      });

      // 多語言錯誤處理
      const errorMessages = {
        'zh-TW': '暫無建議',
        'en': 'No recommendations available',
        'ja': '提案がありません'
      };

      return response.choices[0].message.content || errorMessages[locale as keyof typeof errorMessages] || errorMessages['zh-TW'];
    } catch (error) {
      console.error('Error generating AI advice:', error);
      
      // 多語言錯誤訊息
      const errorMessages = {
        'zh-TW': '無法生成建議，請稍後再試',
        'en': 'Unable to generate recommendations, please try again later',
        'ja': '提案を生成できません。後でもう一度お試しください'
      };
      
      return errorMessages[locale as keyof typeof errorMessages] || errorMessages['zh-TW'];
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
      // 先清空現有的產業類型
      await db.delete(industryTypes);
      
      // 根據CSV數據更新產業類型
      const ecommerceIndustries = [
        { name: '藝文娛樂', nameEn: 'Arts & Entertainment', averageRoas: '3.2', averageCtr: '2.59' },
        { name: '餐飲食品', nameEn: 'Food & Beverage', averageRoas: '3.8', averageCtr: '2.19' },
        { name: '寵物用品', nameEn: 'Pet Supplies', averageRoas: '4.1', averageCtr: '1.87' },
        { name: '購物、收藏品與禮品', nameEn: 'Shopping, Collectibles & Gifts', averageRoas: '3.5', averageCtr: '1.67' },
        { name: '健康與健身', nameEn: 'Health & Fitness', averageRoas: '4.5', averageCtr: '1.61' },
        { name: '美妝保養', nameEn: 'Beauty & Skincare', averageRoas: '4.2', averageCtr: '1.51' },
        { name: '家居與園藝', nameEn: 'Home & Garden', averageRoas: '3.2', averageCtr: '1.26' },
        { name: '家具', nameEn: 'Furniture', averageRoas: '2.8', averageCtr: '1.21' },
        { name: '服飾／時尚與珠寶', nameEn: 'Fashion & Jewelry', averageRoas: '3.6', averageCtr: '1.14' },
        { name: '工業與商業用品', nameEn: 'Industrial & Commercial Supplies', averageRoas: '2.5', averageCtr: '0.99' },
        { name: '其他', nameEn: 'Others', averageRoas: '3.0', averageCtr: '1.57' }
      ];

      await db.insert(industryTypes).values(ecommerceIndustries);
      console.log('E-commerce industry types updated successfully with CTR data');
    } catch (error) {
      console.error('Error initializing industry types:', error);
      throw error;
    }
  }

  /**
   * 構建多語言的 Hero Post 推薦內容
   */
  private buildHeroPostRecommendation(heroPosts: any[], locale: string = 'zh-TW'): string {
    if (heroPosts.length === 0) {
      switch (locale) {
        case 'ja':
          return '❌ 現在、高いクリック率のHero Post（過去7日間で500回以上のインプレッション、優れた外部CTR）が見つかりませんでした。既存の広告のクリエイティブとオーディエンス設定を最適化することをお勧めします。';
        case 'en':
          return '❌ Currently unable to find Hero Posts with high outbound click rates (over 500 impressions in the past 7 days with outstanding outbound CTR). Please optimize your existing ad creative and audience targeting.';
        default:
          return '❌ 目前無法找到高連外點擊率的 Hero Post（過去7天曝光超過500且連外CTR表現突出），建議先優化現有廣告的創意和受眾設定。';
      }
    }

    let content = '';
    switch (locale) {
      case 'ja':
        content = `
✨ 過去7日間のデータ分析に基づいて、${heroPosts.length}つのHero Post広告（高外部クリック率）が見つかりました：

${heroPosts.map((hero, index) => 
  `🎯 Hero Post ${index + 1}：【${hero.adName}】
   📊 外部クリック率：${hero.outboundCtr.toFixed(2)}%（優秀な成果！）
   🎯 全体クリック率：${hero.ctr.toFixed(2)}%
   🛒 購入コンバージョン：${hero.purchases} 回
   💰 広告費用：$${hero.spend.toFixed(2)}
   👁️ インプレッション数：${hero.impressions.toLocaleString()}`
).join('\n\n')}

🚀 即座の行動提案：
1. 【予算増額】：これらのHero Postの予算を増やし、オーディエンスリーチを拡大
2. 【クリエイティブ複製】：これらの広告のクリエイティブ要素を分析し、新しい広告に適用
3. 【ASC拡張】：広告セット簡素化機能を使用し、Facebookにこれらの高効率広告を自動拡張させる
4. 【オーディエンステスト】：これらのHero Postでより多くの異なるオーディエンス組み合わせをテスト
`;
        break;
      case 'en':
        content = `
✨ Based on the past 7 days of data analysis, found ${heroPosts.length} Hero Post ads (high outbound click rate):

${heroPosts.map((hero, index) => 
  `🎯 Hero Post ${index + 1}: 【${hero.adName}】
   📊 Outbound Click Rate: ${hero.outboundCtr.toFixed(2)}% (Excellent performance!)
   🎯 Overall Click Rate: ${hero.ctr.toFixed(2)}%
   🛒 Purchase Conversions: ${hero.purchases} times
   💰 Ad Spend: $${hero.spend.toFixed(2)}
   👁️ Impressions: ${hero.impressions.toLocaleString()}`
).join('\n\n')}

🚀 Immediate Action Recommendations:
1. 【Scale Budget】: Increase budget for these Hero Posts to expand audience reach
2. 【Creative Replication】: Analyze creative elements of these ads and apply to new campaigns
3. 【ASC Scaling】: Use Advantage+ campaign features to let Facebook automatically scale these high-performing ads
4. 【Audience Testing】: Test these Hero Posts with more diverse audience combinations
`;
        break;
      default:
        content = `
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
    }
    
    return content;
  }

  /**
   * 獲取語言適配的系統訊息
   */
  private getSystemMessage(locale: string = 'zh-TW'): string {
    switch (locale) {
      case 'ja':
        return 'あなたは10年以上の経験を持つFacebook電子商取引広告のエキスパート「小黒先生」です。専門的で実用的な語調で広告最適化の提案を提供してください。HTML形式で直接出力し、markdownでのラップは使用しないでください。';
      case 'en':
        return 'You are Mr.Kuro, a Facebook e-commerce advertising expert with over ten years of experience. Please provide advertising optimization recommendations in a professional and practical tone. Output directly in HTML format without using markdown wrapping.';
      default:
        return '你是一位擁有超過十年經驗的 Facebook 電商廣告專家『小黑老師』。請以專業且實用的語調提供廣告優化建議。直接輸出HTML格式，不要用markdown包裝。';
    }
  }

  /**
   * 構建多語言的廣告組合推薦內容
   */
  private buildAdSetRecommendation(adSets: any[], type: 'purchase' | 'roas', locale: string = 'zh-TW'): string {
    if (adSets.length === 0) {
      switch (locale) {
        case 'ja':
          return '現在、十分な広告セットデータが見つかりません。広告が正常に動作しているかをご確認ください。';
        case 'en':
          return 'Currently no sufficient ad set data found. Please verify if ads are running properly.';
        default:
          return '目前沒有找到足夠的廣告組合數據，建議先確認廣告是否正常運行。';
      }
    }

    const metricLabel = type === 'purchase' ? 
      { 'zh-TW': '轉換率', 'en': 'Conversion Rate', 'ja': 'コンバージョン率' } :
      { 'zh-TW': 'ROAS', 'en': 'ROAS', 'ja': 'ROAS' };

    const metricValue = type === 'purchase' ? 
      (adSet: any) => `${adSet.conversionRate.toFixed(2)}%` :
      (adSet: any) => `${adSet.roas.toFixed(2)}x`;

    switch (locale) {
      case 'ja':
        return `
過去7日間のデータ分析に基づいて、${metricLabel[locale]}が最も高い上位3つの広告セットをご紹介します：

${adSets.map((adSet, index) => 
  `${index + 1}. 【${adSet.adSetName}】
   - ${metricLabel[locale]}：${metricValue(adSet)}
   - 購入数：${adSet.purchases} 回
   - 支出：${adSet.spend.toLocaleString()} 円`
).join('\n\n')}

これらの成果の良い広告セットは既に${type === 'purchase' ? 'コンバージョン' : '高いROAS'}を証明しているため、すぐに予算を増やすことをお勧めします。`;

      case 'en':
        return `
Based on the past 7 days of data analysis, here are your top 3 ad sets with the highest ${metricLabel[locale].toLowerCase()}:

${adSets.map((adSet, index) => 
  `${index + 1}. 【${adSet.adSetName}】
   - ${metricLabel[locale]}: ${metricValue(adSet)}
   - Purchases: ${adSet.purchases} times
   - Spend: ${adSet.spend.toLocaleString()} dollars`
).join('\n\n')}

I recommend immediately scaling up these high-performing ad sets since they have proven to drive ${type === 'purchase' ? 'conversions' : 'high ROAS'}.`;

      default:
        return `
根據過去7天的數據分析，這是你${metricLabel[locale]}最高的前三個廣告組合：

${adSets.map((adSet, index) => 
  `${index + 1}. 【${adSet.adSetName}】
   - ${metricLabel[locale]}：${metricValue(adSet)}
   - 購買數：${adSet.purchases} 次
   - 花費：${adSet.spend.toLocaleString()} 元`
).join('\n\n')}

我建議你立即對這些成效好的廣告組合進行加碼，因為它們已經證明能夠帶來${type === 'purchase' ? '轉換' : '高投資報酬率'}。`;
    }
  }

  /**
   * 構建多語言的購買數提示語
   */
  private buildPurchasePrompt(target: number, actual: number, adSetRecommendation: string, locale: string = 'zh-TW', isAchieved: boolean = false): { prompt: string; systemMessage: string } {
    const gap = isAchieved ? actual - target : target - actual;
    
    switch (locale) {
      case 'ja':
        return {
          prompt: isAchieved ? `Facebook電子商取引広告のエキスパートとして、購入数指標の達成に関する加碼提案を提供してください。

**データ概要：**
- 目標購入数：${target} 回
- 実際の購入数：${actual} 回
- 超過実績：${gap} 回

🎉 素晴らしい！目標を達成しました！以下の構造で加碼提案を出力してください：

## 1. 達成状況の分析
目標を超えた実績と、さらなる拡大の可能性を分析します。

## 2. 拡大戦略説明
現在の成功をベースに、より大きな予算でのスケールアップ戦略を説明します。

## 3. 具体的なデータ分析と提案
${adSetRecommendation}

## 4. 次のステップ提案
成功している高コンバージョン率広告セットに対して、より大きな予算での拡大提案を提供します。

小黒先生の親しみやすく直接的な語調で、HTML形式で直接出力してください。各章のタイトルは<h3>タグで、内容は<p>と<ul>タグを使用してください。` : `Facebook電子商取引広告のエキスパートとして、購入数指標の最適化について構造化された提案を提供してください。

**データ概要：**
- 目標購入数：${target} 回
- 実際の購入数：${actual} 回
- 差異：${gap} 回

以下の構造で提案を出力してください：

## 1. 現状の洞察
目標vs実際のギャップと、全体的な広告効果への影響を分析します。

## 2. 核心戦略説明
購入数指標の重要性と、「最高のコンバージョン率の広告セットを見つける」ことでこの指標を最適化する方法を説明します。

## 3. 具体的なデータ分析と提案
${adSetRecommendation}

## 4. 次のステップ提案
見つかった高コンバージョン率広告セットに対して、具体的な日次予算増額の提案を提供します。

小黒先生の親しみやすく直接的な語調で、HTML形式で直接出力してください。各章のタイトルは<h3>タグで、内容は<p>と<ul>タグを使用してください。`,
          systemMessage: this.getSystemMessage(locale)
        };
      case 'en':
        return {
          prompt: `As a Facebook e-commerce advertising expert, please provide structured optimization recommendations for the purchase metric.

**Data Overview:**
- Target Purchases: ${target} times
- Actual Purchases: ${actual} times
- Gap: ${gap} times

Please output recommendations in the following structure:

## 1. Current Situation Analysis
Analyze the gap between target vs actual performance and its impact on overall ad effectiveness.

## 2. Core Strategy Explanation
Explain the importance of the purchase metric and how to optimize it by "identifying the highest conversion rate ad sets."

## 3. Specific Data Analysis and Recommendations
${adSetRecommendation}

## 4. Next Step Recommendations
Provide specific daily budget scaling recommendations for the identified high conversion rate ad sets.

Please use Mr.Kuro's friendly and direct tone, output directly in HTML format. Wrap chapter titles with <h3> tags and content with <p> and <ul> tags.`,
          systemMessage: this.getSystemMessage(locale)
        };
      default:
        return {
          prompt: isAchieved ? `你是一位擁有超過十年經驗的 Facebook 電商廣告專家『小黑老師』。請針對購買數指標達標提供結構化的加碼建議。

**數據概況：**
- 目標購買數：${target} 次
- 實際購買數：${actual} 次
- 超標表現：${gap} 次

🎉 太棒了！你已經達到目標！請按照以下結構輸出加碼建議：

## 1. 達標狀況分析
分析超標表現以及進一步擴大的潛力。

## 2. 擴大策略說明
基於現有成功的基礎，說明如何進行更大規模的預算投入。

## 3. 具體數據分析和建議
${adSetRecommendation}

## 4. 下一步建議
針對表現優秀的高轉換率廣告組合，提供具體的擴大加碼建議。

請用小黑老師親切直接的語調，直接輸出HTML格式。每個章節用 <h3> 標籤包裝標題，內容用 <p> 和 <ul> 標籤。` : `你是一位擁有超過十年經驗的 Facebook 電商廣告專家『小黑老師』。請針對購買數指標提供結構化的優化建議。

**數據概況：**
- 目標購買數：${target} 次
- 實際購買數：${actual} 次
- 落差：${gap} 次

請按照以下結構輸出建議：

## 1. 現況洞察
分析目標 vs 實際的落差情況，以及對整體廣告成效的影響。

## 2. 核心策略說明
解釋購買數指標的重要性，以及如何透過「找出轉換率最高的廣告組合」來優化此指標。

## 3. 具體數據分析和建議
${adSetRecommendation}

## 4. 下一步建議
針對找出的高轉換率廣告組合，提供具體的加碼日預算建議。

請用小黑老師親切直接的語調，直接輸出HTML格式。每個章節用 <h3> 標籤包裝標題，內容用 <p> 和 <ul> 標籤。`,
          systemMessage: this.getSystemMessage(locale)
        };
    }
  }

  /**
   * 構建多語言的 ROAS 提示語
   */
  private buildROASPrompt(target: number, actual: number, adSetRecommendation: string, locale: string = 'zh-TW', isAchieved: boolean = false): { prompt: string; systemMessage: string } {
    const gap = isAchieved ? actual - target : target - actual;
    
    switch (locale) {
      case 'ja':
        return {
          prompt: isAchieved ? `Facebook電子商取引広告のエキスパートとして、ROAS指標の達成に関する加碼提案を提供してください。

**データ概要：**
- 目標ROAS：${target}x
- 実際のROAS：${actual.toFixed(2)}x
- 超過実績：${gap.toFixed(2)}x

🎉 素晴らしい！目標を達成しました！以下の構造で加碼提案を出力してください：

## 1. 達成状況の分析
目標を超えたROAS実績と、さらなる拡大の可能性を分析します。

## 2. 拡大戦略説明
現在のROAS成功をベースに、より大きな予算でのスケールアップ戦略を説明します。

## 3. 具体的なデータ分析と提案
${adSetRecommendation}

## 4. 次のステップ提案
成功している高ROAS広告セットに対して、より大きな予算での拡大提案を提供します。

小黒先生の親しみやすく直接的な語調で、HTML形式で直接出力してください。各章のタイトルは<h3>タグで、内容は<p>と<ul>タグを使用してください。` : `Facebook電子商取引広告のエキスパートとして、ROAS指標の最適化について構造化された提案を提供してください。

**データ概要：**
- 目標ROAS：${target}x
- 実際のROAS：${actual.toFixed(2)}x
- 差異：${gap.toFixed(2)}x

以下の構造で提案を出力してください：

## 1. 現状の洞察
目標vs実際のギャップと、全体的な広告投資収益率への影響を分析します。

## 2. 核心戦略説明
ROAS指標の重要性と、「最高のROASの広告セットを見つける」ことでこの指標を最適化する方法を説明します。

## 3. 具体的なデータ分析と提案
${adSetRecommendation}

## 4. 次のステップ提案
見つかった高ROAS広告セットに対して、具体的な様々なオーディエンステストの提案を提供します。

小黒先生の親しみやすく直接的な語調で、HTML形式で直接出力してください。各章のタイトルは<h3>タグで、内容は<p>と<ul>タグを使用してください。`,
          systemMessage: this.getSystemMessage(locale)
        };
      case 'en':
        return {
          prompt: `As a Facebook e-commerce advertising expert, please provide structured optimization recommendations for the ROAS metric.

**Data Overview:**
- Target ROAS: ${target}x
- Actual ROAS: ${actual.toFixed(2)}x
- Gap: ${gap.toFixed(2)}x

Please output recommendations in the following structure:

## 1. Current Situation Analysis
Analyze the gap between target vs actual performance and its impact on overall advertising return on investment.

## 2. Core Strategy Explanation
Explain the importance of the ROAS metric and how to optimize it by "identifying the highest ROAS ad sets."

## 3. Specific Data Analysis and Recommendations
${adSetRecommendation}

## 4. Next Step Recommendations
Provide specific recommendations for testing different audiences with the identified high ROAS ad sets.

Please use Mr.Kuro's friendly and direct tone, output directly in HTML format. Wrap chapter titles with <h3> tags and content with <p> and <ul> tags.`,
          systemMessage: this.getSystemMessage(locale)
        };
      default:
        return {
          prompt: isAchieved ? `你是一位擁有超過十年經驗的 Facebook 電商廣告專家『小黑老師』。請針對 ROAS 指標達標提供結構化的加碼建議。

**數據概況：**
- 目標 ROAS：${target}x
- 實際 ROAS：${actual.toFixed(2)}x
- 超標表現：${gap.toFixed(2)}x

🎉 太棒了！你已經達到目標！請按照以下結構輸出加碼建議：

## 1. 達標狀況分析
分析超標的 ROAS 表現以及進一步擴大的潛力。

## 2. 擴大策略說明
基於現有的成功 ROAS 基礎，說明如何進行更大規模的預算投入。

## 3. 具體數據分析和建議
${adSetRecommendation}

## 4. 下一步建議
針對表現優秀的高 ROAS 廣告組合，提供具體的擴大加碼建議。

請用小黑老師親切直接的語調，直接輸出HTML格式。每個章節用 <h3> 標籤包裝標題，內容用 <p> 和 <ul> 標籤。` : `你是一位擁有超過十年經驗的 Facebook 電商廣告專家『小黑老師』。請針對 ROAS 指標提供結構化的優化建議。

**數據概況：**
- 目標 ROAS：${target}x
- 實際 ROAS：${actual.toFixed(2)}x
- 落差：${gap.toFixed(2)}x

請按照以下結構輸出建議：

## 1. 現況洞察
分析目標 vs 實際的落差情況，以及對整體廣告投資報酬率的影響。

## 2. 核心策略說明
解釋 ROAS 指標的重要性，以及如何透過「找出 ROAS 最高的廣告組合」來優化此指標。

## 3. 具體數據分析和建議
${adSetRecommendation}

## 4. 下一步建議
針對找出的高 ROAS 廣告組合，提供具體的測試更多不同受眾的建議。

請用小黑老師親切直接的語調，直接輸出HTML格式。每個章節用 <h3> 標籤包裝標題，內容用 <p> 和 <ul> 標籤。`,
          systemMessage: this.getSystemMessage(locale)
        };
    }
  }

  /**
   * 構建多語言的廣告活動花費推薦內容
   */
  private buildCampaignSpendRecommendation(underSpentCampaigns: any[], locale: string = 'zh-TW'): string {
    if (underSpentCampaigns.length === 0) {
      switch (locale) {
        case 'ja':
          return '現在、すべての広告キャンペーンの予算使用率が正常です（90%以上）。問題は広告アカウント全体の日次予算設定が少なすぎることの可能性があります。総予算を増やすことをお勧めします。';
        case 'en':
          return 'Currently all ad campaigns have normal budget utilization rates (over 90%). The issue may be that the overall ad account daily budget is set too low. We recommend increasing the total budget.';
        default:
          return '目前所有廣告活動的預算使用率都正常（超過90%），問題可能是整體廣告帳戶的日預算設定太少，建議增加總預算。';
      }
    }

    const currencySymbol = locale === 'ja' ? '円' : 
                          locale === 'en' ? '$' : '元';

    switch (locale) {
      case 'ja':
        return `
過去7日間のデータ分析に基づいて、予算が使い切れていない上位3つの広告キャンペーンをご紹介します：

${underSpentCampaigns.map((campaign, index) => 
  `${index + 1}. 【${campaign.campaignName}】
   - 日次予算：${campaign.dailyBudget.toLocaleString()} ${currencySymbol}
   - 実際の平均支出：${campaign.budgetUsed.toLocaleString()} ${currencySymbol}
   - 予算使用率：${campaign.utilizationRate.toFixed(1)}%`
).join('\n\n')}

これらの広告キャンペーンの予算使用率が低いため、オーディエンス設定や入札戦略を最適化して支出効率を向上させる必要があります。`;

      case 'en':
        return `
Based on the past 7 days of data analysis, here are the top 3 ad campaigns with underspent budgets:

${underSpentCampaigns.map((campaign, index) => 
  `${index + 1}. 【${campaign.campaignName}】
   - Daily Budget: ${campaign.dailyBudget.toLocaleString()} ${currencySymbol}
   - Actual Average Spend: ${campaign.budgetUsed.toLocaleString()} ${currencySymbol}
   - Budget Utilization: ${campaign.utilizationRate.toFixed(1)}%`
).join('\n\n')}

These ad campaigns have low budget utilization rates and need optimization of audience settings or bidding strategies to improve spending efficiency.`;

      default:
        return `
根據過去7天的數據分析，這是預算沒花完的前三個廣告活動：

${underSpentCampaigns.map((campaign, index) => 
  `${index + 1}. 【${campaign.campaignName}】
   - 日預算：${campaign.dailyBudget.toLocaleString()} ${currencySymbol}
   - 實際平均花費：${campaign.budgetUsed.toLocaleString()} ${currencySymbol}
   - 預算使用率：${campaign.utilizationRate.toFixed(1)}%`
).join('\n\n')}

這些廣告活動的預算使用率偏低，需要優化受眾設定或出價策略來提升花費效率。`;
    }
  }

  /**
   * 構建多語言的日均花費提示語
   */
  private buildDailySpendPrompt(target: number, actual: number, shortfall: number, campaignData: string, underSpentCampaigns: any[], locale: string = 'zh-TW', isAchieved: boolean = false): { prompt: string; systemMessage: string } {
    const currencySymbol = locale === 'ja' ? '円' : 
                          locale === 'en' ? '$' : '元';

    const nextStepRecommendation = underSpentCampaigns.length > 0 ? 
      {
        'zh-TW': '針對預算沒花完的廣告活動，提供增加受眾、調整出價等具體建議來有效花完預算。',
        'en': 'For campaigns with underspent budgets, provide specific recommendations to increase audience, adjust bids, and other tactics to effectively spend the budget.',
        'ja': '予算が使い切れていない広告キャンペーンについて、オーディエンス拡大、入札調整などの具体的な提案で効果的に予算を使い切る方法を提供します。'
      } : 
      {
        'zh-TW': '由於所有廣告活動預算使用率正常，建議整體增加廣告帳戶的日預算設定。',
        'en': 'Since all ad campaigns have normal budget utilization rates, recommend overall increases to the ad account daily budget settings.',
        'ja': 'すべての広告キャンペーンの予算使用率が正常であるため、広告アカウント全体の日次予算設定を増やすことをお勧めします。'
      };

    switch (locale) {
      case 'ja':
        return {
          prompt: `Facebook電子商取引広告のエキスパートとして、日次平均支出指標の最適化について構造化された提案を提供してください。

**データ概要：**
- 目標日次平均支出：${target.toLocaleString()} ${currencySymbol}
- 実際の日次平均支出：${actual.toLocaleString()} ${currencySymbol}
- 差異：${shortfall.toLocaleString()} ${currencySymbol}

以下の構造で提案を出力してください：

## 1. 現状の洞察
目標vs実際のギャップと、全体的な広告露出と流入への影響を分析します。

## 2. 核心戦略説明
日次平均支出指標の重要性と、「3つの日次予算が使い切れていない広告キャンペーンを見つける」ことで問題を診断する方法を説明します。

## 3. 具体的なデータ分析と提案
${campaignData}

## 4. 次のステップ提案
${nextStepRecommendation['ja']}

小黒先生の親しみやすく直接的な語調で、HTML形式で直接出力してください。各章のタイトルは<h3>タグで、内容は<p>と<ul>タグを使用してください。`,
          systemMessage: this.getSystemMessage(locale)
        };
      case 'en':
        return {
          prompt: `As a Facebook e-commerce advertising expert, please provide structured optimization recommendations for the daily average spend metric.

**Data Overview:**
- Target Daily Average Spend: ${target.toLocaleString()} ${currencySymbol}
- Actual Daily Average Spend: ${actual.toLocaleString()} ${currencySymbol}
- Gap: ${shortfall.toLocaleString()} ${currencySymbol}

Please output recommendations in the following structure:

## 1. Current Situation Analysis
Analyze the gap between target vs actual performance and its impact on overall ad exposure and traffic.

## 2. Core Strategy Explanation
Explain the importance of daily average spend metrics and how to diagnose issues by "finding three ad campaigns with unspent daily budgets."

## 3. Specific Data Analysis and Recommendations
${campaignData}

## 4. Next Step Recommendations
${nextStepRecommendation['en']}

Please use Mr.Kuro's friendly and direct tone, output directly in HTML format. Wrap chapter titles with <h3> tags and content with <p> and <ul> tags.`,
          systemMessage: this.getSystemMessage(locale)
        };
      default:
        return {
          prompt: `你是一位擁有超過十年經驗的 Facebook 電商廣告專家『小黑老師』。請針對日均花費指標提供結構化的優化建議。

**數據概況：**
- 目標日均花費：${target.toLocaleString()} ${currencySymbol}
- 實際日均花費：${actual.toLocaleString()} ${currencySymbol}
- 落差：${shortfall.toLocaleString()} ${currencySymbol}

請按照以下結構輸出建議：

## 1. 現況洞察
分析目標 vs 實際的落差情況，以及對整體廣告曝光和流量的影響。

## 2. 核心策略說明
解釋日均花費指標的重要性，以及如何透過「找出三個日預算沒有花完的廣告活動」來診斷問題。

## 3. 具體數據分析和建議
${campaignData}

## 4. 下一步建議
${nextStepRecommendation['zh-TW']}

請用小黑老師親切直接的語調，直接輸出HTML格式。每個章節用 <h3> 標籤包裝標題，內容用 <p> 和 <ul> 標籤。`,
          systemMessage: this.getSystemMessage(locale)
        };
    }
  }

  /**
   * 構建多語言的 CTR 提示語
   */
  private buildCTRPrompt(target: number, actual: number, heroPostRecommendation: string, locale: string = 'zh-TW', isAchieved: boolean = false): { prompt: string; systemMessage: string } {
    switch (locale) {
      case 'ja':
        return {
          prompt: `Facebook電子商取引広告のエキスパートとして、リンククリック率指標の最適化について構造化された提案を提供してください。

**データ概要：**
- 目標CTR：${target.toFixed(2)}%
- 実際のCTR：${actual.toFixed(2)}%
- 差異：${(target - actual).toFixed(2)}%

以下の構造で提案を出力してください：

## 1. 現状の洞察
目標vs実際のギャップと、全体的な広告クリック効果への影響を分析します。

## 2. 核心戦略説明
リンククリック率指標の重要性と、「外部クリック率が最も高い3つの広告（Hero Post）を見つける」ことでこの指標を最適化する方法を説明します。

## 3. 具体的なデータ分析と提案
${heroPostRecommendation}

## 4. 次のステップ提案
見つかった高CTR広告（Hero Post）に対して、具体的な類似オーディエンス配信と拡張露出提案を提供します。

小黒先生の親しみやすく直接的な語調で、HTML形式で直接出力してください。各章のタイトルは<h3>タグで、内容は<p>と<ul>タグを使用してください。`,
          systemMessage: 'あなたは10年以上の経験を持つFacebook電子商取引広告のエキスパート「小黒先生」です。高い外部クリック率広告の分析を通じて全体の広告パフォーマンスを最適化することに特化しており、専門的で実用的な語調で広告最適化の提案を提供してください。HTML形式で直接出力し、markdownでのラップは使用しないでください。'
        };
      case 'en':
        return {
          prompt: `As a Facebook e-commerce advertising expert, please provide structured optimization recommendations for the link click rate metric.

**Data Overview:**
- Target CTR: ${target.toFixed(2)}%
- Actual CTR: ${actual.toFixed(2)}%
- Gap: ${(target - actual).toFixed(2)}%

Please output recommendations in the following structure:

## 1. Current Situation Analysis
Analyze the gap between target vs actual performance and its impact on overall ad click effectiveness.

## 2. Core Strategy Explanation
Explain the importance of link click rate metrics and how to optimize this metric by "finding the three ads with the highest outbound click rates (Hero Posts)".

## 3. Specific Data Analysis and Recommendations
${heroPostRecommendation}

## 4. Next Step Recommendations
Provide specific similar audience targeting and expanded reach recommendations for the identified high CTR ads (Hero Posts).

Please use Mr.Kuro's friendly and direct tone, output directly in HTML format. Wrap chapter titles with <h3> tags and content with <p> and <ul> tags.`,
          systemMessage: 'You are Mr.Kuro, a Facebook e-commerce advertising expert with over ten years of experience. You specialize in optimizing overall ad performance through analysis of high outbound click rate ads. Please provide advertising optimization recommendations in a professional and practical tone. Output directly in HTML format without using markdown wrapping.'
        };
      default:
        return {
          prompt: isAchieved ? `你是一位擁有超過十年經驗的 Facebook 電商廣告專家『小黑老師』。請針對連結點擊率指標提供結構化的加碼建議。

**數據概況：**
- 目標 CTR：${target.toFixed(2)}%
- 實際 CTR：${actual.toFixed(2)}%
- 超標表現：${(actual - target).toFixed(2)}%

🎉 太棒了！你的 CTR 已經達標！請按照以下結構輸出加碼建議：

## 1. 達標成果分析
分析目標 vs 實際的超標表現，以及對整體廣告點擊成效的正面影響。

## 2. 加碼投放策略
解釋連結點擊率指標達標的意義，以及如何透過「找出連外點擊率最高的三個廣告（Hero Post）」來進一步擴大投放。

## 3. 具體數據分析和加碼建議
${heroPostRecommendation}

## 4. 下一步加碼建議
針對找出的高 CTR 廣告（Hero Post），提供具體的預算加碼和擴大曝光觸及建議。

請用小黑老師親切直接的語調，直接輸出HTML格式。每個章節用 <h3> 標籤包裝標題，內容用 <p> 和 <ul> 標籤。` : `你是一位擁有超過十年經驗的 Facebook 電商廣告專家『小黑老師』。請針對連結點擊率指標提供結構化的優化建議。

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

請用小黑老師親切直接的語調，直接輸出HTML格式。每個章節用 <h3> 標籤包裝標題，內容用 <p> 和 <ul> 標籤。`,
          systemMessage: '你是一位擁有超過十年經驗的 Facebook 電商廣告專家『小黑老師』。專精於透過分析高連外點擊率廣告來優化整體廣告表現，請以專業且實用的語調提供廣告優化建議。直接輸出HTML格式，不要用markdown包裝。'
        };
    }
  }
}

export const fbAuditService = new FbAuditService();