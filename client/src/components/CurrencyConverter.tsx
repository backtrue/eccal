import { useExchangeRates } from "@/hooks/useExchangeRates";
import type { Locale } from "@/lib/i18n";
import { Clock, TrendingUp } from "lucide-react";

interface CurrencyConverterProps {
  jpyAmount: number;
  locale: Locale;
  className?: string;
}

export default function CurrencyConverter({ jpyAmount, locale, className = "" }: CurrencyConverterProps) {
  const { data: rates, isLoading } = useExchangeRates();

  if (isLoading || !rates) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        計算匯率中...
      </div>
    );
  }

  const getLocalCurrency = () => {
    switch (locale) {
      case 'zh-TW':
        return {
          symbol: 'NT$',
          amount: Math.round(jpyAmount * rates.TWD),
          code: 'TWD',
          rate: rates.TWD
        };
      case 'en':
        return {
          symbol: '$',
          amount: Math.round(jpyAmount * rates.USD * 100) / 100,
          code: 'USD',
          rate: rates.USD
        };
      case 'ja':
      default:
        return {
          symbol: '¥',
          amount: jpyAmount,
          code: 'JPY',
          rate: 1
        };
    }
  };

  const currency = getLocalCurrency();

  // 如果是日文，就不顯示轉換
  if (locale === 'ja') {
    return (
      <div className={`${className}`}>
        <span className="text-2xl font-bold text-red-600">¥{jpyAmount.toLocaleString()}</span>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-red-600">
            {currency.symbol}{currency.amount.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500">({currency.code})</span>
        </div>
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          <span>≈ ¥{jpyAmount.toLocaleString()} JPY</span>
        </div>
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>
            {locale === 'zh-TW' 
              ? `匯率: 1 JPY = ${currency.rate} TWD (${rates.lastUpdated})`
              : `Rate: 1 JPY = ${currency.rate} USD (${rates.lastUpdated})`
            }
          </span>
        </div>
      </div>
    </div>
  );
}