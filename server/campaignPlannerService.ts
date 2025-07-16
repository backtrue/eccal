import { format, addDays, differenceInDays } from "date-fns";
import { storage } from "./storage";
import type { InsertCampaignPlan, InsertCampaignPeriod, InsertDailyBudget } from "@shared/schema";

// 活動規劃服務類別
export class CampaignPlannerService {
  
  // 計算活動預算分配
  async calculateCampaignBudget(params: {
    userId: string;
    name: string;
    startDate: string;
    endDate: string;
    targetRevenue: number;
    targetAov: number;
    targetConversionRate: number;
    costPerClick: number;
  }) {
    const {
      userId,
      name,
      startDate,
      endDate,
      targetRevenue,
      targetAov,
      targetConversionRate,
      costPerClick
    } = params;

    // 1. 基本計算
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = differenceInDays(end, start) + 1;
    
    const targetOrders = Math.ceil(targetRevenue / targetAov);
    const totalTraffic = Math.ceil(targetOrders / (targetConversionRate / 100));
    const totalBudget = Math.ceil(totalTraffic * costPerClick);

    // 2. 建立活動計畫
    const campaignPlanData: InsertCampaignPlan = {
      userId,
      name,
      description: `目標營收: NT$ ${targetRevenue.toLocaleString()}，預計${totalDays}天活動`,
      startDate: start,
      endDate: end,
      totalDays,
      targetRevenue: targetRevenue.toString(),
      targetAov: targetAov.toString(),
      targetConversionRate: targetConversionRate.toString(),
      costPerClick: costPerClick.toString(),
      totalBudget: totalBudget.toString(),
      totalTraffic,
      totalOrders: targetOrders,
      status: "draft"
    };

    const campaignPlan = await storage.createCampaignPlan(campaignPlanData);

    // 3. 根據活動天數決定預算分配策略
    const { periods, dailyBreakdown } = this.calculateBudgetAllocation({
      campaignId: campaignPlan.id,
      totalDays,
      totalBudget,
      totalTraffic,
      targetOrders,
      targetRevenue,
      startDate: start,
      endDate: end
    });

    // 4. 計算漏斗架構分配
    const funnelAllocation = this.calculateFunnelAllocation(periods);

    // 5. 儲存預算期間
    const campaignPeriods = await storage.createCampaignPeriods(periods);

    // 6. 更新每日預算的 period_id 並儲存
    const dailyBudgetsWithPeriodIds = this.assignPeriodIds(dailyBreakdown, campaignPeriods);
    const dailyBudgets = await storage.createDailyBudgets(dailyBudgetsWithPeriodIds);

    return {
      campaign: campaignPlan,
      periods: campaignPeriods,
      dailyBreakdown: dailyBudgets,
      funnelAllocation,
      summary: {
        totalBudget,
        totalTraffic,
        totalOrders: targetOrders,
        totalDays,
        avgDailyBudget: Math.ceil(totalBudget / totalDays),
        avgDailyTraffic: Math.ceil(totalTraffic / totalDays)
      }
    };
  }

  // 預算分配策略
  private calculateBudgetAllocation(params: {
    campaignId: string;
    totalDays: number;
    totalBudget: number;
    totalTraffic: number;
    targetOrders: number;
    targetRevenue: number;
    startDate: Date;
    endDate: Date;
  }) {
    const {
      campaignId,
      totalDays,
      totalBudget,
      totalTraffic,
      targetOrders,
      targetRevenue,
      startDate,
      endDate
    } = params;

    let periods: InsertCampaignPeriod[] = [];
    let dailyBreakdown: InsertDailyBudget[] = [];

    if (totalDays <= 3) {
      // 短期活動策略（1-3天）
      const allocations = this.getShortTermAllocation(totalDays);
      
      for (let i = 0; i < totalDays; i++) {
        const date = addDays(startDate, i);
        const allocation = allocations[i];
        const periodBudget = Math.ceil(totalBudget * allocation.percentage);
        const periodTraffic = Math.ceil(totalTraffic * allocation.percentage);
        const periodOrders = Math.ceil(targetOrders * allocation.percentage);
        const periodRevenue = Math.ceil(targetRevenue * allocation.percentage);

        // 建立期間
        const period: InsertCampaignPeriod = {
          campaignId,
          name: `day_${i + 1}`,
          displayName: allocation.name,
          orderIndex: i,
          startDate: date,
          endDate: date,
          durationDays: 1,
          budgetAmount: periodBudget.toString(),
          budgetPercentage: (allocation.percentage * 100).toString(),
          dailyBudget: periodBudget.toString(),
          trafficAmount: periodTraffic,
          trafficPercentage: (allocation.percentage * 100).toString(),
          dailyTraffic: periodTraffic,
          expectedOrders: periodOrders,
          expectedRevenue: periodRevenue.toString()
        };
        periods.push(period);

        // 建立每日預算
        const dailyBudget: InsertDailyBudget = {
          campaignId,
          periodId: `temp_${allocation.name}_${i}`, // 臨時 ID，稍後會替換
          date,
          dayOfCampaign: i + 1,
          budget: periodBudget.toString(),
          traffic: periodTraffic,
          expectedOrders: periodOrders,
          expectedRevenue: periodRevenue.toString()
        };
        dailyBreakdown.push(dailyBudget);
      }
    } else if (totalDays <= 7) {
      // 中期活動策略（4-7天）
      const allocations = this.getMediumTermAllocation(totalDays);
      this.buildPeriodsAndDailyBudgets({
        campaignId,
        allocations,
        totalBudget,
        totalTraffic,
        targetOrders,
        targetRevenue,
        startDate,
        periods,
        dailyBreakdown
      });
    } else {
      // 長期活動策略（8天以上）
      const allocations = this.getLongTermAllocation(totalDays);
      this.buildPeriodsAndDailyBudgets({
        campaignId,
        allocations,
        totalBudget,
        totalTraffic,
        targetOrders,
        targetRevenue,
        startDate,
        periods,
        dailyBreakdown
      });
    }

    return { periods, dailyBreakdown };
  }

