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
import SaveProjectDialog from "@/components/SaveProjectDialog";
import Footer from "@/components/Footer";

// Form validation schema
const campaignPlannerSchema = z.object({
  startDate: z.string().min(1, "請選擇活動開始日期"),
  endDate: z.string().min(1, "請選擇活動結束日期"),
  targetRevenue: z.number().min(1, "目標營收必須大於0"),
  targetAov: z.number().min(1, "目標客單價必須大於0"),
  targetConversionRate: z.number().min(0.01).max(100, "轉換率必須介於0.01%到100%之間"),
  cpc: z.number().min(0.1, "CPC必須大於0.1"),
});

type CampaignPlannerFormData = z.infer<typeof campaignPlannerSchema>;

interface PlanningResult {
  totalTraffic: number;
  totalBudget: number;
  campaignPeriods: any;
  dailyBudgets?: any[];
}

interface DailyBudget {
  date: string;
  period: string;
  budget: number;
  traffic: number;
}

export default function CampaignPlanner({ locale = "zh-TW" }: { locale?: string }) {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { data: usageData, refetch: refetchUsage } = useCampaignPlannerUsage();
  const { data: analyticsData } = useAnalyticsData();
  const [results, setResults] = useState<PlanningResult | null>(null);

  const form = useForm<CampaignPlannerFormData>({
    resolver: zodResolver(campaignPlannerSchema),
    defaultValues: {
      startDate: undefined,
      endDate: undefined,
      targetRevenue: undefined,
      targetAov: undefined,
      targetConversionRate: undefined,
      cpc: 5,
    },
  });

  const fillFromAnalytics = () => {
    if (analyticsData?.averageOrderValue) {
      form.setValue('targetAov', analyticsData.averageOrderValue);
    }
    
    if (analyticsData?.conversionRate) {
      // Calculate suggested conversion rate based on AOV difference
      const suggestedConversionRate = calculateSuggestedConversionRate(
        analyticsData.conversionRate,
        analyticsData.averageOrderValue,
        form.getValues('targetAov')
      );
      
      form.setValue('targetConversionRate', suggestedConversionRate);
    }
  };

  const calculateSuggestedConversionRate = (
    avgConversionRate: number,
    avgAov: number,
    targetAov: number
  ): number => {
    if (avgAov === 0) return avgConversionRate;
    
    const aovAdjustment = (avgAov - targetAov) / avgAov;
    const suggestedRate = avgConversionRate * (1 + aovAdjustment);
    
    return Math.max(0.01, Math.min(100, suggestedRate));
  };

  // Secure backend calculation API call
  const onSubmit = async (data: CampaignPlannerFormData) => {
    // Check authentication first
    if (!isAuthenticated || !user) {
      toast({
        title: "需要登入",
        description: "請先使用 Google 帳號登入才能使用活動預算規劃器。",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/auth/google";
      }, 1000);
      return;
    }

    try {
      const response = await apiRequest('POST', '/api/campaign-planner/calculate', {
        startDate: data.startDate,
        endDate: data.endDate,
        targetRevenue: data.targetRevenue,
        targetAov: data.targetAov,
        targetConversionRate: data.targetConversionRate,
        cpc: data.cpc
      });

      if ((response as any).success) {
        // Transform backend result to frontend format
        const backendResult = (response as any).result;
        const frontendResult = transformBackendToFrontendResult(backendResult, data);
        setResults(frontendResult);
        
        // Update usage info from backend response
        refetchUsage();
        
        toast({
          title: "計算完成",
          description: "活動預算規劃已完成，請查看結果",
          variant: "default",
        });
      }
    } catch (error: any) {
      if (error.message.includes('403') || error.message.includes('usage_limit_exceeded')) {
        toast({
          title: "使用次數已達上限",
          description: "免費會員可使用 3 次活動預算規劃器，您已使用完畢。請升級至 Pro 會員享受無限使用。",
          variant: "destructive",
        });
      } else if (error.message.includes('401') || error.message.includes('Authentication required')) {
        toast({
          title: "需要重新登入",
          description: "您的登入狀態已過期，正在重新導向登入頁面...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/auth/google";
        }, 1000);
      } else {
        toast({
          title: "計算失敗",
          description: "活動預算計算發生錯誤，請稍後再試",
          variant: "destructive",
        });
      }
      return;
    }
  };

  // Transform backend calculation result to frontend PlanningResult format
  const transformBackendToFrontendResult = (backendResult: any, inputData: CampaignPlannerFormData): PlanningResult => {
    const { totalTraffic, totalBudget, campaignDays, budgetBreakdown, trafficBreakdown, periodDays } = backendResult;
    const startDate = new Date(inputData.startDate);
    const endDate = new Date(inputData.endDate);

    // Generate daily budget breakdown for UI display
    const dailyBudgets: DailyBudget[] = [];

    // Build campaign periods based on campaign type
    let campaignPeriods: any = {};

    if (campaignDays === 3) {
      // 3-day campaign structure
      campaignPeriods = {
        day1: {
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(startDate, 'yyyy-MM-dd'),
          budget: budgetBreakdown.day1,
          traffic: trafficBreakdown.day1,
        },
        day2: {
          startDate: format(addDays(startDate, 1), 'yyyy-MM-dd'),
          endDate: format(addDays(startDate, 1), 'yyyy-MM-dd'),
          budget: budgetBreakdown.day2,
          traffic: trafficBreakdown.day2,
        },
        day3: {
          startDate: format(addDays(startDate, 2), 'yyyy-MM-dd'),
          endDate: format(addDays(startDate, 2), 'yyyy-MM-dd'),
          budget: budgetBreakdown.day3,
          traffic: trafficBreakdown.day3,
        },
      };

      // Generate daily budgets for 3-day campaign
      for (let i = 0; i < 3; i++) {
        const date = format(addDays(startDate, i), 'yyyy-MM-dd');
        const periods = ['第一天', '第二天', '第三天'];
        const budgets = [budgetBreakdown.day1, budgetBreakdown.day2, budgetBreakdown.day3];
        const traffics = [trafficBreakdown.day1, trafficBreakdown.day2, trafficBreakdown.day3];
        
        dailyBudgets.push({
          date,
          period: periods[i],
          budget: budgets[i],
          traffic: traffics[i],
        });
      }
    } else if (campaignDays >= 4 && campaignDays <= 9) {
      // 4-9 day campaign structure
      const launchDays = periodDays?.launch || Math.floor(campaignDays * 0.3);
      const mainDays = periodDays?.main || Math.max(1, campaignDays - launchDays - (periodDays?.final || Math.floor(campaignDays * 0.3)));
      
      campaignPeriods = {
        launch: {
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(addDays(startDate, launchDays - 1), 'yyyy-MM-dd'),
          budget: budgetBreakdown.launch || 0,
          traffic: trafficBreakdown.launch || 0,
        },
        main: {
          startDate: format(addDays(startDate, launchDays), 'yyyy-MM-dd'),
          endDate: format(addDays(startDate, launchDays + mainDays - 1), 'yyyy-MM-dd'),
          budget: budgetBreakdown.main || 0,
          traffic: trafficBreakdown.main || 0,
        },
        final: {
          startDate: format(addDays(startDate, launchDays + mainDays), 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
          budget: budgetBreakdown.final || 0,
          traffic: trafficBreakdown.final || 0,
        },
      };
    } else {
      // 10+ day campaign structure (full 5 periods)
      const preheatDays = periodDays?.preheat || 4;
      const launchDays = periodDays?.launch || 3;
      const finalDays = periodDays?.final || 3;
      const repurchaseDays = periodDays?.repurchase || 7;
      const mainDays = periodDays?.main || Math.max(1, campaignDays - launchDays - finalDays);
      
      campaignPeriods = {
        preheat: {
          startDate: format(subDays(startDate, preheatDays), 'yyyy-MM-dd'),
          endDate: format(subDays(startDate, 1), 'yyyy-MM-dd'),
          budget: budgetBreakdown.preheat || 0,
          traffic: trafficBreakdown.preheat || 0,
        },
        launch: {
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(addDays(startDate, launchDays - 1), 'yyyy-MM-dd'),
          budget: budgetBreakdown.launch || 0,
          traffic: trafficBreakdown.launch || 0,
        },
        main: {
          startDate: format(addDays(startDate, launchDays), 'yyyy-MM-dd'),
          endDate: format(addDays(startDate, launchDays + mainDays - 1), 'yyyy-MM-dd'),
          budget: budgetBreakdown.main || 0,
          traffic: trafficBreakdown.main || 0,
        },
        final: {
          startDate: format(addDays(startDate, launchDays + mainDays), 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
          budget: budgetBreakdown.final || 0,
          traffic: trafficBreakdown.final || 0,
        },
        repurchase: {
          startDate: format(addDays(endDate, 1), 'yyyy-MM-dd'),
          endDate: format(addDays(endDate, repurchaseDays), 'yyyy-MM-dd'),
          budget: budgetBreakdown.repurchase || 0,
          traffic: trafficBreakdown.repurchase || 0,
        },
      };
    }

    return {
      totalTraffic,
      totalBudget,
      campaignPeriods,
      dailyBudgets,
    };
  };

  const formatCurrency = (amount: number) => {
    return `NT$ ${amount.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar locale="zh-TW" />
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">活動預算規劃器</h1>
          <p className="text-gray-600">專業的活動預算規劃工具，採用動態預算分配演算法，適合各種活動週期</p>
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">🚀 動態預算分配技術</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• <strong>短期活動</strong>（10-20天）：起跑期重點投放，確保瞬間流量爆發</p>
              <p>• <strong>長期活動</strong>（30-60天）：自動增加活動期預算，避免中段失血</p>
              <p>• <strong>智能調配</strong>：活動期預算隨天數動態調整，保持熱度不間斷</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="outline">Pro 會員專屬</Badge>
            {!isAuthenticated ? (
              <Badge variant="destructive">需要 Google 登入</Badge>
            ) : (usageData as any)?.membershipStatus?.level === 'pro' && (usageData as any)?.membershipStatus?.isActive ? (
              <Badge variant="default">Pro 會員 - 無限使用</Badge>
            ) : (
              <Badge variant="secondary">
                免費試用 剩餘 {Math.max(0, 3 - ((usageData as any)?.usage || 0))}/3 次
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                活動參數設定
              </CardTitle>
              <CardDescription>
                請輸入您的活動基本資訊，系統將自動計算最佳預算分配
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>活動開始日期</FormLabel>
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
                          <FormLabel>活動結束日期</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="targetRevenue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>目標營收 (NT$)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="例如：100000"
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
                          <FormLabel>目標客單價 (NT$)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="例如：1200"
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="targetConversionRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>目標轉換率 (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="例如：2.5"
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
                          <FormLabel>每次點擊成本 (NT$)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="例如：5"
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
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    開始計算活動預算
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {results && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  活動預算規劃結果
                </CardTitle>
                <CardDescription>根據您的活動參數計算出的最佳預算分配</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(results.totalBudget)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">總預算</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {results.totalTraffic.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">總流量</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-gray-800">活動期間預算分配</h4>
                    {isAuthenticated && (
                      <SaveProjectDialog 
                        projectType="campaign_planner"
                        projectData={{
                          ...form.getValues(),
                          results: results
                        }}
                      />
                    )}
                  </div>
                  
                  {/* Display campaign periods based on structure */}
                  <div className="grid gap-3">
                    {Object.entries(results.campaignPeriods).map(([period, data]: [string, any]) => {
                      const periodNames: { [key: string]: string } = {
                        preheat: '預熱期',
                        launch: '起跑期',
                        main: '活動期',
                        final: '倒數期',
                        repurchase: '回購期',
                        day1: '第一天',
                        day2: '第二天',
                        day3: '第三天'
                      };
                      
                      return (
                        <div key={period} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">{periodNames[period]}</div>
                            <div className="text-sm text-gray-500">
                              {data.startDate} - {data.endDate}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(data.budget)}</div>
                            <div className="text-sm text-gray-500">{data.traffic.toLocaleString()} 流量</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}