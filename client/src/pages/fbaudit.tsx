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
import { useFbAuditStream } from "@/hooks/useFbAuditStream";
import { NPSRating } from "@/components/NPSRating";
import FacebookAccountSelector from "@/components/FacebookAccountSelector";
import type { Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";

interface FbAuditProps {
  locale: Locale;
}

export default function FbAudit({ locale }: FbAuditProps) {
  const t = getTranslations(locale);
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
  const streamAudit = useFbAuditStream();

  const handleStartAudit = async () => {
    if (!selectedAccount || !selectedPlan || !selectedIndustry) {
      return;
    }

    try {
      console.log('開始執行健檢...', {
        selectedAccount,
        selectedPlan,
        selectedIndustry
      });
      
      const result = await checkMutation.mutateAsync({
        adAccountId: selectedAccount,
        planResultId: selectedPlan,
        industryType: selectedIndustry,
        locale
      });

      console.log('健檢成功完成:', result);
      setShowResults(true);
    } catch (error) {
      console.error('Audit failed:', error);
      // 即使失敗也要有清楚的錯誤顯示
      alert(t.healthCheckFailed);
    }
  };

  const handleStartStreamingAudit = async () => {
    if (!selectedAccount || !selectedPlan || !selectedIndustry) {
      return;
    }

    setShowResults(true);
    streamAudit.reset();
    await streamAudit.startStreamingHealthCheck(
      selectedAccount,
      selectedPlan,
      selectedIndustry,
      locale
    );
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
            <h1 className="text-3xl font-bold mb-4">{t.fbAuditTitle}</h1>
            <p className="text-gray-600 mb-8">{t.loginRequired}</p>
            <Button size="lg" onClick={() => window.location.href = '/api/auth/google'}>
              {t.loginWithGoogle}
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // 調試前端狀態
  console.log('前端狀態檢查:', {
    showResults,
    hasData: !!checkMutation.data,
    mutationStatus: checkMutation.status,
    isLoading: checkMutation.isPending
  });

  if (showResults && checkMutation.data) {
    console.log('健檢結果數據:', checkMutation.data);
    
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar locale={locale} />
        <div className="container mx-auto p-6 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t.healthCheckResults}</h1>
            <p className="text-gray-600">{t.resultsBasedOn}</p>
          </div>

          {/* 健檢結果概覽 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {t.overallScore}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 日均花費 */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">日均花費</div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    NT$ {(checkMutation.data as any)?.actualMetrics?.dailySpend?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs text-gray-500">
                    目標: NT$ {(checkMutation.data as any)?.comparisons?.find((c: any) => c.metric === 'dailySpend')?.target?.toLocaleString() || '0'}
                  </div>
                </div>

                {/* 總購買數 */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">總購買數</div>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {(checkMutation.data as any)?.actualMetrics?.purchases || 0}
                  </div>
                  <div className="text-xs text-gray-500">
                    目標: {(checkMutation.data as any)?.comparisons?.find((c: any) => c.metric === 'purchases')?.target || 0}
                  </div>
                </div>

                {/* ROAS */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">ROAS</div>
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {(checkMutation.data as any)?.actualMetrics?.roas?.toFixed(1) || '0.0'}x
                  </div>
                  <div className="text-xs text-gray-500">
                    目標: {((checkMutation.data as any)?.comparisons?.find((c: any) => c.metric === 'roas')?.target || 0).toFixed(1)}x
                  </div>
                </div>

                {/* 連結點擊率 */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">連結點擊率</div>
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {(checkMutation.data as any)?.actualMetrics?.ctr?.toFixed(2) || '0.00'}%
                  </div>
                  <div className="text-xs text-gray-500">
                    目標: {((checkMutation.data as any)?.comparisons?.find((c: any) => c.metric === 'ctr')?.target || 0).toFixed(2)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 詳細指標分析 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {((checkMutation.data as any)?.comparisons || []).map((comparison: any, index: number) => {
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
                          {(() => {
                            const actual = comparison.actual;
                            if (actual === undefined || actual === null || isNaN(actual)) {
                              return '無資料';
                            }
                            
                            if (comparison.metric === 'ctr') {
                              return `${actual.toFixed(2)}%`;
                            } else if (comparison.metric === 'roas') {
                              return `${actual.toFixed(1)}x`;
                            } else {
                              return actual.toLocaleString();
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                    
                    {!isAchieved && comparison.advice && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-yellow-800 mb-1">{t.aiRecommendations}</div>
                            <div 
                              className="text-yellow-700 text-sm leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: comparison.advice }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* NPS 評分組件 */}
          {(checkMutation.data as any)?.healthCheckId && (
            <NPSRating 
              healthCheckId={(checkMutation.data as any).healthCheckId}
              locale={locale}
              onRatingSubmitted={() => {
                console.log('NPS 評分已提交');
              }}
            />
          )}

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
{t.runAgain}
            </Button>
            <Button onClick={() => window.location.href = '/dashboard'}>
{t.backToDashboard}
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
          <h1 className="text-4xl font-bold mb-4">{t.fbAuditTitle}</h1>
          <p className="text-xl text-gray-600 mb-6">
            {t.fbAuditDescription}
          </p>
          
          {/* 安全提示 */}
          <Alert className="max-w-2xl mx-auto mb-8">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              {t.securityNotice}
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
            {currentStep === 1 && t.fbAuditStep1}
            {currentStep === 2 && t.fbAuditStep2}
            {currentStep === 3 && t.fbAuditStep3}
            {currentStep === 4 && t.fbAuditStep4}
          </div>
        </div>

        {/* 步驟 1: Facebook 連接 */}
        {currentStep === 1 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Facebook className="w-5 h-5" />
                {t.fbAuditStep1}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isConnected ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-6">
                    {t.connectFacebookPrompt}
                  </p>
                  <FacebookLoginButton />
                  
                  {/* Facebook 設定指南連結 */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-3">
                      {t.errorEncountered}
                    </p>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('/facebook-setup', '_blank')}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {t.fbSetupGuide}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <p className="text-green-600 font-medium mb-4">{t.facebookConnected}</p>
                  <Button onClick={() => setCurrentStep(2)}>
                    {t.nextSelectAccount}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* {t.selectAdAccountStep} */}
        {currentStep === 2 && isConnected && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                {t.fbAuditStep2}
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
                  <FacebookAccountSelector 
                    onAccountSelected={(accountId) => setSelectedAccount(accountId)}
                    accounts={accounts}
                    isLoading={accountsLoading}
                    useExternalData={true}
                  />
                  
                  {selectedAccount && (
                    <div className="text-center pt-4">
                      <Button onClick={() => setCurrentStep(3)}>
                        {t.nextSelectBudgetPlan}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                  <p className="text-yellow-600 font-medium">{t.noAccountsFound}</p>
                  <p className="text-gray-600 text-sm">{t.confirmFbPermissions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* {t.selectPlanStep} */}
        {currentStep === 3 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {t.fbAuditStep3}
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
                      <SelectValue placeholder={t.selectCampaignPlan} />
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
                        {t.nextSelectIndustryType}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <p className="text-blue-600 font-medium mb-4">{locale === 'zh-TW' ? '尚未建立預算計劃' : locale === 'en' ? 'No campaign plan created yet' : 'キャンペーンプランがまだ作成されていません'}</p>
                  <p className="text-gray-600 mb-6">
                    {locale === 'zh-TW' ? '需要先建立預算計劃才能進行健檢對比' : locale === 'en' ? 'Need to create a campaign plan first for health check comparison' : 'ヘルスチェック比較のためにまずキャンペーンプランを作成する必要があります'}
                  </p>
                  <Button onClick={() => window.location.href = '/calculator'}>
                    {locale === 'zh-TW' ? '前往建立預算計劃' : locale === 'en' ? 'Go to Create Campaign Plan' : 'キャンペーンプラン作成へ'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* {t.selectIndustryStep} */}
        {currentStep === 4 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                {t.fbAuditStep4}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectIndustry} />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(industries) && industries.map((industry: any) => {
                      // 根據語言顯示產業名稱
                      const getIndustryName = (industry: any, locale: string) => {
                        if (locale === 'en') {
                          return industry.nameEn || industry.name;
                        } else if (locale === 'ja') {
                          // 日文產業類型翻譯
                          const jaTranslations: Record<string, string> = {
                            '藝文娛樂': 'アート・エンターテイメント',
                            '餐飲食品': '飲食・食品',
                            '寵物用品': 'ペット用品',
                            '購物、收藏品與禮品': 'ショッピング・コレクション・ギフト',
                            '健康與健身': 'ヘルス・フィットネス',
                            '美妝保養': '美容・スキンケア',
                            '家居與園藝': 'ホーム・ガーデン',
                            '家具': '家具',
                            '服飾／時尚與珠寶': 'ファッション・ジュエリー',
                            '工業與商業用品': '産業・商業用品',
                            '其他': 'その他'
                          };
                          return jaTranslations[industry.name] || industry.name;
                        } else {
                          return industry.name;
                        }
                      };

                      const displayName = getIndustryName(industry, locale);
                      
                      return (
                        <SelectItem key={industry.id} value={industry.id}>
                          {displayName}
                        </SelectItem>
                      );
                    })}
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
                          {t.startHealthCheck}
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
              <h3 className="text-lg font-medium mb-2">{t.analyzingYourData}</h3>
              <p className="text-gray-600 mb-6">{t.analyzingDescription}</p>
              
              <div className="max-w-md mx-auto">
                <Progress value={75} className="mb-2" />
                <p className="text-sm text-gray-500">
                  {t.tipTitle}：{t.tipMessage}
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