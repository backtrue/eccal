import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface MembershipStatus {
  level: "free" | "pro";
  isActive: boolean;
  expiresAt?: string;
}

export function useMembershipStatus() {
  return useQuery({
    queryKey: ["/api/membership/status"],
    staleTime: 0, // Force fresh data
    gcTime: 1 * 60 * 1000, // 1分鐘快取
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useUpgradeToPro() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (durationDays: number = 30) => {
      return await apiRequest('POST', '/api/membership/upgrade-to-pro', { durationDays });
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/membership/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });
}

// Utility function to check if user has required membership level
export function checkMembershipAccess(
  userLevel: "free" | "pro", 
  requiredLevel: "free" | "pro"
): boolean {
  if (requiredLevel === "free") return true;
  if (requiredLevel === "pro" && userLevel === "pro") return true;
  return false;
}

// Custom hook for protected features
export function useProtectedFeature(requiredLevel: "free" | "pro" = "pro") {
  const { data: membership, isLoading } = useMembershipStatus();
  
  const hasAccess = membership ? 
    checkMembershipAccess(membership.level, requiredLevel) && membership.isActive : 
    false;
  
  return {
    hasAccess,
    membershipLevel: membership?.level,
    isActive: membership?.isActive,
    expiresAt: membership?.expiresAt,
    isLoading,
    requiresUpgrade: !hasAccess && !isLoading,
  };
}