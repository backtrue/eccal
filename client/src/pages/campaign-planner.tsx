import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calculator, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import NavigationBar from "@/components/NavigationBar";
import Footer from "@/components/Footer";

// 表單驗證架構
const campaignSchema = z.object({
  startDate: z.string().min(1, "請選擇活動開始日期"),
  endDate: z.string().min(1, "請選擇活動結束日期"),
  targetRevenue: z.number().min(1, "目標營收必須大於0"),
  targetAov: z.number().min(1, "目標客單價必須大於0"),
  targetConversionRate: z.number().min(0.01).max(100, "轉換率必須介於0.01%到100%之間"),
  cpc: z.number().min(0.1, "CPC必須大於0.1"),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface CalculationResult {
  totalTraffic: number;
  totalBudget: number;
  campaignDays: number;
  budgetBreakdown: Record<string, number>;
  trafficBreakdown: Record<string, number>;
}

export default function CampaignPlannerNew({ locale = "zh-TW" }: { locale?: string }) {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      startDate: "2025-07-10",
      endDate: "2025-07-17",
      targetRevenue: 500000,
      targetAov: 3000,
      targetConversionRate: 1.5,
      cpc: 5,
    },
  });

  // 認證檢查
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
        <NavigationBar locale="zh-TW" />
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold mb-4">活動預算規劃器</h1>
            <p className="text-gray-600 mb-8">請先登入 Google 帳號以使用活動預算規劃功能</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">需要 Google 登入</h3>
              <p className="text-blue-700 mb-4">
                活動預算規劃器是 Pro 功能，需要 Google 帳號登入才能使用。
              </p>
              <Button 
                onClick={() => window.location.href = '/api/auth/google'}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                使用 Google 帳號登入
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
      const response = await apiRequest('POST', '/api/campaign-planner/calculate', data);

      if (response && (response as any).success) {
        const result = (response as any).result;
        setResults(result);
        
        toast({
          title: "計算完成",
          description: "活動預算規劃已完成",
          variant: "default",
        });
      } else {
        throw new Error('計算失敗');
      }
    } catch (error: any) {
      console.error('計算錯誤:', error);
      
      if (error.message.includes('401') || error.message.includes('Authentication')) {
        toast({
          title: "需要重新登入",
          description: "請重新登入後再試",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = '/api/auth/google', 1000);
      } else {
        toast({
          title: "計算失敗",
          description: error.message || "請稍後再試",
          variant: "destructive",
        });
      }
    } finally {
      setIsCalculating(false);
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
          <p className="text-gray-600">專業的活動預算規劃工具</p>
          <Badge variant="outline" className="mt-2">Pro 會員專屬</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 輸入表單 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                活動設定
              </CardTitle>
              <CardDescription>
                設定您的活動目標和預算參數
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
                        <FormLabel>目標營收 (NT$)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="500000"
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
                            placeholder="3000"
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
                        <FormLabel>目標轉換率 (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="1.5"
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
                        <FormLabel>平均點擊成本 (NT$)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="5"
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

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isCalculating}
                  >
                    {isCalculating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        計算中...
                      </>
                    ) : (
                      "開始計算預算"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* 計算結果 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                計算結果
              </CardTitle>
              <CardDescription>
                {results ? "根據您的設定計算出的預算配置" : "請先填寫左側表單並計算"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results ? (
                <div className="space-y-6">
                  {/* 總覽數據 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(results.totalBudget)}
                      </div>
                      <div className="text-sm text-gray-600">總預算需求</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">
                        {results.totalTraffic.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">總流量需求</div>
                    </div>
                  </div>

                  {/* 活動期間分配 */}
                  {results.budgetBreakdown && Object.keys(results.budgetBreakdown).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">預算分配 ({results.campaignDays} 天活動)</h3>
                      <div className="space-y-3">
                        {Object.entries(results.budgetBreakdown).map(([period, budget]) => {
                          const traffic = results.trafficBreakdown?.[period] || 0;
                          const percentage = ((budget / results.totalBudget) * 100).toFixed(1);
                          
                          return (
                            <div key={period} className="p-3 border rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium capitalize">{period}</span>
                                <span className="text-sm text-gray-600">{percentage}%</span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">預算: </span>
                                  <span className="font-medium">{formatCurrency(budget)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">流量: </span>
                                  <span className="font-medium">{traffic.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>填寫活動參數後，點擊「開始計算預算」查看結果</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}