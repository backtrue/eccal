import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function FacebookTestPage() {
  const [step, setStep] = useState<'auth' | 'accounts' | 'connected'>('auth');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const { toast } = useToast();

  // 檢查 URL 參數，看是否從 Facebook OAuth 回來
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('facebook_connected') === 'true') {
      // 清除 URL 參數
      window.history.replaceState({}, '', window.location.pathname);
      
      // 檢查是否有 access token
      checkFacebookToken();
    }
  }, []);

  // 檢查 Facebook token
  const checkFacebookToken = async () => {
    try {
      const response = await fetch('/api/diagnosis/facebook-token-check');
      if (response.ok) {
        const data = await response.json();
        if (data.hasToken) {
          setAccessToken(data.token);
          setStep('accounts');
          fetchFacebookAccounts();
        }
      }
    } catch (error) {
      console.error('檢查 token 失敗:', error);
    }
  };

  // 步驟 1: 點擊連接 Facebook
  const handleConnectFacebook = async () => {
    try {
      const response = await fetch('/api/diagnosis/facebook-auth-url');
      const data = await response.json();
      
      if (data.authUrl) {
        console.log('重定向到 Facebook OAuth:', data.authUrl);
        window.location.href = data.authUrl;
      } else {
        throw new Error('無法獲取授權連結');
      }
    } catch (error) {
      console.error('Facebook 授權錯誤:', error);
      toast({
        title: "授權失敗",
        description: "無法獲取 Facebook 授權連結",
        variant: "destructive",
      });
    }
  };

  // 步驟 4: 獲取廣告帳戶列表
  const fetchFacebookAccounts = async () => {
    try {
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
    }
  };

  // 步驟 5: 選擇廣告帳戶
  const handleSelectAccount = async (accountId: string) => {
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
        setStep('connected');
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Facebook 廣告帳戶連接測試</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* 步驟 1-2: 授權連接 */}
          {step === 'auth' && (
            <div className="space-y-4">
              <p className="text-gray-600">
                點擊下方按鈕開始 Facebook OAuth 授權流程
              </p>
              <Button 
                onClick={handleConnectFacebook}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                連接 Facebook 廣告帳戶
              </Button>
            </div>
          )}

          {/* 步驟 4-5: 選擇廣告帳戶 */}
          {step === 'accounts' && (
            <div className="space-y-4">
              <p className="text-gray-600">
                選擇要分析的 Facebook 廣告帳戶：
              </p>
              {accounts.length > 0 ? (
                <div className="space-y-2">
                  {accounts.map((account) => (
                    <Button
                      key={account.id}
                      onClick={() => handleSelectAccount(account.id)}
                      variant="outline"
                      className="w-full text-left justify-start"
                    >
                      {account.name} ({account.id})
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">載入廣告帳戶中...</p>
              )}
            </div>
          )}

          {/* 步驟 6: 連接完成 */}
          {step === 'connected' && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-green-800 font-medium">連接成功！</h3>
                <p className="text-green-600 text-sm">
                  Facebook 廣告帳戶已成功連接，現在可以進行廣告健檢診斷
                </p>
              </div>
              <Button 
                onClick={() => window.location.href = '/calculator'}
                className="w-full"
              >
                回到計算器進行診斷
              </Button>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}