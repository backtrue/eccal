import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calculator as CalcIcon, TrendingUp, Target, ShoppingCart, BarChart3, Facebook, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Footer from "@/components/Footer";
import NavigationBar from "@/components/NavigationBar";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import FacebookLoginButton from "@/components/FacebookLoginButton";
import FacebookAccountSelector from "@/components/FacebookAccountSelector";
import { useAuth } from "@/hooks/useAuth";
import { useAnalyticsProperties, useAnalyticsData } from "@/hooks/useAnalyticsData";
import { useFacebookConnection, useFacebookDiagnosis } from "@/hooks/useFacebookDiagnosis";
import { getTranslations, type Locale } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";
import { trackCalculatorUsage, trackMetaEvent } from "@/lib/meta-pixel";

const createCalculatorSchema = (t: any) => z.object({
  targetRevenue: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.number({ invalid_type_error: "目標營業額必須是數字" }).positive("目標營業額必須大於 0")
  ),
  averageOrderValue: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.number({ invalid_type_error: "客單價必須是數字" }).positive("客單價必須大於 0")
  ),
  conversionRate: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.number({ invalid_type_error: "轉換率必須是數字" }).positive("轉換率必須大於 0").max(100, "轉換率不能超過 100%")
  ),
  selectedGaProperty: z.string().optional(),
});

type CalculatorFormData = z.infer<ReturnType<typeof createCalculatorSchema>>;

interface CalculationResults {
  requiredOrders: number;
  monthlyTraffic: number;
  dailyTraffic: number;
  monthlyAdBudget: number;
  dailyAdBudget: number;
  targetRoas: number;
}

interface CalculatorProps {
  locale: Locale;
}

