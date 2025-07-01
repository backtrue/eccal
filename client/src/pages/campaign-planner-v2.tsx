import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addDays } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Calculator, Calendar, DollarSign, Users, Target, Zap, TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCampaignPlannerUsage } from "@/hooks/useCampaignPlannerUsage";
import { apiRequest } from "@/lib/queryClient";
import NavigationBar from "@/components/NavigationBar";
import Footer from "@/components/Footer";

// 表單驗證 Schema
const campaignFormSchema = z.object({
  name: z.string().min(1, "活動名稱不能為空"),
  startDate: z.string().min(1, "請選擇活動開始日期"),
  endDate: z.string().min(1, "請選擇活動結束日期"),
  targetRevenue: z.number().min(1, "目標營收必須大於0"),
  targetAov: z.number().min(1, "目標客單價必須大於0"),
  targetConversionRate: z.number().min(0.01).max(100, "轉換率必須介於0.01%到100%之間"),
  costPerClick: z.number().min(0.01, "每次點擊成本必須大於0"),
});

type CampaignFormData = z.infer<typeof campaignFormSchema>;

interface CampaignResult {
  campaign: any;
  periods: any[];
  dailyBreakdown: any[];
  summary: {
    totalBudget: number;
    totalTraffic: number;
    totalOrders: number;
    totalDays: number;
    avgDailyBudget: number;
    avgDailyTraffic: number;
  };
}

