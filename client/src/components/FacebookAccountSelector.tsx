import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useFacebookConnection, useFacebookAdAccounts, useSelectFacebookAccount } from '@/hooks/useFacebookDiagnosis';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, AlertCircle, Search, Check } from 'lucide-react';

interface FacebookAccountSelectorProps {
  onAccountSelected?: (accountId: string) => void;
  accounts?: any[];
  isLoading?: boolean;
  useExternalData?: boolean;
}

export default function FacebookAccountSelector({ 
  onAccountSelected, 
  accounts: externalAccounts, 
  isLoading: externalLoading,
  useExternalData = false 
}: FacebookAccountSelectorProps) {
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { user } = useAuth();
  const { data: connectionData } = useFacebookConnection();
  const { data: internalAccounts, isLoading: internalLoading } = useFacebookAdAccounts(!useExternalData);
  const { mutate: selectAccount } = useSelectFacebookAccount();

  // 選擇使用內部或外部資料
  const accounts = useExternalData ? externalAccounts : internalAccounts;
  const accountsLoading = useExternalData ? externalLoading : internalLoading;

  // 檢查是否已連接 Facebook
  const isConnected = (connectionData as any)?.connected || user?.metaAccessToken;

  // 過濾廣告帳戶
  const filteredAccounts = useMemo(() => {
    if (!accounts || !Array.isArray(accounts)) return [];
    
    return (accounts as any[]).filter((account: any) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        account.name.toLowerCase().includes(searchLower) ||
        account.id.toLowerCase().includes(searchLower)
      );
    });
  }, [accounts, searchTerm]);

  // 找到選中的帳戶資訊
  const selectedAccountInfo = useMemo(() => {
    if (!selectedAccount || !accounts) return null;
    return (accounts as any[]).find((account: any) => account.id === selectedAccount);
  }, [selectedAccount, accounts]);

  // 處理帳戶選擇
  const handleAccountSelect = (accountId: string) => {
    setSelectedAccount(accountId);
    selectAccount(accountId);
    onAccountSelected?.(accountId);
    setIsOpen(false);
    setSearchTerm('');
  };

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.facebook-account-selector')) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!isConnected) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Facebook 廣告帳戶
        </label>
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <AlertCircle className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">請先連接 Facebook 帳戶</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">
          Facebook 廣告帳戶
        </label>
        <Badge variant="outline" className="text-green-600 border-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          已連接
        </Badge>
        {accounts && (
          <Badge variant="secondary" className="text-xs">
            {(accounts as any[]).length} 個帳戶
          </Badge>
        )}
      </div>
      
      <div className="relative facebook-account-selector">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between"
          disabled={accountsLoading}
        >
          {accountsLoading ? (
            "載入中..."
          ) : selectedAccountInfo ? (
            <span className="truncate">
              {selectedAccountInfo.name} ({selectedAccountInfo.id})
            </span>
          ) : (
            "選擇 Facebook 廣告帳戶"
          )}
          <Search className="h-4 w-4 ml-2" />
        </Button>

        {isOpen && (
          <Card className="absolute top-full mt-1 w-full z-50 max-h-80 overflow-hidden shadow-lg">
            <CardContent className="p-0">
              <div className="p-3 border-b">
                <Input
                  placeholder="搜尋廣告帳戶名稱或 ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                  autoFocus
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {accountsLoading ? (
                  <div className="p-3 text-center text-gray-500">載入中...</div>
                ) : filteredAccounts.length > 0 ? (
                  <div>
                    <div className="p-2 text-xs text-gray-500 bg-gray-50 border-b">
                      顯示 {filteredAccounts.length} 個帳戶
                    </div>
                    {filteredAccounts.map((account: any) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => handleAccountSelect(account.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{account.name}</div>
                          <div className="text-sm text-gray-500 truncate">{account.id}</div>
                          {account.status !== 1 && (
                            <Badge variant="destructive" className="text-xs mt-1">
                              未啟用
                            </Badge>
                          )}
                        </div>
                        {selectedAccount === account.id && (
                          <Check className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center text-gray-500">
                    {searchTerm ? '找不到符合的廣告帳戶' : '沒有可用的廣告帳戶'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}