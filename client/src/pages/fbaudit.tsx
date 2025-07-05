import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import NavigationBar from "@/components/NavigationBar";
import Footer from "@/components/Footer";
import FacebookLoginButton from "@/components/FacebookLoginButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2,
  Facebook,
  BarChart3,
  Lightbulb
} from "lucide-react";
import { useFbAuditAccounts, useFbAuditPlans, useFbAuditIndustries, useFbAuditCheck } from "@/hooks/useFbAudit";
import type { Locale } from "@/lib/i18n";

interface FbAuditProps {
  locale: Locale;
}

export default function FbAudit({ locale }: FbAuditProps) {
  const { user, isAuthenticated } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [showResults, setShowResults] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // 只有在用戶已認證且有 Facebook access token 時才載入帳戶
  const shouldLoadAccounts = Boolean(isAuthenticated && user?.metaAccessToken);
  const { data: accounts, isLoading: accountsLoading } = useFbAuditAccounts(shouldLoadAccounts);
  const { data: plans, isLoading: plansLoading } = useFbAuditPlans(isAuthenticated);
  const { data: industries } = useFbAuditIndustries();
  const checkMutation = useFbAuditCheck();

  const handleStartAudit = async () => {
    if (!selectedAccount || !selectedPlan || !selectedIndustry) {
      return;
    }

    try {
      const result = await checkMutation.mutateAsync({
        adAccountId: selectedAccount,
        planResultId: selectedPlan,
        industryType: selectedIndustry
      });

      setShowResults(true);
    } catch (error) {
      console.error('Audit failed:', error);
    }
  };

  const isConnected = user?.metaAccessToken;
  const hasPlans = plans && plans.length > 0;
  const canStartAudit = selectedAccount && selectedPlan && selectedIndustry;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar locale={locale} />
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="text-center py-20">
            <Facebook className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">FB 廣告健檢</h1>
            <p className="text-gray-600 mb-8">請先登入以使用廣告健檢功能</p>
            <Button size="lg" onClick={() => window.location.href = '/api/auth/google'}>
              使用 Google 登入
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (showResults && checkMutation.data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar locale={locale} />
        <div className="container mx-auto p-6 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">廣告健檢報告</h1>
            <p className="text-gray-600">基於過去 28 天的廣告數據分析</p>
          </div>

          {/* 健檢結果概覽 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                健檢結果概覽
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 日均花費 */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">日均花費</div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    NT$ {(checkMutation.data as any)?.data?.actualMetrics?.dailySpend?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs text-gray-500">
                    目標: NT$ {(checkMutation.data as any)?.data?.comparisons?.find((c: any) => c.metric === 'dailySpend')?.target?.toLocaleString() || '0'}
                  </div>
                </div>

                {/* 總購買數 */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">總購買數</div>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {(checkMutation.data as any)?.data?.actualMetrics?.purchases || 0}
                  </div>
                  <div className="text-xs text-gray-500">
                    目標: {(checkMutation.data as any)?.data?.comparisons?.find((c: any) => c.metric === 'purchases')?.target || 0}
                  </div>
                </div>

                {/* ROAS */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">ROAS</div>
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {(checkMutation.data as any)?.data?.actualMetrics?.roas?.toFixed(1) || '0.0'}x
                  </div>
                  <div className="text-xs text-gray-500">
                    目標: {(checkMutation.data as any)?.data?.comparisons?.find((c: any) => c.metric === 'roas')?.target?.toFixed(1) || '0.0'}x
                  </div>
                </div>

                {/* 連結點擊率 */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">連結點擊率</div>
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {(checkMutation.data as any)?.data?.actualMetrics?.ctr?.toFixed(2) || '0.00'}%
                  </div>
                  <div className="text-xs text-gray-500">
                    目標: {(checkMutation.data as any)?.data?.comparisons?.find((c: any) => c.metric === 'ctr')?.target?.toFixed(2) || '0.00'}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 詳細指標分析 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {((checkMutation.data as any)?.data?.comparisons || []).map((comparison: any, index: number) => {
              const metricNames = {
                dailySpend: '日均花費',
                purchases: '購買數',
                roas: 'ROAS',
                ctr: '連結點擊率'
              };

              const metricIcons = {
                dailySpend: TrendingUp,
                purchases: Target,
                roas: BarChart3,
                ctr: CheckCircle
              };

              const Icon = metricIcons[comparison.metric as keyof typeof metricIcons];
              const isAchieved = comparison.status === 'achieved';

              return (
                <Card key={index} className={`border-l-4 ${isAchieved ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5" />
                        {metricNames[comparison.metric as keyof typeof metricNames]}
                      </div>
                      <Badge variant={isAchieved ? "default" : "destructive"}>
                        {isAchieved ? "達標" : "未達標"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">目標值</div>
                        <div className="text-lg font-bold">
                          {comparison.metric === 'ctr' ? `${comparison.target}%` : 
                           comparison.metric === 'roas' ? `${comparison.target}x` :
                           comparison.target.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">實際值</div>
                        <div className={`text-lg font-bold ${isAchieved ? 'text-green-600' : 'text-red-600'}`}>
                          {comparison.metric === 'ctr' ? `${comparison.actual.toFixed(2)}%` : 
                           comparison.metric === 'roas' ? `${comparison.actual.toFixed(1)}x` :
                           comparison.actual.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {!isAchieved && comparison.advice && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-yellow-800 mb-1">AI 優化建議</div>
                            <div className="text-yellow-700 text-sm leading-relaxed">
                              {comparison.advice}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* 操作按鈕 */}
          <div className="text-center">
            <Button 
              onClick={() => {
                setShowResults(false);
                setCurrentStep(1);
                setSelectedAccount("");
                setSelectedPlan("");
                setSelectedIndustry("");
              }}
              variant="outline"
              className="mr-4"
            >
              重新健檢
            </Button>
            <Button onClick={() => window.location.href = '/dashboard'}>
              回到儀表板
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar locale={locale} />
      
      <div className="container mx-auto p-6 max-w-4xl">
        {/* 頁面標題 */}
        <div className="text-center mb-12">
          <Facebook className="w-16 h-16 text-blue-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">FB 廣告健檢</h1>
          <p className="text-xl text-gray-600 mb-6">
            快速診斷您的 Facebook 廣告成效，獲得 AI 優化建議
          </p>
          
          {/* 安全提示 */}
          <Alert className="max-w-2xl mx-auto mb-8">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              我們僅會讀取您的廣告數據，絕不修改任何設定。您的數據安全是我們的首要考量。
            </AlertDescription>
          </Alert>
        </div>

        {/* 步驟進度 */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-gray-600">
            {currentStep === 1 && '連接 Facebook 廣告帳號'}
            {currentStep === 2 && '選擇廣告帳號'}
            {currentStep === 3 && '選擇預算計劃'}
            {currentStep === 4 && '選擇產業類型'}
          </div>
        </div>

        {/* 步驟 1: Facebook 連接 */}
        {currentStep === 1 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Facebook className="w-5 h-5" />
                步驟 1: 連接 Facebook 廣告帳號
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isConnected ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-6">
                    請先連接您的 Facebook 帳號以獲取廣告數據
                  </p>
                  <FacebookLoginButton />
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <p className="text-green-600 font-medium mb-4">Facebook 帳號已連接</p>
                  <Button onClick={() => setCurrentStep(2)}>
                    下一步：選擇廣告帳號
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 步驟 2: 選擇廣告帳號 */}
        {currentStep === 2 && isConnected && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                步驟 2: 選擇要健檢的廣告帳號
              </CardTitle>
            </CardHeader>
            <CardContent>
              {accountsLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-gray-600">載入廣告帳號中...</p>
                </div>
              ) : accounts && accounts.length > 0 ? (
                <div className="space-y-4">
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger>
                      <SelectValue placeholder="請選擇要健檢的廣告帳號" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account: any) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} (ID: {account.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedAccount && (
                    <div className="text-center pt-4">
                      <Button onClick={() => setCurrentStep(3)}>
                        下一步：選擇預算計劃
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                  <p className="text-yellow-600 font-medium">未找到可用的廣告帳號</p>
                  <p className="text-gray-600 text-sm">請確認您的 Facebook 帳號有廣告管理權限</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 步驟 3: 選擇預算計劃 */}
        {currentStep === 3 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                步驟 3: 選擇預算計劃
              </CardTitle>
            </CardHeader>
            <CardContent>
              {plansLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-gray-600">載入預算計劃中...</p>
                </div>
              ) : hasPlans ? (
                <div className="space-y-4">
                  <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                    <SelectTrigger>
                      <SelectValue placeholder="請選擇要對比的預算計劃" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan: any) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.planName} (目標 ROAS: {plan.targetRoas}x)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedPlan && (
                    <div className="text-center pt-4">
                      <Button onClick={() => setCurrentStep(4)}>
                        下一步：選擇產業類型
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <p className="text-blue-600 font-medium mb-4">尚未建立預算計劃</p>
                  <p className="text-gray-600 mb-6">
                    需要先建立預算計劃才能進行健檢對比
                  </p>
                  <Button onClick={() => window.location.href = '/calculator'}>
                    前往建立預算計劃
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 步驟 4: 選擇產業類型 */}
        {currentStep === 4 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                步驟 4: 選擇產業類型
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="請選擇您的產業類型" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(industries) && industries.map((industry: any) => (
                      <SelectItem key={industry.id} value={industry.id}>
                        {industry.name} (平均 ROAS: {industry.averageRoas}x, 平均 CTR: {industry.averageCtr}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedIndustry && (
                  <div className="text-center pt-4">
                    <Button 
                      onClick={handleStartAudit}
                      disabled={!canStartAudit || checkMutation.isPending}
                      size="lg"
                      className="px-8"
                    >
                      {checkMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          分析中...
                        </>
                      ) : (
                        <>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          開始健檢
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 載入狀態 */}
        {checkMutation.isPending && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mb-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
              <h3 className="text-lg font-medium mb-2">正在分析您的廣告數據</h3>
              <p className="text-gray-600 mb-6">正在為您分析過去 28 天的廣告數據，請稍候...</p>
              
              <div className="max-w-md mx-auto">
                <Progress value={75} className="mb-2" />
                <p className="text-sm text-gray-500">
                  💡 小提示：廣告素材的 CTR 越高，通常 CPC 就越低，因為系統認為這是受歡迎的內容！
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Footer />
    </div>
  );
}