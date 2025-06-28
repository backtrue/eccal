import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Calculator, Target, TrendingUp, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useDeleteProject, type SavedProject } from "@/hooks/useSavedProjects";
import EditProjectDialog from "@/components/EditProjectDialog";
import { useState } from "react";

export default function ProjectDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const deleteProject = useDeleteProject();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Set meta tags to no-index
  useEffect(() => {
    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) {
      metaRobots.setAttribute('content', 'noindex, nofollow');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex, nofollow';
      document.head.appendChild(meta);
    }

    return () => {
      // Clean up on unmount
      const metaToRemove = document.querySelector('meta[name="robots"]');
      if (metaToRemove) {
        metaToRemove.remove();
      }
    };
  }, []);

  const { data: project, isLoading } = useQuery<SavedProject>({
    queryKey: ['/api/projects', id],
    enabled: !!id,
  });

  const handleDelete = async () => {
    if (!project) return;
    
    if (confirm(`確定要刪除專案「${project.projectName}」嗎？此操作無法復原。`)) {
      try {
        await deleteProject.mutateAsync(project.id);
        toast({
          title: "專案已刪除",
          description: `專案「${project.projectName}」已成功刪除`,
        });
        setLocation("/dashboard");
      } catch (error) {
        toast({
          title: "刪除失敗",
          description: "無法刪除專案，請稍後再試",
          variant: "destructive",
        });
      }
    }
  };

  const getProjectTypeLabel = (type: string) => {
    switch (type) {
      case "campaign_planner":
        return "活動預算規劃";
      case "budget_calculator":
        return "廣告預算計算";
      default:
        return type;
    }
  };

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case "campaign_planner":
        return <Calendar className="h-5 w-5" />;
      case "budget_calculator":
        return <Calculator className="h-5 w-5" />;
      default:
        return <Calculator className="h-5 w-5" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${rate.toFixed(2)}%`;
  };

  const renderCampaignPlannerDetails = () => {
    if (!project) return null;
    
    const data = project.projectData;
    const result = project.lastCalculationResult;

    return (
      <div className="space-y-6">
        {/* 活動基本資訊 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              活動基本資訊
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">活動開始日期</span>
                <p className="font-medium">{data.startDate}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">活動結束日期</span>
                <p className="font-medium">{data.endDate}</p>
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600">活動天數</span>
              <p className="font-medium">{result?.totalDays || 0} 天</p>
            </div>
          </CardContent>
        </Card>

        {/* 目標設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              目標設定
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600">目標營業額</span>
              <p className="font-semibold text-lg">{formatCurrency(data.targetRevenue)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">目標客單價</span>
              <p className="font-semibold text-lg">{formatCurrency(data.targetAov)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">目標轉換率</span>
              <p className="font-semibold text-lg">{formatPercentage(data.targetConversionRate)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">每次點擊成本</span>
              <p className="font-semibold text-lg">{formatCurrency(data.cpc)}</p>
            </div>
          </CardContent>
        </Card>

        {/* 計算結果 */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                計算結果
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">所需訂單數</span>
                  <p className="font-semibold text-lg">{result.requiredOrders?.toLocaleString() || 0} 筆</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">所需流量</span>
                  <p className="font-semibold text-lg">{result.requiredTraffic?.toLocaleString() || 0} 人</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">總廣告預算</span>
                  <p className="font-semibold text-lg text-blue-600">{formatCurrency(result.totalBudget || 0)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">平均日預算</span>
                  <p className="font-semibold text-lg text-green-600">{formatCurrency(result.averageDailyBudget || 0)}</p>
                </div>
              </div>

              {/* 各期間預算分配 */}
              {result.periods && (
                <div>
                  <h4 className="font-medium mb-3">各期間預算分配</h4>
                  <div className="grid gap-3">
                    {result.periods.map((period: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">{period.name}</span>
                          <span className="text-sm text-gray-600 ml-2">({period.days} 天)</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(period.budget)}</div>
                          <div className="text-sm text-gray-600">{formatCurrency(period.dailyBudget)}/日</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">專案不存在</h1>
          <p className="text-gray-600 mb-6">找不到您要查看的專案</p>
          <Button onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            回到儀表板
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation("/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.projectName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="flex items-center gap-1">
                {getProjectTypeIcon(project.projectType)}
                {getProjectTypeLabel(project.projectType)}
              </Badge>
              <span className="text-sm text-gray-500">
                更新於 {format(new Date(project.updatedAt), 'yyyy/MM/dd HH:mm', { locale: zhTW })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setEditDialogOpen(true)}
          >
            <Edit className="mr-2 h-4 w-4" />
            編輯
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            刪除
          </Button>
        </div>
      </div>

      {/* Content */}
      {project.projectType === "campaign_planner" && renderCampaignPlannerDetails()}

      {/* Edit Dialog */}
      {editDialogOpen && (
        <EditProjectDialog
          project={project}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </div>
  );
}