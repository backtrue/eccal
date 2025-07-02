import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLocale } from "@/hooks/useLocale";
import NavigationBar from "@/components/NavigationBar";
import Footer from "@/components/Footer";
import DiagnosisReport from "@/components/DiagnosisReport";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { Link } from "wouter";

export default function DiagnosisReportPage() {
  const { reportId } = useParams();
  const { isAuthenticated } = useAuth();
  const { locale } = useLocale();

  const { data: report, isLoading, error } = useQuery({
    queryKey: [`/api/diagnosis/report/${reportId}`],
    enabled: isAuthenticated && !!reportId,
    refetchInterval: (data: any) => {
      // 如果狀態是 processing，每5秒重新獲取
      return data?.diagnosisStatus === 'processing' ? 5000 : false;
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar locale={locale} />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>需要登入</CardTitle>
              <CardDescription>
                請先登入以查看診斷報告
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button className="w-full">
                  返回首頁
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar locale={locale} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">無法載入報告</CardTitle>
                <CardDescription>
                  {error ? '載入報告時發生錯誤' : '找不到指定的診斷報告'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/calculator">
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    返回計算器
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 頁面標題 */}
          <div className="flex items-center gap-4 mb-6">
            <Link href="/calculator">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回計算器
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold">Facebook 廣告健診報告</h1>
            </div>
          </div>

          {/* 診斷報告內容 */}
          <DiagnosisReport report={report} />
        </div>
      </div>
      <Footer />
    </div>
  );
}