import OpenAI from 'openai';

export interface MetaAccountData {
  accountId: string;
  accountName: string;
  impressions: number;
  clicks: number;
  spend: number;
  linkClicks: number;
  purchases: number;
  purchaseValue: number;
  addToCart: number;
  viewContent: number;
  currency: string;
  dateRange: {
    since: string;
    until: string;
  };
  // 真實廣告數據（從 Facebook API 獲取）
  topPerformingAds?: Array<{
    adName: string;
    effectiveObjectStoryId: string;
    ctr: number;
    impressions: number;
    clicks: number;
    spend: number;
  }>;
}

export interface AccountDiagnosisData {
  // Target data from calculator
  targetDailyTraffic: number;
  targetDailyBudget: number;
  targetCpa: number;
  targetRoas: number;
  targetRevenue: number;
  targetAov: number;
  targetConversionRate: number;
  
  // Actual Facebook account data
  actualDailyTraffic: number;
  actualDailySpend: number;
  actualCtr: number;
  actualCpa: number;
  actualRoas: number;
  
  // Calculated metrics
  trafficAchievementRate: number;
  budgetUtilizationRate: number;
  addToCartRate: number; // ATC/VC
  checkoutRate: number; // PUR/ATC
  overallConversionRate: number; // PUR/VC
}

export class MetaAccountService {
  private openai: OpenAI;
  private readonly baseUrl = 'https://graph.facebook.com/v19.0';

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * 獲取 Facebook 廣告帳戶數據 (帳戶級別分析)
   */
  async getAdAccountData(accessToken: string, adAccountId: string): Promise<MetaAccountData> {
    try {
      if (!accessToken) {
        throw new Error('Facebook Access Token 未提供');
      }

      console.log(`[META] 開始獲取廣告帳戶數據: ${adAccountId}`);

      // 格式化廣告帳戶 ID (確保包含 act_ 前綴)
      const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;

      // 設定時間範圍 (最近 30 天)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      
      const since = startDate.toISOString().split('T')[0];
      const until = endDate.toISOString().split('T')[0];

      // 檢查是否為測試 token (如 'mock_token')，只有在測試 token 時才使用模擬數據
      if (accessToken === 'mock_token' || accessToken.startsWith('mock_')) {
        console.log(`[META] 使用模擬數據（測試 token）- ${formattedAccountId}`);
        return {
          accountId: formattedAccountId,
          accountName: "示範廣告帳戶",
          impressions: 125000,
          clicks: 3200,
          spend: 15000,
          linkClicks: 2800,
          purchases: 45,
          purchaseValue: 67500,
          addToCart: 180,
          viewContent: 1200,
          currency: "TWD",
          dateRange: { since, until },

        };
      }

      console.log(`[META] 使用真實 Facebook API 獲取數據 - ${formattedAccountId}`);

      // 獲取廣告帳戶基本資訊
      const accountUrl = `${this.baseUrl}/${formattedAccountId}`;
      const accountParams = new URLSearchParams({
        access_token: accessToken,
        fields: 'name,account_status,currency'
      });

      const accountResponse = await fetch(`${accountUrl}?${accountParams}`);
      
      if (!accountResponse.ok) {
        const errorData = await accountResponse.json().catch(() => null);
        throw new Error(`Facebook API 請求失敗: ${accountResponse.status} - ${errorData?.error?.message || accountResponse.statusText}`);
      }
      
      const accountData = await accountResponse.json();

      // 獲取廣告帳戶的統計數據 (所有活動的綜合數據)
      const insightsUrl = `${this.baseUrl}/${formattedAccountId}/insights`;
      const insightsParams = new URLSearchParams({
        access_token: accessToken,
        time_range: JSON.stringify({ since, until }),
        fields: 'impressions,clicks,spend,actions,action_values,cpm,cpc,ctr',
        level: 'account'
      });

      const insightsResponse = await fetch(`${insightsUrl}?${insightsParams}`);
      
      if (!insightsResponse.ok) {
        const errorData = await insightsResponse.json().catch(() => null);
        throw new Error(`Facebook Insights API 請求失敗: ${insightsResponse.status} - ${errorData?.error?.message || insightsResponse.statusText}`);
      }
      
      const insightsData = await insightsResponse.json();
      const insights = insightsData.data?.[0];

      if (!insights) {
        throw new Error('無法獲取廣告帳戶統計數據，可能該帳戶沒有活躍廣告或權限不足');
      }

      // 解析數據並計算指標
      const impressions = parseInt(insights.impressions || '0');
      const clicks = parseInt(insights.clicks || '0');
      const spend = parseFloat(insights.spend || '0');
      
      // 從 actions 陣列中提取轉換數據
      const actions = insights.actions || [];
      const actionValues = insights.action_values || [];
      
      const linkClicks = this.extractActionValue(actions, 'link_click');
      const purchases = this.extractActionValue(actions, 'purchase');
      const addToCart = this.extractActionValue(actions, 'add_to_cart');
      const viewContent = this.extractActionValue(actions, 'view_content');
      
      const purchaseValue = this.extractActionValue(actionValues, 'purchase');

      // 獲取廣告級別數據來計算 top performing ads
      let topPerformingAds: Array<{
        adName: string;
        effectiveObjectStoryId: string;
        ctr: number;
        impressions: number;
        clicks: number;
        spend: number;
      }> = [];
      try {
        topPerformingAds = await this.getTopPerformingAds(accessToken, formattedAccountId, since, until);
      } catch (error) {
        console.log('[META] 獲取廣告級別數據失敗，繼續使用帳戶級別數據');
      }
      
      return {
        accountId: formattedAccountId,
        accountName: accountData.name || '廣告帳戶',
        impressions,
        clicks,
        spend,
        linkClicks,
        purchases,
        purchaseValue,
        addToCart,
        viewContent,
        currency: accountData.currency || 'TWD',
        dateRange: { since, until },
        topPerformingAds
      };

    } catch (error) {
      console.error('獲取 Meta 廣告帳戶數據錯誤:', error);
      throw error;
    }
  }

