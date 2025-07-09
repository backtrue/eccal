import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export interface PlanResult {
  id: string;
  userId: string;
  planName: string;
  targetRevenue: string;
  averageOrderValue: string;
  conversionRate: string;
  cpc: string;
  currency: string;
  requiredOrders: number;
  monthlyTraffic: number;
  dailyTraffic: number;
  monthlyAdBudget: string;
  dailyAdBudget: string;
  targetRoas: string;
  gaPropertyId?: string;
  gaPropertyName?: string;
  dataSource: string;
  pdcaPhase: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavePlanData {
  planName: string;
  targetRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  requiredOrders: number;
  monthlyTraffic: number;
  dailyTraffic: number;
  monthlyAdBudget: number;
  dailyAdBudget: number;
  targetRoas: number;
  currency: string;
  gaPropertyId?: string;
  gaPropertyName?: string;
  dataSource: string;
}

// Hook to get all plan results for current user
export function usePlanResults() {
  return useQuery({
    queryKey: ['/api/plan-results'],
    enabled: true,
  });
}

// Hook to get a specific plan result
export function usePlanResult(planId: string) {
  return useQuery({
    queryKey: ['/api/plan-results', planId],
    enabled: !!planId,
  });
}

// Hook to save a new plan result
export function useSavePlanResult() {
  return useMutation({
    mutationFn: async (data: SavePlanData) => {
      const response = await fetch('/api/plan-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '儲存失敗');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plan-results'] });
    },
  });
}

// Hook to delete a plan result
export function useDeletePlanResult() {
  return useMutation({
    mutationFn: async (planId: string) => {
      const response = await fetch(`/api/plan-results/${planId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '刪除失敗');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plan-results'] });
    },
  });
}

// Hook to update a plan result
export function useUpdatePlanResult() {
  return useMutation({
    mutationFn: async ({ planId, updates }: { planId: string; updates: Partial<SavePlanData> }) => {
      const response = await fetch(`/api/plan-results/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '更新失敗');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plan-results'] });
    },
  });
}