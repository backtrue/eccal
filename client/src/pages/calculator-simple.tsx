import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calculator as CalcIcon, TrendingUp, Target, ShoppingCart, BarChart3, RefreshCw, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import Footer from "@/components/Footer";
import NavigationBar from "@/components/NavigationBar";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import SavePlanDialog from "@/components/SavePlanDialog";
import { useAuth } from "@/hooks/useAuth";
import { useAnalyticsProperties, useAnalyticsData } from "@/hooks/useAnalyticsData";
import { getTranslations, type Locale } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";
import { trackCalculatorUsage, trackMetaEvent } from "@/lib/meta-pixel";

const createCalculatorSchema = (t: any) => z.object({
  targetRevenue: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.number({ invalid_type_error: t.targetMonthlyRevenue + " must be a number" }).positive(t.targetMonthlyRevenue + " must be greater than 0")
  ),
  averageOrderValue: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.number({ invalid_type_error: t.averageOrderValue + " must be a number" }).positive(t.averageOrderValue + " must be greater than 0")
  ),
  conversionRate: z.preprocess(
    (a) => (a === '' ? undefined : a),
    z.number({ invalid_type_error: t.conversionRate + " must be a number" }).positive(t.conversionRate + " must be greater than 0").max(100, t.conversionRate + " cannot exceed 100%")
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
  const [formData, setFormData] = useState<any>(null); // 儲存表單數據
  const { isAuthenticated, user } = useAuth();
  
  // GA Analytics hooks
  const { data: properties } = useAnalyticsProperties(isAuthenticated);
  const { data: analyticsData, refetch: refetchAnalytics } = useAnalyticsData(
    selectedProperty, 
    { enabled: false }
  );

  const form = useForm<CalculatorFormData>({
    resolver: zodResolver(createCalculatorSchema(t)),
    defaultValues: {
      targetRevenue: undefined,
      averageOrderValue: undefined,
      conversionRate: undefined,
      selectedGaProperty: '',
    },
  });

  const handleLoadGaData = async () => {
    if (!selectedProperty) return;
    
    setLoadingGaData(true);
    try {
      const result = await refetchAnalytics();
      if (result.data) {
        // 自動填入表單
        form.setValue('averageOrderValue', Math.round(result.data.averageOrderValue));
        form.setValue('conversionRate', Math.round(result.data.conversionRate * 100) / 100);
      }
    } catch (error) {
      console.error('Failed to load GA data:', error);
    } finally {
      setLoadingGaData(false);
    }
  };

  const onSubmit = (data: CalculatorFormData) => {
    const cpc = t.cpcValue; // CPC value based on locale
    
    // Calculation steps
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
      targetRoas
    };

    setResults(calculationResults);
    
    // Store form data for later plan saving
    const selectedGaProperty = Array.isArray(properties) ? properties.find((p: any) => p.id === selectedProperty) : null;
    setFormData({
      targetRevenue: data.targetRevenue!,
      averageOrderValue: data.averageOrderValue!,
      conversionRate: data.conversionRate!,
      results: calculationResults,
      gaPropertyId: selectedProperty || undefined,
      gaPropertyName: selectedGaProperty?.displayName || undefined,
      dataSource: selectedProperty ? 'google_analytics' : 'manual',
    });

    // Track calculation events
    trackEvent('calculator_calculation', 'Calculator');
    // trackCalculatorUsage();
    trackMetaEvent('Purchase');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar locale={locale} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t.calculatorTitle}
          </h1>
          <p className="text-gray-600">
            {t.calculatorDescription}
          </p>
        </div>

        {/* Google Analytics 連接區塊 */}
        {!isAuthenticated && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <BarChart3 className="text-blue-600 w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2">{t.connectAccountTitle}</h3>
                  <p className="text-sm text-blue-700 mb-4">
                    {t.connectAccountDescription}
                  </p>
                  <GoogleLoginButton />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* GA Property Selection */}
        {isAuthenticated && Array.isArray(properties) && properties.length > 0 && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <BarChart3 className="text-green-600 w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-green-900">{t.loadGaData}</h3>
                  </div>
                  <p className="text-sm text-green-700 mb-4">
                    {t.autoFill}
                  </p>

                  <div className="space-y-3">
                    <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder={t.selectGaProperty} />
                      </SelectTrigger>
                      <SelectContent>
                        {(properties as any[]).map((property: any) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.displayName} ({property.accountName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      onClick={handleLoadGaData}
                      disabled={!selectedProperty || loadingGaData}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loadingGaData ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          {t.loading}...
                        </>
                      ) : (
                        <>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          {t.loadGaData}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalcIcon className="w-5 h-5" />
              {t.targetMonthlyRevenue}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="targetRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Target className="w-4 h-4" />
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
                          <ShoppingCart className="w-4 h-4" />
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
                          <TrendingUp className="w-4 h-4" />
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
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                  <CalcIcon className="w-4 h-4 mr-2" />
                  {t.calculate}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Calculation Results */}
        {results && (
          <Card className="mb-8 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-green-800">{t.calculationResults}</CardTitle>
              {isAuthenticated && formData && (
                <SavePlanDialog calculationData={formData}>
                  <Button variant="outline" size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    {t.save}
                  </Button>
                </SavePlanDialog>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <ShoppingCart className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900">{results.requiredOrders}</div>
                  <div className="text-sm text-blue-700">{t.requiredOrders}</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-900">{results.dailyTraffic}</div>
                  <div className="text-sm text-purple-700">{t.dailyTrafficNeeded}</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-900">{results.targetRoas.toFixed(1)}x</div>
                  <div className="text-sm text-green-700">{t.targetRoasValue}</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <BarChart3 className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-900">{t.currency} {results.monthlyAdBudget.toLocaleString()}</div>
                  <div className="text-sm text-orange-700">{t.monthlyAdBudgetNeeded}</div>
                </div>
                
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <CalcIcon className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-900">{t.currency} {results.dailyAdBudget.toLocaleString()}</div>
                  <div className="text-sm text-red-700">{t.dailyAdBudgetNeeded}</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Target className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{results.monthlyTraffic.toLocaleString()}</div>
                  <div className="text-sm text-gray-700">{t.monthlyTrafficNeeded}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Footer />
    </div>
  );
}