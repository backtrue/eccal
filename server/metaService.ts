import { OpenAI } from 'openai';

export interface MetaCampaignData {
  campaignId: string;
  campaignName: string;
  impressions: number;
  clicks: number;
  spend: number;
  linkClicks: number; // 連外點擊
  purchases: number;
  purchaseValue: number;
  addToCart: number;
  viewContent: number;
  dateRange: {
    since: string;
    until: string;
  };
}

export interface DiagnosisData {
  // Target data from calculator
  targetDailyTraffic: number;
  targetDailyBudget: number;
  targetCpa: number;
  targetRoas: number;
  targetRevenue: number;
  targetAov: number;
  targetConversionRate: number;
  
  // Actual Facebook data
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

export class MetaService {
  private openai: OpenAI;
  private readonly baseUrl = 'https://graph.facebook.com/v19.0';

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required');
    }
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * 獲取 Meta 廣告帳戶數據 (帳戶級別分析)
   */
  async getAdAccountData(accessToken: string, adAccountId: string): Promise<MetaCampaignData> {
    try {
      // 使用環境變數中的 access token 如果沒有提供的話
      const token = accessToken || process.env.FACEBOOK_ACCESS_TOKEN;
      
      if (!token) {
        throw new Error('Facebook Access Token 未設定');
      }

      // 獲取廣告帳戶基本資訊
      const campaignResponse = await fetch(
        `${this.baseUrl}/${adAccountId}?fields=name,account_status&access_token=${token}`
      );
      
      if (!campaignResponse.ok) {
        const errorData = await campaignResponse.json().catch(() => null);
        throw new Error(`Facebook API 錯誤: ${campaignResponse.status} - ${errorData?.error?.message || campaignResponse.statusText}`);
      }
      
      const campaignInfo = await campaignResponse.json();
      
      // 獲取廣告活動統計數據 (最近30天)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      
      const since = startDate.toISOString().split('T')[0];
      const until = endDate.toISOString().split('T')[0];
      
      const insightsResponse = await fetch(
        `${this.baseUrl}/${adAccountId}/insights?fields=impressions,clicks,spend,inline_link_clicks,actions,purchase_roas&time_range={'since':'${since}','until':'${until}'}&access_token=${token}`
      );
      
      if (!insightsResponse.ok) {
        const errorData = await insightsResponse.json().catch(() => null);
        throw new Error(`Facebook Insights API 錯誤: ${insightsResponse.status} - ${errorData?.error?.message || insightsResponse.statusText}`);
      }
      
      const insightsData = await insightsResponse.json();
      
      if (!insightsData.data || insightsData.data.length === 0) {
        throw new Error('找不到廣告活動數據，請確認活動 ID 是否正確且有數據');
      }
      
      const insights = insightsData.data[0];
      
      // 解析 actions 數據以獲取購買和加入購物車數據
      const actions = insights.actions || [];
      const purchases = this.extractActionValue(actions, 'purchase') || 0;
      const addToCart = this.extractActionValue(actions, 'add_to_cart') || 0;
      const viewContent = this.extractActionValue(actions, 'view_content') || 0;
      
      return {
        campaignId: adAccountId,
        campaignName: campaignInfo.name || `廣告帳戶 ${adAccountId}`,
        impressions: parseInt(insights.impressions || '0'),
        clicks: parseInt(insights.clicks || '0'),
        spend: parseFloat(insights.spend || '0'),
        linkClicks: parseInt(insights.inline_link_clicks || '0'),
        purchases,
        purchaseValue: parseFloat(insights.purchase_roas?.[0]?.value || '0') * purchases,
        addToCart,
        viewContent,
        dateRange: {
          since,
          until
        }
      };
    } catch (error) {
      console.error('Meta API 錯誤:', error);
      
      // 如果是網路錯誤或 API 配置問題，提供詳細錯誤訊息
      if (error instanceof Error) {
        throw new Error(`無法獲取 Facebook 廣告數據: ${error.message}`);
      }
      
      throw new Error('無法連接 Facebook Marketing API，請檢查網路連線和 API 權限');
    }
  }

  /**
   * 從 Facebook actions 數組中提取特定動作的值
   */
  private extractActionValue(actions: any[], actionType: string): number {
    const action = actions.find(a => a.action_type === actionType);
    return action ? parseInt(action.value || '0') : 0;
  }

