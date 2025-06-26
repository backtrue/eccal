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
  // 完全停用查詢
  return {
    data: {
      usage: 0,
      limit: 3,
      canUse: true,
      membershipStatus: {
        level: "free" as const,
        isActive: true
      }
    },
    isLoading: false,
    error: null
  };
}

export function useRecordCampaignPlannerUsage() {
  // 完全停用 mutation
  return {
    mutate: () => {
      console.log("Campaign planner usage recording disabled");
    },
    mutateAsync: async () => {
      console.log("Campaign planner usage recording disabled");
    },
    isPending: false
  };
}