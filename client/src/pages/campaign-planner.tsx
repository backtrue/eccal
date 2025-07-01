import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addDays, subDays } from "date-fns";
import { Calculator, TrendingUp, Calendar, DollarSign, Users, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCampaignPlannerUsage } from "@/hooks/useCampaignPlannerUsage";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { apiRequest } from "@/lib/queryClient";
import NavigationBar from "@/components/NavigationBar";

import Footer from "@/components/Footer";

// Translation constants
const translations = {
  "zh-TW": {
    title: "活動預算規劃器",
    subtitle: "專業的活動預算規劃工具，幫助您精確計算廣告預算配置",
    proBadge: "Pro 會員專屬",
    needAuth: "需要登入",
    authDescription: "請先登入 Google 帳號以使用活動預算規劃功能",
    loginButton: "使用 Google 帳號登入",
    campaignSettings: "活動設定",
    campaignDescription: "設定您的活動目標和預算參數",
    startDate: "活動開始日期",
    endDate: "活動結束日期",
    targetRevenue: "目標營收 (NT$)",
    targetAov: "目標客單價 (NT$)",
    targetConversionRate: "目標轉換率 (%)",
    cpc: "每次點擊成本 (NT$)",
    calculate: "開始計算預算",
    calculating: "計算中...",
    results: "計算結果",
    fillFormFirst: "請先填寫左側表單並計算",
    totalBudget: "總預算需求",
    totalTraffic: "總流量需求",
    budgetAllocation: "預算分配",
    period: "期間",
    budget: "預算",
    traffic: "流量",
    dailyBudget: "每日預算",
    dailyTraffic: "每日流量",
    calculationComplete: "計算完成",
    planningComplete: "活動預算規劃已完成",
    calculationFailed: "計算失敗",
    authRequired: "需要重新登入",
    loginAgain: "請重新登入後再試",
    tryAgain: "請稍後再試",
    usageInfo: "使用次數"
  },
  "en": {
    title: "Campaign Budget Planner",
    subtitle: "Professional campaign budget planning tool to help you accurately calculate ad budget allocation",
    proBadge: "Pro Member Exclusive",
    needAuth: "Login Required",
    authDescription: "Please login with your Google account to use the campaign budget planner",
    loginButton: "Login with Google Account",
    campaignSettings: "Campaign Settings",
    campaignDescription: "Set your campaign goals and budget parameters",
    startDate: "Campaign Start Date",
    endDate: "Campaign End Date",
    targetRevenue: "Target Revenue ($)",
    targetAov: "Target AOV ($)",
    targetConversionRate: "Target Conversion Rate (%)",
    cpc: "Cost Per Click ($)",
    calculate: "Calculate Budget",
    calculating: "Calculating...",
    results: "Results",
    fillFormFirst: "Please fill out the form on the left and calculate",
    totalBudget: "Total Budget Required",
    totalTraffic: "Total Traffic Required",
    budgetAllocation: "Budget Allocation",
    period: "Period",
    budget: "Budget",
    traffic: "Traffic",
    dailyBudget: "Daily Budget",
    dailyTraffic: "Daily Traffic",
    calculationComplete: "Calculation Complete",
    planningComplete: "Campaign budget planning completed",
    calculationFailed: "Calculation Failed",
    authRequired: "Re-authentication Required",
    loginAgain: "Please login again and try",
    tryAgain: "Please try again later",
    usageInfo: "Usage Count"
  },
  "ja": {
    title: "キャンペーン予算プランナー",
    subtitle: "プロフェッショナルなキャンペーン予算計画ツールで、広告予算配分を正確に計算します",
    proBadge: "Pro会員限定",
    needAuth: "ログインが必要",
    authDescription: "キャンペーン予算プランナーを使用するには、Googleアカウントでログインしてください",
    loginButton: "Googleアカウントでログイン",
    campaignSettings: "キャンペーン設定",
    campaignDescription: "キャンペーンの目標と予算パラメータを設定してください",
    startDate: "キャンペーン開始日",
    endDate: "キャンペーン終了日",
    targetRevenue: "目標売上 (¥)",
    targetAov: "目標客単価 (¥)",
    targetConversionRate: "目標コンバージョン率 (%)",
    cpc: "クリック単価 (¥)",
    calculate: "予算を計算",
    calculating: "計算中...",
    results: "結果",
    fillFormFirst: "左側のフォームに入力して計算してください",
    totalBudget: "総予算必要額",
    totalTraffic: "総トラフィック必要数",
    budgetAllocation: "予算配分",
    period: "期間",
    budget: "予算",
    traffic: "トラフィック",
    dailyBudget: "日予算",
    dailyTraffic: "日トラフィック",
    calculationComplete: "計算完了",
    planningComplete: "キャンペーン予算計画が完了しました",
    calculationFailed: "計算失敗",
    authRequired: "再認証が必要",
    loginAgain: "再ログインして再試行してください",
    tryAgain: "後でもう一度お試しください",
    usageInfo: "使用回数"
  }
};

