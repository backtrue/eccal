import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ReactMarkdown from "react-markdown";
import { 
  AlertCircle, 
  CheckCircle, 
  AlertTriangle, 
  Target, 
  TrendingUp, 
  DollarSign,
  BarChart3,
  Eye
} from "lucide-react";

interface DiagnosisReportProps {
  report: {
    id: string;
    campaignId: string;
    campaignName: string;
    targetDailyTraffic: number;
    targetDailyBudget: string;
    targetCpa: string;
    targetRoas: string;
    actualDailyTraffic: number;
    actualDailySpend: string;
    actualCtr: string;
    actualCpa: string;
    actualRoas: string;
    overallHealthScore: number;
    trafficAchievementRate: string;
    budgetUtilizationRate: string;
    aiDiagnosisReport: string;
    diagnosisStatus: string;
    createdAt: string;
  };
}

export default function DiagnosisReport({ report }: DiagnosisReportProps) {
  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `NT$${num.toLocaleString()}`;
  };

  const formatPercentage = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${num.toFixed(1)}%`;
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthScoreBadge = (score: number) => {
    if (score >= 80) return { variant: "default" as const, icon: CheckCircle, text: "健康" };
    if (score >= 60) return { variant: "secondary" as const, icon: AlertTriangle, text: "注意" };
    return { variant: "destructive" as const, icon: AlertCircle, text: "危險" };
  };

  const getAchievementColor = (rate: string) => {
    const num = parseFloat(rate);
    if (num >= 80) return "text-green-600";
    if (num >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const healthBadge = getHealthScoreBadge(report.overallHealthScore);

  if (report.diagnosisStatus === 'processing') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            正在分析廣告活動...
          </CardTitle>
          <CardDescription>
            請稍等，AI 正在深度分析您的廣告成效
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <Progress value={66} className="w-full" />
            <p className="text-sm text-gray-600">預計需要 1-2 分鐘...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (report.diagnosisStatus === 'failed') {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            診斷失敗
          </CardTitle>
          <CardDescription>
            無法完成廣告活動分析，請稍後重試
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 活動標題與健康分數 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                您的廣告活動「{report.campaignName}」健診報告
              </CardTitle>
              <CardDescription className="mt-2">
                基於最近 7 天的廣告數據分析
              </CardDescription>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getHealthScoreColor(report.overallHealthScore)}`}>
                {report.overallHealthScore}/100
              </div>
              <Badge variant={healthBadge.variant} className="mt-2">
                <healthBadge.icon className="h-3 w-3 mr-1" />
                {healthBadge.text}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 核心指標概覽 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">流量達成率</span>
            </div>
            <div className={`text-2xl font-bold ${getAchievementColor(report.trafficAchievementRate)}`}>
              {formatPercentage(report.trafficAchievementRate)}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              目標: {report.targetDailyTraffic} | 實際: {report.actualDailyTraffic}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">預算使用率</span>
            </div>
            <div className={`text-2xl font-bold ${getAchievementColor(report.budgetUtilizationRate)}`}>
              {formatPercentage(report.budgetUtilizationRate)}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              目標: {formatCurrency(report.targetDailyBudget)} | 實際: {formatCurrency(report.actualDailySpend)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">點擊率 (CTR)</span>
            </div>
            <div className="text-2xl font-bold">
              {formatPercentage(report.actualCtr)}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              目標: {'> 3.0%'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">ROAS</span>
            </div>
            <div className="text-2xl font-bold">
              {parseFloat(report.actualRoas).toFixed(1)}x
            </div>
            <div className="text-xs text-gray-600 mt-1">
              目標: {parseFloat(report.targetRoas).toFixed(1)}x
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI 診斷報告 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            小黑老師的專業診斷
          </CardTitle>
          <CardDescription>
            基於您的商業目標與實際廣告數據的深度分析
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown 
              components={{
                h1: ({ children }) => <h1 className="text-xl font-bold mt-6 mb-4 text-gray-900">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-semibold mt-5 mb-3 text-gray-800">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-medium mt-4 mb-2 text-gray-700">{children}</h3>,
                p: ({ children }) => <p className="mb-3 text-gray-600 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-gray-600">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-200 pl-4 py-2 bg-blue-50 rounded-r">
                    {children}
                  </blockquote>
                ),
                hr: () => <hr className="my-6 border-gray-200" />,
              }}
            >
              {report.aiDiagnosisReport}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* 報告信息 */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="text-xs text-gray-500">
            <p>報告生成時間: {new Date(report.createdAt).toLocaleString('zh-TW')}</p>
            <p>分析期間: 最近 7 天廣告數據</p>
            <p>診斷活動 ID: {report.campaignId}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}