export default function CampaignPlannerV2({ locale = "zh-TW" }: { locale?: string }) {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { data: usageData, refetch: refetchUsage } = useCampaignPlannerUsage();
  const [results, setResults] = useState<CampaignResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      targetRevenue: undefined,
      targetAov: undefined,
      targetConversionRate: undefined,
      costPerClick: 5,
    },
  });

  // 自動產生活動名稱
  const generateCampaignName = () => {
    console.log("Generate Campaign Name clicked!");
    const today = new Date();
    const defaultName = `行銷活動 ${format(today, 'yyyy-MM-dd')}`;
    form.setValue('name', defaultName);
    console.log("Set campaign name to:", defaultName);
  };

  // 提交表單
  const onSubmit = async (data: CampaignFormData) => {
    console.log("Form submitted with data:", data);
    console.log("User authenticated:", isAuthenticated);
    console.log("User object:", user);
    
    if (!isAuthenticated || !user) {
      toast({
        title: "需要登入",
        description: "請先使用 Google 帳號登入才能使用活動預算規劃器。",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log("Making API request to:", '/api/v2/campaign-planner/create');

    try {
      const response = await apiRequest('POST', '/api/v2/campaign-planner/create', data);
      console.log("API Response:", response);

      if ((response as any).success) {
        setResults((response as any).data);
        refetchUsage();
        
        toast({
          title: "活動計畫建立成功！",
          description: `「${data.name}」活動預算規劃已完成`,
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error('Campaign creation failed:', error);
      
      if (error.message.includes('403')) {
        toast({
          title: "使用額度已達上限",
          description: "免費會員可使用 3 次活動預算規劃器，請升級至 Pro 會員享受無限使用。",
          variant: "destructive",
        });
      } else {
        toast({
          title: "建立失敗",
          description: error.message || "活動計畫建立發生錯誤，請稍後再試",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 重置表單
  const resetForm = () => {
    form.reset();
    setResults(null);
  };

  // 格式化貨幣
  const formatCurrency = (amount: number) => {
    return `NT$ ${amount.toLocaleString()}`;
  };

  // 格式化百分比
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar locale={locale} />
      
      <div className="container mx-auto p-6 max-w-7xl">
        {/* 頁面標題 */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">🚀 活動預算規劃器 2.0</h1>
          <p className="text-lg text-gray-600 mb-4">
            智能活動預算分配系統，根據活動天數自動優化預算配置策略
          </p>
          
          {/* 功能特色 */}
          <div className="flex justify-center gap-4 mb-6 flex-wrap">
            <Badge variant="outline" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              智能預算分配
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              期間分析
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              每日追蹤
            </Badge>
          </div>

          {/* 會員狀態 */}
          <div className="flex justify-center items-center gap-2 flex-wrap">
            {!isAuthenticated ? (
              <Badge variant="destructive">需要 Google 登入</Badge>
            ) : (usageData as any)?.membershipStatus?.level === 'pro' && (usageData as any)?.membershipStatus?.isActive ? (
              <Badge variant="default" className="bg-green-600">Pro 會員 - 無限使用</Badge>
            ) : (
              <Badge variant="secondary">
                免費試用 剩餘 {Math.max(0, 3 - ((usageData as any)?.usage || 0))}/3 次
              </Badge>
            )}
          </div>
        </div>

        {!results ? (
          /* 輸入表單 */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    活動基本設定
                  </CardTitle>
                  <CardDescription>
                    請填入您的活動資訊，系統將自動計算最佳預算分配策略
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>活動名稱</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input placeholder="輸入活動名稱" {...field} />
                              </FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={generateCampaignName}
                              >
                                自動產生
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                          name="costPerClick"
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

                      <Button 
                        type="submit" 
                        className="w-full" 
                        size="lg"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>正在建立活動計畫...</>
                        ) : (
                          <>
                            <Target className="h-4 w-4 mr-2" />
                            建立活動預算計畫
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* 右側功能說明 */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🎯 預算分配策略</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold">短期活動 (1-3天)</h4>
                    <p className="text-gray-600">集中式投放，首日重點衝刺</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">中期活動 (4-7天)</h4>
                    <p className="text-gray-600">啟動期→主推期→收尾期</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">長期活動 (8天以上)</h4>
                    <p className="text-gray-600">預熱→啟動→主推→收尾→回購</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📊 分析功能</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    每日預算分配
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    流量分配計算
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    期間投資回報
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    成長趨勢分析
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* 結果顯示 */
          <div className="space-y-8">
            {/* 活動總覽 */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl">{results.campaign.name}</CardTitle>
                    <CardDescription>
                      {format(new Date(results.campaign.startDate), 'yyyy/MM/dd')} - {format(new Date(results.campaign.endDate), 'yyyy/MM/dd')}
                      （共 {results.summary.totalDays} 天）
                    </CardDescription>
                  </div>
                  <Button onClick={resetForm} variant="outline">
                    建立新活動
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(results.summary.totalBudget)}
                    </div>
                    <div className="text-sm text-gray-600">總預算</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {results.summary.totalTraffic.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">總流量</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {results.summary.totalOrders.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">目標訂單</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {formatCurrency(results.summary.avgDailyBudget)}
                    </div>
                    <div className="text-sm text-gray-600">日均預算</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 預算期間分配 */}
            <Card>
              <CardHeader>
                <CardTitle>預算期間分配</CardTitle>
                <CardDescription>
                  根據活動長度自動分配的預算策略
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.periods.map((period, index) => (
                    <div key={period.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{period.displayName}</h4>
                        <Badge variant="outline">
                          {period.durationDays} 天
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>預算:</span>
                          <span className="font-semibold">
                            {formatCurrency(parseInt(period.budgetAmount))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>佔比:</span>
                          <span>{formatPercentage(parseFloat(period.budgetPercentage))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>流量:</span>
                          <span>{period.trafficAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>日預算:</span>
                          <span>{formatCurrency(parseInt(period.dailyBudget))}</span>
                        </div>
                        <Progress 
                          value={parseFloat(period.budgetPercentage)} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 每日預算表格 */}
            <Card>
              <CardHeader>
                <CardTitle>每日預算明細</CardTitle>
                <CardDescription>
                  完整的每日預算和流量分配表
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">日期</th>
                        <th className="text-left p-2">活動天數</th>
                        <th className="text-right p-2">預算</th>
                        <th className="text-right p-2">流量</th>
                        <th className="text-right p-2">預期訂單</th>
                        <th className="text-right p-2">預期營收</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.dailyBreakdown.slice(0, 10).map((day, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            {format(new Date(day.date), 'MM/dd')}
                          </td>
                          <td className="p-2">第 {day.dayOfCampaign} 天</td>
                          <td className="p-2 text-right font-semibold">
                            {formatCurrency(parseInt(day.budget))}
                          </td>
                          <td className="p-2 text-right">
                            {day.traffic.toLocaleString()}
                          </td>
                          <td className="p-2 text-right">
                            {day.expectedOrders}
                          </td>
                          <td className="p-2 text-right">
                            {formatCurrency(parseInt(day.expectedRevenue))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {results.dailyBreakdown.length > 10 && (
                    <div className="text-center p-4 text-gray-500">
                      顯示前 10 天，總共 {results.dailyBreakdown.length} 天
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}