// Form validation schema
const campaignSchema = z.object({
  startDate: z.string().min(1, "Please select campaign start date"),
  endDate: z.string().min(1, "Please select campaign end date"),
  targetRevenue: z.number().min(1, "Target revenue must be greater than 0"),
  targetAov: z.number().min(1, "Target AOV must be greater than 0"),
  targetConversionRate: z.number().min(0.01).max(100, "Conversion rate must be between 0.01% and 100%"),
  cpc: z.number().min(0.1, "CPC must be greater than 0.1"),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface PeriodAllocation {
  period: string;
  budget: number;
  traffic: number;
  dailyBudget: number;
  dailyTraffic: number;
  days: number;
  percentage: number;
}

interface CalculationResult {
  totalTraffic: number;
  totalBudget: number;
  campaignDays: number;
  budgetBreakdown: Record<string, number>;
  trafficBreakdown: Record<string, number>;
  periodDays: Record<string, number>;
  calculations: {
    targetRevenue: number;
    targetAov: number;
    targetConversionRate: number;
    cpc: number;
    startDate: string;
    endDate: string;
  };
}

interface UsageInfo {
  current: number;
  limit: number;
  membershipLevel: string;
}

export default function CampaignPlanner({ locale = "zh-TW" }: { locale?: string }) {
  const t = translations[locale as keyof typeof translations] || translations["zh-TW"];
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: usageData } = useCampaignPlannerUsage();
  const { data: analyticsData } = useAnalyticsData();
  
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  // Removed save dialog for now

  // Get default currency values based on locale
  const getDefaultValues = () => {
    const defaults = {
      startDate: "2025-07-10",
      endDate: "2025-07-17",
    };

    switch (locale) {
      case "en":
        return {
          ...defaults,
          targetRevenue: 10000,
          targetAov: 50,
          targetConversionRate: 2.5,
          cpc: 1,
        };
      case "ja":
        return {
          ...defaults,
          targetRevenue: 1000000,
          targetAov: 6000,
          targetConversionRate: 2.0,
          cpc: 120,
        };
      default: // zh-TW
        return {
          ...defaults,
          targetRevenue: 300000,
          targetAov: 1500,
          targetConversionRate: 2.0,
          cpc: 5,
        };
    }
  };

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: getDefaultValues(),
  });

  // Auto-fill from analytics data
  const fillFromAnalytics = () => {
    if (analyticsData) {
      form.setValue("targetAov", analyticsData.averageOrderValue || form.getValues("targetAov"));
      form.setValue("targetConversionRate", analyticsData.conversionRate || form.getValues("targetConversionRate"));
    }
  };

  // Handle authentication redirect
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">檢查登入狀態中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar locale={locale} />
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold mb-4">{t.title}</h1>
            <p className="text-gray-600 mb-8">{t.authDescription}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">{t.needAuth}</h3>
              <p className="text-blue-700 mb-4">{t.authDescription}</p>
              <Button 
                onClick={() => window.location.href = '/api/auth/google'}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t.loginButton}
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const onSubmit = async (data: CampaignFormData) => {
    setIsCalculating(true);
    try {
      console.log('Submitting campaign calculation:', data);
      
      const response = await apiRequest('POST', '/api/campaign-planner/calculate', data);
      console.log('API Response:', response);

      if (response && (response as any).success) {
        const result = (response as any).result;
        const usage = (response as any).usage;
        
        setResults(result);
        setUsageInfo(usage);
        
        toast({
          title: t.calculationComplete,
          description: t.planningComplete,
          variant: "default",
        });
      } else {
        throw new Error('計算失敗');
      }
    } catch (error: any) {
      console.error('Campaign calculation error:', error);
      
      if (error.message.includes('401') || error.message.includes('Authentication')) {
        toast({
          title: t.authRequired,
          description: t.loginAgain,
          variant: "destructive",
        });
        setTimeout(() => window.location.href = '/api/auth/google', 1000);
      } else {
        toast({
          title: t.calculationFailed,
          description: error.message || t.tryAgain,
          variant: "destructive",
        });
      }
    } finally {
      setIsCalculating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    switch (locale) {
      case "en":
        return `$${amount.toLocaleString()}`;
      case "ja":
        return `¥${amount.toLocaleString()}`;
      default:
        return `NT$ ${amount.toLocaleString()}`;
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const calculatePeriodAllocations = (): PeriodAllocation[] => {
    if (!results) return [];

    const allocations: PeriodAllocation[] = [];
    const periodNames: Record<string, string> = {
      preheat: "預熱期",
      launch: "起跑期", 
      main: "活動期",
      final: "倒數期",
      repurchase: "回購期",
      day1: "第1天",
      day2: "第2天", 
      day3: "第3天",
      total: "總計"
    };

    Object.entries(results.budgetBreakdown).forEach(([period, budget]) => {
      const traffic = results.trafficBreakdown[period] || 0;
      const days = results.periodDays?.[period] || 1;
      const percentage = ((budget / results.totalBudget) * 100);

      allocations.push({
        period: periodNames[period] || period,
        budget,
        traffic,
        dailyBudget: Math.ceil(budget / days),
        dailyTraffic: Math.ceil(traffic / days),
        days,
        percentage
      });
    });

    return allocations;
  };

  const periodAllocations = calculatePeriodAllocations();

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar locale={locale} />
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="outline">{t.proBadge}</Badge>
            {usageInfo && usageInfo.membershipLevel === 'free' && (
              <Badge variant="secondary">
                {t.usageInfo}: {usageInfo.current}/{usageInfo.limit}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                {t.campaignSettings}
              </CardTitle>
              <CardDescription>
                {t.campaignDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.startDate}</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.endDate}</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="targetRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.targetRevenue}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : parseFloat(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetAov"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.targetAov}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : parseFloat(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetConversionRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.targetConversionRate}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : parseFloat(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cpc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.cpc}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : parseFloat(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {analyticsData && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={fillFromAnalytics}
                      className="w-full"
                    >
                      從 GA 數據自動填入
                    </Button>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isCalculating}
                  >
                    {isCalculating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t.calculating}
                      </>
                    ) : (
                      t.calculate
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t.results}
              </CardTitle>
              <CardDescription>
                {results ? "根據您的設定計算出的預算配置" : t.fillFormFirst}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(results.totalBudget)}
                      </div>
                      <div className="text-sm text-gray-600">{t.totalBudget}</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">
                        {formatNumber(results.totalTraffic)}
                      </div>
                      <div className="text-sm text-gray-600">{t.totalTraffic}</div>
                    </div>
                  </div>

                  {/* Period Breakdown */}
                  {periodAllocations.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        {t.budgetAllocation} ({results.campaignDays} 天活動)
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {periodAllocations.map((allocation, index) => (
                          <div key={index} className="flex-1 min-w-36 p-3 border rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-sm">{allocation.period}</span>
                              <span className="text-xs text-gray-600">
                                {allocation.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="space-y-1 text-xs">
                              <div>
                                <span className="text-gray-600">{t.budget}: </span>
                                <span className="font-medium">{formatCurrency(allocation.budget)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">{t.traffic}: </span>
                                <span className="font-medium">{formatNumber(allocation.traffic)}</span>
                              </div>
                              {allocation.days > 1 && (
                                <>
                                  <div>
                                    <span className="text-gray-600">{t.dailyBudget}: </span>
                                    <span className="font-medium">{formatCurrency(allocation.dailyBudget)}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">{t.dailyTraffic}: </span>
                                    <span className="font-medium">{formatNumber(allocation.dailyTraffic)}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Results saved automatically */}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t.fillFormFirst}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Project saving removed for now */}

      <Footer />
    </div>
  );
}