  // 短期活動分配（1-3天）
  private getShortTermAllocation(totalDays: number) {
    if (totalDays === 1) {
      return [{ name: "單日爆發", percentage: 1.0 }];
    } else if (totalDays === 2) {
      return [
        { name: "首日衝刺", percentage: 0.6 },
        { name: "收尾日", percentage: 0.4 }
      ];
    } else { // 3 days
      return [
        { name: "開場日", percentage: 0.5 },
        { name: "主推日", percentage: 0.3 },
        { name: "收尾日", percentage: 0.2 }
      ];
    }
  }

  // 中期活動分配（4-7天）
  private getMediumTermAllocation(totalDays: number) {
    return [
      {
        name: "launch",
        displayName: "啟動期",
        percentage: 0.45,
        days: Math.ceil(totalDays * 0.4) // 40% 的天數
      },
      {
        name: "main", 
        displayName: "主推期",
        percentage: 0.35,
        days: Math.floor(totalDays * 0.4) // 40% 的天數
      },
      {
        name: "final",
        displayName: "收尾期", 
        percentage: 0.2,
        days: totalDays - Math.ceil(totalDays * 0.4) - Math.floor(totalDays * 0.4) // 剩餘天數
      }
    ];
  }

  // 長期活動分配（8天以上）
  private getLongTermAllocation(totalDays: number) {
    // 動態調整主推期預算比例
    const extraDays = Math.max(0, totalDays - 20);
    const extraBudgetRatio = Math.min(0.20, extraDays * 0.008);
    
    return [
      {
        name: "preheat",
        displayName: "預熱期",
        percentage: 0.04,
        days: 4 // 固定4天預熱
      },
      {
        name: "launch",
        displayName: "啟動期",
        percentage: 0.32 - extraBudgetRatio * 0.6,
        days: 3 // 固定3天啟動
      },
      {
        name: "main",
        displayName: "主推期",
        percentage: 0.38 + extraBudgetRatio,
        days: totalDays - 10 // 扣除其他期間的固定天數
      },
      {
        name: "final",
        displayName: "收尾期",
        percentage: 0.24 - extraBudgetRatio * 0.4,
        days: 3 // 固定3天收尾
      },
      {
        name: "repurchase",
        displayName: "回購期",
        percentage: 0.02,
        days: 7 // 固定7天回購
      }
    ];
  }

