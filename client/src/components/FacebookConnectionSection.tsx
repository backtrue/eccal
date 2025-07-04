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
  const { toast } = useToast();

  // Hooks
  const connectionQuery = useFacebookConnection(true); // 啟用真正的連接檢查
  const authUrlQuery = useFacebookAuthUrl();
  const accountsQuery = useFacebookAdAccounts(connectionStep === 'select');
  const selectAccountMutation = useSelectFacebookAccount();
  const diagnosisMutation = useFacebookDiagnosis();

  // 檢查 Facebook 連接成功回調
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('facebook_connected') === 'true') {
      // 清除 URL 參數
      window.history.replaceState({}, '', window.location.pathname);
      
      // 刷新連接狀態
      connectionQuery.refetch();
      toast({
        title: "Facebook 帳戶連接成功",
        description: "正在檢查您的廣告帳戶...",
      });
    }
  }, []);

  // 檢查連接狀態並更新 UI
  useEffect(() => {
    if (connectionQuery.data) {
      const connection = connectionQuery.data as any;
      console.log('[FACEBOOK_CONNECTION] Current connection status:', connection);
      
      if (connection.hasAccessToken && connection.hasSelectedAccount) {
        console.log('[FACEBOOK_CONNECTION] User has token and selected account - setting to ready');
        setConnectionStep('ready');
        onConnectionSuccess?.();
      } else if (connection.hasAccessToken && !connection.hasSelectedAccount) {
        console.log('[FACEBOOK_CONNECTION] User has token but no account selected - setting to select');
        setConnectionStep('select');
      } else {
        console.log('[FACEBOOK_CONNECTION] User needs to authorize - setting to auth');
        setConnectionStep('auth');
      }
    } else {
      console.log('[FACEBOOK_CONNECTION] No connection data - setting to auth');
      setConnectionStep('auth');
    }
  }, [connectionQuery.data, onConnectionSuccess]);

  // Handle Facebook OAuth - 真正的 OAuth 流程
  const handleFacebookAuth = async () => {
    try {
      const result = await authUrlQuery.refetch();
      const data = result.data as any;
      if (data?.authUrl) {
        console.log('[FACEBOOK_AUTH] Redirecting to Facebook OAuth:', data.authUrl);
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

  // Handle account selection
  const handleAccountSelect = (accountId: string) => {
    setSelectedAccount(accountId);
    selectAccountMutation.mutate(accountId, {
      onSuccess: () => {
        setConnectionStep('ready');
        onConnectionSuccess?.();
      }
    });
  };

  // Handle diagnosis
  const handleDiagnosis = () => {
    if (!calculationData) {
      toast({
        title: "計算資料缺失",
        description: "請先完成預算計算",
        variant: "destructive",
      });
      return;
    }

    setConnectionStep('diagnosis');
    diagnosisMutation.mutate(calculationData, {
      onSuccess: () => {
        onDiagnosisComplete?.();
      },
      onError: () => {
        setConnectionStep('ready');
      }
    });
  };

  // 調試輸出
  console.log('[FACEBOOK_DEBUG] Current state:', {
    connectionStep,
    isLoading: connectionQuery.isLoading,
    connectionData: connectionQuery.data,
    error: connectionQuery.error
  });

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
          disabled={authUrlQuery.isFetching}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {authUrlQuery.isFetching ? '準備中...' : '連接 Facebook 廣告帳戶'}
        </Button>
      </div>
    );
  }

  if (connectionStep === 'select') {
    return (
      <div className="space-y-4">
        <p className="text-gray-600 text-sm">
          請選擇要分析的 Facebook 廣告帳戶
        </p>
        
        <Select value={selectedAccount} onValueChange={handleAccountSelect}>
          <SelectTrigger>
            <SelectValue placeholder="選擇廣告帳戶" />
          </SelectTrigger>
          <SelectContent>
            {(accountsQuery.data as any)?.accounts?.map((account: any) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name} ({account.id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectAccountMutation.isPending && (
          <div className="text-center text-gray-600">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <span className="text-sm">連接中...</span>
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