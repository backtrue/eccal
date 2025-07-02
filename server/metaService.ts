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

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required');
    }
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * 模擬獲取 Meta 廣告數據 (實際實現需要 Meta Marketing API)
   * 這裡提供測試數據結構，實際部署時需要集成真實 API
   */
  async getCampaignData(accessToken: string, campaignId: string): Promise<MetaCampaignData> {
    // TODO: 實際實現 Meta Marketing API 調用
    // 目前返回模擬數據用於開發測試
    return {
      campaignId,
      campaignName: `測試廣告活動 ${campaignId}`,
      impressions: 50000,
      clicks: 1500,
      spend: 15000,
      linkClicks: 1200, // 連外點擊數
      purchases: 24,
      purchaseValue: 28800,
      addToCart: 96,
      viewContent: 1200,
      dateRange: {
        since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        until: new Date().toISOString().split('T')[0]
      }
    };
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
  - 加入購物車率 (ATC/VC)：${data.addToCartRate.toFixed(1)}%
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

請確保你的回覆是 Markdown 格式，並且語氣專業、自信且具有說服力。使用繁體中文回答。
`;
  }

  /**
   * 計算健康分數
   */
  private calculateHealthScore(data: DiagnosisData): number {
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
    if (ctr >= 3) return '健康 (高於 3%)';
    if (ctr >= 2) return '正常 (2-3%)';
    if (ctr >= 1) return '注意 (1-2%)';
    return '危險 (低於 1%)';
  }
}

export const metaService = new MetaService();