  // 建立期間和每日預算
  private buildPeriodsAndDailyBudgets(params: {
    campaignId: string;
    allocations: any[];
    totalBudget: number;
    totalTraffic: number;
    targetOrders: number;
    targetRevenue: number;
    startDate: Date;
    periods: InsertCampaignPeriod[];
    dailyBreakdown: InsertDailyBudget[];
  }) {
    const {
      campaignId,
      allocations,
      totalBudget,
      totalTraffic,
      targetOrders,
      targetRevenue,
      startDate,
      periods,
      dailyBreakdown
    } = params;

    let currentDate = new Date(startDate);
    let dayOfCampaign = 1;

    allocations.forEach((allocation, index) => {
      const periodBudget = Math.ceil(totalBudget * allocation.percentage);
      const periodTraffic = Math.ceil(totalTraffic * allocation.percentage);
      const periodOrders = Math.ceil(targetOrders * allocation.percentage);
      const periodRevenue = Math.ceil(targetRevenue * allocation.percentage);
      const periodDays = allocation.days;
      
      const periodStartDate = new Date(currentDate);
      const periodEndDate = addDays(currentDate, periodDays - 1);

      // 建立期間
      const period: InsertCampaignPeriod = {
        campaignId,
        name: allocation.name,
        displayName: allocation.displayName,
        orderIndex: index,
        startDate: periodStartDate,
        endDate: periodEndDate,
        durationDays: periodDays,
        budgetAmount: periodBudget.toString(),
        budgetPercentage: (allocation.percentage * 100).toString(),
        dailyBudget: Math.ceil(periodBudget / periodDays).toString(),
        trafficAmount: periodTraffic,
        trafficPercentage: (allocation.percentage * 100).toString(),
        dailyTraffic: Math.ceil(periodTraffic / periodDays),
        expectedOrders: periodOrders,
        expectedRevenue: periodRevenue.toString()
      };
      periods.push(period);

      // 建立該期間的每日預算
      for (let i = 0; i < periodDays; i++) {
        const date = addDays(periodStartDate, i);
        const dailyBudgetAmount = Math.ceil(periodBudget / periodDays);
        const dailyTrafficAmount = Math.ceil(periodTraffic / periodDays);
        const dailyOrdersAmount = Math.ceil(periodOrders / periodDays);
        const dailyRevenueAmount = Math.ceil(periodRevenue / periodDays);

        const dailyBudget: InsertDailyBudget = {
          campaignId,
          periodId: `temp_${allocation.name}_${i}`, // 臨時 ID，稍後會替換
          date,
          dayOfCampaign,
          budget: dailyBudgetAmount.toString(),
          traffic: dailyTrafficAmount,
          expectedOrders: dailyOrdersAmount,
          expectedRevenue: dailyRevenueAmount.toString()
        };
        dailyBreakdown.push(dailyBudget);
        
        dayOfCampaign++;
      }

      currentDate = addDays(periodEndDate, 1);
    });
  }

  // 取得使用者的活動計畫列表
  async getUserCampaignPlans(userId: string) {
    return await storage.getUserCampaignPlans(userId);
  }

  // 取得活動計畫詳細資料
  async getCampaignPlanDetails(campaignId: string, userId: string) {
    const campaign = await storage.getCampaignPlan(campaignId, userId);
    if (!campaign) return null;

    const periods = await storage.getCampaignPeriods(campaignId);
    const dailyBudgets = await storage.getDailyBudgets(campaignId);

    return {
      campaign,
      periods,
      dailyBudgets
    };
  }

  // 刪除活動計畫
  async deleteCampaignPlan(campaignId: string, userId: string) {
    return await storage.deleteCampaignPlan(campaignId, userId);
  }

