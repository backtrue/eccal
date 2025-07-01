import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const testSchema = z.object({
  startDate: z.string().min(1, "請選擇活動開始日期"),
  endDate: z.string().min(1, "請選擇活動結束日期"),
  targetRevenue: z.number().min(1, "目標營收必須大於0"),
  targetAov: z.number().min(1, "目標客單價必須大於0"),
  targetConversionRate: z.number().min(0.01).max(100, "轉換率必須介於0.01%到100%之間"),
  cpc: z.number().min(0.1, "CPC必須大於0.1"),
});

type TestFormData = z.infer<typeof testSchema>;

export default function TestCalculator() {
  const { toast } = useToast();
  const [results, setResults] = useState<any>(null);

  const form = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      startDate: "2025-07-10",
      endDate: "2025-07-17",
      targetRevenue: 500000,
      targetAov: 3000,
      targetConversionRate: 1.5,
      cpc: 5,
    },
  });

  const onSubmit = async (data: TestFormData) => {
    try {
      // 直接在前端計算，不需要認證
      const startDateObj = new Date(data.startDate);
      const endDateObj = new Date(data.endDate);
      
      // 計算活動總需要流量 
      const totalTraffic = Math.ceil((data.targetRevenue / data.targetAov) / (data.targetConversionRate / 100));
      
      // 計算活動期間天數
      const campaignDays = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      // 計算總預算
      const totalBudget = totalTraffic * data.cpc;

      // 根據活動天數決定分配策略
      let budgetBreakdown: any = {};
      let trafficBreakdown: any = {};

      if (campaignDays >= 4 && campaignDays <= 9) {
        // 4-9天邏輯
        budgetBreakdown = {
          launch: Math.ceil(totalBudget * 0.45),
          main: Math.ceil(totalBudget * 0.30),
          final: Math.ceil(totalBudget * 0.25)
        };
        trafficBreakdown = {
          launch: Math.ceil(totalTraffic * 0.45),
          main: Math.ceil(totalTraffic * 0.30),
          final: Math.ceil(totalTraffic * 0.25)
        };
      }

      const result = {
        totalTraffic,
        totalBudget,
        campaignDays,
        budgetBreakdown,
        trafficBreakdown,
        inputData: data
      };

      setResults(result);
      
      toast({
        title: "測試計算完成",
        description: "前端直接計算成功",
        variant: "default",
      });

    } catch (error: any) {
      toast({
        title: "計算失敗",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">測試計算器（無需認證）</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>活動設定</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                  <FormField
                    control={form.control}
                    name="targetRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>目標營收 (NT$)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
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

                  <Button type="submit" className="w-full">
                    直接計算（測試用）
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {results && (
            <Card>
              <CardHeader>
                <CardTitle>計算結果</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">基本數據</h3>
                    <p>活動天數: {results.campaignDays} 天</p>
                    <p>總流量需求: {results.totalTraffic.toLocaleString()} 人</p>
                    <p>總預算需求: NT$ {results.totalBudget.toLocaleString()}</p>
                  </div>

                  {results.budgetBreakdown && (
                    <div>
                      <h3 className="font-semibold">預算分配</h3>
                      <div className="space-y-2">
                        {Object.entries(results.budgetBreakdown).map(([period, budget]: [string, any]) => (
                          <div key={period} className="flex justify-between">
                            <span>{period}:</span>
                            <span>NT$ {budget.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}