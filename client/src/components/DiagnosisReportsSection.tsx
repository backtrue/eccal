import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Clock, CheckCircle, XCircle, FileText, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface DiagnosisReport {
  id: string;
  campaignName: string;
  diagnosisStatus: 'processing' | 'completed' | 'failed';
  overallHealthScore: number;
  createdAt: string;
  aiDiagnosisReport?: string;
}

interface DiagnosisSummary {
  total: number;
  processing: number;
  completed: number;
  failed: number;
  latestReport: DiagnosisReport | null;
}

function useDiagnosisReports() {
  return useQuery<DiagnosisReport[]>({
    queryKey: ['/api/dashboard/diagnosis-reports'],
    staleTime: 30 * 1000, // 30 seconds
  });
}

function useDiagnosisSummary() {
  return useQuery<DiagnosisSummary>({
    queryKey: ['/api/dashboard/diagnosis-summary'],
    staleTime: 30 * 1000, // 30 seconds
  });
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'processing':
      return <Badge variant="outline" className="text-yellow-600 border-yellow-300"><Clock className="w-3 h-3 mr-1" />處理中</Badge>;
    case 'completed':
      return <Badge variant="outline" className="text-green-600 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />已完成</Badge>;
    case 'failed':
      return <Badge variant="outline" className="text-red-600 border-red-300"><XCircle className="w-3 h-3 mr-1" />失敗</Badge>;
    default:
      return <Badge variant="outline">未知</Badge>;
  }
}

function getHealthScoreColor(score: number) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

export default function DiagnosisReportsSection() {
  const { data: reports, isLoading: reportsLoading } = useDiagnosisReports();
  const { data: summary, isLoading: summaryLoading } = useDiagnosisSummary();

  // Type guards
  const typedReports = Array.isArray(reports) ? reports as DiagnosisReport[] : [];
  const typedSummary = (summary && typeof summary === 'object' && 'total' in summary) 
    ? summary as DiagnosisSummary 
    : null;

  if (reportsLoading || summaryLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Facebook 廣告診斷
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">載入診斷報告中...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!typedSummary || typedSummary.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Facebook 廣告診斷
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">還沒有診斷報告</h3>
            <p className="text-gray-600 mb-4">開始分析您的 Facebook 廣告成效</p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              開始診斷
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Facebook 廣告診斷概覽
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{typedSummary.total}</div>
              <div className="text-sm text-gray-500">總報告數</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{typedSummary.processing}</div>
              <div className="text-sm text-gray-500">處理中</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{typedSummary.completed}</div>
              <div className="text-sm text-gray-500">已完成</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{typedSummary.failed}</div>
              <div className="text-sm text-gray-500">失敗</div>
            </div>
          </div>

          {typedSummary.latestReport && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">最新診斷報告</h4>
                {getStatusBadge(typedSummary.latestReport.diagnosisStatus)}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{typedSummary.latestReport.campaignName}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(typedSummary.latestReport.createdAt), { 
                      addSuffix: true, 
                      locale: zhTW 
                    })}
                  </p>
                </div>
                {typedSummary.latestReport.diagnosisStatus === 'completed' && (
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getHealthScoreColor(typedSummary.latestReport.overallHealthScore)}`}>
                      {typedSummary.latestReport.overallHealthScore}分
                    </div>
                    <div className="text-xs text-gray-500">健康分數</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {typedReports && typedReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              診斷報告列表
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {typedReports.slice(0, 5).map((report: DiagnosisReport) => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{report.campaignName}</span>
                      {getStatusBadge(report.diagnosisStatus)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(report.createdAt), { 
                        addSuffix: true, 
                        locale: zhTW 
                      })}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {report.diagnosisStatus === 'completed' && (
                      <div className="text-right">
                        <div className={`font-bold ${getHealthScoreColor(report.overallHealthScore)}`}>
                          {report.overallHealthScore}分
                        </div>
                      </div>
                    )}
                    
                    {report.diagnosisStatus === 'processing' && (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-gray-500">分析中...</span>
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={report.diagnosisStatus === 'processing'}
                    >
                      查看
                    </Button>
                  </div>
                </div>
              ))}
              
              {typedReports.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline">
                    查看全部 {typedReports.length} 個報告
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}