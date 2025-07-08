import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ExternalLink, Copy, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NavigationBar from "@/components/NavigationBar";
import Footer from "@/components/Footer";
import type { Locale } from "@/lib/i18n";

interface FacebookSetupProps {
  locale: Locale;
}

export default function FacebookSetup({ locale }: FacebookSetupProps) {
  const { toast } = useToast();
  const [appId, setAppId] = useState<string>('');
  const [currentDomain, setCurrentDomain] = useState<string>('');

  useEffect(() => {
    setCurrentDomain(window.location.hostname);
    
    // 嘗試獲取當前的 Facebook App ID（用於顯示）
    fetch('/api/diagnosis/facebook-config')
      .then(res => res.json())
      .then(data => {
        if (data.appId) {
          setAppId(data.appId);
        }
      })
      .catch(err => console.log('Could not fetch app config:', err));
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "已複製到剪貼板",
      description: "設定內容已複製，請貼到 Facebook 開發者控制台",
    });
  };

  const redirectUris = [
    `https://eccal.thinkwithblack.com/api/diagnosis/facebook-callback`,
    `https://${currentDomain}/api/diagnosis/facebook-callback`
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar locale={locale} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Facebook 應用程式設定指南</h1>
            <p className="text-gray-600">
              請按照以下步驟在 Facebook 開發者控制台設定你的應用程式
            </p>
          </div>

          {/* 步驟 1: 應用程式狀態 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                步驟 1: 應用程式模式設定
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">將應用程式設為上線模式</p>
                    <p className="text-sm text-gray-600">
                      在 Facebook 開發者控制台 → 應用程式設定 → 基本設定 → 應用程式模式
                      <br />
                      選擇「上線」(Live) 而不是「開發」(Development)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 步驟 2: 重定向 URI */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                步驟 2: 有效的 OAuth 重新導向 URI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  在 Facebook 開發者控制台 → Facebook 登入 → 設定 → 有效的 OAuth 重新導向 URI
                  <br />
                  請添加以下 URI：
                </p>
                
                {redirectUris.map((uri, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                    <code className="flex-1 text-sm">{uri}</code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(uri)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 步驟 3: 應用程式權限 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                步驟 3: 應用程式權限設定
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2">確保以下權限已啟用：</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <code>ads_read</code> - 讀取廣告資料
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <code>ads_management</code> - 管理廣告帳戶
                    </li>
                  </ul>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>注意：</strong> 這些權限可能需要 Facebook 審核，特別是 ads_management。
                    在審核通過前，只有應用程式的測試用戶可以使用這些功能。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 步驟 4: 測試連接 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                步驟 4: 測試連接
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appId && (
                  <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                    <span className="text-sm">當前 Facebook App ID:</span>
                    <code className="text-sm font-mono">{appId}</code>
                  </div>
                )}
                
                <div className="flex gap-4">
                  <Button 
                    onClick={() => window.open('https://developers.facebook.com/apps/', '_blank')}
                    variant="outline"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    打開 Facebook 開發者控制台
                  </Button>
                  
                  <Button 
                    onClick={() => window.location.href = '/fbaudit'}
                  >
                    返回 FB 廣告健檢
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 故障排除 */}
          <Card>
            <CardHeader>
              <CardTitle>常見問題解決方案</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    錯誤：「無法使用此功能」
                  </h4>
                  <p className="text-sm text-gray-600 ml-6">
                    應用程式可能還在開發模式，請將其切換為上線模式
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    錯誤：重新導向 URI 不匹配
                  </h4>
                  <p className="text-sm text-gray-600 ml-6">
                    請確保在 Facebook 設定中添加了正確的重新導向 URI
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    權限被拒絕
                  </h4>
                  <p className="text-sm text-gray-600 ml-6">
                    ads_management 權限需要 Facebook 審核，或者將使用者添加為應用程式的測試用戶
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer locale={locale} />
    </div>
  );
}