  /**
   * 計算診斷數據
   */
  calculateDiagnosisData(
    targetData: {
      targetRevenue: number;
      targetAov: number;
      targetConversionRate: number;
      cpc: number;
    },
    metaData: MetaCampaignData
  ): DiagnosisData {
    // 計算目標數據
    const targetMonthlyOrders = targetData.targetRevenue / targetData.targetAov;
    const targetDailyOrders = targetMonthlyOrders / 30;
    const targetDailyTraffic = Math.ceil(targetDailyOrders / (targetData.targetConversionRate / 100));
    const targetDailyBudget = targetDailyTraffic * targetData.cpc;
    const targetCpa = targetData.targetAov / (targetData.targetConversionRate / 100) * targetData.cpc;
    const targetRoas = targetData.targetRevenue / (targetDailyBudget * 30);

    // 計算實際數據 (7天平均)
    const days = 7;
    const actualDailyTraffic = Math.round(metaData.linkClicks / days);
    const actualDailySpend = metaData.spend / days;
    const actualCtr = (metaData.linkClicks / metaData.impressions) * 100;
    const actualCpa = metaData.spend / metaData.purchases;
    const actualRoas = metaData.purchaseValue / metaData.spend;

    // 計算達成率
    const trafficAchievementRate = (actualDailyTraffic / targetDailyTraffic) * 100;
    const budgetUtilizationRate = (actualDailySpend / targetDailyBudget) * 100;

    // 計算轉換漏斗
    const addToCartRate = (metaData.addToCart / metaData.viewContent) * 100;
    const checkoutRate = (metaData.purchases / metaData.addToCart) * 100;
    const overallConversionRate = (metaData.purchases / metaData.viewContent) * 100;

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
   * 生成 AI 診斷報告
   */
  async generateDiagnosisReport(
    campaignName: string,
    diagnosisData: DiagnosisData
  ): Promise<string> {
    const prompt = this.buildDiagnosisPrompt(campaignName, diagnosisData);
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '你是一位頂尖的 Facebook 廣告策略顧問，你的名字叫「小黑老師」。你的分析風格犀利、一針見血，並且總是基於數據說話。你的核心理念是「報表不是成績單，而是行動指南」。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      return response.choices[0]?.message?.content || '診斷報告生成失敗';
    } catch (error) {
      console.error('OpenAI API 錯誤:', error);
      throw new Error('AI 診斷報告生成失敗');
    }
  }

