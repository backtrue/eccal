import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePlanResults, useDeletePlanResult, type PlanResult } from "@/hooks/usePlanResults";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Trash2, FolderOpen, Target, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

export default function PlanResultsList() {
  const { data: planResults, isLoading } = usePlanResults();
  const deletePlanMutation = useDeletePlanResult();
  const { toast } = useToast();
  const [planToDelete, setPlanToDelete] = useState<PlanResult | null>(null);

  const handleDelete = async () => {
    if (!planToDelete) return;

    try {
      await deletePlanMutation.mutateAsync(planToDelete.id);
      toast({
        title: "計劃已刪除",
        description: `計劃「${planToDelete.planName}」已成功刪除`,
      });
      setPlanToDelete(null);
    } catch (error) {
      toast({
        title: "刪除失敗",
        description: "請稍後再試",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            已儲存的預算計劃
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">載入中...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const plans = (planResults as any)?.data || [];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            已儲存的預算計劃
          </CardTitle>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">還沒有儲存的計劃</p>
              <p className="text-sm text-gray-400">
                使用預算計算機進行計算後，點選「儲存計劃」來保存結果
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {plans.map((plan: PlanResult) => (
                <div
                  key={plan.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{plan.planName}</h3>
                        <Badge variant="outline" className="text-xs">
                          {plan.dataSource === 'google_analytics' ? 'GA數據' : '手動輸入'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>目標營收: NT$ {parseFloat(plan.targetRevenue).toLocaleString()}</span>
                        </div>
                        <div>
                          <span>月預算: NT$ {parseFloat(plan.monthlyAdBudget).toLocaleString()}</span>
                        </div>
                        <div>
                          <span>目標訂單: {plan.requiredOrders} 筆</span>
                        </div>
                        <div>
                          <span>目標 ROAS: {parseFloat(plan.targetRoas).toFixed(1)}x</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>
                          建立於 {format(new Date(plan.createdAt), 'yyyy/MM/dd HH:mm', { locale: zhTW })}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPlanToDelete(plan)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 刪除確認對話框 */}
      <AlertDialog open={!!planToDelete} onOpenChange={() => setPlanToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除計劃「{planToDelete?.planName}」嗎？此操作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deletePlanMutation.isPending}
            >
              {deletePlanMutation.isPending ? "刪除中..." : "確認刪除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}