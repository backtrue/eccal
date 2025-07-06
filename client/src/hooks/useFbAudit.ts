import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// 獲取 Facebook 廣告帳號列表
export function useFbAuditAccounts(enabled = true) {
  return useQuery({
    queryKey: ['/api/fbaudit/accounts'],
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 分鐘
    gcTime: 10 * 60 * 1000, // 10 分鐘
    select: (data: any) => data?.data || [], // 提取 API 回應中的 data 欄位
  });
}

// 獲取預算計劃列表
export function useFbAuditPlans(enabled = true) {
  return useQuery({
    queryKey: ['/api/fbaudit/plans'],
    enabled: enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    select: (data: any) => data?.data || [], // 提取 API 回應中的 data 欄位
  });
}

// 獲取產業類型列表
export function useFbAuditIndustries() {
  return useQuery({
    queryKey: ['/api/fbaudit/industries'],
    staleTime: 30 * 60 * 1000, // 30 分鐘，產業類型變化較少
    gcTime: 60 * 60 * 1000, // 1 小時
    select: (data: any) => data?.data || [], // 提取 API 回應中的 data 欄位
  });
}

// 執行廣告健檢
export function useFbAuditCheck() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      adAccountId: string;
      planResultId: string;
      industryType: string;
      locale?: string;
    }) => {
      const response = await apiRequest('POST', '/api/fbaudit/check', data);
      const result = await response.json();
      console.log('API 回應結果:', result);
      return result.data; // 返回 data 部分
    },
    onSuccess: () => {
      // 成功後刷新歷史記錄
      queryClient.invalidateQueries({ queryKey: ['/api/fbaudit/history'] });
    },
  });
}

// 獲取健檢歷史
export function useFbAuditHistory() {
  return useQuery({
    queryKey: ['/api/fbaudit/history'],
    staleTime: 2 * 60 * 1000, // 2 分鐘
    gcTime: 5 * 60 * 1000, // 5 分鐘
  });
}

// 獲取特定健檢詳情
export function useFbAuditDetails(id: string) {
  return useQuery({
    queryKey: ['/api/fbaudit/check', id],
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 分鐘
    gcTime: 30 * 60 * 1000, // 30 分鐘
  });
}

// 刪除健檢記錄
export function useDeleteFbAuditCheck() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/fbaudit/check/${id}`);
    },
    onSuccess: () => {
      // 成功後刷新歷史記錄
      queryClient.invalidateQueries({ queryKey: ['/api/fbaudit/history'] });
    },
  });
}

// 初始化產業類型（管理員功能）
export function useInitIndustries() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/fbaudit/init-industries');
    },
    onSuccess: () => {
      // 成功後刷新產業類型列表
      queryClient.invalidateQueries({ queryKey: ['/api/fbaudit/industries'] });
    },
  });
}