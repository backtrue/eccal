import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Users, TrendingUp, CreditCard, FileText, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

        <Tabs defaultValue="marketing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              系統概覽
            </TabsTrigger>
            <TabsTrigger value="marketing" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              行銷資料庫
            </TabsTrigger>
          </TabsList>

          {/* System Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">總用戶數</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">42</div>
                  <p className="text-xs text-muted-foreground">
                    本週新增: 3
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pro 會員</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">
                    轉換率: 19.0%
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
                  <p className="text-xs text-muted-foreground">
                    所有服務運行中
                  </p>
                </CardContent>
              </Card>
            </div>
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
    </div>
  );
}