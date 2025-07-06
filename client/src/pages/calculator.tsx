import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calculator as CalcIcon, TrendingUp, Target, ShoppingCart, BarChart3, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { Facebook } from "lucide-react";
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
import { useAuth } from "@/hooks/useAuth";
import { useAnalyticsProperties, useAnalyticsData } from "@/hooks/useAnalyticsData";
import { getTranslations, type Locale } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";
import { trackCalculatorUsage, trackMetaEvent } from "@/lib/meta-pixel";

const createCalculatorSchema = (locale: Locale) => z.object({
  targetRevenue: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.number({ invalid_type_error: locale === 'zh-TW' ? "目標營業額必須是數字" : locale === 'en' ? "Target revenue must be a number" : "目標売上は数値である必要があります" }).positive(locale === 'zh-TW' ? "目標營業額必須大於 0" : locale === 'en' ? "Target revenue must be greater than 0" : "目標売上は0より大きい必要があります")
  ),
  averageOrderValue: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.number({ invalid_type_error: locale === 'zh-TW' ? "客單價必須是數字" : locale === 'en' ? "Average order value must be a number" : "平均注文額は数値である必要があります" }).positive(locale === 'zh-TW' ? "客單價必須大於 0" : locale === 'en' ? "Average order value must be greater than 0" : "平均注文額は0より大きい必要があります")
  ),
  conversionRate: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.number({ invalid_type_error: locale === 'zh-TW' ? "轉換率必須是數字" : locale === 'en' ? "Conversion rate must be a number" : "コンバージョン率は数値である必要があります" }).positive(locale === 'zh-TW' ? "轉換率必須大於 0" : locale === 'en' ? "Conversion rate must be greater than 0" : "コンバージョン率は0より大きい必要があります").max(100, locale === 'zh-TW' ? "轉換率不能超過 100%" : locale === 'en' ? "Conversion rate cannot exceed 100%" : "コンバージョン率は100%を超えることはできません")
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

  const form = useForm<CalculatorFormData>({
    resolver: zodResolver(createCalculatorSchema(locale)),
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
    const localeMap = {
      'zh-TW': 'zh-TW',
      'en': 'en-US', 
      'ja': 'ja-JP'
    };
    return num.toLocaleString(localeMap[locale]);
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
              <h1 className="text-3xl font-bold text-gray-900">{t.calculator}</h1>
            </div>
            <p className="text-lg text-gray-600">{t.calculatorDescription}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-8">
          
          {/* Account Connection Section */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-3 text-center">
                {t.connectAccountTitle}
              </h2>
              <p className="text-blue-700 mb-6 text-center">
                {t.connectAccountDescription}
              </p>
              
              {/* Platform Connection Status */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* Google Connection */}
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${isGoogleConnected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <div className="font-medium text-gray-900">{t.googleAnalytics}</div>
                      <div className={`text-sm ${isGoogleConnected ? 'text-green-600' : 'text-gray-500'}`}>
                        {isGoogleConnected ? t.connected : t.notConnected}
                      </div>
                    </div>
                  </div>
                  {!isGoogleConnected && <GoogleLoginButton />}
                </div>

                {/* Facebook Connection */}
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${isFacebookConnected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <div className="font-medium text-gray-900">{t.facebookAds}</div>
                      <div className={`text-sm ${isFacebookConnected ? 'text-green-600' : 'text-gray-500'}`}>
                        {isFacebookConnected ? t.connected : t.notConnected}
                      </div>
                    </div>
                  </div>
                  {!isFacebookConnected && <FacebookLoginButton />}
                </div>
              </div>

              {/* Account Selection */}
              {(isGoogleConnected || isFacebookConnected) && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">選擇要使用的帳戶</h3>
                  
                  {/* Google Analytics Property Selection */}
                  {isGoogleConnected && (
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
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">
                          Facebook 廣告帳戶
                        </label>
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            window.open('/facebook-permissions', '_blank');
                          }}
                        >
                          檢查權限
                        </Button>
                      </div>
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
                          {t.targetMonthlyRevenue} ({t.targetMonthlyRevenueUnit})
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder={t.targetRevenuePlaceholder} 
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
                          {t.averageOrderValue} ({t.averageOrderValueUnit})
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder={t.aovPlaceholder} 
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
                          {t.conversionRate} ({t.conversionRateUnit})
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder={t.conversionRatePlaceholder} 
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
                    {t.calculateBudget}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Results */}
          {results && (
            <Card>
              <CardHeader>
                <CardTitle>{t.calculationResults}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">{t.monthlyRequiredOrders}</h3>
                      <p className="text-2xl font-bold text-blue-600">{formatNumber(results.requiredOrders)} {t.ordersUnit}</p>
                      <p className="text-sm text-blue-700">{t.dailyApprox} {formatNumber(Math.round(results.requiredOrders / 30))} {t.ordersUnit}</p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-2">{t.monthlyRequiredTraffic}</h3>
                      <p className="text-2xl font-bold text-green-600">{formatNumber(results.monthlyTraffic)} {t.visitorsUnit}</p>
                      <p className="text-sm text-green-700">{t.dailyApprox} {formatNumber(results.dailyTraffic)} {t.visitorsUnit}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-purple-900 mb-2">{t.suggestedDailyBudget}</h3>
                      <p className="text-2xl font-bold text-purple-600">{t.currency === 'USD' ? '$' : t.currency === 'JPY' ? '¥' : 'NT$'} {formatNumber(results.dailyAdBudget)}</p>
                      <p className="text-sm text-purple-700">{t.monthlyBudgetApprox} {t.currency === 'USD' ? '$' : t.currency === 'JPY' ? '¥' : 'NT$'} {formatNumber(results.monthlyAdBudget)}</p>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-orange-900 mb-2">{t.suggestedTargetRoas}</h3>
                      <p className="text-2xl font-bold text-orange-600">{results.targetRoas.toFixed(1)}x</p>
                      <p className="text-sm text-orange-700">{t.roasDescription.replace('{roas}', results.targetRoas.toFixed(1))}</p>
                    </div>
                  </div>
                </div>

                {/* Facebook Diagnosis Section */}
                {isAuthenticated && results && (
                  <div className="mt-8 pt-6 border-t">
                    <div className="flex items-center gap-2 mb-4">
                      <Facebook className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">{t.facebookDiagnosis}</h3>
                    </div>
                    
                    <div className="text-center py-6">
                      <p className="text-gray-600 mb-4">
                        {t.diagnosisDescription}
                      </p>
                      <Button 
                        onClick={handleDiagnosis}
                        disabled={diagnosisMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {diagnosisMutation.isPending ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            {t.analyzing}
                          </>
                        ) : (
                          t.startFacebookDiagnosis
                        )}
                      </Button>
                    </div>

                    {/* Diagnosis Results */}
                    {diagnosisMutation.data && (
                      <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">{t.diagnosisResults}</h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p>{t.account}: {diagnosisMutation.data.accountName}</p>
                          <p>{t.healthScore}: {diagnosisMutation.data.healthScore}/100</p>
                          <div className="mt-4">
                            <h5 className="font-medium mb-2">{t.recommendations}:</h5>
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