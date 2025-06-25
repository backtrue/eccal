import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calculator as CalcIcon, Edit, ListOrdered, TrendingUp, Target, ShoppingCart, Percent, Info, Lightbulb, Users, ShoppingBag, Calendar, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Footer from "@/components/Footer";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import AnalyticsDataLoader from "@/components/AnalyticsDataLoader";
import { useAuth } from "@/hooks/useAuth";
import { useLocale } from "@/hooks/useLocale";
import { trackEvent } from "@/lib/analytics";
import { trackCalculatorUsage, trackMetaEvent } from "@/lib/meta-pixel";

const createCalculatorSchema = (t: any) => z.object({
  targetRevenue: z.number().positive(t.locale === 'zh-TW' ? "目標營業額必須大於 0" : t.locale === 'en' ? "Target revenue must be greater than 0" : "目標売上は0より大きくなければなりません"),
  averageOrderValue: z.number().positive(t.locale === 'zh-TW' ? "客單價必須大於 0" : t.locale === 'en' ? "Average order value must be greater than 0" : "平均注文額は0より大きくなければなりません"),
  conversionRate: z.number().positive(t.locale === 'zh-TW' ? "轉換率必須大於 0" : t.locale === 'en' ? "Conversion rate must be greater than 0" : "コンバージョン率は0より大きくなければなりません").max(100, t.locale === 'zh-TW' ? "轉換率不能超過 100%" : t.locale === 'en' ? "Conversion rate cannot exceed 100%" : "コンバージョン率は100%を超えることはできません"),
});

type CalculatorFormData = z.infer<typeof calculatorSchema>;

interface CalculationResults {
  requiredOrders: number;
  requiredTraffic: number;
  monthlyAdBudget: number;
  dailyAdBudget: number;
}

