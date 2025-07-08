import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Locale } from '@/lib/i18n';

interface PricingData {
  locale: string;
  currency: string;
  pricing: {
    monthly: {
      priceId: string;
      amount: number;
      displayPrice: string;
    };
    lifetime: {
      priceId: string;
      amount: number;
      displayPrice: string;
    };
  };
}

export const usePricing = (locale: Locale) => {
  return useQuery({
    queryKey: ['pricing', locale],
    queryFn: async (): Promise<PricingData> => {
      const response = await apiRequest('GET', `/api/stripe/pricing/${locale}`);
      if (!response.ok) {
        throw new Error('Failed to fetch pricing data');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: 2
  });
};