  /**
   * 獲取表現最佳的廣告 (CTR 高於平均值且曝光 > 500)
   */
  private async getTopPerformingAds(accessToken: string, adAccountId: string, since: string, until: string): Promise<Array<{
    adName: string;
    effectiveObjectStoryId: string;
    ctr: number;
    impressions: number;
    clicks: number;
    spend: number;
  }>> {
    try {
      console.log(`[META] 開始獲取廣告級別數據用於篩選高效廣告`);
      
      // 獲取廣告帳戶下的所有廣告
      const adsUrl = `${this.baseUrl}/${adAccountId}/ads`;
      const adsParams = new URLSearchParams({
        access_token: accessToken,
        fields: 'id,name,effective_object_story_id,status',
        limit: '100', // 限制數量避免過多數據
        filtering: JSON.stringify([{
          field: 'ad.effective_status',
          operator: 'IN',
          value: ['ACTIVE', 'PAUSED']
        }])
      });

      const adsResponse = await fetch(`${adsUrl}?${adsParams}`);
      if (!adsResponse.ok) {
        throw new Error(`Facebook Ads API 錯誤: ${adsResponse.status}`);
      }

      const adsData = await adsResponse.json();
      const ads = adsData.data || [];

      if (ads.length === 0) {
        console.log(`[META] 該帳戶沒有找到廣告數據`);
        return [];
      }

      // 獲取每個廣告的統計數據
      const adPerformanceData = [];
      
      for (const ad of ads) {
        try {
          const insightsUrl = `${this.baseUrl}/${ad.id}/insights`;
          const insightsParams = new URLSearchParams({
            access_token: accessToken,
            fields: 'impressions,clicks,spend',
            time_range: JSON.stringify({
              since: since,
              until: until
            })
          });

          const insightsResponse = await fetch(`${insightsUrl}?${insightsParams}`);
          if (!insightsResponse.ok) {
            console.log(`[META] 無法獲取廣告 ${ad.id} 的統計數據`);
            continue;
          }

          const insightsData = await insightsResponse.json();
          const insights = insightsData.data?.[0];

          if (!insights) {
            continue;
          }

          const impressions = parseInt(insights.impressions || '0');
          const clicks = parseInt(insights.clicks || '0');
          const spend = parseFloat(insights.spend || '0');
          const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

          // 只考慮有曝光數據的廣告
          if (impressions > 0) {
            adPerformanceData.push({
              adName: ad.name || '未命名廣告',
              effectiveObjectStoryId: ad.effective_object_story_id || '',
              ctr,
              impressions,
              clicks,
              spend
            });
          }
        } catch (error) {
          console.log(`[META] 處理廣告 ${ad.id} 時發生錯誤:`, error);
          continue;
        }
      }

      if (adPerformanceData.length === 0) {
        console.log(`[META] 沒有找到有效的廣告統計數據`);
        return [];
      }

      // 計算帳戶平均 CTR
      const totalImpressions = adPerformanceData.reduce((sum, ad) => sum + ad.impressions, 0);
      const totalClicks = adPerformanceData.reduce((sum, ad) => sum + ad.clicks, 0);
      const averageCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

      console.log(`[META] 帳戶平均 CTR: ${averageCtr.toFixed(2)}%`);

      // 篩選條件：CTR > 平均值 且 曝光 > 500
      const filteredAds = adPerformanceData.filter(ad => 
        ad.ctr > averageCtr && ad.impressions > 500
      );

      // 按 CTR 排序並取前 5 名
      const topAds = filteredAds
        .sort((a, b) => b.ctr - a.ctr)
        .slice(0, 5);

      console.log(`[META] 找到 ${topAds.length} 個高效廣告 (CTR > ${averageCtr.toFixed(2)}%, 曝光 > 500)`);

      return topAds;

    } catch (error) {
      console.error('獲取廣告級別數據錯誤:', error);
      return [];
    }
  }

