import { CampaignPlannerFormData, PlanningResult, DailyBudget } from '../types/campaign-planner';

// Transform V2 API backend result to frontend PlanningResult format
export const transformBackendToFrontendResult = (backendResult: any, inputData: CampaignPlannerFormData): PlanningResult => {
  const { summary, periods, funnelAllocation, dailyBreakdown } = backendResult;
  const { totalTraffic, totalBudget } = summary;
  
  // Convert periods array to campaignPeriods object
  const campaignPeriods: any = {};
  if (periods) {
    periods.forEach((period: any) => {
      campaignPeriods[period.type] = {
        startDate: period.startDate,
        endDate: period.endDate,
        budget: period.budget,
        traffic: period.traffic,
      };
    });
  }

  // Use dailyBreakdown directly or create empty array
  const dailyBudgets: DailyBudget[] = dailyBreakdown || [];

  return {
    totalTraffic: totalTraffic || 0,
    totalBudget: totalBudget || 0,
    campaignPeriods,
    dailyBudgets,
    funnelAllocation: funnelAllocation || null,
  };
};