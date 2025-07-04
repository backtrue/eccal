import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// 簡化的接口定義

export interface FacebookConnection {
  connected: boolean;
  adAccountId?: string;
  adAccountName?: string;
  needsAccountSelection?: boolean;
}

export interface FacebookAccount {
  id: string;
  name: string;
  status: string;
  currency: string;
}

export interface DiagnosisRequest {
  targetRevenue: number;
  targetAov: number;
  targetConversionRate: number;
  cpc: number;
}

export interface TopAd {
  adName: string;
  ctr: number;
  impressions: number;
  clicks: number;
  spend: number;
}

export interface DiagnosisReport {
  id: string;
  accountName: string;
  overallHealthScore: number;
  diagnosisReport: string;
  topPerformingAds: TopAd[];
  highRoasAds: TopAd[];
  createdAt: string;
}

// 檢查 Facebook 連接狀態
export function useFacebookConnection(enabled: boolean = true) {
  return useQuery<FacebookConnection>({
    queryKey: ["/api/diagnosis/facebook-status"],
    enabled,
    staleTime: 5 * 60 * 1000, // 5分鐘
    retry: false,
  });
}

// 獲取 Facebook 廣告帳戶列表
export function useFacebookAccounts(enabled: boolean = true) {
  return useQuery<{ accounts: FacebookAccount[] }>({
    queryKey: ["/api/diagnosis/facebook-accounts"],
    enabled,
    staleTime: 10 * 60 * 1000, // 10分鐘
    retry: false,
  });
}

// 獲取 Facebook OAuth URL
export function useFacebookAuthUrl() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (): Promise<{ authUrl: string }> => {
      const response = await apiRequest("GET", "/api/diagnosis/facebook-auth-url");
      return response.json();
    },
    onSuccess: (data) => {
      // 導向 Facebook OAuth 頁面
      window.location.href = data.authUrl;
    },
    onError: (error: any) => {
      toast({
        title: "連接失敗",
        description: error.message || "無法連接 Facebook",
        variant: "destructive",
      });
    },
  });
}

// 選擇 Facebook 廣告帳戶
export function useFacebookAccountSelection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (adAccountId: string): Promise<{ success: boolean }> => {
      const response = await apiRequest("POST", "/api/diagnosis/select-facebook-account", {
        adAccountId
      });
      return response.json();
    },
    onSuccess: () => {
      // 刷新連接狀態
      queryClient.invalidateQueries({ queryKey: ["/api/diagnosis/facebook-status"] });
      toast({
        title: "選擇成功",
        description: "廣告帳戶已設定完成",
      });
    },
    onError: (error: any) => {
      toast({
        title: "選擇失敗",
        description: error.message || "無法設定廣告帳戶",
        variant: "destructive",
      });
    },
  });
}

// Facebook 廣告診斷
export function useFacebookDiagnosis() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: DiagnosisRequest): Promise<DiagnosisReport> => {
      const response = await apiRequest("POST", "/api/diagnosis/analyze", data);
      return response.json();
    },
    onSuccess: (data) => {
      // 刷新診斷報告列表
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/diagnosis-reports"] });
      
      toast({
        title: "診斷完成",
        description: `廣告健康分數：${data.overallHealthScore}分`,
      });
      
      // 可以導向診斷報告詳情頁面
      window.location.href = `/diagnosis-report/${data.id}`;
    },
    onError: (error: any) => {
      toast({
        title: "診斷失敗",
        description: error.message || "無法完成廣告診斷",
        variant: "destructive",
      });
    },
  });
}

// 獲取診斷報告列表
export function useDiagnosisReports(enabled: boolean = true) {
  return useQuery({
    queryKey: ["/api/dashboard/diagnosis-reports"],
    enabled,
    staleTime: 5 * 60 * 1000, // 5分鐘
  });
}

// 獲取診斷報告詳情
export function useDiagnosisReport(reportId: string, enabled: boolean = true) {
  return useQuery<DiagnosisReport>({
    queryKey: ["/api/diagnosis/reports", reportId],
    enabled: enabled && !!reportId,
    staleTime: 30 * 60 * 1000, // 30分鐘
  });
}

// 刪除診斷報告
export function useDeleteDiagnosisReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (reportId: string): Promise<void> => {
      await apiRequest("DELETE", `/api/diagnosis/reports/${reportId}`);
    },
    onSuccess: () => {
      // 刷新報告列表
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/diagnosis-reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/diagnosis-summary"] });
      
      toast({
        title: "刪除成功",
        description: "診斷報告已成功刪除",
      });
    },
    onError: (error: any) => {
      toast({
        title: "刪除失敗",
        description: error.message || "無法刪除診斷報告",
        variant: "destructive",
      });
    },
  });
}