  /**
   * 從 Facebook actions 數組中提取特定動作的值
   */
  private extractActionValue(actions: any[], actionType: string): number {
    const action = actions.find(a => a.action_type === actionType);
    return action ? parseInt(action.value) : 0;
  }

  /**
   * 計算帳戶診斷數據
   */
  calculateAccountDiagnosisData(
    targetData: {
      targetRevenue: number;
      targetAov: number;
      targetConversionRate: number;
      cpc: number;
    },
    metaData: MetaAccountData
  ): AccountDiagnosisData {
    // 目標計算
    const targetDailyRevenue = targetData.targetRevenue / 30;
    const targetDailyOrders = targetDailyRevenue / targetData.targetAov;
    const targetDailyTraffic = targetDailyOrders / (targetData.targetConversionRate / 100);
    const targetDailyBudget = targetDailyTraffic * targetData.cpc;
    const targetCpa = targetData.targetAov / (targetData.targetConversionRate / 100);
    // 修正 ROAS 計算：月目標營業額 / 月廣告預算
    const monthlyTargetBudget = targetDailyBudget * 30;
    const targetRoas = targetData.targetRevenue / monthlyTargetBudget;

    // 實際數據 (30天平均)
    const actualDailyTraffic = metaData.linkClicks / 30;
    const actualDailySpend = metaData.spend / 30;
    const actualCtr = metaData.clicks > 0 ? (metaData.clicks / metaData.impressions) * 100 : 0;
    const actualCpa = metaData.purchases > 0 ? metaData.spend / metaData.purchases : 0;
    const actualRoas = metaData.spend > 0 ? metaData.purchaseValue / metaData.spend : 0;

    // 達成率計算
    const trafficAchievementRate = targetDailyTraffic > 0 ? (actualDailyTraffic / targetDailyTraffic) * 100 : 0;
    const budgetUtilizationRate = targetDailyBudget > 0 ? (actualDailySpend / targetDailyBudget) * 100 : 0;

    // 漏斗轉換率
    const addToCartRate = metaData.viewContent > 0 ? (metaData.addToCart / metaData.viewContent) * 100 : 0;
    const checkoutRate = metaData.addToCart > 0 ? (metaData.purchases / metaData.addToCart) * 100 : 0;
    const overallConversionRate = metaData.viewContent > 0 ? (metaData.purchases / metaData.viewContent) * 100 : 0;

    return {
      targetDailyTraffic,
      targetDailyBudget,
      targetCpa,
      targetRoas,
      targetRevenue: targetData.targetRevenue,
      targetAov: targetData.targetAov,
      targetConversionRate: targetData.targetConversionRate,
      
      actualDailyTraffic,
      actualDailySpend,
      actualCtr,
      actualCpa,
      actualRoas,
      
      trafficAchievementRate,
      budgetUtilizationRate,
      addToCartRate,
      checkoutRate,
      overallConversionRate
    };
  }

