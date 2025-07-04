import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export interface FacebookConnection {
  connected: boolean;
  accountId?: string;
  accountName?: string;
  accessToken?: string;
}

export interface FacebookDiagnosisRequest {
  targetRevenue: number;
  targetAov: number;
  targetConversionRate: number;
  cpc: number;
}

export interface FacebookDiagnosisResult {
  reportId: string;
  accountName: string;
  healthScore: number;
  recommendations: string[];
  comparison: {
    targetOrders: number;
    actualOrders: number;
    targetBudget: number;
    actualBudget: number;
    targetTraffic: number;
    actualTraffic: number;
    targetRoas: number;
    actualRoas: number;
  };
  createdAt: string;
}

// Hook for Facebook connection status
export function useFacebookConnection(enabled: boolean = true) {
  return useQuery({
    queryKey: ['/api/diagnosis/facebook-connection'],
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for Facebook diagnosis
export function useFacebookDiagnosis() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: FacebookDiagnosisRequest) => {
      const response = await apiRequest('POST', '/api/diagnosis/analyze', data);
      return response;
    },
    onSuccess: (data: any) => {
      toast({
        title: "診斷完成",
        description: `您的廣告帳戶健康分數：${data.healthScore}/100`,
      });
      // Invalidate diagnosis reports to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/diagnosis/reports'] });
    },
    onError: (error: any) => {
      toast({
        title: "診斷失敗",
        description: error.message || "無法分析廣告帳戶，請稍後再試",
        variant: "destructive",
      });
    },
  });
}

// Hook for Facebook OAuth URL
export function useFacebookAuthUrl() {
  return useQuery({
    queryKey: ['/api/diagnosis/facebook-auth-url'],
    enabled: false, // Only fetch when needed
    staleTime: 0, // Always fresh
  });
}

// Hook for Facebook ad accounts
export function useFacebookAdAccounts(enabled: boolean = false) {
  return useQuery({
    queryKey: ['/api/diagnosis/facebook-accounts'],
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for selecting Facebook ad account
export function useSelectFacebookAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (accountId: string) => {
      return await apiRequest('POST', '/api/diagnosis/select-account', { accountId });
    },
    onSuccess: () => {
      toast({
        title: "帳戶選擇成功",
        description: "Facebook 廣告帳戶已連接",
      });
      // Invalidate connection status to refresh
      queryClient.invalidateQueries({ queryKey: ['/api/diagnosis/facebook-connection'] });
    },
    onError: (error: any) => {
      toast({
        title: "連接失敗",
        description: error.message || "無法連接廣告帳戶，請稍後再試",
        variant: "destructive",
      });
    },
  });
}