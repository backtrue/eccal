import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface AdminStats {
  totalUsers: number;
  proUsers: number;
  freeUsers: number;
  totalCredits: number;
  dailyActiveUsers: number;
  retention7Day: number;
  retention30Day: number;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  membershipLevel: string;
  membershipExpires: string | null;
  createdAt: string;
}

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['/api/bdmin/stats'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAdminUsers() {
  return useQuery<AdminUser[]>({
    queryKey: ['/api/bdmin/users'],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useBulkMembershipUpdate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userIds, membershipLevel, duration }: {
      userIds: string[];
      membershipLevel: string;
      duration?: number;
    }) => {
      return await apiRequest('POST', '/api/bdmin/users/bulk-membership', {
        userIds,
        membershipLevel,
        duration
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bdmin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bdmin/stats'] });
    },
  });
}

export function useBulkCreditsUpdate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userIds, amount }: {
      userIds: string[];
      amount: number;
    }) => {
      return await apiRequest('POST', '/api/bdmin/users/bulk-credits', {
        userIds,
        amount
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bdmin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bdmin/stats'] });
    },
  });
}