  // 計算漏斗架構分配
  private calculateFunnelAllocation(periods: any[]) {
    const funnelAllocation: any = {};

    periods.forEach(period => {
      const periodName = period.name;
      const periodBudget = parseInt(period.budgetAmount);
      
      let allocation: any = {};

      switch (periodName) {
        case 'preheat':
          allocation = {
            awareness: {
              label: '觸及/互動/影觀',
              percentage: 30,
              budget: Math.ceil(periodBudget * 0.30),
              description: '擴大觸及面，累積潛在受眾'
            },
            traffic: {
              label: '流量導引',
              percentage: 70,
              budget: Math.ceil(periodBudget * 0.70),
              breakdown: {
                interests: {
                  label: '精準興趣標籤',
                  percentage: 100,
                  budget: Math.ceil(periodBudget * 0.70)
                }
              }
            }
          };
          break;

        case 'launch':
          allocation = {
            awareness: {
              label: '觸及/互動/影觀',
              percentage: 10,
              budget: Math.ceil(periodBudget * 0.10)
            },
            traffic: {
              label: '流量導引',
              percentage: 20,
              budget: Math.ceil(periodBudget * 0.20),
              breakdown: {
                interests: {
                  label: '精準興趣標籤',
                  percentage: 50,
                  budget: Math.ceil(periodBudget * 0.10)
                },
                remarketing_l1: {
                  label: '再行銷第一層受眾',
                  percentage: 50,
                  budget: Math.ceil(periodBudget * 0.10)
                }
              }
            },
            conversion: {
              label: '轉換促成',
              percentage: 70,
              budget: Math.ceil(periodBudget * 0.70),
              breakdown: {
                remarketing_l1: {
                  label: '再行銷第一層受眾',
                  percentage: 28.6,
                  budget: Math.ceil(periodBudget * 0.20)
                },
                remarketing_l2: {
                  label: '再行銷第二層受眾',
                  percentage: 42.9,
                  budget: Math.ceil(periodBudget * 0.30)
                },
                asc: {
                  label: 'ASC 廣告',
                  percentage: 28.6,
                  budget: Math.ceil(periodBudget * 0.20)
                }
              }
            }
          };
          break;

        case 'main':
          allocation = {
            awareness: {
              label: '觸及/互動/影觀',
              percentage: 5,
              budget: Math.ceil(periodBudget * 0.05)
            },
            traffic: {
              label: '流量導引',
              percentage: 15,
              budget: Math.ceil(periodBudget * 0.15),
              breakdown: {
                interests: {
                  label: '精準興趣標籤',
                  percentage: 66.7,
                  budget: Math.ceil(periodBudget * 0.10)
                },
                remarketing_l1: {
                  label: '再行銷第一層受眾',
                  percentage: 33.3,
                  budget: Math.ceil(periodBudget * 0.05)
                }
              }
            },
            conversion: {
              label: '轉換促成',
              percentage: 80,
              budget: Math.ceil(periodBudget * 0.80),
              breakdown: {
                remarketing_l1: {
                  label: '再行銷第一層受眾',
                  percentage: 12.5,
                  budget: Math.ceil(periodBudget * 0.10)
                },
                remarketing_l2: {
                  label: '再行銷第二層受眾',
                  percentage: 50,
                  budget: Math.ceil(periodBudget * 0.40)
                },
                asc: {
                  label: 'ASC 廣告',
                  percentage: 37.5,
                  budget: Math.ceil(periodBudget * 0.30)
                }
              }
            }
          };
          break;

        case 'final':
          allocation = {
            traffic: {
              label: '流量導引',
              percentage: 5,
              budget: Math.ceil(periodBudget * 0.05),
              breakdown: {
                remarketing_l1: {
                  label: '再行銷第一層受眾',
                  percentage: 100,
                  budget: Math.ceil(periodBudget * 0.05)
                }
              }
            },
            conversion: {
              label: '轉換促成',
              percentage: 95,
              budget: Math.ceil(periodBudget * 0.95),
              breakdown: {
                remarketing_l1: {
                  label: '再行銷第一層受眾',
                  percentage: 10.5,
                  budget: Math.ceil(periodBudget * 0.10)
                },
                remarketing_l2: {
                  label: '再行銷第二層受眾',
                  percentage: 47.4,
                  budget: Math.ceil(periodBudget * 0.45)
                },
                asc: {
                  label: 'ASC 廣告',
                  percentage: 42.1,
                  budget: Math.ceil(periodBudget * 0.40)
                }
              }
            }
          };
          break;

        case 'repurchase':
          allocation = {
            conversion: {
              label: '轉換促成',
              percentage: 100,
              budget: periodBudget,
              breakdown: {
                repurchase_remarketing: {
                  label: '活動轉換受眾再行銷',
                  percentage: 100,
                  budget: periodBudget,
                  description: '僅針對活動檔期間有轉換的受眾做再行銷'
                }
              }
            }
          };
          break;

        default:
          // 短期活動（1-3天）的情況
          if (periodName.includes('day_') || periodName.includes('日')) {
            allocation = {
              awareness: {
                label: '觸及/互動/影觀',
                percentage: 20,
                budget: Math.ceil(periodBudget * 0.20)
              },
              traffic: {
                label: '流量導引',
                percentage: 30,
                budget: Math.ceil(periodBudget * 0.30)
              },
              conversion: {
                label: '轉換促成',
                percentage: 50,
                budget: Math.ceil(periodBudget * 0.50)
              }
            };
          }
          break;
      }

      funnelAllocation[periodName] = allocation;
    });

    return funnelAllocation;
  }

  // 為每日預算分配正確的 period_id
  private assignPeriodIds(dailyBudgets: InsertDailyBudget[], periods: any[]): InsertDailyBudget[] {
    return dailyBudgets.map((budget) => {
      // 從臨時 ID 中提取 period 名稱
      const tempId = budget.periodId;
      if (tempId.startsWith('temp_')) {
        const periodName = tempId.split('_')[1]; // 例如：從 "temp_launch_0" 取得 "launch"
        
        // 找到匹配的 period
        const matchingPeriod = periods.find(period => period.name === periodName);
        
        return {
          ...budget,
          periodId: matchingPeriod ? matchingPeriod.id : '',
        };
      }
      
      // 如果沒有臨時 ID，按日期匹配
      const budgetDate = new Date(budget.date);
      const matchingPeriod = periods.find(period => {
        const periodStart = new Date(period.startDate);
        const periodEnd = new Date(period.endDate);
        return budgetDate >= periodStart && budgetDate <= periodEnd;
      });

      return {
        ...budget,
        periodId: matchingPeriod ? matchingPeriod.id : '',
      };
    });
  }
}

export const campaignPlannerService = new CampaignPlannerService();