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
import { useToast } from "@/hooks/use-toast";

const campaignPlannerSchema = z.object({
  startDate: z.string().min(1, "請選擇活動開始日期"),
  endDate: z.string().min(1, "請選擇活動結束日期"),
  targetRevenue: z.number().min(1, "目標營業額必須大於 0"),
  targetAov: z.number().min(1, "目標客單價必須大於 0"),
  targetConversionRate: z.number().min(0.01).max(100, "轉換率必須在 0.01% 到 100% 之間"),
  cpc: z.number().min(0.1, "CPC 必須大於 0.1"),
});

type CampaignPlannerFormData = z.infer<typeof campaignPlannerSchema>;

interface CampaignPlannerProps {
  locale: Locale;
}

interface PlanningResult {
  totalTraffic: number;
  campaignPeriods: {
    preheat: { startDate: string; endDate: string; budget: number; traffic: number };
    launch: { startDate: string; endDate: string; budget: number; traffic: number };
    main: { startDate: string; endDate: string; budget: number; traffic: number };
    final: { startDate: string; endDate: string; budget: number; traffic: number };
    repurchase: { startDate: string; endDate: string; budget: number; traffic: number };
  };
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
  const { toast } = useToast();

  const form = useForm<CampaignPlannerFormData>({
    resolver: zodResolver(campaignPlannerSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      targetRevenue: undefined,
      targetAov: undefined,
      targetConversionRate: undefined,
      cpc: locale === 'zh-TW' ? 5 : locale === 'ja' ? 120 : 1,
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

  const onSubmit = (data: CampaignPlannerFormData) => {
    // TODO: Re-enable Pro membership check after testing
    // Check Pro membership before calculation
    // const isPro = membershipStatus?.level === 'pro' && membershipStatus?.isActive;
    
    // if (!isPro) {
    //   toast({
    //     title: "需要 Pro 會員",
    //     description: "活動預算規劃器功能僅限 Pro 會員使用，請先登入並升級至 Pro 會員。",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    // 計算活動總需要流量
    const requiredOrders = data.targetRevenue / data.targetAov;
    const totalTraffic = Math.ceil(requiredOrders / (data.targetConversionRate / 100));
    
    // 計算活動期間天數
    const campaignDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // 流量分配：前三天 60%、中間 15%、後三天 20%
    const launchTraffic = Math.ceil(totalTraffic * 0.60);
    const mainTraffic = Math.ceil(totalTraffic * 0.15);
    const finalTraffic = Math.ceil(totalTraffic * 0.20);
    
    // 計算各期間預算 (95% 的總預算)
    const launchBudget = launchTraffic * data.cpc;
    const mainBudget = mainTraffic * data.cpc;
    const finalBudget = finalTraffic * data.cpc;
    const campaignBudget = launchBudget + mainBudget + finalBudget;
    
    // 總預算 = 活動預算 / 0.95
    const totalBudget = Math.ceil(campaignBudget / 0.95);
    
    // 預熱期和回購期預算
    const preheatBudget = Math.ceil(totalBudget * 0.04);
    const repurchaseBudget = Math.ceil(totalBudget * 0.01);
    
    // 計算預熱期和回購期流量
    const preheatTraffic = Math.ceil(preheatBudget / data.cpc);
    const repurchaseTraffic = Math.ceil(repurchaseBudget / data.cpc);
    
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
    
    // 預熱期（4天）
    for (let i = 0; i < 4; i++) {
      const date = format(subDays(startDate, 4 - i), 'yyyy-MM-dd');
      dailyBudgets.push({
        date,
        period: '預熱期',
        budget: Math.ceil(preheatBudget / 4),
        traffic: Math.ceil(preheatTraffic / 4),
      });
    }
    
    // 起跑期（3天）
    for (let i = 0; i < 3; i++) {
      const date = format(addDays(startDate, i), 'yyyy-MM-dd');
      dailyBudgets.push({
        date,
        period: '起跑期',
        budget: Math.ceil(launchBudget / 3),
        traffic: Math.ceil(launchTraffic / 3),
      });
    }
    
    // 活動期（中間天數）
    const mainDays = Math.max(1, campaignDays - 6);
    for (let i = 0; i < mainDays; i++) {
      const date = format(addDays(startDate, 3 + i), 'yyyy-MM-dd');
      dailyBudgets.push({
        date,
        period: '活動期',
        budget: Math.ceil(mainBudget / mainDays),
        traffic: Math.ceil(mainTraffic / mainDays),
      });
    }
    
    // 倒數期（3天）
    for (let i = 0; i < 3; i++) {
      const date = format(subDays(endDate, 2 - i), 'yyyy-MM-dd');
      dailyBudgets.push({
        date,
        period: '倒數期',
        budget: Math.ceil(finalBudget / 3),
        traffic: Math.ceil(finalTraffic / 3),
      });
    }
    
    // 回購期（7天）
    for (let i = 0; i < 7; i++) {
      const date = format(addDays(endDate, 1 + i), 'yyyy-MM-dd');
      dailyBudgets.push({
        date,
        period: '回購期',
        budget: Math.ceil(repurchaseBudget / 7),
        traffic: Math.ceil(repurchaseTraffic / 7),
      });
    }

    const result: PlanningResult = {
      totalTraffic,
      campaignPeriods: {
        preheat: {
          startDate: preheatStart,
          endDate: preheatEnd,
          budget: preheatBudget,
          traffic: preheatTraffic,
        },
        launch: {
          startDate: launchStart,
          endDate: launchEnd,
          budget: launchBudget,
          traffic: launchTraffic,
        },
        main: {
          startDate: mainStart,
          endDate: mainEnd,
          budget: mainBudget,
          traffic: mainTraffic,
        },
        final: {
          startDate: finalStart,
          endDate: finalEnd,
          budget: finalBudget,
          traffic: finalTraffic,
        },
        repurchase: {
          startDate: repurchaseStart,
          endDate: repurchaseEnd,
          budget: repurchaseBudget,
          traffic: repurchaseTraffic,
        },
      },
      totalBudget,
      dailyBudgets,
    };

    setResults(result);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar locale={locale} />
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">活動預算規劃器</h1>
          <p className="text-gray-600">專業的活動預算規劃工具，幫助您制定完整的活動策略</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">Pro 會員專屬</Badge>
            <Badge variant="secondary">測試模式 - 暫時開放</Badge>
            {/* TODO: Re-enable after testing */}
            {/* {(!membershipStatus || membershipStatus?.level !== 'pro' || !membershipStatus?.isActive) && (
              <Badge variant="destructive">需要升級 Pro 會員</Badge>
            )} */}
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
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
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
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
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
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
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
                            onChange={(e) => field.onChange(Number(e.target.value))}
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
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  活動規劃結果
                </CardTitle>
                <CardDescription>
                  完整的活動預算與流量分配建議
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    活動期間規劃
                  </h3>
                  
                  {[
                    { key: 'preheat', name: '預熱期', color: 'bg-orange-50 border-orange-200', percentage: '4%' },
                    { key: 'launch', name: '起跑期', color: 'bg-blue-50 border-blue-200', percentage: '60%' },
                    { key: 'main', name: '活動期', color: 'bg-green-50 border-green-200', percentage: '15%' },
                    { key: 'final', name: '倒數期', color: 'bg-red-50 border-red-200', percentage: '20%' },
                    { key: 'repurchase', name: '回購期', color: 'bg-purple-50 border-purple-200', percentage: '1%' },
                  ].map(({ key, name, color, percentage }) => {
                    const period = results.campaignPeriods[key as keyof typeof results.campaignPeriods];
                    return (
                      <div key={key} className={`p-4 rounded-lg border ${color}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold">{name}</div>
                            <div className="text-sm text-gray-600">
                              {period.startDate} ~ {period.endDate}
                            </div>
                          </div>
                          <Badge variant="outline">{percentage}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <DollarSign className="h-4 w-4 inline mr-1" />
                            預算: {period.budget.toLocaleString()}
                          </div>
                          <div>
                            <TrendingUp className="h-4 w-4 inline mr-1" />
                            流量: {period.traffic.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {results && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                每日預算分配
              </CardTitle>
              <CardDescription>
                詳細的每日預算與流量分配建議
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">日期</th>
                      <th className="text-left p-2">期間</th>
                      <th className="text-right p-2">預算</th>
                      <th className="text-right p-2">流量</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.dailyBudgets.map((day, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2">{day.date}</td>
                        <td className="p-2">
                          <Badge variant="outline" className="text-xs">
                            {day.period}
                          </Badge>
                        </td>
                        <td className="p-2 text-right">{day.budget.toLocaleString()}</td>
                        <td className="p-2 text-right">{day.traffic.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}