import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ExternalLink, Copy, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BrevoSyncTools() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCSVDownload = async () => {
    setIsLoading('csv');
    try {
      const response = await fetch('/api/admin/export-users-csv', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('下載失敗');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brevo-contacts-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "CSV 檔案已下載",
        description: "請手動上傳到 Brevo 後台進行批量匯入",
      });
    } catch (error) {
      toast({
        title: "下載失敗",
        description: "請稍後再試或聯繫管理員",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleScriptDownload = async () => {
    setIsLoading('script');
    try {
      const response = await fetch('/api/admin/brevo-sync-script', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('下載失敗');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brevo-bulk-import-${new Date().toISOString().split('T')[0]}.sh`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "同步腳本已下載",
        description: "請在有固定 IP 的伺服器上執行此腳本",
      });
    } catch (error) {
      toast({
        title: "下載失敗",
        description: "請稍後再試或聯繫管理員",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleWebhookData = async () => {
    setIsLoading('webhook');
    try {
      const response = await fetch('/api/admin/brevo-webhook-data', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('獲取失敗');
      
      const data = await response.json();
      
      // 複製到剪貼簿
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      
      toast({
        title: "Webhook 數據已複製",
        description: `已複製 ${data.totalContacts} 個聯絡人數據到剪貼簿`,
      });
    } catch (error) {
      toast({
        title: "獲取失敗",
        description: "請稍後再試或聯繫管理員",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Brevo 同步工具</h2>
        <p className="text-muted-foreground">
          由於 Replit 動態 IP 問題，以下提供三種替代同步方案
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* 方案1: CSV 匯出 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              CSV 檔案匯出
            </CardTitle>
            <CardDescription>
              最簡單的方法，適合手動操作
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>• 下載包含所有用戶的 CSV 檔案</p>
              <p>• 登入 Brevo 後台</p>
              <p>• 選擇「聯絡人」→「匯入聯絡人」</p>
              <p>• 上傳 CSV 檔案到名單 #15</p>
            </div>
            <Button 
              onClick={handleCSVDownload} 
              disabled={isLoading === 'csv'}
              className="w-full"
            >
              {isLoading === 'csv' ? '下載中...' : '下載 CSV 檔案'}
            </Button>
          </CardContent>
        </Card>

        {/* 方案2: 同步腳本 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              自動同步腳本
            </CardTitle>
            <CardDescription>
              適合有技術背景的用戶
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>• 下載 Bash 自動同步腳本</p>
              <p>• 在有固定 IP 的伺服器執行</p>
              <p>• 自動批量添加到 Brevo</p>
              <p>• 包含錯誤處理和速率限制</p>
            </div>
            <Button 
              onClick={handleScriptDownload} 
              disabled={isLoading === 'script'}
              variant="outline"
              className="w-full"
            >
              {isLoading === 'script' ? '下載中...' : '下載同步腳本'}
            </Button>
          </CardContent>
        </Card>

        {/* 方案3: Webhook 數據 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              自動化工具
            </CardTitle>
            <CardDescription>
              使用 Zapier 或 Make.com
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>• 複製 JSON 格式用戶數據</p>
              <p>• 在 Zapier/Make.com 創建流程</p>
              <p>• 自動同步到 Brevo 名單</p>
              <p>• 支持即時同步新用戶</p>
            </div>
            <Button 
              onClick={handleWebhookData} 
              disabled={isLoading === 'webhook'}
              variant="secondary"
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-2" />
              {isLoading === 'webhook' ? '複製中...' : '複製 Webhook 數據'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">建議步驟</CardTitle>
        </CardHeader>
        <CardContent className="text-orange-700">
          <ol className="list-decimal list-inside space-y-2">
            <li><strong>立即解決：</strong>使用 CSV 匯出方案手動同步現有 42 個用戶</li>
            <li><strong>長期方案：</strong>設置 Zapier 自動化，確保新用戶即時同步</li>
            <li><strong>備選方案：</strong>如有固定 IP 伺服器，可使用同步腳本</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}