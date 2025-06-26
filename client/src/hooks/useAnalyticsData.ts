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
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5分鐘
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
    enabled: true,
    staleTime: 2 * 60 * 1000, // 2分鐘
  });
}