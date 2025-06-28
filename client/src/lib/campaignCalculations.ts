import { addDays, subDays, format } from 'date-fns';

export interface CampaignData {
  startDate: string;
  endDate: string;
  targetRevenue: number;
  targetAov: number;
  targetConversionRate: number;
  cpc: number;
}

export interface PeriodData {
  name: string;
  days: number;
  budget: number;
  traffic: number;
  dailyBudget: number;
  dailyTraffic: number;
}

export interface CampaignCalculationResult {
  totalDays: number;
  requiredOrders: number;
  requiredTraffic: number;
  totalBudget: number;
  averageDailyBudget: number;
  periods: PeriodData[];
  dailyBreakdown: Array<{
    date: string;
    period: string;
    budget: number;
    traffic: number;
  }>;
}

export function calculateCampaignBudget(data: CampaignData): CampaignCalculationResult {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  const campaignDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // 基本計算
  const requiredOrders = Math.ceil(data.targetRevenue / data.targetAov);
  const totalTraffic = Math.ceil(requiredOrders / (data.targetConversionRate / 100));
  const totalBudget = Math.ceil(totalTraffic * data.cpc);
  const averageDailyBudget = Math.ceil(totalBudget / campaignDays);

  let periods: PeriodData[] = [];
  let dailyBreakdown: Array<{ date: string; period: string; budget: number; traffic: number; }> = [];

  if (campaignDays === 3) {
    // 3天活動：50% + 25% + 25%
    const day1Budget = Math.ceil(totalBudget * 0.50);
    const day2Budget = Math.ceil(totalBudget * 0.25);
    const day3Budget = totalBudget - day1Budget - day2Budget;

    const day1Traffic = Math.ceil(totalTraffic * 0.50);
    const day2Traffic = Math.ceil(totalTraffic * 0.25);
    const day3Traffic = totalTraffic - day1Traffic - day2Traffic;

    periods = [
      {
        name: '第一天',
        days: 1,
        budget: day1Budget,
        traffic: day1Traffic,
        dailyBudget: day1Budget,
        dailyTraffic: day1Traffic,
      },
      {
        name: '第二天',
        days: 1,
        budget: day2Budget,
        traffic: day2Traffic,
        dailyBudget: day2Budget,
        dailyTraffic: day2Traffic,
      },
      {
        name: '第三天',
        days: 1,
        budget: day3Budget,
        traffic: day3Traffic,
        dailyBudget: day3Budget,
        dailyTraffic: day3Traffic,
      },
    ];

    dailyBreakdown = [
      { date: format(startDate, 'yyyy-MM-dd'), period: '第一天', budget: day1Budget, traffic: day1Traffic },
      { date: format(addDays(startDate, 1), 'yyyy-MM-dd'), period: '第二天', budget: day2Budget, traffic: day2Traffic },
      { date: format(addDays(startDate, 2), 'yyyy-MM-dd'), period: '第三天', budget: day3Budget, traffic: day3Traffic },
    ];

  } else if (campaignDays >= 4 && campaignDays <= 9) {
    // 4-9天活動：45% + 30% + 25%
    const launchDays = Math.max(1, Math.ceil(campaignDays * 0.4));
    const finalDays = Math.max(1, Math.ceil(campaignDays * 0.25));
    const mainDays = campaignDays - launchDays - finalDays;

    const launchBudget = Math.ceil(totalBudget * 0.45);
    const mainBudget = Math.ceil(totalBudget * 0.30);
    const finalBudget = totalBudget - launchBudget - mainBudget;

    const launchTraffic = Math.ceil(totalTraffic * 0.45);
    const mainTraffic = Math.ceil(totalTraffic * 0.30);
    const finalTraffic = totalTraffic - launchTraffic - mainTraffic;

    periods = [
      {
        name: '啟動期',
        days: launchDays,
        budget: launchBudget,
        traffic: launchTraffic,
        dailyBudget: Math.ceil(launchBudget / launchDays),
        dailyTraffic: Math.ceil(launchTraffic / launchDays),
      },
      {
        name: '主推期',
        days: mainDays,
        budget: mainBudget,
        traffic: mainTraffic,
        dailyBudget: Math.ceil(mainBudget / mainDays),
        dailyTraffic: Math.ceil(mainTraffic / mainDays),
      },
      {
        name: '收尾期',
        days: finalDays,
        budget: finalBudget,
        traffic: finalTraffic,
        dailyBudget: Math.ceil(finalBudget / finalDays),
        dailyTraffic: Math.ceil(finalTraffic / finalDays),
      },
    ];

    // 生成每日分解
    let currentDate = new Date(startDate);
    
    // 啟動期
    for (let i = 0; i < launchDays; i++) {
      dailyBreakdown.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        period: '啟動期',
        budget: Math.ceil(launchBudget / launchDays),
        traffic: Math.ceil(launchTraffic / launchDays),
      });
      currentDate = addDays(currentDate, 1);
    }

    // 主推期
    for (let i = 0; i < mainDays; i++) {
      dailyBreakdown.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        period: '主推期',
        budget: Math.ceil(mainBudget / mainDays),
        traffic: Math.ceil(mainTraffic / mainDays),
      });
      currentDate = addDays(currentDate, 1);
    }

    // 收尾期
    for (let i = 0; i < finalDays; i++) {
      dailyBreakdown.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        period: '收尾期',
        budget: Math.ceil(finalBudget / finalDays),
        traffic: Math.ceil(finalTraffic / finalDays),
      });
      currentDate = addDays(currentDate, 1);
    }

  } else {
    // 10天以上活動：預熱4%，啟動32%，主推38%，收尾24%，回購2%
    const expandedMainDays = Math.max(1, campaignDays - 6); // 活動天數 - 6天固定期間
    
    const preheatBudget = Math.ceil(totalBudget * 0.04);
    const launchBudget = Math.ceil(totalBudget * 0.32);
    const mainBudget = Math.ceil(totalBudget * 0.38);
    const finalBudget = Math.ceil(totalBudget * 0.24);
    const repurchaseBudget = totalBudget - preheatBudget - launchBudget - mainBudget - finalBudget;

    const preheatTraffic = Math.ceil(totalTraffic * 0.04);
    const launchTraffic = Math.ceil(totalTraffic * 0.32);
    const mainTraffic = Math.ceil(totalTraffic * 0.38);
    const finalTraffic = Math.ceil(totalTraffic * 0.24);
    const repurchaseTraffic = totalTraffic - preheatTraffic - launchTraffic - mainTraffic - finalTraffic;

    periods = [
      {
        name: '預熱期',
        days: 4,
        budget: preheatBudget,
        traffic: preheatTraffic,
        dailyBudget: Math.ceil(preheatBudget / 4),
        dailyTraffic: Math.ceil(preheatTraffic / 4),
      },
      {
        name: '啟動期',
        days: 3,
        budget: launchBudget,
        traffic: launchTraffic,
        dailyBudget: Math.ceil(launchBudget / 3),
        dailyTraffic: Math.ceil(launchTraffic / 3),
      },
      {
        name: '主推期',
        days: expandedMainDays,
        budget: mainBudget,
        traffic: mainTraffic,
        dailyBudget: Math.ceil(mainBudget / expandedMainDays),
        dailyTraffic: Math.ceil(mainTraffic / expandedMainDays),
      },
      {
        name: '收尾期',
        days: 3,
        budget: finalBudget,
        traffic: finalTraffic,
        dailyBudget: Math.ceil(finalBudget / 3),
        dailyTraffic: Math.ceil(finalTraffic / 3),
      },
      {
        name: '回購期',
        days: 7,
        budget: repurchaseBudget,
        traffic: repurchaseTraffic,
        dailyBudget: Math.ceil(repurchaseBudget / 7),
        dailyTraffic: Math.ceil(repurchaseTraffic / 7),
      },
    ];

    // 生成每日分解
    let currentDate = subDays(startDate, 4); // 預熱期從活動開始前4天開始

    // 預熱期
    for (let i = 0; i < 4; i++) {
      dailyBreakdown.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        period: '預熱期',
        budget: Math.ceil(preheatBudget / 4),
        traffic: Math.ceil(preheatTraffic / 4),
      });
      currentDate = addDays(currentDate, 1);
    }

    // 啟動期
    for (let i = 0; i < 3; i++) {
      dailyBreakdown.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        period: '啟動期',
        budget: Math.ceil(launchBudget / 3),
        traffic: Math.ceil(launchTraffic / 3),
      });
      currentDate = addDays(currentDate, 1);
    }

    // 主推期
    for (let i = 0; i < expandedMainDays; i++) {
      dailyBreakdown.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        period: '主推期',
        budget: Math.ceil(mainBudget / expandedMainDays),
        traffic: Math.ceil(mainTraffic / expandedMainDays),
      });
      currentDate = addDays(currentDate, 1);
    }

    // 收尾期
    for (let i = 0; i < 3; i++) {
      dailyBreakdown.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        period: '收尾期',
        budget: Math.ceil(finalBudget / 3),
        traffic: Math.ceil(finalTraffic / 3),
      });
      currentDate = addDays(currentDate, 1);
    }

    // 回購期
    for (let i = 0; i < 7; i++) {
      dailyBreakdown.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        period: '回購期',
        budget: Math.ceil(repurchaseBudget / 7),
        traffic: Math.ceil(repurchaseTraffic / 7),
      });
      currentDate = addDays(currentDate, 1);
    }
  }

  return {
    totalDays: campaignDays,
    requiredOrders,
    requiredTraffic: totalTraffic,
    totalBudget,
    averageDailyBudget,
    periods,
    dailyBreakdown,
  };
}