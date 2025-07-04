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

export function useAnalyticsProperties(enabled: boolean = true) {
  return useQuery({
    queryKey: ["/api/analytics/properties"],
    enabled,
    staleTime: 30 * 60 * 1000, // 30分鐘
    gcTime: 60 * 60 * 1000, // 1小時快取
  });
}

export function useAnalyticsData(propertyId: string, options: { enabled: boolean } = { enabled: true }) {
  return useQuery({
    queryKey: ["/api/analytics/data", propertyId],
    queryFn: async (): Promise<AnalyticsData> => {
      const response = await apiRequest("POST", "/api/analytics/data", { propertyId });
      return response.json();
    },
    enabled: options.enabled && !!propertyId,
    staleTime: 10 * 60 * 1000, // 10分鐘
    gcTime: 30 * 60 * 1000, // 30分鐘快取
  });
}

export function useUserMetrics() {
  return useQuery({
    queryKey: ["/api/user/metrics"],
    enabled: true, // 重新啟用以支援 GA 資源選單
    staleTime: 30 * 60 * 1000, // 30分鐘
    gcTime: 60 * 60 * 1000, // 1小時快取
  });
}