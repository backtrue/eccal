import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Users, TrendingUp, CreditCard, Settings, Monitor, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserStats {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  activeUsersToday: number;
  activeUsersThisWeek: number;
  retention7Days: number;
  retention30Days: number;
  totalCreditsDistributed: number;
  totalProMembers: number;
  arpu: number;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  membershipLevel: string;
  membershipExpires: Date;
  createdAt: Date;
}

interface SeoSetting {
  id: number;
  page: string;
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
}

interface SystemLog {
  id: number;
  level: string;
  message: string;
  endpoint: string;
  createdAt: Date;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Fetch user statistics
  const { data: userStats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ['/api/bdmin/stats'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch all users
  const { data: usersData, isLoading: usersLoading } = useQuery<{ users: User[], total: number }>({
    queryKey: ['/api/bdmin/users'],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch SEO settings
  const { data: seoSettings, isLoading: seoLoading } = useQuery<SeoSetting[]>({
    queryKey: ['/api/bdmin/seo'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch system logs
  const { data: systemLogs } = useQuery<SystemLog[]>({
    queryKey: ['/api/bdmin/logs'],
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Fetch system monitoring
  const { data: systemStats } = useQuery<{
    totalErrors: number;
    errorsToday: number;
    avgResponseTime: number;
    topErrorEndpoints: { endpoint: string; count: number }[];
    systemInfo: {
      memoryUsage: { rss: number; heapUsed: number };
      uptime: number;
      nodeVersion: string;
      platform: string;
    };
  }>({
    queryKey: ['/api/bdmin/system'],
    staleTime: 30 * 1000, // 30 seconds
  });

  // Batch update membership mutation
  const batchMembershipMutation = useMutation({
    mutationFn: async ({ userIds, membershipLevel, durationDays }: any) => {
      return apiRequest('PUT', '/api/bdmin/users/batch/membership', {
        userIds,
        membershipLevel,
        durationDays
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bdmin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bdmin/stats'] });
      setSelectedUsers([]);
      toast({
        title: "成功",
        description: "批次更新會員等級完成",
      });
    },
    onError: () => {
      toast({
        title: "錯誤",
        description: "批次更新失敗",
        variant: "destructive",
      });
    }
  });

  // Batch add credits mutation
  const batchCreditsMutation = useMutation({
    mutationFn: async ({ userIds, amount, description }: any) => {
      return apiRequest('POST', '/api/bdmin/users/batch/credits', {
        userIds,
        amount,
        description
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bdmin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bdmin/stats'] });
      setSelectedUsers([]);
      toast({
        title: "成功",
        description: "批次發放點數完成",
      });
    },
    onError: () => {
      toast({
        title: "錯誤",
        description: "批次發放點數失敗",
        variant: "destructive",
      });
    }
  });

  // Update SEO settings mutation
  const updateSeoMutation = useMutation({
    mutationFn: async ({ page, data }: any) => {
      return apiRequest('PUT', `/api/bdmin/seo/${page}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bdmin/seo'] });
      toast({
        title: "成功",
        description: "SEO 設定已更新",
      });
    },
    onError: () => {
      toast({
        title: "錯誤",
        description: "SEO 設定更新失敗",
        variant: "destructive",
      });
    }
  });

  const handleBatchMembershipUpdate = (membershipLevel: string, durationDays?: number) => {
    if (selectedUsers.length === 0) {
      toast({
        title: "錯誤",
        description: "請先選擇用戶",
        variant: "destructive",
      });
      return;
    }

    batchMembershipMutation.mutate({
      userIds: selectedUsers,
      membershipLevel,
      durationDays
    });
  };

  const handleBatchCreditsAdd = (amount: number, description: string) => {
    if (selectedUsers.length === 0) {
      toast({
        title: "錯誤",
        description: "請先選擇用戶",
        variant: "destructive",
      });
      return;
    }

    batchCreditsMutation.mutate({
      userIds: selectedUsers,
      amount,
      description
    });
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">管理後台</h1>
          <p className="text-gray-600 mt-2">報數據系統管理控制台</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              BI 分析
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              用戶管理
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              系統監控
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              SEO 設定
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              系統日誌
            </TabsTrigger>
          </TabsList>

          {/* BI Analytics Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">總用戶數</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "載入中..." : userStats?.totalUsers || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    本週新增: {userStats?.newUsersThisWeek || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pro 會員</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userStats?.totalProMembers || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    轉換率: {userStats?.totalUsers ? ((userStats.totalProMembers / userStats.totalUsers) * 100).toFixed(1) : 0}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">7日留存率</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userStats?.retention7Days?.toFixed(1) || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    30日留存: {userStats?.retention30Days?.toFixed(1) || 0}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">點數發放總額</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userStats?.totalCreditsDistributed || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ARPU: ${userStats?.arpu?.toFixed(2) || 0}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>用戶管理</CardTitle>
                <CardDescription>
                  管理用戶會員等級和點數發放
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Batch Operations */}
                  <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleBatchMembershipUpdate('pro', 30)}
                        disabled={selectedUsers.length === 0}
                        variant="outline"
                      >
                        批次升級為 Pro (30天)
                      </Button>
                      <Button
                        onClick={() => handleBatchMembershipUpdate('free')}
                        disabled={selectedUsers.length === 0}
                        variant="outline"
                      >
                        批次降級為免費
                      </Button>
                      <Button
                        onClick={() => handleBatchCreditsAdd(100, '管理員發放獎勵')}
                        disabled={selectedUsers.length === 0}
                        variant="outline"
                      >
                        批次發放 100 點數
                      </Button>
                    </div>
                    <span className="text-sm text-gray-600">
                      已選擇 {selectedUsers.length} 位用戶
                    </span>
                  </div>

                  {/* Users Table */}
                  <div className="border rounded-lg">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="p-3 text-left">
                              <input
                                type="checkbox"
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUsers(usersData?.users.map(u => u.id) || []);
                                  } else {
                                    setSelectedUsers([]);
                                  }
                                }}
                                checked={selectedUsers.length === usersData?.users.length}
                              />
                            </th>
                            <th className="p-3 text-left">用戶信息</th>
                            <th className="p-3 text-left">會員等級</th>
                            <th className="p-3 text-left">註冊時間</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usersData?.users.map((user) => (
                            <tr key={user.id} className="border-t">
                              <td className="p-3">
                                <input
                                  type="checkbox"
                                  checked={selectedUsers.includes(user.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedUsers(prev => [...prev, user.id]);
                                    } else {
                                      setSelectedUsers(prev => prev.filter(id => id !== user.id));
                                    }
                                  }}
                                />
                              </td>
                              <td className="p-3">
                                <div>
                                  <div className="font-medium">{user.email}</div>
                                  <div className="text-sm text-gray-600">
                                    {user.firstName} {user.lastName}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <Badge 
                                  variant={user.membershipLevel === 'pro' ? 'default' : 'secondary'}
                                >
                                  {user.membershipLevel === 'pro' ? 'Pro' : '免費'}
                                </Badge>
                                {user.membershipLevel === 'pro' && user.membershipExpires && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    到期: {new Date(user.membershipExpires).toLocaleDateString()}
                                  </div>
                                )}
                              </td>
                              <td className="p-3">
                                <div className="text-sm">
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Monitoring */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>CPU & Memory</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>RSS Memory:</span>
                      <span className="font-mono">
                        {systemStats?.systemInfo ? formatBytes(systemStats.systemInfo.memoryUsage.rss) : '載入中...'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Heap Used:</span>
                      <span className="font-mono">
                        {systemStats?.systemInfo ? formatBytes(systemStats.systemInfo.memoryUsage.heapUsed) : '載入中...'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>運行時間:</span>
                      <span className="font-mono">
                        {systemStats?.systemInfo ? Math.floor(systemStats.systemInfo.uptime / 3600) : 0}h
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Node.js 版本:</span>
                      <span className="font-mono">
                        {systemStats?.systemInfo?.nodeVersion || 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>錯誤統計</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>總錯誤數:</span>
                      <span className="font-mono text-red-600">
                        {systemStats?.totalErrors || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>今日錯誤:</span>
                      <span className="font-mono text-red-600">
                        {systemStats?.errorsToday || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>平均響應時間:</span>
                      <span className="font-mono">
                        {systemStats?.avgResponseTime?.toFixed(2) || 0}ms
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SEO Settings */}
          <TabsContent value="seo" className="space-y-6">
            <div className="grid gap-6">
              {seoSettings?.map((setting) => (
                <Card key={setting.id}>
                  <CardHeader>
                    <CardTitle>頁面: {setting.page}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`title-${setting.id}`}>標題</Label>
                        <Input
                          id={`title-${setting.id}`}
                          defaultValue={setting.title}
                          onBlur={(e) => {
                            if (e.target.value !== setting.title) {
                              updateSeoMutation.mutate({
                                page: setting.page,
                                data: { title: e.target.value }
                              });
                            }
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`description-${setting.id}`}>描述</Label>
                        <Textarea
                          id={`description-${setting.id}`}
                          defaultValue={setting.description}
                          onBlur={(e) => {
                            if (e.target.value !== setting.description) {
                              updateSeoMutation.mutate({
                                page: setting.page,
                                data: { description: e.target.value }
                              });
                            }
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`keywords-${setting.id}`}>關鍵字</Label>
                        <Input
                          id={`keywords-${setting.id}`}
                          defaultValue={setting.keywords}
                          onBlur={(e) => {
                            if (e.target.value !== setting.keywords) {
                              updateSeoMutation.mutate({
                                page: setting.page,
                                data: { keywords: e.target.value }
                              });
                            }
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* System Logs */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>系統日誌</CardTitle>
                <CardDescription>
                  最近的系統活動和錯誤記錄
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {systemLogs?.map((log) => (
                    <div
                      key={log.id}
                      className={`p-3 rounded border-l-4 ${
                        log.level === 'error' 
                          ? 'border-red-500 bg-red-50' 
                          : log.level === 'warn'
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-blue-500 bg-blue-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium">{log.message}</div>
                          {log.endpoint && (
                            <div className="text-sm text-gray-600">
                              端點: {log.endpoint}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}