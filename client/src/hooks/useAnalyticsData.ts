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
    enabled: false, // Only fetch when explicitly called
  });
}

export function useAnalyticsData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (propertyId: string): Promise<AnalyticsData> => {
      return apiRequest(`/api/analytics/data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ propertyId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/metrics"] });
    },
  });
}

export function useUserMetrics() {
  return useQuery({
    queryKey: ["/api/user/metrics"],
    enabled: false, // Only fetch when user is authenticated
  });
}