export default function Calculator() {
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { t, locale } = useLocale();

  const form = useForm<CalculatorFormData>({
    resolver: zodResolver(createCalculatorSchema(t)),
    defaultValues: {
      targetRevenue: 0,
      averageOrderValue: 0,
      conversionRate: 0,
    },
  });

  const onSubmit = (data: CalculatorFormData) => {
    const cpc = 5; // Fixed CPC value
    
    // Calculations
    const requiredOrders = Math.ceil(data.targetRevenue / data.averageOrderValue);
    const requiredTraffic = Math.ceil(requiredOrders / (data.conversionRate / 100));
    const monthlyAdBudget = requiredTraffic * cpc;
    const dailyAdBudget = Math.ceil(monthlyAdBudget / 30);

    const calculationResults = {
      requiredOrders,
      requiredTraffic,
      monthlyAdBudget,
      dailyAdBudget,
    };

    setResults(calculationResults);
    setShowSteps(true);

    // Track calculation event in Google Analytics
    trackEvent('calculate_budget', 'calculator', 'budget_calculation', data.targetRevenue);
    
    // Track additional metrics
    trackEvent('budget_result', 'calculator', 'monthly_budget', monthlyAdBudget);
    trackEvent('budget_result', 'calculator', 'daily_budget', dailyAdBudget);

    // Track events in Meta Pixel
    trackCalculatorUsage({
      targetRevenue: data.targetRevenue,
      averageOrderValue: data.averageOrderValue,
      conversionRate: data.conversionRate,
      monthlyAdBudget,
      dailyAdBudget
    });

    // Track custom event for lead generation
    trackMetaEvent('ViewContent', {
      content_name: 'Budget Calculator Result',
      content_type: 'calculator_result',
      value: monthlyAdBudget,
      currency: 'TWD'
    });
  };

  const handleAnalyticsDataLoaded = (data: { averageOrderValue: number; conversionRate: number }) => {
    form.setValue("averageOrderValue", data.averageOrderValue);
    form.setValue("conversionRate", data.conversionRate);
  };

  const formatNumber = (num: number) => num.toLocaleString('zh-TW');

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <CalcIcon className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t.calculatorTitle}</h1>
                <p className="text-sm text-gray-600">{t.calculatorDescription}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Google Login Section */}
        {!isAuthenticated && (
          <div className="mb-8 text-center">
            <Card className="shadow-lg border border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-blue-900 mb-3">
                  登入 Google 自動取得您的電商數據
                </h2>
                <p className="text-blue-700 mb-4">
                  連接您的 Google Analytics 帳戶，自動取得平均客單價和轉換率，讓計算更精準。
                </p>
                <GoogleLoginButton />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Welcome back message for authenticated users */}
        {isAuthenticated && user && (
          <div className="mb-6 text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700">
                歡迎回來，{user.firstName || user.email}！您可以使用 Google Analytics 數據來自動填入計算機。
              </p>
            </div>
          </div>
        )}

        {/* Analytics Data Loader */}
        {isAuthenticated && (
          <AnalyticsDataLoader onDataLoaded={handleAnalyticsDataLoaded} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Calculator Form */}
          <Card className="shadow-lg border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Edit className="text-blue-600 w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">輸入您的業務資料</h2>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Target Revenue */}
                  <FormField
                    control={form.control}
                    name="targetRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-sm font-medium text-gray-700">
                          <Target className="text-blue-500 w-4 h-4 mr-2" />
                          目標營業額（月）
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              placeholder="1000000"
                              className="pr-12"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 text-sm">NTD</span>
                            </div>
                          </div>
                        </FormControl>
                        <p className="text-xs text-gray-500">範例：1,000,000 元</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Average Order Value */}
                  <FormField
                    control={form.control}
                    name="averageOrderValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-sm font-medium text-gray-700">
                          <ShoppingCart className="text-green-500 w-4 h-4 mr-2" />
                          平均客單價
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              placeholder="1000"
                              className="pr-12"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 text-sm">NTD</span>
                            </div>
                          </div>
                        </FormControl>
                        <p className="text-xs text-gray-500">範例：1,000 元</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Conversion Rate */}
                  <FormField
                    control={form.control}
                    name="conversionRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-sm font-medium text-gray-700">
                          <Percent className="text-purple-500 w-4 h-4 mr-2" />
                          網站轉換率
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              placeholder="1"
                              step="0.01"
                              min="0"
                              max="100"
                              className="pr-8"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 text-sm">%</span>
                            </div>
                          </div>
                        </FormControl>
                        <p className="text-xs text-gray-500">範例：1%（填入 1）</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* CPC Information */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <Info className="text-yellow-600 w-4 h-4 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">固定參數</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          點擊成本 (CPC)：<span className="font-semibold">NTD 5</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    <CalcIcon className="w-4 h-4 mr-2" />
                    開始計算
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* Calculation Steps */}
            <Card className="shadow-lg border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <ListOrdered className="text-green-600 w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">計算步驟</h2>
                </div>

                <div className="space-y-4">
                  {!showSteps || !results ? (
                    <div className="text-center py-8 text-gray-500">
                      <CalcIcon className="w-8 h-8 mx-auto mb-3" />
                      <p>請填寫左側表單開始計算</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                        <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">1</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">計算所需訂單數量</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatNumber(form.getValues('targetRevenue'))} ÷ {formatNumber(form.getValues('averageOrderValue'))} = <span className="font-semibold text-blue-600">{formatNumber(results.requiredOrders)} 筆訂單</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                        <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">2</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">計算所需流量</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatNumber(results.requiredOrders)} ÷ {form.getValues('conversionRate')}% = <span className="font-semibold text-green-600">{formatNumber(results.requiredTraffic)} 次訪問</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                        <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">3</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">計算廣告預算</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatNumber(results.requiredTraffic)} × NTD 5 = <span className="font-semibold text-purple-600">NTD {formatNumber(results.monthlyAdBudget)}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Calculation Results */}
            <Card className="shadow-lg border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <TrendingUp className="text-blue-600 w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">計算結果</h2>
                </div>

                <div className="space-y-4">
                  {!results ? (
                    <div className="text-center py-8 text-gray-500">
                      <CalcIcon className="w-8 h-8 mx-auto mb-3" />
                      <p>計算結果將顯示在這裡</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                          <div className="flex items-center space-x-2 mb-2">
                            <ShoppingBag className="w-4 h-4" />
                            <h3 className="font-semibold">所需訂單</h3>
                          </div>
                          <p className="text-2xl font-bold">{formatNumber(results.requiredOrders)}</p>
                          <p className="text-sm opacity-90">筆/月</p>
                        </div>
                        
                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                          <div className="flex items-center space-x-2 mb-2">
                            <Users className="w-4 h-4" />
                            <h3 className="font-semibold">所需流量</h3>
                          </div>
                          <p className="text-2xl font-bold">{formatNumber(results.requiredTraffic)}</p>
                          <p className="text-sm opacity-90">次訪問/月</p>
                        </div>
                        
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                          <div className="flex items-center space-x-2 mb-2">
                            <Calendar className="w-4 h-4" />
                            <h3 className="font-semibold">日廣告預算</h3>
                          </div>
                          <p className="text-2xl font-bold">NTD {formatNumber(results.dailyAdBudget)}</p>
                          <p className="text-sm opacity-90">建議每日投放</p>
                        </div>
                        
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
                          <div className="flex items-center space-x-2 mb-2">
                            <CalendarDays className="w-4 h-4" />
                            <h3 className="font-semibold">月廣告預算</h3>
                          </div>
                          <p className="text-2xl font-bold">NTD {formatNumber(results.monthlyAdBudget)}</p>
                          <p className="text-sm opacity-90">每月總預算</p>
                        </div>
                      </div>
                      
                      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="text-yellow-600 w-4 h-4 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-yellow-800">建議</h4>
                            <p className="text-sm text-yellow-700 mt-1">
                              以上計算基於 CPC = NTD 5 的假設。實際廣告成本可能因行業、關鍵字競爭度、廣告品質等因素而有所不同。建議您根據實際測試結果調整預算。
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works */}
        <Card className="mt-12 shadow-lg border border-gray-200">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">計算原理說明</h2>
              <p className="text-gray-600">了解我們如何計算您的廣告預算</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">計算所需訂單</h3>
                <p className="text-sm text-gray-600">目標營業額 ÷ 客單價</p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">計算所需流量</h3>
                <p className="text-sm text-gray-600">所需訂單 ÷ 轉換率</p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">計算月廣告預算</h3>
                <p className="text-sm text-gray-600">所需流量 × CPC (NTD 5)</p>
              </div>

              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-600">4</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">計算日廣告預算</h3>
                <p className="text-sm text-gray-600">月廣告預算 ÷ 30 天</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
