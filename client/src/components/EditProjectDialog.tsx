import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useUpdateProject, type SavedProject } from "@/hooks/useSavedProjects";
import { Edit, Loader2, Calculator } from "lucide-react";

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

  // Add null safety checks
  if (!project) {
    return null;
  }

  const projectData = project.projectData || {};

  const form = useForm<EditProjectFormData>({
    resolver: zodResolver(campaignPlannerSchema),
    defaultValues: {
      projectName: project.projectName || "",
      startDate: projectData.startDate || "",
      endDate: projectData.endDate || "",
      targetRevenue: projectData.targetRevenue || 0,
      targetAov: projectData.targetAov || 0,
      targetConversionRate: projectData.targetConversionRate || 0,
      cpc: projectData.cpc || 0,
    },
  });

  // Reset form when project changes
  useEffect(() => {
    if (project && project.projectName) {
      const projectData = project.projectData || {};
      form.reset({
        projectName: project.projectName || "",
        startDate: projectData.startDate || "",
        endDate: projectData.endDate || "",
        targetRevenue: projectData.targetRevenue || 0,
        targetAov: projectData.targetAov || 0,
        targetConversionRate: projectData.targetConversionRate || 0,
        cpc: projectData.cpc || 0,
      });
    }
  }, [project, form]);

  const handleSave = async (data: EditProjectFormData) => {
    try {
      await updateProject.mutateAsync({
        projectId: project.id,
        updates: {
          projectName: data.projectName,
          projectData: {
            startDate: data.startDate,
            endDate: data.endDate,
            targetRevenue: data.targetRevenue,
            targetAov: data.targetAov,
            targetConversionRate: data.targetConversionRate,
            cpc: data.cpc,
          },
        },
      });

      toast({
        title: "專案已更新",
        description: `專案「${data.projectName}」已成功更新`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "更新失敗",
        description: "無法更新專案，請稍後再試",
        variant: "destructive",
      });
    }
  };

  const handleRecalculate = async (data: EditProjectFormData) => {
    setIsRecalculating(true);
    
    try {
      // Perform the same calculation logic as in CampaignPlanner
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const campaignDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      const requiredOrders = Math.ceil(data.targetRevenue / data.targetAov);
      const totalTraffic = Math.ceil(requiredOrders / (data.targetConversionRate / 100));
      const totalBudget = Math.ceil(totalTraffic * data.cpc);

      // Create calculation result (simplified version)
      const newCalculationResult = {
        totalTraffic,
        totalBudget,
        campaignDays,
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
            targetRevenue: data.targetRevenue,
            targetAov: data.targetAov,
            targetConversionRate: data.targetConversionRate,
            cpc: data.cpc,
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
      toast({
        title: "計算失敗",
        description: "無法重新計算，請稍後再試",
        variant: "destructive",
      });
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            編輯專案參數
          </DialogTitle>
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