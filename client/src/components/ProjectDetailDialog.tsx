import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Calculator, Target, TrendingUp, ShoppingCart, Percent, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { type SavedProject } from "@/hooks/useSavedProjects";

interface ProjectDetailDialogProps {
  project: SavedProject | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProjectDetailDialog({ project, open, onOpenChange }: ProjectDetailDialogProps) {
  if (!project) return null;

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

  const formatCurrency = (amount: number, currency = "NTD") => {
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

  const renderBudgetCalculatorDetails = () => {
    const data = project.projectData;
    const result = project.lastCalculationResult;

    return (
      <div className="space-y-6">
        {/* 輸入參數 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              計算參數
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600">目標月營收</span>
              <p className="font-semibold text-lg">{formatCurrency(data.monthlyRevenue)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">平均訂單價值</span>
              <p className="font-semibold text-lg">{formatCurrency(data.averageOrderValue)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">轉換率</span>
              <p className="font-semibold text-lg">{formatPercentage(data.conversionRate)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">每次點擊成本</span>
              <p className="font-semibold text-lg">{formatCurrency(data.costPerClick)}</p>
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
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">所需訂單數</span>
                <p className="font-semibold text-lg">{result.requiredOrders?.toLocaleString() || 0} 筆</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">所需流量</span>
                <p className="font-semibold text-lg">{result.requiredTraffic?.toLocaleString() || 0} 人</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">月廣告預算</span>
                <p className="font-semibold text-lg text-blue-600">{formatCurrency(result.monthlyAdBudget || 0)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">日廣告預算</span>
                <p className="font-semibold text-lg text-green-600">{formatCurrency(result.dailyAdBudget || 0)}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getProjectTypeIcon(project.projectType)}
            <div>
              <DialogTitle className="text-xl">{project.projectName}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">
                  {getProjectTypeLabel(project.projectType)}
                </Badge>
                <span className="text-sm text-gray-500">
                  建立於 {format(new Date(project.createdAt), "yyyy年MM月dd日", { locale: zhTW })}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6">
          {project.projectType === "campaign_planner" 
            ? renderCampaignPlannerDetails() 
            : renderBudgetCalculatorDetails()
          }
        </div>
      </DialogContent>
    </Dialog>
  );
}