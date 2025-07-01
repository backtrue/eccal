import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function AdminDebugger() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkAdminStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/debug/admin-status', {
        credentials: 'include'
      });
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      toast({
        title: "錯誤",
        description: "無法獲取管理員狀態",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testBatchMembership = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('PUT', '/api/bdmin/users/batch/membership', {
        userIds: ['101017118047810033810'],
        membershipLevel: 'pro',
        durationDays: 30
      });
      setTestResults(prev => ({ ...prev, membership: { success: true, data: response } }));
      toast({
        title: "成功",
        description: "批次會員測試成功",
      });
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        membership: { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } 
      }));
      toast({
        title: "失敗",
        description: "批次會員測試失敗",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testBatchCredits = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('POST', '/api/bdmin/users/batch/credits', {
        userIds: ['101017118047810033810'],
        amount: 50,
        description: '測試積分'
      });
      setTestResults(prev => ({ ...prev, credits: { success: true, data: response } }));
      toast({
        title: "成功",
        description: "批次積分測試成功",
      });
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        credits: { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } 
      }));
      toast({
        title: "失敗",
        description: "批次積分測試失敗",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testAnnouncement = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('POST', '/api/bdmin/announcements', {
        title: '測試公告',
        content: '這是測試公告內容',
        type: 'info',
        targetAudience: 'all'
      });
      setTestResults(prev => ({ ...prev, announcement: { success: true, data: response } }));
      toast({
        title: "成功",
        description: "公告創建測試成功",
      });
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        announcement: { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } 
      }));
      toast({
        title: "失敗",
        description: "公告創建測試失敗",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>管理員診斷工具</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={checkAdminStatus} disabled={loading}>
            檢查管理員狀態
          </Button>
          
          {debugInfo && (
            <div className="bg-gray-100 p-4 rounded text-sm">
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>功能測試</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Button onClick={testBatchMembership} disabled={loading} variant="outline">
              測試批次會員
            </Button>
            <Button onClick={testBatchCredits} disabled={loading} variant="outline">
              測試批次積分
            </Button>
            <Button onClick={testAnnouncement} disabled={loading} variant="outline">
              測試公告創建
            </Button>
          </div>
          
          {Object.keys(testResults).length > 0 && (
            <div className="bg-gray-100 p-4 rounded text-sm">
              <h4 className="font-medium mb-2">測試結果:</h4>
              <pre>{JSON.stringify(testResults, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}