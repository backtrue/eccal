import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface AnalyticsProperty {
  id: string;
  displayName: string;
  accountName: string;
}

export interface AnalyticsData {
  averageOrderValue: number;
  conversionRate: number;
  totalRevenue: number;
  ecommercePurchases: number;
  sessions: number;
}

export function useAnalyticsProperties() {
  return useQuery({
    queryKey: ["/api/analytics/properties"],
    enabled: false, // 只在需要時手動觸發
    staleTime: 30 * 60 * 1000, // 30分鐘
    gcTime: 60 * 60 * 1000, // 1小時快取
  });
}

export function useAnalyticsData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (propertyId: string): Promise<AnalyticsData> => {
      const response = await apiRequest("POST", "/api/analytics/data", { propertyId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/metrics"] });
    },
  });
}

export function useUserMetrics() {
  return useQuery({
    queryKey: ["/api/user/metrics"],
    enabled: false, // 只在需要時手動觸發
    staleTime: 30 * 60 * 1000, // 30分鐘
    gcTime: 60 * 60 * 1000, // 1小時快取
  });
}