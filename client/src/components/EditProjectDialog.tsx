import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useUpdateProject, type SavedProject } from "@/hooks/useSavedProjects";
import { Edit, Loader2, Calculator } from "lucide-react";
import { format, addDays, subDays } from 'date-fns';

const campaignPlannerSchema = z.object({
  projectName: z.string().min(1, "專案名稱不能為空"),
  startDate: z.string().min(1, "請選擇活動開始日期"),
  endDate: z.string().min(1, "請選擇活動結束日期"),
  targetRevenue: z.number().min(1, "目標營業額必須大於 0"),
  targetAov: z.number().min(1, "目標客單價必須大於 0"),
  targetConversionRate: z.number().min(0.01).max(100, "轉換率必須在 0.01% 到 100% 之間"),
  cpc: z.number().min(0.1, "CPC 必須大於 0.1"),
});

type EditProjectFormData = z.infer<typeof campaignPlannerSchema>;

interface EditProjectDialogProps {
  project: SavedProject;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProjectDialog({ project, open, onOpenChange }: EditProjectDialogProps) {
  const [isRecalculating, setIsRecalculating] = useState(false);
  const { toast } = useToast();
  const updateProject = useUpdateProject();

  // Prepare default values with null safety
  const getDefaultValues = (proj: SavedProject | null): EditProjectFormData => {
    if (!proj) {
      return {
        projectName: "",
        startDate: "",
        endDate: "",
        targetRevenue: 0,
        targetAov: 0,
        targetConversionRate: 0,
        cpc: 0,
      };
    }

    const projectData = proj.projectData || {};
    return {
      projectName: proj.projectName || "",
      startDate: projectData.startDate || "",
      endDate: projectData.endDate || "",
      targetRevenue: Number(projectData.targetRevenue) || 0,
      targetAov: Number(projectData.targetAov) || 0,
      targetConversionRate: Number(projectData.targetConversionRate) || 0,
      cpc: Number(projectData.cpc) || 0,
    };
  };

  const form = useForm<EditProjectFormData>({
    resolver: zodResolver(campaignPlannerSchema),
    defaultValues: getDefaultValues(project),
    mode: "onChange",
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open && project) {
      const defaultValues = getDefaultValues(project);
      console.log("Resetting form with values:", defaultValues);
      form.reset(defaultValues);
    }
  }, [open, project]);

