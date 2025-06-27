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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
}