export default function Calculator({ locale }: CalculatorProps) {
  const t = getTranslations(locale);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [loadingGaData, setLoadingGaData] = useState(false);
  const { isAuthenticated, user } = useAuth();
  
  // GA Analytics hooks
  const { data: properties } = useAnalyticsProperties(isAuthenticated);
  const { data: analyticsData, refetch: refetchAnalytics } = useAnalyticsData(
    selectedProperty, 
    { enabled: false } // 不自動載入，需手動觸發
  );
  
  // Facebook diagnosis hooks
  const { data: fbConnection } = useFacebookConnection(isAuthenticated);
  const diagnosisMutation = useFacebookDiagnosis();
  
  // 檢查 Facebook 是否已連接（通過 JWT 用戶或 Facebook 連接狀態）
  const isFacebookConnected = user?.metaAccessToken || (fbConnection as any)?.connected;
  
  // 只有在 Google 和 Facebook 都登入時才隱藏登入區塊
  // Connection section always shows to display status and account selection

  const form = useForm<CalculatorFormData>({
    resolver: zodResolver(createCalculatorSchema(t)),
    defaultValues: {
      targetRevenue: undefined,
      averageOrderValue: undefined,
      conversionRate: undefined,
      selectedGaProperty: '',
    },
  });

  const onSubmit = (data: CalculatorFormData) => {
    const cpc = 5; // 固定 CPC 值
    
    // 計算步驟
    const requiredOrders = Math.ceil(data.targetRevenue / data.averageOrderValue);
    const monthlyTraffic = Math.ceil(requiredOrders / (data.conversionRate / 100));
    const dailyTraffic = Math.ceil(monthlyTraffic / 30);
    const monthlyAdBudget = monthlyTraffic * cpc;
    const dailyAdBudget = Math.ceil(monthlyAdBudget / 30);
    const targetRoas = data.targetRevenue / monthlyAdBudget;

    const calculationResults = {
      requiredOrders,
      monthlyTraffic,
      dailyTraffic,
      monthlyAdBudget,
      dailyAdBudget,
      targetRoas,
    };

    setResults(calculationResults);

    // 追蹤事件
    trackEvent('calculate_budget', 'calculator', 'budget_calculation', data.targetRevenue);
    trackCalculatorUsage({
      targetRevenue: data.targetRevenue,
      averageOrderValue: data.averageOrderValue,
      conversionRate: data.conversionRate,
      monthlyAdBudget,
      dailyAdBudget
    });
  };

  const handleLoadGaData = async () => {
    if (!selectedProperty) return;
    
    setLoadingGaData(true);
    try {
      const result = await refetchAnalytics();
      if (result.data) {
        form.setValue("averageOrderValue", Math.round(result.data.averageOrderValue));
        form.setValue("conversionRate", parseFloat(result.data.conversionRate.toFixed(2)));
      }
    } catch (error) {
      console.error('載入 GA 數據失敗:', error);
    } finally {
      setLoadingGaData(false);
    }
  };

  const handleDiagnosis = () => {
    if (!results) return;
    
    diagnosisMutation.mutate({
      targetRevenue: form.getValues('targetRevenue'),
      targetAov: form.getValues('averageOrderValue'),
      targetConversionRate: form.getValues('conversionRate'),
      cpc: 5
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('zh-TW');
  };

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      <NavigationBar locale={locale} />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-blue-600 p-3 rounded-lg">
                <CalcIcon className="text-white w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">廣告預算計算機</h1>
            </div>
            <p className="text-lg text-gray-600">設定目標營收，AI 智能分析廣告成效</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-8">
          
          {/* Account Connection Section */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-3 text-center">
                連接帳戶以使用完整功能
              </h2>
              <p className="text-blue-700 mb-6 text-center">
                需要同時連接 Google Analytics 和 Facebook 廣告帳戶才能使用所有功能
              </p>
              
              {/* Platform Connection Status */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* Google Connection */}
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <div className="font-medium text-gray-900">Google Analytics</div>
                      <div className={`text-sm ${isAuthenticated ? 'text-green-600' : 'text-gray-500'}`}>
                        {isAuthenticated ? '已連接' : '未連接'}
                      </div>
                    </div>
                  </div>
                  {!isAuthenticated && <GoogleLoginButton />}
                </div>

                {/* Facebook Connection */}
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${isFacebookConnected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <div className="font-medium text-gray-900">Facebook 廣告</div>
                      <div className={`text-sm ${isFacebookConnected ? 'text-green-600' : 'text-gray-500'}`}>
                        {isFacebookConnected ? '已連接' : '未連接'}
                      </div>
                    </div>
                  </div>
                  {!isFacebookConnected && <FacebookLoginButton />}
                </div>
              </div>

              {/* Account Selection */}
              {(isAuthenticated || isFacebookConnected) && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">選擇要使用的帳戶</h3>
                  
                  {/* Google Analytics Property Selection */}
                  {isAuthenticated && (
                    <div className="p-4 bg-white rounded-lg border">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Google Analytics 資源
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇 Google Analytics 資源" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">請先載入 GA 資源</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Facebook Ad Account Selection */}
                  {isFacebookConnected && (
                    <div className="p-4 bg-white rounded-lg border">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Facebook 廣告帳戶
                      </label>
                      <FacebookAccountSelector />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calculator Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                計算廣告預算
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Account Selection Section */}
                  {isAuthenticated && (
                    <div className="space-y-4">
                      {/* GA Property Selection */}
                      {properties && Array.isArray(properties) && properties.length > 0 && (
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                              選擇 GA 資源（選填）
                            </label>
                            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                              <SelectTrigger>
                                <SelectValue placeholder="選擇 Google Analytics 資源" />
                              </SelectTrigger>
                              <SelectContent>
                                {properties.map((property: any) => (
                                  <SelectItem key={property.id} value={property.id}>
                                    {property.displayName || property.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button 
                            type="button"
                            variant="outline"
                            onClick={handleLoadGaData}
                            disabled={!selectedProperty || loadingGaData}
                            className="mt-6"
                          >
                            {loadingGaData ? <RefreshCw className="h-4 w-4 animate-spin" /> : '載入數據'}
                          </Button>
                        </div>
                      )}
                      
                      {/* Facebook Account Selection */}
                      <FacebookAccountSelector />
                    </div>
                  )}

                  {/* Form Fields */}
                  <FormField
                    control={form.control}
                    name="targetRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          目標月營收 (元)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="例如：300000" 
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
                    name="averageOrderValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4" />
                          平均訂單價值 (元)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="例如：1500" 
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
                    name="conversionRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          轉換率 (%)
                        </FormLabel>
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

                  <Button type="submit" className="w-full" size="lg">
                    計算預算
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Results */}
          {results && (
            <Card>
              <CardHeader>
                <CardTitle>計算結果</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">每月所需訂單數</h3>
                      <p className="text-2xl font-bold text-blue-600">{formatNumber(results.requiredOrders)} 筆</p>
                      <p className="text-sm text-blue-700">每日約 {formatNumber(Math.round(results.requiredOrders / 30))} 筆</p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-2">每月所需流量</h3>
                      <p className="text-2xl font-bold text-green-600">{formatNumber(results.monthlyTraffic)} 人次</p>
                      <p className="text-sm text-green-700">每日約 {formatNumber(results.dailyTraffic)} 人次</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-purple-900 mb-2">建議日廣告預算</h3>
                      <p className="text-2xl font-bold text-purple-600">NT$ {formatNumber(results.dailyAdBudget)}</p>
                      <p className="text-sm text-purple-700">月預算約 NT$ {formatNumber(results.monthlyAdBudget)}</p>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-orange-900 mb-2">建議目標 ROAS</h3>
                      <p className="text-2xl font-bold text-orange-600">{results.targetRoas.toFixed(1)}x</p>
                      <p className="text-sm text-orange-700">每投入 1 元廣告費，應產生 {results.targetRoas.toFixed(1)} 元營收</p>
                    </div>
                  </div>
                </div>

                {/* Facebook Diagnosis Section */}
                {isAuthenticated && results && (
                  <div className="mt-8 pt-6 border-t">
                    <div className="flex items-center gap-2 mb-4">
                      <Facebook className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">Facebook 廣告健檢</h3>
                    </div>
                    
                    <div className="text-center py-6">
                      <p className="text-gray-600 mb-4">
                        連接 Facebook 廣告帳戶後，點擊下方按鈕開始診斷分析
                      </p>
                      <Button 
                        onClick={handleDiagnosis}
                        disabled={diagnosisMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {diagnosisMutation.isPending ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            分析中...
                          </>
                        ) : (
                          '開始 Facebook 廣告診斷'
                        )}
                      </Button>
                    </div>

                    {/* Diagnosis Results */}
                    {diagnosisMutation.data && (
                      <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">診斷結果</h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p>帳戶: {diagnosisMutation.data.accountName}</p>
                          <p>健康分數: {diagnosisMutation.data.healthScore}/100</p>
                          <div className="mt-4">
                            <h5 className="font-medium mb-2">建議:</h5>
                            <ul className="list-disc list-inside space-y-1">
                              {diagnosisMutation.data.recommendations?.map((rec: string, index: number) => (
                                <li key={index}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}