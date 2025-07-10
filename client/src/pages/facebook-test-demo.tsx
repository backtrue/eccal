import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import NavigationBar from "@/components/NavigationBar";
import Footer from "@/components/Footer";
import FacebookLoginButton from "@/components/FacebookLoginButton";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Target, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Facebook,
  Eye,
  Lock,
  UserCheck,
  ExternalLink,
  Play,
  ArrowRight
} from "lucide-react";
import type { Locale } from "@/lib/i18n";

interface FacebookTestDemoProps {
  locale: Locale;
}

export default function FacebookTestDemo({ locale }: FacebookTestDemoProps) {
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "1. 訪問測試頁面",
      description: "前往 Facebook 廣告健檢頁面",
      action: "訪問頁面",
      status: "completed"
    },
    {
      id: 2,
      title: "2. Google 登入",
      description: "完成 Google OAuth 身份驗證",
      action: "Google 登入",
      status: isAuthenticated ? "completed" : "pending"
    },
    {
      id: 3,
      title: "3. Facebook 授權",
      description: "授權應用程式存取 Facebook 廣告資料",
      action: "Facebook 授權",
      status: user?.metaAccessToken ? "completed" : "pending"
    },
    {
      id: 4,
      title: "4. 權限確認",
      description: "確認應用程式取得必要權限",
      action: "權限檢查",
      status: user?.metaAccessToken ? "completed" : "pending"
    },
    {
      id: 5,
      title: "5. 廣告帳戶選擇",
      description: "選擇要分析的 Facebook 廣告帳戶",
      action: "選擇帳戶",
      status: "pending"
    },
    {
      id: 6,
      title: "6. 開始健檢",
      description: "執行 Facebook 廣告資料分析",
      action: "開始分析",
      status: "pending"
    }
  ];

  const permissions = [
    {
      name: "ads_read",
      description: "讀取廣告資料",
      purpose: "分析廣告表現、生成診斷報告",
      examples: [
        "讀取廣告帳戶清單",
        "獲取廣告活動資料",
        "分析點擊率和轉換率",
        "計算 ROAS (廣告投資回報率)"
      ]
    },
    {
      name: "ads_management",
      description: "廣告帳戶管理",
      purpose: "存取詳細的廣告帳戶資訊",
      examples: [
        "取得廣告帳戶詳細資訊",
        "讀取廣告組和廣告素材",
        "分析廣告投放設定",
        "提供優化建議"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar locale={locale} />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 頁面標題 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Facebook 應用程式測試演示</h1>
          <p className="text-gray-600 mb-6">
            此頁面為 Facebook 應用程式審查團隊提供完整的測試流程演示
          </p>
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>審查員注意事項：</strong>
              本應用程式需要 ads_read 和 ads_management 權限來提供 Facebook 廣告健檢服務。
              請依照以下步驟完成測試，如有任何問題請聯絡 backtrue@thinkwithblack.com
            </AlertDescription>
          </Alert>
        </div>

        {/* 權限說明 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              權限使用說明
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {permissions.map((permission) => (
                <div key={permission.name} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-blue-600">{permission.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{permission.description}</p>
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">使用目的：</span>
                    <p className="text-sm text-gray-600">{permission.purpose}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">具體用途：</span>
                    <ul className="text-sm text-gray-600 mt-1">
                      {permission.examples.map((example, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 測試步驟 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              測試流程
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    {step.status === "completed" ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : step.status === "pending" ? (
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-500">{step.id}</span>
                      </div>
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                    
                    {step.id === 2 && !isAuthenticated && (
                      <GoogleLoginButton 
                        locale={locale}
                        returnTo="/facebook-test-demo"
                        className="bg-blue-600 hover:bg-blue-700"
                      />
                    )}
                    
                    {step.id === 3 && isAuthenticated && !user?.metaAccessToken && (
                      <div className="space-y-3">
                        <Alert className="border-blue-200 bg-blue-50">
                          <AlertTriangle className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-800">
                            <strong>審查員請注意：</strong>
                            點擊下方按鈕將開啟 Facebook 登入對話框，我們的隱私政策連結會在對話框中顯示。
                            隱私政策網址：<span className="font-mono text-sm">https://thinkwithblack.com/privacy</span>
                          </AlertDescription>
                        </Alert>
                        <FacebookLoginButton />
                        <p className="text-xs text-gray-500">
                          💡 Facebook OAuth 對話框將包含隱私政策連結，符合 Meta 平台政策要求
                        </p>
                      </div>
                    )}
                    
                    {step.id === 4 && user?.metaAccessToken && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Facebook 授權成功</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          應用程式已取得必要權限，可以進行廣告資料分析
                        </p>
                      </div>
                    )}
                    
                    {step.id === 5 && user?.metaAccessToken && (
                      <Button 
                        onClick={() => window.location.href = '/fbaudit'}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        前往廣告健檢 <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 隱私政策與安全說明 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              隱私政策與資料安全
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-lg mb-3 inline-block">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">資料透明</h3>
                <p className="text-sm text-gray-600">
                  明確說明收集哪些資料以及如何使用
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-lg mb-3 inline-block">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">安全保護</h3>
                <p className="text-sm text-gray-600">
                  採用業界標準的加密和安全措施
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 p-3 rounded-lg mb-3 inline-block">
                  <UserCheck className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">用戶控制</h3>
                <p className="text-sm text-gray-600">
                  用戶可隨時撤銷權限或要求刪除資料
                </p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-3">相關連結</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" onClick={() => window.open('https://thinkwithblack.com/privacy', '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  隱私政策
                </Button>
                <Button variant="outline" onClick={() => window.open('https://thinkwithblack.com/terms', '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  服務條款
                </Button>
                <Button variant="outline" onClick={() => window.open('/api/facebook/data-deletion', '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  資料刪除
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 聯絡資訊 */}
        <Card>
          <CardHeader>
            <CardTitle>聯絡資訊</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">技術支援</h3>
              <p className="text-sm text-gray-600 mb-2">
                如果您在測試過程中遇到任何問題，請聯絡我們：
              </p>
              <div className="text-sm">
                <p><strong>公司：</strong>煜言顧問有限公司</p>
                <p><strong>信箱：</strong>backtrue@thinkwithblack.com</p>
                <p><strong>網站：</strong>https://thinkwithblack.com</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}