import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useFacebookConnection, useFacebookAdAccounts, useSelectFacebookAccount } from '@/hooks/useFacebookDiagnosis';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface FacebookAccountSelectorProps {
  onAccountSelected?: (accountId: string) => void;
}

export default function FacebookAccountSelector({ onAccountSelected }: FacebookAccountSelectorProps) {
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const { user } = useAuth();
  const { data: connectionData } = useFacebookConnection();
  const { data: accounts, isLoading: accountsLoading } = useFacebookAdAccounts();
  const { mutate: selectAccount } = useSelectFacebookAccount();

  // 檢查是否已連接 Facebook
  const isConnected = connectionData?.connected || user?.metaAccessToken;

  // 處理帳戶選擇
  const handleAccountSelect = (accountId: string) => {
    setSelectedAccount(accountId);
    selectAccount(accountId);
    onAccountSelected?.(accountId);
  };

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
      </div>
      
      <Select value={selectedAccount} onValueChange={handleAccountSelect}>
        <SelectTrigger>
          <SelectValue placeholder="選擇 Facebook 廣告帳戶" />
        </SelectTrigger>
        <SelectContent>
          {accountsLoading ? (
            <SelectItem value="loading" disabled>載入中...</SelectItem>
          ) : accounts && accounts.length > 0 ? (
            accounts.map((account: any) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name} ({account.id})
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-accounts" disabled>
              沒有可用的廣告帳戶
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}