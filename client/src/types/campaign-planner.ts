export interface CampaignPlannerFormData {
  startDate: string;
  endDate: string;
  targetRevenue: number;
  targetAov: number;
  targetConversionRate: number;
  cpc: number;
}

export interface DailyBudget {
  date: string;
  period: string;
  budget: number;
  traffic: number;
}

export interface PlanningResult {
  totalTraffic: number;
  totalBudget: number;
  campaignPeriods: any;
  dailyBudgets?: DailyBudget[];
  funnelAllocation?: any;
}