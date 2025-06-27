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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
}