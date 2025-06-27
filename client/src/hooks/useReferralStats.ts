import { useQuery } from "@tanstack/react-query";

export interface ReferralStats {
  totalReferrals: number;
  creditsFromReferrals: number;
  progressToProMembership: number;
  referralsNeededForPro: number;
  nextReferralValue: number;
}

export function useReferralStats() {
  return useQuery<ReferralStats>({
    queryKey: ['/api/referral/stats'],
    staleTime: 0, // Force fresh data
    gcTime: 1 * 60 * 1000, // 1 minute
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}