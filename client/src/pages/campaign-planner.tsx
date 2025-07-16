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
import { transformBackendToFrontendResult } from "@/utils/transformResult";
import { CampaignPlannerFormData, PlanningResult } from "@/types/campaign-planner";

// Form validation schema
const campaignPlannerSchema = z.object({
  startDate: z.string().min(1, "請選擇活動開始日期"),
  endDate: z.string().min(1, "請選擇活動結束日期"),
  targetRevenue: z.number().min(1, "目標營收必須大於0"),
  targetAov: z.number().min(1, "目標客單價必須大於0"),
  targetConversionRate: z.number().min(0.01).max(100, "轉換率必須介於0.01%到100%之間"),
  cpc: z.number().min(0.1, "CPC必須大於0.1"),
});

type CampaignPlannerFormDataLocal = z.infer<typeof campaignPlannerSchema>;



export default function CampaignPlanner({ locale = "zh-TW" }: { locale?: string }) {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { data: usageData, refetch: refetchUsage } = useCampaignPlannerUsage();
  const { data: analyticsData } = useAnalyticsData();
  const [results, setResults] = useState<PlanningResult | null>(null);

  const form = useForm<CampaignPlannerFormDataLocal>({
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
  const onSubmit = async (data: CampaignPlannerFormDataLocal) => {
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

    try {
      const response = await apiRequest('POST', '/api/v2/campaign-planner/create', {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        targetRevenue: data.targetRevenue,
        targetAov: data.targetAov,
        targetConversionRate: data.targetConversionRate,
        cpc: data.cpc
      });

      if ((response as any).success) {
        // Transform backend result to frontend format
        const backendResult = (response as any).data;
        console.log('Backend result:', backendResult);
        console.log('Backend funnelAllocation:', backendResult.funnelAllocation);
        
        const frontendResult = transformBackendToFrontendResult(backendResult, data);
        console.log('Frontend result:', frontendResult);
        console.log('Frontend funnelAllocation:', frontendResult.funnelAllocation);
        
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
            <div className="space-y-6">
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

              {/* 漏斗架構分配建議 */}
              {results && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      漏斗架構分配建議
                    </CardTitle>
                    <CardDescription>
                      根據活動期間特性，為您規劃最佳的廣告受眾預算分配策略
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* 預熱期漏斗分配 */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold text-lg mb-4 text-gray-800">
                          預熱期 漏斗分配
                        </h5>
                        
                        <div className="space-y-3">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-blue-800">
                                認知廣告 (Awareness)
                              </span>
                              <span className="text-blue-600 font-semibold">
                                40% · {formatCurrency(results.totalBudget * 0.04 * 0.4)}
                              </span>
                            </div>
                            <p className="text-sm text-blue-700">
                              建立品牌認知度，觸及潛在客戶群體
                            </p>
                          </div>

                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-green-800">
                                興趣廣告 (Interest)
                              </span>
                              <span className="text-green-600 font-semibold">
                                35% · {formatCurrency(results.totalBudget * 0.04 * 0.35)}
                              </span>
                            </div>
                            <p className="text-sm text-green-700">
                              吸引感興趣的用戶，建立初步連結
                            </p>
                          </div>

                          <div className="bg-yellow-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-yellow-800">
                                考慮廣告 (Consideration)
                              </span>
                              <span className="text-yellow-600 font-semibold">
                                25% · {formatCurrency(results.totalBudget * 0.04 * 0.25)}
                              </span>
                            </div>
                            <p className="text-sm text-yellow-700">
                              促使用戶深入了解產品，提高購買意願
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 啟動期漏斗分配 */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold text-lg mb-4 text-gray-800">
                          啟動期 漏斗分配
                        </h5>
                        
                        <div className="space-y-3">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-blue-800">
                                認知廣告 (Awareness)
                              </span>
                              <span className="text-blue-600 font-semibold">
                                30% · {formatCurrency(results.totalBudget * 0.32 * 0.3)}
                              </span>
                            </div>
                            <p className="text-sm text-blue-700">
                              持續擴大品牌曝光，觸及更多潛在客戶
                            </p>
                          </div>

                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-green-800">
                                興趣廣告 (Interest)
                              </span>
                              <span className="text-green-600 font-semibold">
                                25% · {formatCurrency(results.totalBudget * 0.32 * 0.25)}
                              </span>
                            </div>
                            <p className="text-sm text-green-700">
                              強化用戶興趣，提高互動率
                            </p>
                          </div>

                          <div className="bg-yellow-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-yellow-800">
                                考慮廣告 (Consideration)
                              </span>
                              <span className="text-yellow-600 font-semibold">
                                35% · {formatCurrency(results.totalBudget * 0.32 * 0.35)}
                              </span>
                            </div>
                            <p className="text-sm text-yellow-700">
                              加強產品介紹，建立購買信心
                            </p>
                          </div>

                          <div className="bg-red-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-red-800">
                                轉換廣告 (Conversion)
                              </span>
                              <span className="text-red-600 font-semibold">
                                10% · {formatCurrency(results.totalBudget * 0.32 * 0.1)}
                              </span>
                            </div>
                            <p className="text-sm text-red-700">
                              針對高意願客戶，促成首批轉換
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 主推期漏斗分配 */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold text-lg mb-4 text-gray-800">
                          主推期 漏斗分配
                        </h5>
                        
                        <div className="space-y-3">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-blue-800">
                                認知廣告 (Awareness)
                              </span>
                              <span className="text-blue-600 font-semibold">
                                20% · {formatCurrency(results.totalBudget * 0.38 * 0.2)}
                              </span>
                            </div>
                            <p className="text-sm text-blue-700">
                              維持品牌曝光，持續獲取新客戶
                            </p>
                          </div>

                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-green-800">
                                興趣廣告 (Interest)
                              </span>
                              <span className="text-green-600 font-semibold">
                                20% · {formatCurrency(results.totalBudget * 0.38 * 0.2)}
                              </span>
                            </div>
                            <p className="text-sm text-green-700">
                              持續培養用戶興趣，建立品牌好感
                            </p>
                          </div>

                          <div className="bg-yellow-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-yellow-800">
                                考慮廣告 (Consideration)
                              </span>
                              <span className="text-yellow-600 font-semibold">
                                30% · {formatCurrency(results.totalBudget * 0.38 * 0.3)}
                              </span>
                            </div>
                            <p className="text-sm text-yellow-700">
                              強化產品優勢，消除購買疑慮
                            </p>
                          </div>

                          <div className="bg-red-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-red-800">
                                轉換廣告 (Conversion)
                              </span>
                              <span className="text-red-600 font-semibold">
                                30% · {formatCurrency(results.totalBudget * 0.38 * 0.3)}
                              </span>
                            </div>
                            <p className="text-sm text-red-700">
                              全力促成轉換，達成銷售目標
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 收尾期漏斗分配 */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold text-lg mb-4 text-gray-800">
                          收尾期 漏斗分配
                        </h5>
                        
                        <div className="space-y-3">
                          <div className="bg-yellow-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-yellow-800">
                                考慮廣告 (Consideration)
                              </span>
                              <span className="text-yellow-600 font-semibold">
                                20% · {formatCurrency(results.totalBudget * 0.24 * 0.2)}
                              </span>
                            </div>
                            <p className="text-sm text-yellow-700">
                              最後推動猶豫客戶下單決定
                            </p>
                          </div>

                          <div className="bg-red-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-red-800">
                                轉換廣告 (Conversion)
                              </span>
                              <span className="text-red-600 font-semibold">
                                50% · {formatCurrency(results.totalBudget * 0.24 * 0.5)}
                              </span>
                            </div>
                            <p className="text-sm text-red-700">
                              集中火力促成最後轉換機會
                            </p>
                          </div>

                          <div className="bg-purple-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-purple-800">
                                再行銷 (Retargeting)
                              </span>
                              <span className="text-purple-600 font-semibold">
                                30% · {formatCurrency(results.totalBudget * 0.24 * 0.3)}
                              </span>
                            </div>
                            <p className="text-sm text-purple-700">
                              重新觸及未轉換用戶，挽回流失機會
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 回購期漏斗分配 */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold text-lg mb-4 text-gray-800">
                          回購期 漏斗分配
                        </h5>
                        
                        <div className="space-y-3">
                          <div className="bg-orange-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-orange-800">
                                客戶保留 (Retention)
                              </span>
                              <span className="text-orange-600 font-semibold">
                                60% · {formatCurrency(results.totalBudget * 0.02 * 0.6)}
                              </span>
                            </div>
                            <p className="text-sm text-orange-700">
                              維護既有客戶關係，提升忠誠度
                            </p>
                          </div>

                          <div className="bg-indigo-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-indigo-800">
                                交叉銷售 (Cross-sell)
                              </span>
                              <span className="text-indigo-600 font-semibold">
                                25% · {formatCurrency(results.totalBudget * 0.02 * 0.25)}
                              </span>
                            </div>
                            <p className="text-sm text-indigo-700">
                              推薦相關產品，提高客戶價值
                            </p>
                          </div>

                          <div className="bg-pink-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-pink-800">
                                口碑推薦 (Advocacy)
                              </span>
                              <span className="text-pink-600 font-semibold">
                                15% · {formatCurrency(results.totalBudget * 0.02 * 0.15)}
                              </span>
                            </div>
                            <p className="text-sm text-pink-700">
                              鼓勵客戶推薦，建立口碑效應
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 保存專案功能 */}
              {results && (

                              {allocation.traffic && (
                                <div className="bg-green-50 p-3 rounded-lg">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-green-800">
                                      {allocation.traffic.label}
                                    </span>
                                    <span className="text-green-600 font-semibold">
                                      {allocation.traffic.percentage}% · {formatCurrency(allocation.traffic.budget)}
                                    </span>
                                  </div>
                                  {allocation.traffic.breakdown && (
                                    <div className="ml-4 space-y-1">
                                      {Object.entries(allocation.traffic.breakdown).map(([key, item]: [string, any]) => (
                                        <div key={key} className="flex justify-between text-sm">
                                          <span className="text-green-700">└ {item.label}</span>
                                          <span className="text-green-600">{formatCurrency(item.budget)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {allocation.conversion && (
                                <div className="bg-purple-50 p-3 rounded-lg">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-purple-800">
                                      {allocation.conversion.label}
                                    </span>
                                    <span className="text-purple-600 font-semibold">
                                      {allocation.conversion.percentage}% · {formatCurrency(allocation.conversion.budget)}
                                    </span>
                                  </div>
                                  {allocation.conversion.breakdown && (
                                    <div className="ml-4 space-y-1">
                                      {Object.entries(allocation.conversion.breakdown).map(([key, item]: [string, any]) => (
                                        <div key={key}>
                                          <div className="flex justify-between text-sm">
                                            <span className="text-purple-700">└ {item.label}</span>
                                            <span className="text-purple-600">{formatCurrency(item.budget)}</span>
                                          </div>
                                          {item.description && (
                                            <p className="text-xs text-purple-600 ml-4">{item.description}</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h6 className="font-semibold text-yellow-800 mb-2">📋 漏斗架構說明</h6>
                      <div className="text-sm text-yellow-700 space-y-1">
                        <p><strong>觸及/互動/影觀：</strong>擴大觸及面，累積看過影片和貼文互動的受眾</p>
                        <p><strong>流量導引：</strong>導引流量進入網站，包含興趣標籤和再行銷受眾</p>
                        <p><strong>轉換促成：</strong>主力為再行銷，搭配 Facebook ASC 廣告促成轉換</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      漏斗架構分配建議
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-gray-500 p-4">
                      <p>漏斗架構分配功能正在開發中...</p>
                      <p className="text-sm mt-2">Debug: funnelAllocation = {JSON.stringify((results as any).funnelAllocation)}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}