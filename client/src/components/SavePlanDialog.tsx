import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useSavePlanResult } from "@/hooks/usePlanResults";
import { getCurrencyByLocale } from "@shared/currency";

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
  returnTo?: string;
  locale?: string;
}

export default function SavePlanDialog({ calculationData, children, returnTo, locale = 'zh-TW' }: SavePlanDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const savePlanMutation = useSavePlanResult();

  const form = useForm<SavePlanFormData>({
    resolver: zodResolver(savePlanSchema),
    defaultValues: {
      planName: '',
    },
  });

  const onSubmit = async (data: SavePlanFormData) => {
    try {
      const currencyConfig = getCurrencyByLocale(locale);
      const planData = {
        planName: data.planName,
        targetRevenue: calculationData.targetRevenue,
        averageOrderValue: calculationData.averageOrderValue,
        conversionRate: calculationData.conversionRate,
        requiredOrders: calculationData.results.requiredOrders,
        monthlyTraffic: calculationData.results.monthlyTraffic,
        dailyTraffic: calculationData.results.dailyTraffic,
        monthlyAdBudget: calculationData.results.monthlyAdBudget,
        dailyAdBudget: calculationData.results.dailyAdBudget,
        targetRoas: calculationData.results.targetRoas,
        currency: currencyConfig.code,
        gaPropertyId: calculationData.gaPropertyId,
        gaPropertyName: calculationData.gaPropertyName,
        dataSource: calculationData.dataSource || 'manual',
      };

      const result = await savePlanMutation.mutateAsync(planData);
      
      console.log('SavePlanDialog - API response:', result);
      console.log('SavePlanDialog - Plan ID:', result?.data?.id);
      
      toast({
        title: "儲存成功",
        description: "計劃已成功儲存，可在儀表板中查看",
      });
      
      setOpen(false);
      form.reset();
      
      // 如果有 returnTo 參數，跳轉回原來的頁面並帶上新計劃的 ID
      if (returnTo && result?.data?.id) {
        const url = new URL(returnTo, window.location.origin);
        url.searchParams.set('newPlan', result.data.id);
        console.log('SavePlanDialog - Redirecting to:', url.toString());
        window.location.href = url.toString();
      } else {
        console.log('SavePlanDialog - No redirect:', { returnTo, resultData: result?.data });
      }
    } catch (error) {
      toast({
        title: "儲存失敗",
        description: error instanceof Error ? error.message : "請稍後再試",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>儲存計劃</DialogTitle>
        </DialogHeader>
        
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
            
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
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
                    儲存
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}