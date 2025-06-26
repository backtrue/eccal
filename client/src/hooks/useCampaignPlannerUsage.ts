import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface CampaignPlannerUsage {
  usage: number;
  limit: number;
  canUse: boolean;
  membershipStatus: {
    level: "free" | "pro";
    isActive: boolean;
    expiresAt?: Date;
  };
}

export function useCampaignPlannerUsage() {
  return useQuery({
    queryKey: ["/api/campaign-planner/usage"],
    retry: false,
  });
}

export function useRecordCampaignPlannerUsage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/campaign-planner/use", {
        method: "POST",
      });
    },
    onSuccess: () => {
      // Invalidate usage query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/campaign-planner/usage"] });
      queryClient.invalidateQueries({ queryKey: ["/api/membership/status"] });
    },
  });
}