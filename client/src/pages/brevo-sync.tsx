import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Download, Copy, Users, Mail, Database, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface User {
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
}

export default function BrevoSync() {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  // Fetch all users for Brevo sync
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/users/all'],
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5分鐘快取
  });

  const usersWithEmail = users.filter(user => user.email);

  const generateCSV = () => {
    const csvHeader = 'EMAIL,FIRSTNAME,LASTNAME,GA_RESOURCE_NAME,SIGNUP_DATE\n';
    const csvRows = usersWithEmail.map(user => {
      const email = user.email || '';
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      const gaResourceName = user.gaResourceName || user.firstName || '';
      const signupDate = user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '';
      
      return `"${email}","${firstName}","${lastName}","${gaResourceName}","${signupDate}"`;
    });

    return csvHeader + csvRows.join('\n');
  };

  const generateBashScript = () => {
    const bashScript = `#!/bin/bash
# Brevo 批量同步腳本
# 生成時間: ${new Date().toISOString()}
# 總用戶數: ${usersWithEmail.length}

echo "開始同步 ${usersWithEmail.length} 個用戶到 Brevo 名單 #15..."

${usersWithEmail.map((user, index) => {
  const payload = {
    email: user.email,
    attributes: {
      FIRSTNAME: user.firstName || '',
      LASTNAME: user.lastName || ''
    },
    listIds: [15]
  };
  
  return `
# 用戶 ${index + 1}: ${user.email}
curl -X POST "https://api.brevo.com/v3/contacts" \\
  -H "accept: application/json" \\
  -H "api-key: YOUR_BREVO_API_KEY" \\
  -H "content-type: application/json" \\
  -d '${JSON.stringify(payload)}'
echo "已添加: ${user.email}"
sleep 0.5
`;
}).join('')}

echo "同步完成！"`;

    return bashScript;
  };

  const generateWebhookData = () => {
    const webhookData = usersWithEmail.map(user => ({
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      gaResourceName: user.gaResourceName || user.firstName || '',
      signupDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '',
      listId: 15,
      attributes: {
        FIRSTNAME: user.firstName || '',
        LASTNAME: user.lastName || ''
      }
    }));

    return JSON.stringify(webhookData, null, 2);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "下載成功",
      description: `${filename} 已下載完成`,
    });
  };

  const copyToClipboard = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
      
      toast({
        title: "複製成功",
        description: `${type} 已複製到剪貼板`,
      });
    } catch (error) {
      toast({
        title: "複製失敗",
        description: "請手動選擇文字複製",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">載入用戶數據中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 標題 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Brevo 同步工具
          </h1>
          <p className="text-gray-600">
            解決 Replit 動態 IP 白名單問題的替代方案
          </p>
        </div>

        {/* 統計資訊 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              用戶統計
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                <div className="text-sm text-gray-600">總用戶數</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{usersWithEmail.length}</div>
                <div className="text-sm text-gray-600">有 Email 用戶</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">15</div>
                <div className="text-sm text-gray-600">Brevo 名單 ID</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CSV 匯出 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              方案一：CSV 檔案匯出
            </CardTitle>
            <CardDescription>
              下載 CSV 檔案，手動上傳到 Brevo 後台進行批量匯入
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => downloadFile(generateCSV(), 'brevo-contacts.csv', 'text/csv')}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                下載 CSV 檔案
              </Button>
              <Button 
                variant="outline"
                onClick={() => copyToClipboard(generateCSV(), 'CSV 數據')}
                className="flex items-center gap-2"
              >
                {copied === 'CSV 數據' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                複製 CSV 內容
              </Button>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>操作步驟：</strong>
                1. 下載 CSV 檔案 
                2. 登入 Brevo 後台 
                3. 選擇「聯絡人」→「匯入聯絡人」
                4. 上傳 CSV 檔案並選擇名單 #15
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bash 腳本 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              方案二：自動同步腳本
            </CardTitle>
            <CardDescription>
              在有固定 IP 的伺服器上執行批量同步腳本
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => downloadFile(generateBashScript(), 'brevo-sync.sh', 'text/plain')}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                下載 Bash 腳本
              </Button>
              <Button 
                variant="outline"
                onClick={() => copyToClipboard(generateBashScript(), 'Bash 腳本')}
                className="flex items-center gap-2"
              >
                {copied === 'Bash 腳本' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                複製腳本內容
              </Button>
            </div>
            <Textarea 
              value={generateBashScript().substring(0, 500) + '...'}
              readOnly
              className="h-32 font-mono text-xs"
            />
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>使用方法：</strong>
                1. 下載腳本到有固定 IP 的伺服器
                2. 替換腳本中的 YOUR_BREVO_API_KEY
                3. 執行：chmod +x brevo-sync.sh && ./brevo-sync.sh
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Webhook 數據 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              方案三：Webhook 自動化
            </CardTitle>
            <CardDescription>
              配合 Zapier 或 Make.com 設置自動同步流程
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => downloadFile(generateWebhookData(), 'brevo-webhook-data.json', 'application/json')}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                下載 JSON 數據
              </Button>
              <Button 
                variant="outline"
                onClick={() => copyToClipboard(generateWebhookData(), 'Webhook 數據')}
                className="flex items-center gap-2"
              >
                {copied === 'Webhook 數據' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                複製 JSON 數據
              </Button>
            </div>
            <Textarea 
              value={generateWebhookData().substring(0, 500) + '...'}
              readOnly
              className="h-32 font-mono text-xs"
            />
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>自動化設置：</strong>
                1. 在 Zapier 創建新 Zap
                2. 觸發器：Webhook (接收此 JSON 數據)
                3. 動作：Brevo - Add Contact to List
                4. 設置定期執行或手動觸發
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 建議流程 */}
        <Card>
          <CardHeader>
            <CardTitle>建議執行流程</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant="outline">1</Badge>
                <span>立即使用 <strong>CSV 方案</strong> 手動同步現有 {usersWithEmail.length} 個用戶</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">2</Badge>
                <span>設置 <strong>Zapier 自動化</strong> 確保新用戶即時同步</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">3</Badge>
                <span>如有固定 IP 伺服器，可使用 <strong>Bash 腳本</strong> 作為備選</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}