  /**
   * 生成 AI 帳戶診斷報告
   */
  async generateAccountDiagnosisReport(
    accountName: string,
    diagnosisData: AccountDiagnosisData,
    metaData?: MetaAccountData
  ): Promise<string> {
    const prompt = this.buildAccountDiagnosisPrompt(accountName, diagnosisData, metaData);
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system", 
            content: "你是專業的 Facebook 廣告優化顧問，專精於電商廣告帳戶診斷和優化建議。請提供精準、實用的分析和建議。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      return completion.choices[0]?.message?.content || "診斷報告生成失敗";
    } catch (error) {
      console.error('OpenAI API 錯誤:', error);
      return "AI 診斷服務暫時無法使用，請稍後再試。";
    }
  }

  /**
   * 建構帳戶診斷 Prompt
   */
  private buildAccountDiagnosisPrompt(accountName: string, data: AccountDiagnosisData, metaData?: MetaAccountData): string {
    const healthScore = this.calculateAccountHealthScore(data);
    
    // 計算目標轉換率
    const targetBrowseToCartRate = 15; // 業界標準
    const targetCartToCheckoutRate = 25; // 業界標準
    
    return `
作為專業的 Facebook 廣告優化顧問，請針對「${accountName}」進行全面帳戶健診分析：

## 📊 帳戶基本數據
- 目標月營收：NT$${data.targetRevenue.toLocaleString()}
- 目標客單價：NT$${data.targetAov.toLocaleString()}
- 目標轉換率：${data.targetConversionRate}%
- 目標 ROAS：${data.targetRoas.toFixed(2)}x
- 目標日流量：${Math.round(data.targetDailyTraffic)} 人次
- 目標日預算：NT$${Math.round(data.targetDailyBudget).toLocaleString()}

## 📈 實際帳戶表現
- 實際日流量：${Math.round(data.actualDailyTraffic)} 人次 (達成率：${data.trafficAchievementRate.toFixed(1)}%)
- 實際日花費：NT$${Math.round(data.actualDailySpend).toLocaleString()} (預算使用率：${data.budgetUtilizationRate.toFixed(1)}%)
- 實際 CTR：${data.actualCtr.toFixed(2)}% (${this.getCtrRating(data.actualCtr)})
- 實際 CPA：NT$${Math.round(data.actualCpa).toLocaleString()}
- 實際 ROAS：${data.actualRoas.toFixed(2)}x

## 🔄 轉換漏斗分析
- 瀏覽→加購轉換率：${data.addToCartRate.toFixed(1)}% (目標：${targetBrowseToCartRate}%)
- 加購→結帳轉換率：${data.checkoutRate.toFixed(1)}% (目標：${targetCartToCheckoutRate}%)
- 整體轉換率：${data.overallConversionRate.toFixed(2)}%

## 🎯 健康分數
帳戶健康分數：${healthScore}/100 分

**重要指示：請勿在診斷報告中提及任何具體的廣告名稱、Post ID、廣告組合名稱或其他需要從 Facebook API 獲取的具體資訊。只進行策略性分析。**

請按以下架構提供完整診斷報告：

## 1. 🌟 成功亮點分析
基於現有數據分析帳戶優勢：
- CTR 表現分析和成功因素
- ROAS 達成情況和優化策略
- 轉換率表現評估
- 受眾定向效果分析

## 2. 📊 轉換漏斗優化建議
詳細說明：
- 「瀏覽→加購轉換率」現在是 ${data.addToCartRate.toFixed(1)}%，應該要提升到 ${targetBrowseToCartRate}%
- 「加購→結帳轉換率」現在是 ${data.checkoutRate.toFixed(1)}%，應該要提升到 ${targetCartToCheckoutRate}%
- 提供具體優化策略和可執行的改善方案

## 3. ⚠️ 問題診斷與解決方案
基於實際數據指出問題並提供解決方案

## 4. 💰 預算優化建議
針對目前預算配置給出調整建議

請用繁體中文回答，語氣專業但易懂。嚴格遵守：絕對不要編造任何廣告名稱、Post ID、廣告組合名稱等具體細節，只提供基於真實數據的策略性建議。
`;
  }

  /**
   * 計算帳戶健康分數
   */
  private calculateAccountHealthScore(data: AccountDiagnosisData): number {
    let score = 0;
    
    // 流量達成率 (25分)
    if (data.trafficAchievementRate >= 80) score += 25;
    else if (data.trafficAchievementRate >= 60) score += 20;
    else if (data.trafficAchievementRate >= 40) score += 15;
    else score += 5;
    
    // CTR 表現 (25分)
    if (data.actualCtr >= 3) score += 25;
    else if (data.actualCtr >= 2) score += 20;
    else if (data.actualCtr >= 1) score += 15;
    else score += 5;
    
    // ROAS 表現 (25分)
    if (data.actualRoas >= data.targetRoas) score += 25;
    else if (data.actualRoas >= data.targetRoas * 0.8) score += 20;
    else if (data.actualRoas >= data.targetRoas * 0.6) score += 15;
    else score += 5;
    
    // 轉換率表現 (25分)
    if (data.overallConversionRate >= data.targetConversionRate) score += 25;
    else if (data.overallConversionRate >= data.targetConversionRate * 0.8) score += 20;
    else if (data.overallConversionRate >= data.targetConversionRate * 0.6) score += 15;
    else score += 5;
    
    return Math.min(score, 100);
  }

  /**
   * 獲取 CTR 評級
   */
  private getCtrRating(ctr: number): string {
    if (ctr >= 3) return "優秀";
    if (ctr >= 2) return "良好";
    if (ctr >= 1) return "普通";
    return "需改善";
  }
}

export const metaAccountService = new MetaAccountService();