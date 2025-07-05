import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, AlertCircle, Shield, Database, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PermissionData {
  permission: string;
  status: string;
}

interface FacebookPermissionsData {
  success: boolean;
  tokenInfo: {
    id: string;
    name: string;
    email?: string;
  };
  permissions: PermissionData[];
  adAccounts: any[];
  hasAdsPermissions: boolean;
  summary: {
    tokenValid: boolean;
    adsPermissionsGranted: boolean;
    adAccountsAccessible: boolean;
    totalAdAccounts: number;
  };
}

export default function FacebookPermissions() {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [permissionsData, setPermissionsData] = useState<FacebookPermissionsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkPermissions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/diagnosis/facebook-permissions', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Facebook 權限診斷完整結果:', data);
      setPermissionsData(data);
    } catch (err) {
      console.error('權限檢查失敗:', err);
      setError(err instanceof Error ? err.message : '權限檢查失敗');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">需要登入</h2>
            <p className="text-gray-500">請先登入才能檢查 Facebook 權限</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Facebook 廣告權限診斷</h1>
        <p className="text-gray-600">檢查您的 Facebook 帳戶是否具有廣告管理相關權限</p>
      </div>

      {/* 當前用戶資訊 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            當前用戶資訊
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">用戶 ID:</span> {user?.id || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Email:</span> {user?.email || 'N/A'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 權限檢查按鈕 */}
      <Card className="mb-6">
        <CardContent className="py-6">
          <div className="text-center">
            <Button 
              onClick={checkPermissions}
              disabled={loading}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  正在檢查權限...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  檢查 Facebook 廣告權限
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 錯誤訊息 */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <XCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* 權限檢查結果 */}
      {permissionsData && (
        <div className="space-y-6">
          {/* 總覽卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                權限檢查總覽
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    permissionsData.summary.tokenValid ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {permissionsData.summary.tokenValid ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <p className="text-sm font-medium">Token 有效</p>
                  <p className="text-xs text-gray-500">
                    {permissionsData.summary.tokenValid ? '正常' : '無效'}
                  </p>
                </div>

                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    permissionsData.summary.adsPermissionsGranted ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {permissionsData.summary.adsPermissionsGranted ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <p className="text-sm font-medium">廣告權限</p>
                  <p className="text-xs text-gray-500">
                    {permissionsData.summary.adsPermissionsGranted ? '已授權' : '未授權'}
                  </p>
                </div>

                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    permissionsData.summary.adAccountsAccessible ? 'bg-green-100' : 'bg-orange-100'
                  }`}>
                    {permissionsData.summary.adAccountsAccessible ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-orange-600" />
                    )}
                  </div>
                  <p className="text-sm font-medium">廣告帳戶</p>
                  <p className="text-xs text-gray-500">
                    {permissionsData.summary.totalAdAccounts} 個可存取
                  </p>
                </div>

                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    permissionsData.success ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {permissionsData.success ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <p className="text-sm font-medium">整體狀態</p>
                  <p className="text-xs text-gray-500">
                    {permissionsData.success ? '正常' : '異常'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Facebook 用戶資訊 */}
          <Card>
            <CardHeader>
              <CardTitle>Facebook 用戶資訊</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Facebook ID:</span> {permissionsData.tokenInfo.id}
                </div>
                <div>
                  <span className="font-medium">姓名:</span> {permissionsData.tokenInfo.name}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {permissionsData.tokenInfo.email || '未提供'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 詳細權限清單 */}
          <Card>
            <CardHeader>
              <CardTitle>詳細權限清單</CardTitle>
            </CardHeader>
            <CardContent>
              {permissionsData.permissions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {permissionsData.permissions.map((permission) => (
                    <div key={permission.permission} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{permission.permission}</span>
                      <Badge variant={permission.status === 'granted' ? 'default' : 'destructive'}>
                        {permission.status === 'granted' ? '已授權' : permission.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">無權限資料</p>
              )}
            </CardContent>
          </Card>

          {/* 廣告帳戶清單 */}
          <Card>
            <CardHeader>
              <CardTitle>可存取的廣告帳戶</CardTitle>
            </CardHeader>
            <CardContent>
              {permissionsData.adAccounts.length > 0 ? (
                <div className="space-y-3">
                  {permissionsData.adAccounts.map((account, index) => (
                    <div key={account.id || index} className="p-4 border rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="font-medium">帳戶 ID:</span> {account.id}
                        </div>
                        <div>
                          <span className="font-medium">名稱:</span> {account.name}
                        </div>
                        <div>
                          <span className="font-medium">狀態:</span> 
                          <Badge className="ml-2" variant={account.account_status === 1 ? 'default' : 'destructive'}>
                            {account.account_status === 1 ? '啟用' : '停用'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    未找到可存取的廣告帳戶。這可能是因為：
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>您沒有任何 Facebook 廣告帳戶</li>
                      <li>廣告帳戶權限未正確設定</li>
                      <li>需要重新授權 Facebook 應用程式</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}