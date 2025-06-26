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
    retry: 1,
  });
}

export function useRecordCampaignPlannerUsage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/campaign-planner/record-usage", "POST");
    },
    onSuccess: () => {
      // Invalidate campaign planner usage queries
      queryClient.invalidateQueries({ queryKey: ["/api/campaign-planner/usage"] });
    },
  });
}