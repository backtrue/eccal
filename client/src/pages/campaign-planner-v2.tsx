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
      console.log("API Response (raw):", response);
      
      // 解析 JSON 回應
      const jsonResponse = await response.json();
      console.log("API Response (parsed):", jsonResponse);

      if (jsonResponse.success) {
        console.log("Setting results with data:", jsonResponse.data);
        setResults(jsonResponse.data);
        refetchUsage();
        
        toast({
          title: "活動計畫建立成功！",
          description: `「${data.name}」活動預算規劃已完成`,
          variant: "default",
        });
      } else {
        console.error("API response indicates failure:", jsonResponse);
        toast({
          title: "建立失敗",
          description: jsonResponse.message || "活動計畫建立發生錯誤",
          variant: "destructive",
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

  // 除錯用
  console.log("Current results state:", results);
  console.log("Results exists:", !!results);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar locale={locale as any} />
      
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
                      {(() => {
                        const targetRevenue = form.getValues('targetRevenue') || 0;
                        const totalBudget = results.summary.totalBudget || 1;
                        const roas = totalBudget > 0 ? (targetRevenue / totalBudget) : 0;
                        return roas.toFixed(1) + 'x';
                      })()}
                    </div>
                    <div className="text-sm text-gray-600">目標 ROAS</div>
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

            {/* 漏斗架構分配建議 */}
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
                  {/* 判斷是否為三期活動 */}
                  {results.periods.length === 3 && results.periods.some(p => p.displayName.includes('啟動')) && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700 font-medium">
                        💡 檢測到三期活動配置，以下為三期漏斗分配建議
                      </p>
                    </div>
                  )}

                  {/* 三期活動：啟動期漏斗分配 */}
                  {results.periods.length === 3 && results.periods.some(p => p.displayName.includes('啟動')) && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-lg mb-4 text-gray-800">
                        啟動期 漏斗分配（三期活動）
                      </h5>
                      
                      <div className="space-y-3">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-blue-800">
                              觸及/互動/影觀
                            </span>
                            <span className="text-blue-600 font-semibold">
                              20% · {formatCurrency(results.summary.totalBudget * 0.45 * 0.2)}
                            </span>
                          </div>
                          <p className="text-sm text-blue-700">
                            快速建立品牌認知，大範圍觸及潛在客戶
                          </p>
                        </div>

                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-green-800">
                              流量廣告
                            </span>
                            <span className="text-green-600 font-semibold">
                              30% · {formatCurrency(results.summary.totalBudget * 0.45 * 0.3)}
                            </span>
                          </div>
                          <div className="text-sm text-green-700 space-y-1">
                            <p>導引高品質流量至網站</p>
                            <p className="text-green-600">• 精準興趣標籤 (20%)</p>
                            <p className="text-green-600">• 再行銷第一層受眾 (10%)</p>
                          </div>
                        </div>

                        <div className="bg-red-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-red-800">
                              轉換廣告
                            </span>
                            <span className="text-red-600 font-semibold">
                              50% · {formatCurrency(results.summary.totalBudget * 0.45 * 0.5)}
                            </span>
                          </div>
                          <div className="text-sm text-red-700 space-y-1">
                            <p>積極推動轉換成交</p>
                            <p className="text-red-600">• 再行銷第一層受眾 (20%)</p>
                            <p className="text-red-600">• 再行銷第二層受眾 (20%)</p>
                            <p className="text-red-600">• ASC 廣告 (10%)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 三期活動：主推期漏斗分配 */}
                  {results.periods.length === 3 && results.periods.some(p => p.displayName.includes('主推')) && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-lg mb-4 text-gray-800">
                        主推期 漏斗分配（三期活動）
                      </h5>
                      
                      <div className="space-y-3">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-blue-800">
                              觸及/互動/影觀
                            </span>
                            <span className="text-blue-600 font-semibold">
                              10% · {formatCurrency(results.summary.totalBudget * 0.3 * 0.1)}
                            </span>
                          </div>
                          <p className="text-sm text-blue-700">
                            維持基本曝光，持續獲取新客戶
                          </p>
                        </div>

                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-green-800">
                              流量廣告
                            </span>
                            <span className="text-green-600 font-semibold">
                              15% · {formatCurrency(results.summary.totalBudget * 0.3 * 0.15)}
                            </span>
                          </div>
                          <div className="text-sm text-green-700 space-y-1">
                            <p>持續導引優質流量</p>
                            <p className="text-green-600">• 精準興趣標籤 (10%)</p>
                            <p className="text-green-600">• 再行銷第一層受眾 (5%)</p>
                          </div>
                        </div>

                        <div className="bg-red-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-red-800">
                              轉換廣告
                            </span>
                            <span className="text-red-600 font-semibold">
                              75% · {formatCurrency(results.summary.totalBudget * 0.3 * 0.75)}
                            </span>
                          </div>
                          <div className="text-sm text-red-700 space-y-1">
                            <p>主力推動轉換，達成銷售目標</p>
                            <p className="text-red-600">• 再行銷第一層受眾 (15%)</p>
                            <p className="text-red-600">• 再行銷第二層受眾 (35%)</p>
                            <p className="text-red-600">• ASC 廣告 (25%)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 三期活動：收尾期漏斗分配 */}
                  {results.periods.length === 3 && results.periods.some(p => p.displayName.includes('收尾')) && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-lg mb-4 text-gray-800">
                        收尾期 漏斗分配（三期活動）
                      </h5>
                      
                      <div className="space-y-3">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-green-800">
                              流量廣告
                            </span>
                            <span className="text-green-600 font-semibold">
                              5% · {formatCurrency(results.summary.totalBudget * 0.25 * 0.05)}
                            </span>
                          </div>
                          <p className="text-sm text-green-700">
                            最後階段維持基本流量導引
                          </p>
                        </div>

                        <div className="bg-red-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-red-800">
                              轉換廣告
                            </span>
                            <span className="text-red-600 font-semibold">
                              95% · {formatCurrency(results.summary.totalBudget * 0.25 * 0.95)}
                            </span>
                          </div>
                          <div className="text-sm text-red-700 space-y-1">
                            <p>最後衝刺，全力促成轉換</p>
                            <p className="text-red-600">• 再行銷第一層受眾 (15%)</p>
                            <p className="text-red-600">• 再行銷第二層受眾 (40%)</p>
                            <p className="text-red-600">• ASC 廣告 (40%)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 五期活動：預熱期漏斗分配 */}
                  {results.periods.length === 5 && results.periods.some(p => p.displayName.includes('預熱')) && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-lg mb-4 text-gray-800">
                        預熱期 漏斗分配
                      </h5>
                      
                      <div className="space-y-3">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-blue-800">
                              觸及/互動/影觀
                            </span>
                            <span className="text-blue-600 font-semibold">
                              30% · {formatCurrency(results.summary.totalBudget * 0.04 * 0.3)}
                            </span>
                          </div>
                          <p className="text-sm text-blue-700">
                            建立品牌認知度，擴大觸及範圍
                          </p>
                        </div>

                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-green-800">
                              流量廣告
                            </span>
                            <span className="text-green-600 font-semibold">
                              70% · {formatCurrency(results.summary.totalBudget * 0.04 * 0.7)}
                            </span>
                          </div>
                          <div className="text-sm text-green-700 space-y-1">
                            <p>導引高品質流量至網站</p>
                            <p className="text-green-600">• 精準興趣標籤 (70%)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 啟動期漏斗分配 */}
                  {results.periods.some(p => p.displayName.includes('啟動')) && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-lg mb-4 text-gray-800">
                        啟動期 漏斗分配
                      </h5>
                      
                      <div className="space-y-3">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-blue-800">
                              觸及/互動/影觀
                            </span>
                            <span className="text-blue-600 font-semibold">
                              10% · {formatCurrency(results.summary.totalBudget * 0.32 * 0.1)}
                            </span>
                          </div>
                          <p className="text-sm text-blue-700">
                            持續擴大品牌曝光，觸及更多潛在客戶
                          </p>
                        </div>

                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-green-800">
                              流量廣告
                            </span>
                            <span className="text-green-600 font-semibold">
                              20% · {formatCurrency(results.summary.totalBudget * 0.32 * 0.2)}
                            </span>
                          </div>
                          <div className="text-sm text-green-700 space-y-1">
                            <p>導引高品質流量至網站</p>
                            <p className="text-green-600">• 精準興趣標籤 (10%)</p>
                          </div>
                        </div>

                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-purple-800">
                              再行銷第一層受眾
                            </span>
                            <span className="text-purple-600 font-semibold">
                              10% · {formatCurrency(results.summary.totalBudget * 0.32 * 0.1)}
                            </span>
                          </div>
                          <p className="text-sm text-purple-700">
                            針對已有互動的潛在客戶進行再行銷
                          </p>
                        </div>

                        <div className="bg-red-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-red-800">
                              轉換廣告
                            </span>
                            <span className="text-red-600 font-semibold">
                              70% · {formatCurrency(results.summary.totalBudget * 0.32 * 0.7)}
                            </span>
                          </div>
                          <div className="text-sm text-red-700 space-y-1">
                            <p>重點推動轉換成交</p>
                            <p className="text-red-600">• 再行銷第一層受眾 (20%)</p>
                            <p className="text-red-600">• 再行銷第二層受眾 (30%)</p>
                            <p className="text-red-600">• ASC 廣告 (20%)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 主推期漏斗分配 */}
                  {results.periods.some(p => p.displayName.includes('主推')) && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-lg mb-4 text-gray-800">
                        主推期 漏斗分配
                      </h5>
                      
                      <div className="space-y-3">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-blue-800">
                              觸及/互動/影觀
                            </span>
                            <span className="text-blue-600 font-semibold">
                              5% · {formatCurrency(results.summary.totalBudget * 0.38 * 0.05)}
                            </span>
                          </div>
                          <p className="text-sm text-blue-700">
                            維持品牌曝光，持續獲取新客戶
                          </p>
                        </div>

                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-green-800">
                              流量廣告
                            </span>
                            <span className="text-green-600 font-semibold">
                              15% · {formatCurrency(results.summary.totalBudget * 0.38 * 0.15)}
                            </span>
                          </div>
                          <div className="text-sm text-green-700 space-y-1">
                            <p>導引高品質流量至網站</p>
                            <p className="text-green-600">• 精準興趣標籤 (10%)</p>
                          </div>
                        </div>

                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-purple-800">
                              再行銷第一層受眾
                            </span>
                            <span className="text-purple-600 font-semibold">
                              5% · {formatCurrency(results.summary.totalBudget * 0.38 * 0.05)}
                            </span>
                          </div>
                          <p className="text-sm text-purple-700">
                            針對已有互動的潛在客戶進行再行銷
                          </p>
                        </div>

                        <div className="bg-red-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-red-800">
                              轉換廣告
                            </span>
                            <span className="text-red-600 font-semibold">
                              80% · {formatCurrency(results.summary.totalBudget * 0.38 * 0.8)}
                            </span>
                          </div>
                          <div className="text-sm text-red-700 space-y-1">
                            <p>全力促成轉換，達成銷售目標</p>
                            <p className="text-red-600">• 再行銷第一層受眾 (10%)</p>
                            <p className="text-red-600">• 再行銷第二層受眾 (40%)</p>
                            <p className="text-red-600">• ASC 廣告 (30%)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 收尾期漏斗分配 */}
                  {results.periods.some(p => p.displayName.includes('收尾')) && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-lg mb-4 text-gray-800">
                        收尾期 漏斗分配
                      </h5>
                      
                      <div className="space-y-3">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-green-800">
                              流量廣告
                            </span>
                            <span className="text-green-600 font-semibold">
                              5% · {formatCurrency(results.summary.totalBudget * 0.24 * 0.05)}
                            </span>
                          </div>
                          <p className="text-sm text-green-700">
                            維持基本流量導引
                          </p>
                        </div>

                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-purple-800">
                              再行銷第一層受眾
                            </span>
                            <span className="text-purple-600 font-semibold">
                              5% · {formatCurrency(results.summary.totalBudget * 0.24 * 0.05)}
                            </span>
                          </div>
                          <p className="text-sm text-purple-700">
                            針對已有互動的潛在客戶進行再行銷
                          </p>
                        </div>

                        <div className="bg-red-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-red-800">
                              轉換廣告
                            </span>
                            <span className="text-red-600 font-semibold">
                              95% · {formatCurrency(results.summary.totalBudget * 0.24 * 0.95)}
                            </span>
                          </div>
                          <div className="text-sm text-red-700 space-y-1">
                            <p>最後衝刺期，全力促成轉換</p>
                            <p className="text-red-600">• 再行銷第一層受眾 (10%)</p>
                            <p className="text-red-600">• 再行銷第二層受眾 (45%)</p>
                            <p className="text-red-600">• ASC 廣告 (40%)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 回購期漏斗分配 */}
                  {results.periods.some(p => p.displayName.includes('回購')) && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-lg mb-4 text-gray-800">
                        回購期 漏斗分配
                      </h5>
                      
                      <div className="space-y-3">
                        <div className="bg-red-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-red-800">
                              轉換廣告
                            </span>
                            <span className="text-red-600 font-semibold">
                              100% · {formatCurrency(results.summary.totalBudget * 0.02 * 1.0)}
                            </span>
                          </div>
                          <div className="text-sm text-red-700 space-y-1">
                            <p className="font-medium">目標設定：只針對在本次活動期間有成功轉換的顧客</p>
                            <p>• 促進已購買客戶的再次購買</p>
                            <p>• 提升客戶終身價值 (LTV)</p>
                            <p>• 針對轉換客戶進行精準再行銷</p>
                          </div>
                        </div>
                      </div>
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