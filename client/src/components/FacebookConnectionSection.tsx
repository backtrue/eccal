import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  useFacebookConnection, 
  useFacebookAuthUrl, 
  useFacebookAdAccounts, 
  useSelectFacebookAccount,
  useFacebookDiagnosis
} from '@/hooks/useFacebookDiagnosis';

interface FacebookConnectionSectionProps {
  onConnectionSuccess?: () => void;
  onDiagnosisComplete?: () => void;
  calculationData?: {
    targetRevenue: number;
    targetAov: number;
    targetConversionRate: number;
    cpc: number;
  };
}

export function FacebookConnectionSection({ 
  onConnectionSuccess, 
  onDiagnosisComplete, 
  calculationData 
}: FacebookConnectionSectionProps) {
  const [connectionStep, setConnectionStep] = useState<'auth' | 'select' | 'ready' | 'diagnosis'>('auth');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { toast } = useToast();

  // 檢查 Facebook 連接成功回調
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const facebookAuthSuccess = urlParams.get('facebook_auth_success') === 'true';
    
    if (facebookAuthSuccess) {
      // 清除 URL 參數
      window.history.replaceState({}, '', window.location.pathname);
      
      toast({
        title: "Facebook 授權成功",
        description: "請選擇要分析的廣告帳戶",
      });
      
      // 只有在確認授權成功後才進入選擇步驟
      setConnectionStep('select');
      // 延遲獲取帳戶列表，確保授權完成
      setTimeout(() => {
        fetchFacebookAccounts();
      }, 500);
    }
  }, []);

  // 獲取 Facebook 廣告帳戶列表
  const fetchFacebookAccounts = async () => {
    try {
      // 先檢查是否有 token
      const tokenResponse = await fetch('/api/diagnosis/facebook-token-check');
      const tokenData = await tokenResponse.json();
      
      if (!tokenData.hasToken) {
        throw new Error('請先完成 Facebook 授權');
      }
      
      const response = await fetch('/api/diagnosis/facebook-accounts-list');
      const data = await response.json();
      
      if (data.accounts) {
        setAccounts(data.accounts);
      } else {
        throw new Error(data.error || '無法獲取廣告帳戶');
      }
    } catch (error) {
      console.error('獲取廣告帳戶失敗:', error);
      toast({
        title: "獲取帳戶失敗",
        description: "無法獲取 Facebook 廣告帳戶列表",
        variant: "destructive",
      });
      // 如果沒有 token，回到授權步驟
      setConnectionStep('auth');
    }
  };

  // 步驟 1: 點擊連接 Facebook 廣告帳戶
  const handleFacebookAuth = async () => {
    try {
      const response = await fetch('/api/diagnosis/facebook-auth-url');
      const data = await response.json();
      
      if (data.authUrl) {
        console.log('重定向到 Facebook OAuth:', data.authUrl);
        // 步驟 2: 重定向到 Facebook OAuth 授權頁面
        window.location.href = data.authUrl;
      } else {
        throw new Error('無法獲取授權連結');
      }
    } catch (error) {
      console.error('Facebook 授權錯誤:', error);
      toast({
        title: "授權失敗",
        description: "無法獲取 Facebook 授權連結，請稍後再試",
        variant: "destructive",
      });
    }
  };

  // 步驟 5: 選擇要分析的廣告帳戶
  const handleAccountSelect = async (accountId: string) => {
    try {
      const response = await fetch('/api/diagnosis/facebook-select-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId }),
      });

      if (response.ok) {
        setSelectedAccount(accountId);
        setConnectionStep('ready');
        onConnectionSuccess?.();
        toast({
          title: "連接成功",
          description: "Facebook 廣告帳戶已連接，可以進行診斷",
        });
      } else {
        throw new Error('選擇帳戶失敗');
      }
    } catch (error) {
      console.error('選擇帳戶錯誤:', error);
      toast({
        title: "選擇失敗",
        description: "無法選擇廣告帳戶",
        variant: "destructive",
      });
    }
  };

  // 步驟 6: 開始廣告健檢診斷
  const handleDiagnosis = async () => {
    if (!calculationData) {
      toast({
        title: "計算資料缺失",
        description: "請先完成預算計算",
        variant: "destructive",
      });
      return;
    }

    setConnectionStep('diagnosis');
    
    try {
      const response = await fetch('/api/diagnosis/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calculationData),
      });

      if (response.ok) {
        onDiagnosisComplete?.();
        toast({
          title: "診斷完成",
          description: "Facebook 廣告健檢分析已完成",
        });
      } else {
        throw new Error('診斷失敗');
      }
    } catch (error) {
      console.error('診斷錯誤:', error);
      setConnectionStep('ready');
      toast({
        title: "診斷失敗",
        description: "無法完成廣告健檢分析",
        variant: "destructive",
      });
    }
  };

  // Render different steps (removed check step since we don't use it)

  if (connectionStep === 'auth') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-2 w-2 bg-red-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Facebook 帳戶未連接</span>
        </div>
        
        <p className="text-gray-600 text-sm">
          連接您的 Facebook 廣告帳戶以進行專業廣告健檢分析
        </p>
        
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>訂單數對比</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>預算效率</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>流量表現</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>ROAS 達成率</span>
          </div>
        </div>
        
        <Button 
          onClick={handleFacebookAuth}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          連接 Facebook 廣告帳戶
        </Button>
      </div>
    );
  }

  // 步驟 4: 選擇廣告帳戶
  if (connectionStep === 'select') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Facebook 授權成功</span>
        </div>
        
        <p className="text-gray-600 text-sm">
          請選擇要分析的 Facebook 廣告帳戶
        </p>
        
        {accounts.length > 0 ? (
          <div className="space-y-2">
            {accounts.map((account) => (
              <Button
                key={account.id}
                onClick={() => handleAccountSelect(account.id)}
                variant="outline"
                className="w-full text-left justify-start"
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{account.name}</span>
                  <span className="text-xs text-gray-500">{account.id}</span>
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <span className="text-sm">載入廣告帳戶中...</span>
          </div>
        )}
      </div>
    );
  }

  if (connectionStep === 'ready') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Facebook 廣告帳戶已連接</span>
        </div>
        
        <p className="text-gray-600 text-sm">
          基於您的計算結果，我們將分析 Facebook 廣告帳戶的四大核心指標：
        </p>
        
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>訂單數對比</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>預算效率</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>流量表現</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>ROAS 達成率</span>
          </div>
        </div>
        
        <Button 
          onClick={handleDiagnosis}
          disabled={!calculationData}
          className="w-full"
        >
          開始廣告健檢
        </Button>
      </div>
    );
  }

  if (connectionStep === 'diagnosis') {
    return (
      <div className="text-center space-y-4">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <div>
          <p className="text-gray-600 text-sm mb-2">正在分析您的 Facebook 廣告帳戶...</p>
          <p className="text-xs text-gray-500">
            這可能需要 30-60 秒的時間來獲取和分析您的廣告數據
          </p>
        </div>
      </div>
    );
  }

  return null;
}