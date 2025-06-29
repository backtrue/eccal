import { useState } from "react";
import { getTranslations, type Locale } from "@/lib/i18n";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar, Calculator, TrendingUp, Target, Clock, DollarSign } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { zhTW, enUS, ja } from "date-fns/locale";
import NavigationBar from "@/components/NavigationBar";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { useMembershipStatus } from "@/hooks/useMembership";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useCampaignPlannerUsage, useRecordCampaignPlannerUsage } from "@/hooks/useCampaignPlannerUsage";
import SaveProjectDialog from "@/components/SaveProjectDialog";

const campaignPlannerSchema = z.object({
  startDate: z.string().min(1, "請選擇活動開始日期"),
  endDate: z.string().min(1, "請選擇活動結束日期"),
  targetRevenue: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.number({ invalid_type_error: '目標營業額必須是數字' }).min(1, "目標營業額必須大於 0")
  ),
  targetAov: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.number({ invalid_type_error: '目標客單價必須是數字' }).min(1, "目標客單價必須大於 0")
  ),
  targetConversionRate: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.number({ invalid_type_error: '轉換率必須是數字' }).min(0.01).max(100, "轉換率必須在 0.01% 到 100% 之間")
  ),
  cpc: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.number({ invalid_type_error: 'CPC 必須是數字' }).min(0.01, "CPC 必須大於 0.01")
  ),
});

type CampaignPlannerFormData = z.infer<typeof campaignPlannerSchema>;

interface CampaignPlannerProps {
  locale: Locale;
}

interface PlanningResult {
  totalTraffic: number;
  campaignPeriods: any;
  totalBudget: number;
  dailyBudgets: Array<{
    date: string;
    period: string;
    budget: number;
    traffic: number;
  }>;
}