  /**
   * 建構診斷 Prompt
   */
  private buildDiagnosisPrompt(campaignName: string, data: DiagnosisData): string {
    // 計算健康分數
    const healthScore = this.calculateHealthScore(data);
    
    return `
# Role and Goal

你是一位頂尖的 Facebook 廣告策略顧問，你的名字叫「小黑老師」。你的分析風格犀利、一針見血，並且總是基於數據說話。你的核心理念是「報表不是成績單，而是行動指南」。你的任務是分析一份 Facebook 廣告健診報告的原始數據，並為用戶生成一份專業、客製化且可立即行動的優化建議。

# Context: 健診數據摘要 (Facts)

以下是使用者「${campaignName}」廣告活動的健診數據：

## 1. 商業目標與計算機目標
- 目標月營業額：NT$${data.targetRevenue.toLocaleString()}
- 平均客單價：NT$${data.targetAov}
- 預期轉換率：${data.targetConversionRate}%
- **計算機建議日流量**：${data.targetDailyTraffic}
- **計算機建議日預算**：NT$${data.targetDailyBudget.toLocaleString()}
- **計算出的理想 CPA**：NT$${data.targetCpa.toLocaleString()}
- **計算出的目標 ROAS**：${data.targetRoas.toFixed(1)}x

## 2. 廣告實際表現
- **實際日均流量 (VC)**：${data.actualDailyTraffic}
- **實際日均花費**：NT$${data.actualDailySpend.toLocaleString()}
- **實際平均 CTR (連外)**：${data.actualCtr.toFixed(2)}%
- **實際 CPA**：NT$${data.actualCpa.toLocaleString()}
- **實際 ROAS**：${data.actualRoas.toFixed(1)}x

## 3. 核心診斷分析 (Facts for Analysis)
- **流量目標達成率**：${data.trafficAchievementRate.toFixed(1)}%
- **預算使用率**：${data.budgetUtilizationRate.toFixed(1)}%
- **電商轉換瓶頸**：
  - 加入購物車率 (ATC/VC)：${data.addToCartRate.toFixed(1)}% ${this.getAtcRating(data.addToCartRate)}
  - 購物車結帳率 (PUR/ATC)：${data.checkoutRate.toFixed(1)}%
- **素材吸引力 (CTR) 評級**：${this.getCtrRating(data.actualCtr)}
- **整體轉換率 (PUR/VC)**：${data.overallConversionRate.toFixed(2)}%
- **整體健康分數**：${healthScore}/100

# Task: 你的輸出

請根據上述數據，生成一份包含以下結構的健診報告：

### 一、核心摘要與首要行動建議
用「小黑老師」的口吻，一針見血地點出目前最嚴重的 1-2 個問題，並給出最重要的「首要行動建議」。直接告訴用戶現在最該做什麼。

### 二、多情境綜合診斷
針對「流量與預算」、「漏斗結構」、「轉換瓶頸」與「素材成效」這四個面向，進行深入的綜合分析。你必須：
1. 解釋現象：說明數據背後的意義
2. 推論多種可能原因：根據數據組合，提出 2-3 種可能的原因
3. 提供具體的行動方案矩陣：針對每種可能的原因，提供對應的解決方案

### 三、進階策略與機會點
指出目前數據中表現良好的部分，並提供放大成效的進階策略。

# 重要參考基準
- 加入購物車率 (ATC/VC) 建議值：10-15%，優秀表現：15-20%
- 購物車結帳率 (PUR/ATC) 建議值：20-30%，優秀表現：30-40%
- 整體轉換率 (PUR/VC) 建議值：1-3%，優秀表現：3-5%

請確保你的回覆是 Markdown 格式，並且語氣專業、自信且具有說服力。使用繁體中文回答。
`;
  }

  /**
   * 計算健康分數
   */
  private calculateHealthScore(data: DiagnosisData): number {
    let score = 0;
    
    // 流量達成率 (20分)
    if (data.trafficAchievementRate >= 80) score += 20;
    else if (data.trafficAchievementRate >= 60) score += 16;
    else if (data.trafficAchievementRate >= 40) score += 12;
    else score += 4;
    
    // CTR 表現 (20分)
    if (data.actualCtr >= 3) score += 20;
    else if (data.actualCtr >= 2) score += 16;
    else if (data.actualCtr >= 1) score += 12;
    else score += 4;
    
    // ATC 率表現 (20分) - 新增獨立評分
    if (data.addToCartRate >= 15) score += 20;
    else if (data.addToCartRate >= 10) score += 16;
    else if (data.addToCartRate >= 5) score += 12;
    else score += 4;
    
    // ROAS 表現 (20分)
    if (data.actualRoas >= data.targetRoas) score += 20;
    else if (data.actualRoas >= data.targetRoas * 0.8) score += 16;
    else if (data.actualRoas >= data.targetRoas * 0.6) score += 12;
    else score += 4;
    
    // 整體轉換率表現 (20分)
    if (data.overallConversionRate >= data.targetConversionRate) score += 20;
    else if (data.overallConversionRate >= data.targetConversionRate * 0.8) score += 16;
    else if (data.overallConversionRate >= data.targetConversionRate * 0.6) score += 12;
    else score += 4;
    
    return Math.min(score, 100);
  }

  /**
   * 獲取 CTR 評級
   */
  private getCtrRating(ctr: number): string {
    if (ctr >= 3) return '健康 (高於 3%)';
    if (ctr >= 2) return '正常 (2-3%)';
    if (ctr >= 1) return '注意 (1-2%)';
    return '危險 (低於 1%)';
  }

  /**
   * 獲取 ATC 率評級
   */
  private getAtcRating(atcRate: number): string {
    if (atcRate >= 15) return '(優秀 ≥15%)';
    if (atcRate >= 10) return '(健康 10-15%)';
    if (atcRate >= 5) return '(注意 5-10%)';
    return '(危險 <5%)';
  }
}

export const metaService = new MetaService();