import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Link } from 'wouter';

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-800">已完成</Badge>;
    case 'processing':
      return <Badge className="bg-yellow-100 text-yellow-800">處理中</Badge>;
    case 'failed':
      return <Badge className="bg-red-100 text-red-800">失敗</Badge>;
    default:
      return <Badge variant="secondary">未知</Badge>;
  }
}

function getHealthScoreColor(score: number) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

function getHealthScoreIcon(score: number) {
  if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
  if (score >= 60) return <AlertCircle className="h-5 w-5 text-yellow-600" />;
  return <AlertCircle className="h-5 w-5 text-red-600" />;
}

export default function DiagnosisReportDetailPage() {
  const [match, params] = useRoute('/diagnosis-report/:id');
  const reportId = params?.id;

  const { data: report, isLoading, error } = useQuery({
    queryKey: [`/api/diagnosis/report/${reportId}`],
    enabled: !!reportId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="animate-pulse bg-gray-200 h-10 w-10 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-8 w-48 rounded"></div>
          </div>
          <div className="space-y-6">
            <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
            <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回儀表板
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">診斷報告詳情</h1>
          </div>
          
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">載入失敗</h2>
              <p className="text-gray-600">無法載入診斷報告詳情，請稍後再試。</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const typedReport = report as any;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回儀表板
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">診斷報告詳情</h1>
        </div>

        {/* Report Overview */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{typedReport.campaignName || '診斷報告'}</CardTitle>
                <div className="flex items-center gap-4 mt-2">
                  {getStatusBadge(typedReport.diagnosisStatus || 'completed')}
                  <span className="text-sm text-gray-500">
                    {typedReport.createdAt ? formatDistanceToNow(new Date(typedReport.createdAt), { 
                      addSuffix: true, 
                      locale: zhTW 
                    }) : '剛剛'}
                  </span>
                </div>
              </div>
              {typedReport.diagnosisStatus === 'completed' && typedReport.overallHealthScore && (
                <div className="text-center">
                  <div className="flex items-center gap-2 mb-1">
                    {getHealthScoreIcon(typedReport.overallHealthScore)}
                    <span className="text-sm font-medium">健康分數</span>
                  </div>
                  <div className={`text-3xl font-bold ${getHealthScoreColor(typedReport.overallHealthScore)}`}>
                    {typedReport.overallHealthScore}分
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Processing Status */}
        {typedReport.diagnosisStatus === 'processing' && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-4">
                <Clock className="h-8 w-8 text-yellow-600 animate-pulse" />
                <div>
                  <h3 className="font-semibold">AI 分析進行中</h3>
                  <p className="text-sm text-gray-600">正在分析您的廣告帳戶數據，請稍候...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Failed Status */}
        {typedReport.diagnosisStatus === 'failed' && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <div>
                  <h3 className="font-semibold text-red-600">診斷分析失敗</h3>
                  <p className="text-sm text-gray-600">分析過程中發生錯誤，請重新嘗試或聯繫客服。</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Report Content */}
        {typedReport.aiDiagnosisReport && (
          <Card>
            <CardHeader>
              <CardTitle>AI 診斷報告</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">{typedReport.aiDiagnosisReport}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debug Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>報告 ID</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              報告編號: {reportId}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              資料結構: {JSON.stringify(Object.keys(typedReport), null, 2)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}