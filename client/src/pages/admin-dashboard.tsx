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
import { AlertCircle, Users, TrendingUp, CreditCard, Settings, Monitor, FileText, Download, Bell, Activity, BarChart3, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";

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

interface MarketingPlan {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  status: 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  uploadedBy: string;
  createdAt: string;
  completedAt?: string;
}

interface PlanAnalysisItem {
  id: string;
  planId: string;
  phase: 'pre_heat' | 'campaign' | 'repurchase';
  strategySummary: string;
  isApproved: boolean;
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

  // Fetch behavior analytics
  const { data: behaviorStats } = useQuery<any>({
    queryKey: ['/api/bdmin/behavior/stats'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch announcements
  const { data: announcements } = useQuery<any>({
    queryKey: ['/api/bdmin/announcements'],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch API usage stats
  const { data: apiUsageStats } = useQuery<any>({
    queryKey: ['/api/bdmin/api-usage'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch export jobs
  const { data: exportJobs } = useQuery<any>({
    queryKey: ['/api/bdmin/exports'],
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Fetch maintenance mode
  const { data: maintenanceMode } = useQuery<any>({
    queryKey: ['/api/bdmin/maintenance'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Marketing Plans AI Database queries
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Fetch marketing plans with polling for processing status
  const { data: marketingPlans, refetch: refetchPlans } = useQuery<MarketingPlan[]>({
    queryKey: ['/api/bdmin/marketing-plans'],
    staleTime: 5 * 1000, // 5 seconds for real-time updates
    refetchInterval: 5000, // Poll every 5 seconds for processing updates
  });

  // Fetch analysis items for selected plan
  const { data: analysisItems, refetch: refetchAnalysis } = useQuery<PlanAnalysisItem[]>({
    queryKey: ['/api/bdmin/analysis-items', selectedPlan],
    enabled: !!selectedPlan,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Marketing Plans mutations
  const uploadPlanMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/bdmin/marketing-plans', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setUploadingFile(false);
      refetchPlans();
      toast({
        title: "上傳成功",
        description: "PDF檔案已開始分析處理",
      });
    },
    onError: (error) => {
      setUploadingFile(false);
      toast({
        title: "上傳失敗",
        description: error instanceof Error ? error.message : "檔案上傳失敗",
        variant: "destructive",
      });
    },
  });

  const updateAnalysisItemMutation = useMutation({
    mutationFn: async ({ itemId, updates }: { itemId: string; updates: { phase?: string; isApproved?: boolean } }) => {
      return apiRequest('PUT', `/api/bdmin/analysis-items/${itemId}`, updates);
    },
    onSuccess: () => {
      refetchAnalysis();
      toast({
        title: "更新成功",
        description: "分析項目已更新",
      });
    },
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
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              BI 分析
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              用戶管理
            </TabsTrigger>
            <TabsTrigger value="behavior" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              行為分析
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              公告系統
            </TabsTrigger>
            <TabsTrigger value="exports" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              數據導出
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
            <TabsTrigger value="marketing" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              行銷資料庫
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
                                    setSelectedUsers(usersData?.users?.map(u => u.id) || []);
                                  } else {
                                    setSelectedUsers([]);
                                  }
                                }}
                                checked={!usersLoading && usersData?.users && selectedUsers.length > 0 && selectedUsers.length === usersData.users.length}
                              />
                            </th>
                            <th className="p-3 text-left">用戶信息</th>
                            <th className="p-3 text-left">會員等級</th>
                            <th className="p-3 text-left">註冊時間</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usersLoading ? (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-gray-500">
                                載入中...
                              </td>
                            </tr>
                          ) : !usersData?.users || usersData.users.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-gray-500">
                                目前沒有用戶數據
                              </td>
                            </tr>
                          ) : (
                            usersData.users.map((user) => (
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
                            ))
                          )}
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

          {/* User Behavior Analytics */}
          <TabsContent value="behavior" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>最常用功能</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(behaviorStats as any)?.mostUsedFeatures?.map((feature: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="capitalize">{feature.feature}</span>
                        <Badge variant="secondary">{feature.count} 次</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>轉換漏斗</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {behaviorStats?.conversionFunnel?.map((step: any, index: number) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between">
                          <span>{step.step}</span>
                          <span className="text-sm text-gray-600">{step.rate.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{width: `${step.rate}%`}}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-600">{step.users} 用戶</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>每日活躍用戶 (過去30天)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {behaviorStats?.dailyActiveUsers?.map((day: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 border rounded">
                        <span>{new Date(day.date).toLocaleDateString()}</span>
                        <Badge>{day.users} 用戶</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Announcements Management */}
          <TabsContent value="announcements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>公告管理</CardTitle>
                <CardDescription>
                  管理系統公告和用戶通知
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    onClick={() => {
                      // Create new announcement
                      const title = prompt('公告標題:');
                      const content = prompt('公告內容:');
                      if (title && content) {
                        // Implementation would call API to create announcement
                        toast({
                          title: "功能開發中",
                          description: "公告創建功能即將推出",
                        });
                      }
                    }}
                  >
                    創建新公告
                  </Button>

                  <div className="space-y-4">
                    {(announcements || []).map((announcement: any) => (
                      <Card key={announcement.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{announcement.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                              <div className="flex gap-2 mt-2">
                                <Badge 
                                  variant={announcement.type === 'info' ? 'default' : 
                                          announcement.type === 'warning' ? 'destructive' : 'secondary'}
                                >
                                  {announcement.type}
                                </Badge>
                                <Badge variant="outline">
                                  {announcement.targetAudience}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">編輯</Button>
                              <Button variant="destructive" size="sm">刪除</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Export */}
          <TabsContent value="exports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>數據導出</CardTitle>
                  <CardDescription>
                    導出系統數據為 CSV 格式
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/bdmin/export', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ type: 'users' })
                          });
                          
                          if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'users_export.csv';
                            a.click();
                            window.URL.revokeObjectURL(url);
                          }
                        } catch (error) {
                          toast({
                            title: "導出失敗",
                            description: "無法導出用戶數據",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      導出用戶數據
                    </Button>

                    <Button
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/bdmin/export', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ type: 'behavior' })
                          });
                          
                          if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'behavior_export.csv';
                            a.click();
                            window.URL.revokeObjectURL(url);
                          }
                        } catch (error) {
                          toast({
                            title: "導出失敗",
                            description: "無法導出行為數據",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="w-full"
                      variant="outline"
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      導出行為數據
                    </Button>

                    <Button
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/bdmin/export', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ type: 'api_usage' })
                          });
                          
                          if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'api_usage_export.csv';
                            a.click();
                            window.URL.revokeObjectURL(url);
                          }
                        } catch (error) {
                          toast({
                            title: "導出失敗",
                            description: "無法導出 API 使用數據",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="w-full"
                      variant="outline"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      導出 API 使用數據
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API 使用統計</CardTitle>
                  <CardDescription>
                    API 調用監控和限流控制
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="text-2xl font-bold text-blue-600">
                          {apiUsageStats?.totalRequests || 0}
                        </div>
                        <div className="text-sm text-gray-600">總請求數</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="text-2xl font-bold text-green-600">
                          {apiUsageStats?.requestsToday || 0}
                        </div>
                        <div className="text-sm text-gray-600">今日請求</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>平均響應時間:</span>
                        <span className="font-mono">
                          {apiUsageStats?.avgResponseTime?.toFixed(2) || 0}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>錯誤率:</span>
                        <span className="font-mono text-red-600">
                          {apiUsageStats?.errorRate?.toFixed(2) || 0}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">服務配額使用情況</h4>
                      {(apiUsageStats?.quotaUsage || []).map((quota: any, index: number) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{quota.service}</span>
                            <span>{quota.used}/{quota.limit}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                (quota.used / quota.limit) > 0.8 ? 'bg-red-600' :
                                (quota.used / quota.limit) > 0.6 ? 'bg-yellow-600' : 'bg-green-600'
                              }`}
                              style={{width: `${Math.min((quota.used / quota.limit) * 100, 100)}%`}}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>維護模式控制</CardTitle>
                <CardDescription>
                  系統維護模式開關
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button
                    variant={maintenanceMode?.enabled ? "destructive" : "outline"}
                    onClick={async () => {
                      try {
                        const newState = !maintenanceMode?.enabled;
                        const message = newState ? prompt('維護訊息:') || '系統維修中' : '';
                        
                        const response = await fetch('/api/bdmin/maintenance', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ enabled: newState, message })
                        });
                        
                        if (response.ok) {
                          queryClient.invalidateQueries({ queryKey: ['/api/bdmin/maintenance'] });
                          toast({
                            title: "成功",
                            description: `維護模式已${newState ? '開啟' : '關閉'}`,
                          });
                        }
                      } catch (error) {
                        toast({
                          title: "錯誤",
                          description: "無法更新維護模式",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {maintenanceMode?.enabled ? '關閉維護模式' : '開啟維護模式'}
                  </Button>
                  
                  {maintenanceMode?.enabled && (
                    <div className="text-sm text-gray-600">
                      當前訊息: {maintenanceMode.message}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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

          {/* Marketing Plans AI Database */}
          <TabsContent value="marketing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* File Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle>PDF 上傳</CardTitle>
                  <CardDescription>
                    上傳行銷企劃 PDF 檔案進行 AI 分析
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadingFile(true);
                            uploadPlanMutation.mutate(file);
                          }
                        }}
                        className="hidden"
                        id="pdf-upload"
                        disabled={uploadingFile}
                      />
                      <label
                        htmlFor="pdf-upload"
                        className={`cursor-pointer ${uploadingFile ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        <div className="space-y-2">
                          <FileText className="h-12 w-12 mx-auto text-gray-400" />
                          <div className="text-sm text-gray-600">
                            {uploadingFile ? '上傳中...' : '點擊選擇 PDF 檔案'}
                          </div>
                          <div className="text-xs text-gray-500">
                            支援 PDF 格式，最大 10MB
                          </div>
                        </div>
                      </label>
                    </div>
                    {uploadingFile && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        檔案上傳中，請稍候...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Plans List Section */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>企劃列表</CardTitle>
                  <CardDescription>
                    已上傳的行銷企劃檔案及處理狀態
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(marketingPlans || []).map((plan) => (
                      <div
                        key={plan.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedPlan === plan.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedPlan(plan.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{plan.fileName}</div>
                            <div className="text-sm text-gray-600">
                              {plan.fileSize ? `${(plan.fileSize / 1024).toFixed(1)} KB` : ''} • 
                              上傳時間: {new Date(plan.createdAt).toLocaleString()}
                            </div>
                            {plan.errorMessage && (
                              <div className="text-sm text-red-600 mt-1">
                                錯誤: {plan.errorMessage}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                plan.status === 'completed' ? 'default' :
                                plan.status === 'failed' ? 'destructive' : 'secondary'
                              }
                            >
                              {plan.status === 'processing' && (
                                <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full mr-1"></div>
                              )}
                              {plan.status === 'processing' ? '處理中' : 
                               plan.status === 'completed' ? '已完成' : '失敗'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {!marketingPlans?.length && (
                      <div className="text-center py-8 text-gray-500">
                        尚未上傳任何企劃檔案
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analysis Results Section */}
            {selectedPlan && (
              <Card>
                <CardHeader>
                  <CardTitle>AI 分析結果</CardTitle>
                  <CardDescription>
                    查看和編輯 AI 分析出的策略項目
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysisItems?.length ? (
                    <div className="space-y-6">
                      {/* Pre-heat Phase */}
                      <div>
                        <h3 className="font-semibold text-lg mb-3 text-blue-600">預熱期策略</h3>
                        <div className="space-y-3">
                          {(analysisItems || [])
                            .filter(item => item.phase === 'pre_heat')
                            .map((item) => (
                              <div key={item.id} className="p-4 border rounded-lg bg-blue-50">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <p className="text-sm">{item.strategySummary}</p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <Select
                                      value={item.phase}
                                      onValueChange={(newPhase) => {
                                        updateAnalysisItemMutation.mutate({
                                          itemId: item.id,
                                          updates: { phase: newPhase }
                                        });
                                      }}
                                    >
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pre_heat">預熱期</SelectItem>
                                        <SelectItem value="campaign">活動期</SelectItem>
                                        <SelectItem value="repurchase">回購期</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      size="sm"
                                      variant={item.isApproved ? "default" : "outline"}
                                      onClick={() => {
                                        updateAnalysisItemMutation.mutate({
                                          itemId: item.id,
                                          updates: { isApproved: !item.isApproved }
                                        });
                                      }}
                                    >
                                      {item.isApproved ? '已核准' : '核准'}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Campaign Phase */}
                      <div>
                        <h3 className="font-semibold text-lg mb-3 text-green-600">活動期策略</h3>
                        <div className="space-y-3">
                          {(analysisItems || [])
                            .filter(item => item.phase === 'campaign')
                            .map((item) => (
                              <div key={item.id} className="p-4 border rounded-lg bg-green-50">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <p className="text-sm">{item.strategySummary}</p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <Select
                                      value={item.phase}
                                      onValueChange={(newPhase) => {
                                        updateAnalysisItemMutation.mutate({
                                          itemId: item.id,
                                          updates: { phase: newPhase }
                                        });
                                      }}
                                    >
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pre_heat">預熱期</SelectItem>
                                        <SelectItem value="campaign">活動期</SelectItem>
                                        <SelectItem value="repurchase">回購期</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      size="sm"
                                      variant={item.isApproved ? "default" : "outline"}
                                      onClick={() => {
                                        updateAnalysisItemMutation.mutate({
                                          itemId: item.id,
                                          updates: { isApproved: !item.isApproved }
                                        });
                                      }}
                                    >
                                      {item.isApproved ? '已核准' : '核准'}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Repurchase Phase */}
                      <div>
                        <h3 className="font-semibold text-lg mb-3 text-purple-600">回購期策略</h3>
                        <div className="space-y-3">
                          {(analysisItems || [])
                            .filter(item => item.phase === 'repurchase')
                            .map((item) => (
                              <div key={item.id} className="p-4 border rounded-lg bg-purple-50">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <p className="text-sm">{item.strategySummary}</p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <Select
                                      value={item.phase}
                                      onValueChange={(newPhase) => {
                                        updateAnalysisItemMutation.mutate({
                                          itemId: item.id,
                                          updates: { phase: newPhase }
                                        });
                                      }}
                                    >
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pre_heat">預熱期</SelectItem>
                                        <SelectItem value="campaign">活動期</SelectItem>
                                        <SelectItem value="repurchase">回購期</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      size="sm"
                                      variant={item.isApproved ? "default" : "outline"}
                                      onClick={() => {
                                        updateAnalysisItemMutation.mutate({
                                          itemId: item.id,
                                          updates: { isApproved: !item.isApproved }
                                        });
                                      }}
                                    >
                                      {item.isApproved ? '已核准' : '核准'}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {marketingPlans?.find(p => p.id === selectedPlan)?.status === 'processing' 
                        ? '正在分析中，請稍候...' 
                        : '選擇已完成的企劃查看分析結果'}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
}