export default function CampaignPlanner({ locale }: CampaignPlannerProps) {
  const t = getTranslations(locale);
  const [results, setResults] = useState<PlanningResult | null>(null);
  const { data: analyticsData } = useAnalyticsData();
  const { data: membershipStatus } = useMembershipStatus();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  // Campaign planner usage hooks
  const { data: usageData, isLoading: usageLoading } = useCampaignPlannerUsage();
  const recordUsage = useRecordCampaignPlannerUsage();
  const { toast } = useToast();

  const form = useForm<CampaignPlannerFormData>({
    resolver: zodResolver(campaignPlannerSchema),
    // 將數字欄位的預設值改為 undefined，這樣 placeholder 才會顯示
    defaultValues: {
      startDate: "",
      endDate: "",
      targetRevenue: undefined,
      targetAov: undefined,
      targetConversionRate: undefined,
      cpc: undefined,
    },
  });

  const getDateLocale = () => {
    switch (locale) {
      case 'zh-TW': return zhTW;
      case 'ja': return ja;
      default: return enUS;
    }
  };

  const fillAnalyticsData = () => {
    if (analyticsData) {
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

  const onSubmit = async (data: CampaignPlannerFormData) => {
    // Check authentication first
    if (!isAuthenticated || !user) {
      toast({
        title: "需要登入",
        description: "請先使用 Google 帳號登入才能使用活動預算規劃器。",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
      return;
    }

    // Call secure backend calculation API (removes client-side permission bypass vulnerability)
    try {
      const response = await apiRequest('POST', '/api/campaign-planner/calculate', {
        startDate: data.startDate,
        endDate: data.endDate,
        targetRevenue: data.targetRevenue,
        targetAov: data.targetAov,
        targetConversionRate: data.targetConversionRate,
        cpc: data.cpc
      });

      if (response.success) {
        // Transform backend result to frontend format
        const backendResult = response.result;
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
      console.error('Calculation failed:', error);
      
      if (error.message.includes('403') || error.message.includes('usage_limit_exceeded')) {
        toast({
          title: "使用次數已達上限",
          description: "免費會員可使用 3 次活動預算規劃器，您已使用完畢。請升級至 Pro 會員享受無限使用。",
          variant: "destructive",
        });
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

    // Generate daily budget breakdown (replicating the client logic for UI display)
    const dailyBudgets: DailyBudget[] = [];
    
    if (campaignDays === 3) {
      // 3天活動：前中後三天，首日最重、末日次重、中間最輕
      budgetRatios = {
        day1: 0.50,    // 第一天：50%
        day2: 0.25,    // 第二天：25%
        day3: 0.25     // 第三天：25%
      };
      periodDays = { total: 3 };
    } else if (campaignDays >= 4 && campaignDays <= 9) {
      // 4-9天活動：等比例縮減起跑期和倒數期天數，無預熱期和回購期
      const launchDays = Math.max(1, Math.floor(campaignDays * 0.3)); // 約30%天數
      const finalDays = Math.max(1, Math.floor(campaignDays * 0.3));  // 約30%天數
      const mainDays = campaignDays - launchDays - finalDays;
      
      budgetRatios = {
        launch: 0.45,      // 起跑期：45%
        main: 0.30,        // 活動期：30%
        final: 0.25        // 倒數期：25%
      };
      
      periodDays = {
        launch: launchDays,
        main: Math.max(1, mainDays),
        final: finalDays
      };
    } else {
      // 10天以上活動：完整5階段邏輯
      const fixedDays = {
        preheat: 4,    // 預熱期
        launch: 3,     // 起跑期  
        final: 3,      // 倒數期
        repurchase: 7  // 回購期
      };
      
      const calculatedMainDays = Math.max(1, campaignDays - (fixedDays.launch + fixedDays.final));
      
      budgetRatios = {
        preheat: 0.04,     // 預熱期：4%
        launch: 0.32,      // 起跑期：32%
        final: 0.24,       // 倒數期：24%
        repurchase: 0.02,  // 回購期：2%
        main: 0.38         // 活動期：38%（基礎比例，會隨天數調整）
      };
      
      // 如果活動天數超過20天，增加活動期預算比例
      if (campaignDays > 20) {
        const extraDays = campaignDays - 20;
        const extraBudgetRatio = Math.min(0.20, extraDays * 0.008);
        
        budgetRatios.main += extraBudgetRatio;
        budgetRatios.launch -= extraBudgetRatio * 0.6;
        budgetRatios.final -= extraBudgetRatio * 0.4;
      }
      
      periodDays = {
        preheat: fixedDays.preheat,
        launch: fixedDays.launch,
        main: calculatedMainDays,
        final: fixedDays.final,
        repurchase: fixedDays.repurchase
      };
    }
    
    // 計算總預算（先從目標營收推算）
    const requiredTrafficForRevenue = Math.ceil((data.targetRevenue / data.targetAov) / (data.targetConversionRate / 100));
    const estimatedTotalBudget = Math.ceil(requiredTrafficForRevenue * (data.cpc || 5) * 1.15); // 增加15%緩衝
    
    // 根據活動類型分配預算
    let budgetBreakdown: any = {};
    let totalBudget = 0;
    
    if (campaignDays === 3) {
      // 3天活動預算分配
      budgetBreakdown = {
        day1: Math.ceil(estimatedTotalBudget * budgetRatios.day1),
        day2: Math.ceil(estimatedTotalBudget * budgetRatios.day2),
        day3: Math.ceil(estimatedTotalBudget * budgetRatios.day3)
      };
      totalBudget = budgetBreakdown.day1 + budgetBreakdown.day2 + budgetBreakdown.day3;
    } else if (campaignDays >= 4 && campaignDays <= 9) {
      // 4-9天活動預算分配
      budgetBreakdown = {
        launch: Math.ceil(estimatedTotalBudget * budgetRatios.launch),
        main: Math.ceil(estimatedTotalBudget * budgetRatios.main),
        final: Math.ceil(estimatedTotalBudget * budgetRatios.final)
      };
      totalBudget = budgetBreakdown.launch + budgetBreakdown.main + budgetBreakdown.final;
    } else {
      // 10天以上活動預算分配
      budgetBreakdown = {
        preheat: Math.ceil(estimatedTotalBudget * budgetRatios.preheat),
        launch: Math.ceil(estimatedTotalBudget * budgetRatios.launch),
        main: Math.ceil(estimatedTotalBudget * budgetRatios.main),
        final: Math.ceil(estimatedTotalBudget * budgetRatios.final),
        repurchase: Math.ceil(estimatedTotalBudget * budgetRatios.repurchase)
      };
      totalBudget = budgetBreakdown.preheat + budgetBreakdown.launch + budgetBreakdown.main + budgetBreakdown.final + budgetBreakdown.repurchase;
    }
    
    // 根據活動類型計算各期間流量
    let trafficBreakdown: any = {};
    
    const cpcValue = data.cpc || 5; // 預設 CPC 為 5
    
    if (campaignDays === 3) {
      trafficBreakdown = {
        day1: Math.ceil(budgetBreakdown.day1 / cpcValue),
        day2: Math.ceil(budgetBreakdown.day2 / cpcValue),
        day3: Math.ceil(budgetBreakdown.day3 / cpcValue)
      };
    } else if (campaignDays >= 4 && campaignDays <= 9) {
      trafficBreakdown = {
        launch: Math.ceil(budgetBreakdown.launch / cpcValue),
        main: Math.ceil(budgetBreakdown.main / cpcValue),
        final: Math.ceil(budgetBreakdown.final / cpcValue)
      };
    } else {
      trafficBreakdown = {
        preheat: Math.ceil(budgetBreakdown.preheat / cpcValue),
        launch: Math.ceil(budgetBreakdown.launch / cpcValue),
        main: Math.ceil(budgetBreakdown.main / cpcValue),
        final: Math.ceil(budgetBreakdown.final / cpcValue),
        repurchase: Math.ceil(budgetBreakdown.repurchase / cpcValue)
      };
    }
    
    // 計算各期間日期
    const preheatStart = format(subDays(startDate, 4), 'yyyy-MM-dd');
    const preheatEnd = format(subDays(startDate, 1), 'yyyy-MM-dd');
    
    const launchStart = format(startDate, 'yyyy-MM-dd');
    const launchEnd = format(addDays(startDate, 2), 'yyyy-MM-dd');
    
    const mainStart = format(addDays(startDate, 3), 'yyyy-MM-dd');
    const mainEnd = format(subDays(endDate, 3), 'yyyy-MM-dd');
    
    const finalStart = format(subDays(endDate, 2), 'yyyy-MM-dd');
    const finalEnd = format(endDate, 'yyyy-MM-dd');
    
    const repurchaseStart = format(addDays(endDate, 1), 'yyyy-MM-dd');
    const repurchaseEnd = format(addDays(endDate, 7), 'yyyy-MM-dd');
    
    // 生成每日預算分配
    const dailyBudgets: Array<{
      date: string;
      period: string;
      budget: number;
      traffic: number;
    }> = [];
    
    if (campaignDays === 3) {
      // 3天活動：直接分配到每一天
      const days = ['第一天', '第二天', '第三天'];
      const budgets = [budgetBreakdown.day1, budgetBreakdown.day2, budgetBreakdown.day3];
      const traffics = [trafficBreakdown.day1, trafficBreakdown.day2, trafficBreakdown.day3];
      
      for (let i = 0; i < 3; i++) {
        const date = format(addDays(startDate, i), 'yyyy-MM-dd');
        dailyBudgets.push({
          date,
          period: days[i],
          budget: budgets[i],
          traffic: traffics[i],
        });
      }
    } else if (campaignDays >= 4 && campaignDays <= 9) {
      // 4-9天活動：起跑期 + 活動期 + 倒數期
      
      // 起跑期
      for (let i = 0; i < periodDays.launch; i++) {
        const date = format(addDays(startDate, i), 'yyyy-MM-dd');
        dailyBudgets.push({
          date,
          period: '起跑期',
          budget: Math.ceil(budgetBreakdown.launch / periodDays.launch),
          traffic: Math.ceil(trafficBreakdown.launch / periodDays.launch),
        });
      }
      
      // 活動期
      for (let i = 0; i < periodDays.main; i++) {
        const date = format(addDays(startDate, periodDays.launch + i), 'yyyy-MM-dd');
        dailyBudgets.push({
          date,
          period: '活動期',
          budget: Math.ceil(budgetBreakdown.main / periodDays.main),
          traffic: Math.ceil(trafficBreakdown.main / periodDays.main),
        });
      }
      
      // 倒數期
      for (let i = 0; i < periodDays.final; i++) {
        const date = format(addDays(startDate, periodDays.launch + periodDays.main + i), 'yyyy-MM-dd');
        dailyBudgets.push({
          date,
          period: '倒數期',
          budget: Math.ceil(budgetBreakdown.final / periodDays.final),
          traffic: Math.ceil(trafficBreakdown.final / periodDays.final),
        });
      }
    } else {
      // 10天以上活動：完整5階段
      
      // 預熱期（4天）
      for (let i = 0; i < 4; i++) {
        const date = format(subDays(startDate, 4 - i), 'yyyy-MM-dd');
        dailyBudgets.push({
          date,
          period: '預熱期',
          budget: Math.ceil(budgetBreakdown.preheat / 4),
          traffic: Math.ceil(trafficBreakdown.preheat / 4),
        });
      }
      
      // 起跑期（3天）
      for (let i = 0; i < 3; i++) {
        const date = format(addDays(startDate, i), 'yyyy-MM-dd');
        dailyBudgets.push({
          date,
          period: '起跑期',
          budget: Math.ceil(budgetBreakdown.launch / 3),
          traffic: Math.ceil(trafficBreakdown.launch / 3),
        });
      }
      
      // 活動期（動態天數）
      for (let i = 0; i < periodDays.main; i++) {
        const date = format(addDays(startDate, 3 + i), 'yyyy-MM-dd');
        dailyBudgets.push({
          date,
          period: '活動期',
          budget: Math.ceil(budgetBreakdown.main / periodDays.main),
          traffic: Math.ceil(trafficBreakdown.main / periodDays.main),
        });
      }
      
      // 倒數期（3天）
      for (let i = 0; i < 3; i++) {
        const date = format(subDays(endDate, 2 - i), 'yyyy-MM-dd');
        dailyBudgets.push({
          date,
          period: '倒數期',
          budget: Math.ceil(budgetBreakdown.final / 3),
          traffic: Math.ceil(trafficBreakdown.final / 3),
        });
      }
      
      // 回購期（7天）
      for (let i = 0; i < 7; i++) {
        const date = format(addDays(endDate, 1 + i), 'yyyy-MM-dd');
        dailyBudgets.push({
          date,
          period: '回購期',
          budget: Math.ceil(budgetBreakdown.repurchase / 7),
          traffic: Math.ceil(trafficBreakdown.repurchase / 7),
        });
      }
    }

    // 根據活動類型構建結果物件
    let result: PlanningResult;
    
    if (campaignDays === 3) {
      // 3天活動結果
      result = {
        totalTraffic,
        campaignPeriods: {
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
        },
        totalBudget,
        dailyBudgets,
      };
    } else if (campaignDays >= 4 && campaignDays <= 9) {
      // 4-9天活動結果
      result = {
        totalTraffic,
        campaignPeriods: {
          launch: {
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(addDays(startDate, periodDays.launch - 1), 'yyyy-MM-dd'),
            budget: budgetBreakdown.launch,
            traffic: trafficBreakdown.launch,
          },
          main: {
            startDate: format(addDays(startDate, periodDays.launch), 'yyyy-MM-dd'),
            endDate: format(addDays(startDate, periodDays.launch + periodDays.main - 1), 'yyyy-MM-dd'),
            budget: budgetBreakdown.main,
            traffic: trafficBreakdown.main,
          },
          final: {
            startDate: format(addDays(startDate, periodDays.launch + periodDays.main), 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd'),
            budget: budgetBreakdown.final,
            traffic: trafficBreakdown.final,
          },
        },
        totalBudget,
        dailyBudgets,
      };
    } else {
      // 10天以上活動結果
      result = {
        totalTraffic,
        campaignPeriods: {
          preheat: {
            startDate: format(subDays(startDate, 4), 'yyyy-MM-dd'),
            endDate: format(subDays(startDate, 1), 'yyyy-MM-dd'),
            budget: budgetBreakdown.preheat,
            traffic: trafficBreakdown.preheat,
          },
          launch: {
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(addDays(startDate, 2), 'yyyy-MM-dd'),
            budget: budgetBreakdown.launch,
            traffic: trafficBreakdown.launch,
          },
          main: {
            startDate: format(addDays(startDate, 3), 'yyyy-MM-dd'),
            endDate: format(subDays(endDate, 3), 'yyyy-MM-dd'),
            budget: budgetBreakdown.main,
            traffic: trafficBreakdown.main,
          },
          final: {
            startDate: format(subDays(endDate, 2), 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd'),
            budget: budgetBreakdown.final,
            traffic: trafficBreakdown.final,
          },
          repurchase: {
            startDate: format(addDays(endDate, 1), 'yyyy-MM-dd'),
            endDate: format(addDays(endDate, 7), 'yyyy-MM-dd'),
            budget: budgetBreakdown.repurchase,
            traffic: trafficBreakdown.repurchase,
          },
        },
        totalBudget,
        dailyBudgets,
      };
    }

    setResults(result);
    
    // Record usage for free users after successful calculation
    console.log('Usage info:', usageInfo);
    if (usageInfo && usageInfo.membershipStatus?.level === 'free') {
      console.log('Recording usage for free user...');
      try {
        await recordUsage.mutateAsync();
        console.log('Usage recorded successfully');
      } catch (error) {
        console.error('Failed to record usage:', error);
        // Don't block the user even if usage recording fails
      }
    } else {
      console.log('Not recording usage - either Pro user or no usage info');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar locale={locale} />
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
                活動規劃設定
              </CardTitle>
              <CardDescription>
                設定您的活動參數以獲得完整的預算規劃建議
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

                  <FormField
                    control={form.control}
                    name="targetRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>活動期間目標營業額</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="例如：500000"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          設定活動期間希望達成的總營業額
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetAov"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>活動產品目標客單價</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            inputMode="decimal"
                            pattern="[0-9]*"
                            step="0.01"
                            placeholder="例如：1200"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          活動期間預期的平均客單價
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetConversionRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          活動目標轉換率 (%)
                          {analyticsData && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={fillAnalyticsData}
                              className="ml-2"
                            >
                              <TrendingUp className="h-4 w-4 mr-1" />
                              使用 GA 數據建議
                            </Button>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            inputMode="decimal"
                            pattern="[0-9.]*"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="例如：2.5"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          {analyticsData ? (
                            <>
                              過去 28 天平均轉換率：{analyticsData.conversionRate.toFixed(2)}%
                              <br />
                              建議轉換率會根據客單價差異自動調整
                            </>
                          ) : (
                            "設定活動期間預期的轉換率"
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cpc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>預估 CPC</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder={`例如：${locale === 'zh-TW' ? '5' : locale === 'ja' ? '120' : '1'}`}
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          預估的每次點擊成本
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full"
                    // TODO: Re-enable Pro restriction after testing
                    // disabled={!membershipStatus || membershipStatus?.level !== 'pro' || !membershipStatus?.isActive}
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    計算活動規劃
                    {/* TODO: Re-enable Pro check after testing */}
                    {/* {(!membershipStatus || membershipStatus?.level !== 'pro' || !membershipStatus?.isActive) 
                      ? '需要 Pro 會員才能計算' 
                      : '計算活動規劃'
                    } */}
                  </Button>
                  
                  {/* TODO: Re-enable Pro upgrade prompt after testing */}
                  {/* {(!membershipStatus || membershipStatus?.level !== 'pro' || !membershipStatus?.isActive) && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-amber-800 text-sm font-medium">
                        活動預算規劃器是 Pro 會員專屬功能
                      </p>
                      <p className="text-amber-700 text-sm mt-1">
                        請先登入並升級至 Pro 會員即可使用完整的活動預算規劃功能，包含 8 步驟專業規劃流程。
                      </p>
                    </div>
                  )} */}
                  
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm font-medium">
                      🧪 測試模式
                    </p>
                    <p className="text-blue-700 text-sm mt-1">
                      Pro 會員限制已暫時關閉，可以直接測試活動預算規劃功能。
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {results && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      活動規劃結果
                    </CardTitle>
                    <CardDescription>
                      完整的活動預算與流量分配建議
                    </CardDescription>
                  </div>
                  <SaveProjectDialog
                    projectData={form.getValues()}
                    calculationResult={results}
                    projectType="campaign_planner"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {results.totalBudget.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">總預算</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {results.totalTraffic.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">總流量需求</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Object.keys(results.campaignPeriods).length}
                    </div>
                    <div className="text-sm text-gray-600">活動階段數</div>
                  </div>
                </div>

                <Separator />

                {/* 預算分配分析 */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    動態預算分配分析
                  </h3>
                  <div className={`grid gap-2 text-xs ${Object.keys(results.campaignPeriods).length === 3 ? 'grid-cols-3' : Object.keys(results.campaignPeriods).length === 5 ? 'grid-cols-5' : 'grid-cols-3'}`}>
                    {Object.entries(results.campaignPeriods).map(([key, period], index) => {
                      const colors = ['bg-gray-200', 'bg-red-200', 'bg-blue-200', 'bg-yellow-200', 'bg-green-200'];
                      const typedPeriod = period as { budget: number; traffic: number; startDate: string; endDate: string };
                      const percentage = (typedPeriod.budget / results.totalBudget * 100);
                      const periodNames: {[key: string]: string} = {
                        'preheat': '預熱期',
                        'launch': '起跑期', 
                        'main': '活動期',
                        'final': '倒數期',
                        'repurchase': '回購期',
                        'day1': '第一天',
                        'day2': '第二天',
                        'day3': '第三天'
                      };
                      return (
                        <div key={key} className={`p-2 rounded-lg ${colors[index % colors.length]}`}>
                          <div className="font-semibold text-gray-800">{periodNames[key] || key}</div>
                          <div className="text-gray-700">{percentage.toFixed(1)}%</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <strong>智能分配邏輯：</strong>
                    活動期預算會根據活動總天數自動調整，長期活動會增加活動期比例以避免中段失血，短期活動則重點投放起跑期與倒數期確保瞬間爆發效果。
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    活動期間規劃
                  </h3>
                  
                  <div className="overflow-x-auto w-full">
                    <div className="flex flex-row gap-4 w-full justify-start items-stretch"
                         style={{ display: 'flex', flexDirection: 'row', minWidth: 'max-content' }}>
                      {Object.entries(results.campaignPeriods).map(([key, period]) => {
                        const typedPeriod = period as { budget: number; traffic: number; startDate: string; endDate: string };
                        const periodNames: {[key: string]: string} = {
                          'preheat': '預熱期',
                          'launch': '起跑期', 
                          'main': '活動期',
                          'final': '倒數期',
                          'repurchase': '回購期',
                          'day1': '第一天',
                          'day2': '第二天',
                          'day3': '第三天'
                        };
                        
                        const daysDiff = Math.ceil((new Date(typedPeriod.endDate).getTime() - new Date(typedPeriod.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                        const dailyBudget = Math.ceil(typedPeriod.budget / Math.max(1, daysDiff));
                        const dailyTraffic = Math.ceil(typedPeriod.traffic / Math.max(1, daysDiff));
                        
                        return (
                          <div key={key} 
                               className="text-center space-y-3 p-4 bg-gray-50 rounded-lg flex-shrink-0" 
                               style={{ minWidth: '180px', flex: '0 0 auto' }}>
                            <div className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2">
                              {periodNames[key] || key}
                            </div>
                            
                            <div className="space-y-1">
                              <div className="text-xs text-gray-500 font-medium">日期</div>
                              <div className="text-xs text-gray-700">
                                {new Date(typedPeriod.startDate).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })} - {new Date(typedPeriod.endDate).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="text-xs text-gray-500 font-medium">總預算</div>
                              <div className="text-lg font-bold text-gray-900">
                                ${typedPeriod.budget.toLocaleString()}
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="text-xs text-gray-500 font-medium">日預算</div>
                              <div className="text-sm font-semibold text-green-600">
                                ${dailyBudget.toLocaleString()}
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="text-xs text-gray-500 font-medium">日流量</div>
                              <div className="text-sm font-semibold text-blue-600">
                                {dailyTraffic.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    每日預算詳細規劃
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-3 py-2 text-left">日期</th>
                          <th className="border border-gray-200 px-3 py-2 text-left">期間</th>
                          <th className="border border-gray-200 px-3 py-2 text-right">預算</th>
                          <th className="border border-gray-200 px-3 py-2 text-right">流量</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.dailyBudgets.map((day, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-200 px-3 py-2">
                              {new Date(day.date).toLocaleDateString('zh-TW', { 
                                month: 'numeric', 
                                day: 'numeric',
                                weekday: 'short'
                              })}
                            </td>
                            <td className="border border-gray-200 px-3 py-2">
                              <Badge variant="outline" className="text-xs">
                                {day.period}
                              </Badge>
                            </td>
                            <td className="border border-gray-200 px-3 py-2 text-right font-medium">
                              ${day.budget.toLocaleString()}
                            </td>
                            <td className="border border-gray-200 px-3 py-2 text-right">
                              {day.traffic.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}