  const handleSave = async (data: EditProjectFormData) => {
    if (!project?.id) {
      toast({
        title: "錯誤",
        description: "專案資料無效",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateProject.mutateAsync({
        projectId: project.id,
        updates: {
          projectName: data.projectName,
          projectData: {
            startDate: data.startDate,
            endDate: data.endDate,
            targetRevenue: Number(data.targetRevenue),
            targetAov: Number(data.targetAov),
            targetConversionRate: Number(data.targetConversionRate),
            cpc: Number(data.cpc),
          },
        },
      });

      toast({
        title: "專案已更新",
        description: `專案「${data.projectName}」已成功更新`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Update project error:", error);
      toast({
        title: "更新失敗",
        description: "無法更新專案，請稍後再試",
        variant: "destructive",
      });
    }
  };

  const handleRecalculate = async (data: EditProjectFormData) => {
    if (!project?.id) {
      toast({
        title: "錯誤",
        description: "專案資料無效",
        variant: "destructive",
      });
      return;
    }

    setIsRecalculating(true);
    
    try {
      // Validate dates
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("無效的日期格式");
      }
      
      if (startDate >= endDate) {
        throw new Error("結束日期必須晚於開始日期");
      }

      // Use the same calculation logic as CampaignPlanner to match the original format
      const campaignStartDate = new Date(data.startDate);
      const campaignEndDate = new Date(data.endDate);
      const campaignDays = Math.ceil((campaignEndDate.getTime() - campaignStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      // Calculate required metrics
      const requiredOrders = Math.ceil(Number(data.targetRevenue) / Number(data.targetAov));
      const totalTraffic = Math.ceil(requiredOrders / (Number(data.targetConversionRate) / 100));
      const estimatedTotalBudget = Math.ceil(totalTraffic * Number(data.cpc) * 1.15);
      
      // Dynamic budget ratios based on campaign duration
      let budgetRatios: any = {};
      let periodDays: any = {};
      
      if (campaignDays === 3) {
        budgetRatios = { day1: 0.50, day2: 0.25, day3: 0.25 };
      } else if (campaignDays >= 4 && campaignDays <= 9) {
        budgetRatios = { launch: 0.45, main: 0.30, final: 0.25 };
        periodDays = { launch: 2, main: campaignDays - 4, final: 2 };
      } else {
        budgetRatios = { preheat: 0.04, launch: 0.32, main: 0.38, final: 0.24, repurchase: 0.02 };
        
        // Dynamic main period adjustment for long campaigns
        if (campaignDays > 20) {
          const extraDays = campaignDays - 20;
          const extraBudgetRatio = Math.min(0.20, extraDays * 0.008);
          budgetRatios.main += extraBudgetRatio;
          budgetRatios.launch -= extraBudgetRatio * 0.6;
          budgetRatios.final -= extraBudgetRatio * 0.4;
        }
        
        periodDays = {
          preheat: 4, launch: 3,
          main: Math.max(3, campaignDays - 9),
          final: 3, repurchase: 7
        };
      }
      
      // Calculate budget breakdown
      let budgetBreakdown: any = {};
      let totalBudget = 0;
      
      if (campaignDays === 3) {
        budgetBreakdown = {
          day1: Math.ceil(estimatedTotalBudget * budgetRatios.day1),
          day2: Math.ceil(estimatedTotalBudget * budgetRatios.day2),
          day3: Math.ceil(estimatedTotalBudget * budgetRatios.day3)
        };
        totalBudget = budgetBreakdown.day1 + budgetBreakdown.day2 + budgetBreakdown.day3;
      } else if (campaignDays >= 4 && campaignDays <= 9) {
        budgetBreakdown = {
          launch: Math.ceil(estimatedTotalBudget * budgetRatios.launch),
          main: Math.ceil(estimatedTotalBudget * budgetRatios.main),
          final: Math.ceil(estimatedTotalBudget * budgetRatios.final)
        };
        totalBudget = budgetBreakdown.launch + budgetBreakdown.main + budgetBreakdown.final;
      } else {
        budgetBreakdown = {
          preheat: Math.ceil(estimatedTotalBudget * budgetRatios.preheat),
          launch: Math.ceil(estimatedTotalBudget * budgetRatios.launch),
          main: Math.ceil(estimatedTotalBudget * budgetRatios.main),
          final: Math.ceil(estimatedTotalBudget * budgetRatios.final),
          repurchase: Math.ceil(estimatedTotalBudget * budgetRatios.repurchase)
        };
        totalBudget = budgetBreakdown.preheat + budgetBreakdown.launch + budgetBreakdown.main + budgetBreakdown.final + budgetBreakdown.repurchase;
      }
      
      // Calculate traffic breakdown
      const trafficBreakdown: any = {};
      Object.keys(budgetBreakdown).forEach(key => {
        trafficBreakdown[key] = Math.ceil(budgetBreakdown[key] / Number(data.cpc));
      });
      
      // Build campaign periods object with proper format
      let campaignPeriods: any = {};
      
      if (campaignDays === 3) {
        campaignPeriods = {
          day1: {
            startDate: format(campaignStartDate, 'yyyy-MM-dd'),
            endDate: format(campaignStartDate, 'yyyy-MM-dd'),
            budget: budgetBreakdown.day1,
            traffic: trafficBreakdown.day1,
          },
          day2: {
            startDate: format(addDays(campaignStartDate, 1), 'yyyy-MM-dd'),
            endDate: format(addDays(campaignStartDate, 1), 'yyyy-MM-dd'),
            budget: budgetBreakdown.day2,
            traffic: trafficBreakdown.day2,
          },
          day3: {
            startDate: format(addDays(campaignStartDate, 2), 'yyyy-MM-dd'),
            endDate: format(addDays(campaignStartDate, 2), 'yyyy-MM-dd'),
            budget: budgetBreakdown.day3,
            traffic: trafficBreakdown.day3,
          },
        };
      } else if (campaignDays >= 4 && campaignDays <= 9) {
        campaignPeriods = {
          launch: {
            startDate: format(campaignStartDate, 'yyyy-MM-dd'),
            endDate: format(addDays(campaignStartDate, periodDays.launch - 1), 'yyyy-MM-dd'),
            budget: budgetBreakdown.launch,
            traffic: trafficBreakdown.launch,
          },
          main: {
            startDate: format(addDays(campaignStartDate, periodDays.launch), 'yyyy-MM-dd'),
            endDate: format(addDays(campaignStartDate, periodDays.launch + periodDays.main - 1), 'yyyy-MM-dd'),
            budget: budgetBreakdown.main,
            traffic: trafficBreakdown.main,
          },
          final: {
            startDate: format(addDays(campaignStartDate, periodDays.launch + periodDays.main), 'yyyy-MM-dd'),
            endDate: format(campaignEndDate, 'yyyy-MM-dd'),
            budget: budgetBreakdown.final,
            traffic: trafficBreakdown.final,
          },
        };
      } else {
        campaignPeriods = {
          preheat: {
            startDate: format(subDays(campaignStartDate, 4), 'yyyy-MM-dd'),
            endDate: format(subDays(campaignStartDate, 1), 'yyyy-MM-dd'),
            budget: budgetBreakdown.preheat,
            traffic: trafficBreakdown.preheat,
          },
          launch: {
            startDate: format(campaignStartDate, 'yyyy-MM-dd'),
            endDate: format(addDays(campaignStartDate, 2), 'yyyy-MM-dd'),
            budget: budgetBreakdown.launch,
            traffic: trafficBreakdown.launch,
          },
          main: {
            startDate: format(addDays(campaignStartDate, 3), 'yyyy-MM-dd'),
            endDate: format(subDays(campaignEndDate, 3), 'yyyy-MM-dd'),
            budget: budgetBreakdown.main,
            traffic: trafficBreakdown.main,
          },
          final: {
            startDate: format(subDays(campaignEndDate, 2), 'yyyy-MM-dd'),
            endDate: format(campaignEndDate, 'yyyy-MM-dd'),
            budget: budgetBreakdown.final,
            traffic: trafficBreakdown.final,
          },
          repurchase: {
            startDate: format(addDays(campaignEndDate, 1), 'yyyy-MM-dd'),
            endDate: format(addDays(campaignEndDate, 7), 'yyyy-MM-dd'),
            budget: budgetBreakdown.repurchase,
            traffic: trafficBreakdown.repurchase,
          },
        };
      }
      
      // Create complete calculation result in the correct format
      const newCalculationResult = {
        totalTraffic,
        campaignPeriods,
        totalBudget,
        calculatedAt: new Date().toISOString(),
      };

      // Update project with new data and calculation result
      await updateProject.mutateAsync({
        projectId: project.id,
        updates: {
          projectName: data.projectName,
          projectData: {
            startDate: data.startDate,
            endDate: data.endDate,
            targetRevenue: Number(data.targetRevenue),
            targetAov: Number(data.targetAov),
            targetConversionRate: Number(data.targetConversionRate),
            cpc: Number(data.cpc),
          },
          lastCalculationResult: newCalculationResult,
        },
      });

      toast({
        title: "重新計算完成",
        description: `專案「${data.projectName}」已更新並重新計算`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Recalculate project error:", error);
      const errorMessage = error instanceof Error ? error.message : "無法重新計算，請稍後再試";
      toast({
        title: "計算失敗",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRecalculating(false);
    }
  };

  // Add early return for invalid project
  if (!project) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            編輯專案參數
          </DialogTitle>
          <DialogDescription>
            修改專案設定並重新計算預算分配
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>專案名稱</FormLabel>
                  <FormControl>
                    <Input placeholder="輸入專案名稱" {...field} />
                  </FormControl>
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

            <FormField
              control={form.control}
              name="targetRevenue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>目標營業額</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="例如：500000"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
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
                  <FormLabel>目標客單價</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="例如：1200"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
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
                      placeholder="例如：2.5"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
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
                  <FormLabel>預估 CPC</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="例如：5.0"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateProject.isPending || isRecalculating}
          >
            取消
          </Button>
          <Button
            onClick={form.handleSubmit(handleSave)}
            disabled={updateProject.isPending || isRecalculating}
          >
            {updateProject.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            儲存變更
          </Button>
          <Button
            onClick={form.handleSubmit(handleRecalculate)}
            disabled={updateProject.isPending || isRecalculating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRecalculating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Calculator className="mr-2 h-4 w-4" />
            )}
            重新計算
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}