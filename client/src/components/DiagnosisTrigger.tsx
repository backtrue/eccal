import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Activity, Zap, Link, CheckCircle, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

interface DiagnosisTriggerProps {
  calculatorResults: {
    targetRevenue: number;
    targetAov: number;
    targetConversionRate: number;
    cpc: number;
    dailyTraffic: number;
    dailyBudget: number;
  };
}

export default function DiagnosisTrigger({ calculatorResults }: DiagnosisTriggerProps) {
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [facebookStatus, setFacebookStatus] = useState<{
    connected: boolean;
    adAccountId?: string;
    needsAccountSelection?: boolean;
  }>({ connected: false });
  const [availableAccounts, setAvailableAccounts] = useState<Array<{
    id: string;
    name: string;
    status: string;
    currency: string;
  }>>([]);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [systemStatus, setSystemStatus] = useState<{
    api: boolean;
    auth: boolean;
    message: string;
  }>({ api: false, auth: false, message: "檢查中..." });
  
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // 檢查系統狀態和 Facebook 連接狀態
  useEffect(() => {
    const checkStatus = async () => {
      try {
        // 檢查 Facebook OAuth 配置
        const configResponse = await fetch('/api/diagnosis/check-facebook-config');
        const configData = await configResponse.json();
        
        // 檢查用戶 Facebook 連接狀態
        let fbStatus = { connected: false, adAccountId: undefined, needsAccountSelection: false };
        if (isAuthenticated) {
          try {
            const fbResponse = await apiRequest('GET', '/api/diagnosis/facebook-status');
            fbStatus = await fbResponse.json();
          } catch (error) {
            console.log('Facebook status check failed:', error);
          }
        }
        
        setFacebookStatus(fbStatus);
        
        // 如果需要選擇廣告帳戶，獲取可用帳戶列表
        if (fbStatus?.needsAccountSelection) {
          try {
            const accountsResponse = await apiRequest('GET', '/api/diagnosis/facebook-accounts');
            const accountsData = await accountsResponse.json();
            setAvailableAccounts(accountsData.accounts || []);
            setShowAccountSelector(true);
          } catch (error) {
            console.log('Failed to fetch Facebook accounts:', error);
          }
        }
        
        setSystemStatus({
          api: configData.success,
          auth: isAuthenticated,
          message: configData.success 
            ? isAuthenticated 
              ? fbStatus.connected && fbStatus?.adAccountId
                ? "所有系統正常，可以開始診斷"
                : fbStatus?.needsAccountSelection
                  ? "請選擇要分析的廣告帳戶"
                  : "需要連接 Facebook 廣告帳戶"
              : "需要登入 Google 帳戶"
            : "Facebook OAuth 配置異常"
        });
      } catch (error) {
        setSystemStatus({
          api: false,
          auth: isAuthenticated,
          message: "無法連接到診斷服務"
        });
      }
    };

    checkStatus();
  }, [isAuthenticated]);

  // 處理廣告帳戶選擇
  const handleSelectAccount = async (accountId: string) => {
    try {
      const response = await apiRequest('POST', '/api/diagnosis/select-facebook-account', {
        adAccountId: accountId
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFacebookStatus(prev => ({
          ...prev,
          adAccountId: accountId,
          needsAccountSelection: false
        }));
        setShowAccountSelector(false);
        
        toast({
          title: "帳戶設定成功",
          description: `已選擇廣告帳戶 ${accountId}`,
        });
        
        // 重新檢查狀態
        setSystemStatus(prev => ({
          ...prev,
          message: "所有系統正常，可以開始診斷"
        }));
      } else {
        throw new Error(data.message || '設定廣告帳戶失敗');
      }
    } catch (error: any) {
      console.error('設定廣告帳戶錯誤:', error);
      toast({
        title: "設定失敗",
        description: error.message || "設定廣告帳戶時發生錯誤",
        variant: "destructive",
      });
    }
  };

  // 處理 Facebook OAuth 連接
  const handleConnectFacebook = async () => {
    if (!isAuthenticated) {
      toast({
        title: "請先登入",
        description: "需要先登入 Google 帳戶才能連接 Facebook",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const response = await apiRequest('GET', '/api/diagnosis/facebook-auth-url');
      console.log('Facebook OAuth response:', response);
      
      // 解析 JSON 回應
      const data = await response.json();
      console.log('Facebook OAuth data:', data);
      
      const { authUrl } = data;
      
      if (!authUrl) {
        throw new Error('無法獲得 Facebook 授權 URL');
      }
      
      console.log('跳轉到 Facebook OAuth:', authUrl.substring(0, 100) + '...');
      
      // 跳轉到 Facebook OAuth 授權頁面
      window.location.href = authUrl;
      
    } catch (error: any) {
      console.error('Facebook OAuth 錯誤:', error);
      toast({
        title: "連接失敗",
        description: error.message || "無法啟動 Facebook 授權",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  // 開始帳戶診斷
  const handleStartAccountDiagnosis = async () => {
    setIsDiagnosing(true);
    try {
      const response = await apiRequest('POST', '/api/diagnosis/analyze-account', {
        targetRevenue: calculatorResults.targetRevenue,
        targetAov: calculatorResults.targetAov,
        targetConversionRate: calculatorResults.targetConversionRate,
        cpc: calculatorResults.cpc
      });

      const data = await response.json();

      toast({
        title: "帳戶診斷已開始！",
        description: "AI 正在分析您的廣告帳戶，即將跳轉到報告頁面",
      });

      // 跳轉到診斷報告頁面
      setTimeout(() => {
        navigate(`/diagnosis-report/${data.reportId}`);
      }, 2000);

    } catch (error: any) {
      console.error('帳戶診斷啟動錯誤:', error);
      toast({
        title: "診斷失敗",
        description: error.message || "無法啟動廣告帳戶診斷",
        variant: "destructive",
      });
    } finally {
      setIsDiagnosing(false);
    }
  };

  return (
    <Card className="border-gradient-to-r from-blue-100 to-purple-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Facebook 廣告帳戶健診
        </CardTitle>
        <CardDescription>
          連接您的 Facebook 廣告帳戶，獲得 AI 智能診斷與優化建議
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 系統狀態指示 */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">系統狀態</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${systemStatus.api ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-600">API</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${systemStatus.auth ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-xs text-gray-600">Google</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${facebookStatus.connected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-xs text-gray-600">Facebook</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-1">{systemStatus.message}</p>
        </div>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium mb-2">您的目標設定</div>
              <div className="space-y-1 text-gray-600">
                <p>月營收目標: NT${calculatorResults.targetRevenue.toLocaleString()}</p>
                <p>平均客單價: NT${calculatorResults.targetAov}</p>
                <p>目標轉換率: {calculatorResults.targetConversionRate}%</p>
                <p>建議日預算: NT${calculatorResults.dailyBudget.toLocaleString()}</p>
              </div>
            </div>
            <div>
              <div className="font-medium mb-2">帳戶健診功能</div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>✅ 帳戶整體成效分析</p>
                <p>✅ 廣告投放表現診斷</p>
                <p>✅ 轉換漏斗優化建議</p>
                <p>✅ AI 智能改善方案</p>
              </div>
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 mb-1">
                    需要先登入 Google 帳戶
                  </p>
                  <p className="text-xs text-yellow-700">
                    廣告健診功能需要身份驗證才能安全存取您的廣告數據。請點擊右上角的「登入」按鈕。
                  </p>
                </div>
              </div>
            </div>
          ) : !facebookStatus.connected ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Link className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">
                      連接您的 Facebook 廣告帳戶
                    </p>
                    <p className="text-xs text-blue-700 mb-3">
                      我們需要存取您的廣告帳戶數據進行健診分析。您的廣告設定不會被修改，我們只會讀取統計數據。
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleConnectFacebook}
                disabled={isConnecting}
                className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white"
              >
                {isConnecting ? (
                  <>正在跳轉 Facebook 授權...</>
                ) : (
                  <>
                    <Link className="h-4 w-4 mr-2" />
                    連接 Facebook 廣告帳戶
                  </>
                )}
              </Button>
            </div>
          ) : showAccountSelector ? (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <p className="text-sm font-medium text-yellow-800">
                    請選擇要分析的廣告帳戶
                  </p>
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  從您的 Facebook 廣告帳戶中選擇一個進行健診分析
                </p>
              </div>
              
              <div className="space-y-2">
                {availableAccounts.map((account) => (
                  <div
                    key={account.id}
                    onClick={() => handleSelectAccount(account.id)}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">{account.name}</div>
                        <div className="text-xs text-gray-500">帳戶 ID: {account.id}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        <span className={`px-2 py-1 rounded ${
                          account.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {account.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-sm font-medium text-green-800">
                    Facebook 廣告帳戶已連接
                  </p>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  帳戶 ID: {facebookStatus.adAccountId}
                </p>
              </div>

              <Button 
                onClick={handleStartAccountDiagnosis}
                disabled={isDiagnosing}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isDiagnosing ? (
                  <>AI 分析帳戶中...</>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    開始帳戶智能健診
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}