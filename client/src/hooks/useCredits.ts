import { useQuery } from "@tanstack/react-query";

export interface Credits {
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

export interface CreditTransaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  source: string;
  description: string;
  createdAt: string;
}

export interface CreditsData {
  credits: Credits;
  transactions: CreditTransaction[];
}

export function useCredits() {
  return useQuery<CreditsData>({
    queryKey: ['/api/credits'],
    staleTime: 0, // Force fresh data
    gcTime: 1 * 60 * 1000, // 1 minute
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}