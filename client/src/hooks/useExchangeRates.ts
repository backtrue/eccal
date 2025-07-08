import { useQuery } from '@tanstack/react-query';

interface ExchangeRates {
  TWD: number;
  USD: number;
  JPY: number;
  lastUpdated: string;
}

// 使用免費的匯率 API 或者手動設置匯率
export const useExchangeRates = () => {
  return useQuery({
    queryKey: ['exchange-rates'],
    queryFn: async (): Promise<ExchangeRates> => {
      try {
        // 使用免費的 exchangerate-api.com API
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/JPY');
        if (response.ok) {
          const data = await response.json();
          return {
            TWD: data.rates.TWD || 0.22, // 備用匯率
            USD: data.rates.USD || 0.0067, // 備用匯率
            JPY: 1,
            lastUpdated: new Date().toLocaleDateString('zh-TW')
          };
        }
        throw new Error('API failed');
      } catch (error) {
        // 備用固定匯率（近似值）
        return {
          TWD: 0.22, // 1 JPY ≈ 0.22 TWD
          USD: 0.0067, // 1 JPY ≈ 0.0067 USD
          JPY: 1,
          lastUpdated: new Date().toLocaleDateString('zh-TW')
        };
      }
    },
    staleTime: 1000 * 60 * 60, // 1小時快取
    retry: 1
  });
};