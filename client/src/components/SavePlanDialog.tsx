import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const savePlanSchema = z.object({
  planName: z.string().min(1, "計劃名稱不能為空").max(50, "計劃名稱不能超過50個字符"),
});

type SavePlanFormData = z.infer<typeof savePlanSchema>;

interface CalculationResults {
  requiredOrders: number;
  monthlyTraffic: number;
  dailyTraffic: number;
  monthlyAdBudget: number;
  dailyAdBudget: number;
  targetRoas: number;
}

interface SavePlanDialogProps {
  calculationData: {
    targetRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
    results: CalculationResults;
    gaPropertyId?: string;
    gaPropertyName?: string;
    dataSource?: string;
  };
  children: React.ReactNode;
}

export default function SavePlanDialog({ calculationData, children }: SavePlanDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SavePlanFormData>({
    resolver: zodResolver(savePlanSchema),
    defaultValues: {
      planName: '',
    },
  });

  const savePlanMutation = useMutation({
    mutationFn: async (planName: string) => {
      const cpc = 5; // 固定 CPC 值
      
      const planData = {
        planName,
        targetRevenue: calculationData.targetRevenue,
        averageOrderValue: calculationData.averageOrderValue,
        conversionRate: calculationData.conversionRate,
        cpc,
        requiredOrders: calculationData.results.requiredOrders,
        monthlyTraffic: calculationData.results.monthlyTraffic,
        dailyTraffic: calculationData.results.dailyTraffic,
        monthlyAdBudget: calculationData.results.monthlyAdBudget,
        dailyAdBudget: calculationData.results.dailyAdBudget,
        targetRoas: calculationData.results.targetRoas,
        gaPropertyId: calculationData.gaPropertyId,
        gaPropertyName: calculationData.gaPropertyName,
        dataSource: calculationData.dataSource || 'manual',
      };

      return await apiRequest('POST', '/api/plan-results', planData);
    },
    onSuccess: () => {
      toast({
        title: "儲存成功",
        description: "計劃已成功儲存，可在儀表板中查看",
      });
      
      // 清空表單並關閉對話框
      form.reset();
      setOpen(false);
      
      // 刷新計劃列表
      queryClient.invalidateQueries({ queryKey: ['/api/plan-results'] });
    },
    onError: (error: any) => {
      toast({
        title: "儲存失敗",
        description: error.message || "發生未知錯誤",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SavePlanFormData) => {
    savePlanMutation.mutate(data.planName);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            儲存計算結果
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>將此次計算結果儲存為計劃，以供未來診斷工具使用</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="planName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>計劃名稱</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="例如：10月預算、Q4廣告計畫"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  disabled={savePlanMutation.isPending}
                >
                  取消
                </Button>
                <Button 
                  type="submit"
                  disabled={savePlanMutation.isPending}
                >
                  {savePlanMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      儲存中...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      儲存計劃
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}