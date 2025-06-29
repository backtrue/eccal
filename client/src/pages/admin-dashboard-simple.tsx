import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAdminStats, useAdminUsers, useBulkMembershipUpdate, useBulkCreditsUpdate } from "@/hooks/useAdminStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Users, TrendingUp, CreditCard, FileText, BarChart3, Settings, Download, Monitor, Server, Activity, Search, Edit, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";

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

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Real data from API
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: users, isLoading: usersLoading } = useAdminUsers();
  const bulkMembershipMutation = useBulkMembershipUpdate();
  const bulkCreditsMutation = useBulkCreditsUpdate();
  
  // Marketing Plans AI Database state
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Fetch marketing plans
  const { data: marketingPlans, refetch: refetchPlans } = useQuery<MarketingPlan[]>({
    queryKey: ['/api/bdmin/marketing-plans'],
    staleTime: 5 * 1000,
    refetchInterval: 5000,
  });

  // Fetch analysis items for selected plan
  const { data: analysisItems, refetch: refetchAnalysis } = useQuery<PlanAnalysisItem[]>({
    queryKey: ['/api/bdmin/analysis-items', selectedPlan],
    enabled: !!selectedPlan,
    staleTime: 2 * 60 * 1000,
  });

  // Upload PDF mutation
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

  // Update analysis item mutation
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">管理後台</h1>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-gray-600">系統運行正常</span>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3" />
              概覽
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1 text-xs">
              <Users className="w-3 h-3" />
              用戶
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 text-xs">
              <BarChart3 className="w-3 h-3" />
              分析
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-1 text-xs">
              <AlertCircle className="w-3 h-3" />
              系統
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-1 text-xs">
              <FileText className="w-3 h-3" />
              導出
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-1 text-xs">
              <Search className="w-3 h-3" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="marketing" className="flex items-center gap-1 text-xs">
              <BarChart3 className="w-3 h-3" />
              行銷
            </TabsTrigger>
          </TabsList>

          {/* System Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">總用戶數</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "載入中..." : stats?.totalUsers || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pro會員: {statsLoading ? "-" : stats?.proUsers || 0}
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
                    {statsLoading ? "載入中..." : stats?.proUsers || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    總點數: {statsLoading ? "-" : stats?.totalCredits || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">7日留存</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "載入中..." : `${Math.round((stats?.retention7Day || 0) * 100)}%`}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    30日: {statsLoading ? "-" : `${Math.round((stats?.retention30Day || 0) * 100)}%`}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">系統狀態</CardTitle>
                  <AlertCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">正常</div>
                  <p className="text-xs text-muted-foreground">所有服務運行中</p>
                </CardContent>
              </Card>
            </div>

            {/* BI Analysis Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>點數發放統計</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>歡迎獎勵</span>
                      <span className="font-semibold">1,260 點</span>
                    </div>
                    <div className="flex justify-between">
                      <span>推薦獎勵</span>
                      <span className="font-semibold">2,400 點</span>
                    </div>
                    <div className="flex justify-between">
                      <span>管理員發放</span>
                      <span className="font-semibold">840 點</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>總計</span>
                      <span>4,500 點</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>30日用戶活躍度</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>每日活躍用戶</span>
                      <span className="font-semibold">28</span>
                    </div>
                    <div className="flex justify-between">
                      <span>計算機使用</span>
                      <span className="font-semibold">156 次</span>
                    </div>
                    <div className="flex justify-between">
                      <span>活動規劃器</span>
                      <span className="font-semibold">47 次</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pro 升級</span>
                      <span className="font-semibold">8 次</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">用戶管理</h3>
              <div className="flex gap-2">
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  批次發放點數
                </Button>
                <Button size="sm" variant="outline" className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  批次變更等級
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>用戶列表</CardTitle>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      placeholder="搜尋用戶..."
                      className="pl-8 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                    />
                  </div>
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="等級" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="free">免費</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {usersLoading ? (
                    <div className="text-center py-4">載入用戶數據中...</div>
                  ) : users && users.length > 0 ? (
                    users.map((user, index) => (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{user.email}</div>
                          <div className="text-sm text-gray-600">
                            註冊時間: {new Date(user.createdAt).toLocaleDateString('zh-TW')}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={user.membershipLevel === "pro" ? "default" : "secondary"}>
                            {user.membershipLevel === "pro" ? "Pro" : "免費"}
                          </Badge>
                          <span className="text-sm font-medium">
                            {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '未設定姓名'}
                          </span>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Settings className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">暫無用戶數據</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>用戶行為分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">最常用功能</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>廣告預算計算機</span>
                          <Badge variant="secondary">156 次</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>活動預算規劃器</span>
                          <Badge variant="secondary">47 次</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Google Analytics 連接</span>
                          <Badge variant="secondary">32 次</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>轉換漏斗分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>訪問網站</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full w-full"></div>
                        </div>
                        <span className="text-sm">100%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>使用計算機</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full w-3/4"></div>
                        </div>
                        <span className="text-sm">75%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>註冊帳戶</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full w-1/2"></div>
                        </div>
                        <span className="text-sm">45%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>升級 Pro</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full w-1/5"></div>
                        </div>
                        <span className="text-sm">19%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Monitoring */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    系統監控
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>CPU 使用率</span>
                      <span className="text-green-600 font-medium">15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Memory 使用率</span>
                      <span className="text-yellow-600 font-medium">68%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>運行時間</span>
                      <span className="font-medium">2天 14小時</span>
                    </div>
                    <div className="flex justify-between">
                      <span>錯誤數量</span>
                      <span className="text-red-600 font-medium">3</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    API 監控
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>總請求數</span>
                      <span className="font-medium">12,567</span>
                    </div>
                    <div className="flex justify-between">
                      <span>今日請求</span>
                      <span className="font-medium">1,234</span>
                    </div>
                    <div className="flex justify-between">
                      <span>平均回應時間</span>
                      <span className="text-green-600 font-medium">156ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>錯誤率</span>
                      <span className="text-red-600 font-medium">0.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    維護模式
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>維護模式</span>
                      <Badge variant="secondary">關閉</Badge>
                    </div>
                    <Button className="w-full" variant="outline">
                      開啟維護模式
                    </Button>
                    <div className="text-xs text-gray-500">
                      開啟後將顯示維護頁面給用戶
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Announcements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  公告系統管理
                  <Button size="sm" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    新增公告
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { title: "系統升級通知", audience: "全體用戶", status: "活躍", date: "2025-06-29" },
                    { title: "新功能發布", audience: "Pro 用戶", status: "排程", date: "2025-07-01" },
                  ].map((announcement, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{announcement.title}</div>
                        <div className="text-sm text-gray-600">
                          目標: {announcement.audience} • {announcement.date}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={announcement.status === "活躍" ? "default" : "secondary"}>
                          {announcement.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Export */}
          <TabsContent value="export" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    數據導出中心
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      導出用戶數據 (CSV)
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      導出行為數據 (CSV)
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      導出 API 使用數據 (CSV)
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      導出系統日誌 (CSV)
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>系統日誌</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {[
                      { time: "07:03:15", type: "INFO", message: "服務啟動成功" },
                      { time: "07:02:45", type: "WARNING", message: "記憶體使用率超過 60%" },
                      { time: "07:01:23", type: "ERROR", message: "用戶認證請求被阻擋" },
                      { time: "07:00:56", type: "INFO", message: "新用戶註冊" },
                      { time: "06:59:34", type: "INFO", message: "API 請求處理完成" },
                    ].map((log, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm p-2 border-b">
                        <span className="text-gray-500 font-mono">{log.time}</span>
                        <Badge 
                          variant={
                            log.type === "ERROR" ? "destructive" :
                            log.type === "WARNING" ? "secondary" : "default"
                          }
                          className="text-xs"
                        >
                          {log.type}
                        </Badge>
                        <span className="flex-1">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SEO Settings */}
          <TabsContent value="seo" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    頁面 SEO 設定
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">首頁標題</label>
                      <Input 
                        placeholder="報數據-電商廣告預算計算機"
                        defaultValue="報數據-電商廣告預算計算機"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">首頁描述</label>
                      <Textarea 
                        placeholder="專業的電商廣告預算計算工具..."
                        defaultValue="專業的電商廣告預算計算工具，整合 Google Analytics 數據，智能分析轉換率與客單價，精確計算廣告預算需求。"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">關鍵字</label>
                      <Input 
                        placeholder="廣告預算計算,電商廣告,預算規劃"
                        defaultValue="廣告預算計算,電商廣告,預算規劃,Google Analytics,轉換率分析"
                      />
                    </div>
                    <Button className="w-full">更新首頁 SEO</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>計算機頁面 SEO</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">頁面標題</label>
                      <Input 
                        placeholder="廣告預算計算機 - 報數據"
                        defaultValue="廣告預算計算機 - 報數據"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">頁面描述</label>
                      <Textarea 
                        placeholder="免費使用專業廣告預算計算機..."
                        defaultValue="免費使用專業廣告預算計算機，輸入目標營收、客單價、轉換率，立即獲得精準的廣告預算建議。"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">關鍵字</label>
                      <Input 
                        placeholder="廣告預算怎麼抓,預算計算機"
                        defaultValue="廣告預算怎麼抓,預算計算機,廣告投放預算,電商預算規劃"
                      />
                    </div>
                    <Button className="w-full">更新計算機頁面 SEO</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>其他頁面 SEO 管理</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { page: "活動預算規劃器", url: "/campaign-planner", status: "已優化" },
                    { page: "用戶儀表板", url: "/dashboard", status: "待優化" },
                    { page: "隱私政策", url: "/privacy", status: "已優化" },
                    { page: "服務條款", url: "/terms", status: "已優化" },
                  ].map((page, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{page.page}</div>
                        <div className="text-sm text-gray-600">{page.url}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={page.status === "已優化" ? "default" : "secondary"}>
                          {page.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
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
                    {marketingPlans?.map((plan) => (
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
                          {analysisItems
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
                          {analysisItems
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
                          {analysisItems
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