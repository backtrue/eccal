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

  const { data: project, isLoading, error } = useQuery<SavedProject>({
    queryKey: [`/api/projects/${id}`],
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  // Debug logging
  console.log("Project Detail Debug:", { id, isLoading, error, project });

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
    
    const data = project.projectData || {};
    const result = project.lastCalculationResult || {};

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
                <p className="font-medium">{data.startDate || '未設定'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">活動結束日期</span>
                <p className="font-medium">{data.endDate || '未設定'}</p>
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600">活動天數</span>
              <p className="font-medium">{result.totalDays || 0} 天</p>
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
              <p className="font-semibold text-lg">{data.targetRevenue ? formatCurrency(data.targetRevenue) : '未設定'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">目標客單價</span>
              <p className="font-semibold text-lg">{data.targetAov ? formatCurrency(data.targetAov) : '未設定'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">目標轉換率</span>
              <p className="font-semibold text-lg">{data.targetConversionRate ? formatPercentage(data.targetConversionRate) : '未設定'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">每次點擊成本</span>
              <p className="font-semibold text-lg">{data.cpc ? formatCurrency(data.cpc) : '未設定'}</p>
            </div>
          </CardContent>
        </Card>

        {/* 活動規劃結果 */}
        {result && Object.keys(result).length > 0 && (
          <>
            {/* 活動規劃結果概覽 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  活動規劃結果
                </CardTitle>
                <CardDescription>完整的活動預算與流量分配建議</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {result.totalBudget ? formatCurrency(result.totalBudget) : '0'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">總預算</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {result.totalTraffic?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">總流量需求</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {(() => {
                        if (!result.campaignPeriods || !result.totalBudget) return '0%';
                        const mainPeriod = result.campaignPeriods.main || result.campaignPeriods.day2;
                        if (!mainPeriod) return '0%';
                        return Math.round((mainPeriod.budget / result.totalBudget) * 100) + '%';
                      })()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">活動期預算比例</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 動態預算分配分析 */}
            {result.campaignPeriods && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    動態預算分配分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {Object.entries(result.campaignPeriods).map(([key, period]: [string, any]) => {
                      const periodNames = {
                        preheat: '預熱期',
                        launch: '起跑期', 
                        main: '活動期',
                        final: '倒數期',
                        repurchase: '回購期'
                      };
                      const colors = {
                        preheat: 'bg-gray-200',
                        launch: 'bg-red-200',
                        main: 'bg-blue-200', 
                        final: 'bg-yellow-200',
                        repurchase: 'bg-green-200'
                      };
                      const percentage = result.totalBudget ? ((period.budget / result.totalBudget) * 100).toFixed(1) : '0';
                      
                      return (
                        <div key={key} className={`p-3 rounded-lg text-center ${colors[key as keyof typeof colors] || 'bg-gray-100'}`}>
                          <div className="font-medium text-sm">{periodNames[key as keyof typeof periodNames] || key}</div>
                          <div className="text-lg font-bold">{percentage}%</div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <strong>智能分配邏輯：</strong>
                    活動期預算會根據活動總天數自動調整，長期活動會增加活動期比例以避免中段失血，短期活動則重點投放起跑期與倒數期確保瞬間爆發效果。
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 活動期間規劃 */}
            {result.campaignPeriods && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    活動期間規劃
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto w-full">
                    <div className="flex flex-row gap-4 w-full justify-start items-stretch"
                         style={{ display: 'flex', flexDirection: 'row', minWidth: 'max-content' }}>
                      {Object.entries(result.campaignPeriods).map(([key, period]: [string, any]) => {
                        const periodNames = {
                          preheat: '預熱期',
                          launch: '起跑期',
                          main: '活動期', 
                          final: '倒數期',
                          repurchase: '回購期',
                          day1: '第一天',
                          day2: '第二天',
                          day3: '第三天'
                        };
                        
                        const startDate = period.startDate ? new Date(period.startDate) : null;
                        const endDate = period.endDate ? new Date(period.endDate) : null;
                        const daysDiff = startDate && endDate ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;
                        const dailyBudget = period.budget && daysDiff > 0 ? Math.ceil(period.budget / daysDiff) : 0;
                        const dailyTraffic = period.traffic && daysDiff > 0 ? Math.ceil(period.traffic / daysDiff) : 0;
                        
                        return (
                          <div key={key} 
                               className="text-center space-y-3 p-4 bg-gray-50 rounded-lg flex-shrink-0" 
                               style={{ minWidth: '180px', flex: '0 0 auto' }}>
                            <div className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2">
                              {periodNames[key as keyof typeof periodNames] || key}
                            </div>
                            
                            <div className="space-y-1">
                              <div className="text-xs text-gray-500 font-medium">日期</div>
                              <div className="text-xs text-gray-700">
                                {startDate && endDate 
                                  ? `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}`
                                  : '未設定'
                                }
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="text-xs text-gray-500 font-medium">總預算</div>
                              <div className="text-lg font-bold text-gray-900">
                                ${period.budget?.toLocaleString() || '0'}
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="text-xs text-gray-500 font-medium">日預算</div>
                              <div className="text-sm font-semibold text-green-600">
                                ${dailyBudget.toLocaleString()}
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="text-xs text-gray-500 font-medium">日流量</div>
                              <div className="text-sm font-semibold text-blue-600">
                                {dailyTraffic.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
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
                更新於 {project.updatedAt ? format(new Date(project.updatedAt), 'yyyy/MM/dd HH:mm', { locale: zhTW }) : '未知'}
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