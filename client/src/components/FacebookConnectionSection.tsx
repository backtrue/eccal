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
  const [connectionStep, setConnectionStep] = useState<'check' | 'auth' | 'select' | 'ready' | 'diagnosis'>('check');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const { toast } = useToast();

  // Hooks
  const connectionQuery = useFacebookConnection(connectionStep === 'check');
  const authUrlQuery = useFacebookAuthUrl();
  const accountsQuery = useFacebookAdAccounts(connectionStep === 'select');
  const selectAccountMutation = useSelectFacebookAccount();
  const diagnosisMutation = useFacebookDiagnosis();

  // Check connection status on component mount
  useEffect(() => {
    if (connectionQuery.data) {
      const connection = connectionQuery.data as any;
      if (connection.connected && connection.accountId) {
        setConnectionStep('ready');
        onConnectionSuccess?.();
      } else if (connection.connected && !connection.accountId) {
        setConnectionStep('select');
      } else {
        setConnectionStep('auth');
      }
    }
  }, [connectionQuery.data, onConnectionSuccess]);

  // Handle Facebook OAuth
  const handleFacebookAuth = async () => {
    try {
      const result = await authUrlQuery.refetch();
      const data = result.data as any;
      if (data?.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
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

  // Render different steps
  if (connectionStep === 'check') {
    return (
      <div className="text-center text-gray-600">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        <span className="text-sm">檢查連接狀態...</span>
      </div>
    );
  }

  if (connectionStep === 'auth') {
    return (
      <div className="space-y-4">
        <p className="text-gray-600 text-sm">
          請先連接您的 Facebook 廣告帳戶以進行廣告健檢
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