// 幣值工具函數
export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  defaultCpc: number;
}

export const CURRENCY_CONFIG: Record<string, CurrencyConfig> = {
  'zh-TW': {
    code: 'TWD',
    symbol: 'NT$',
    name: '新台幣',
    defaultCpc: 5,
  },
  'en': {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    defaultCpc: 1,
  },
  'jp': {
    code: 'JPY',
    symbol: '¥',
    name: '日圓',
    defaultCpc: 120,
  },
};

/**
 * 根據語系取得幣值設定
 */
export function getCurrencyByLocale(locale: string): CurrencyConfig {
  return CURRENCY_CONFIG[locale] || CURRENCY_CONFIG['zh-TW'];
}

/**
 * 格式化金額顯示
 */
export function formatCurrency(amount: number, currency: CurrencyConfig, locale: string): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.code,
  });
  
  return formatter.format(amount);
}

/**
 * 簡化的幣值匯率（固定匯率，用於基本轉換）
 * 實際應用中應使用即時匯率 API
 */
export const EXCHANGE_RATES = {
  TWD: {
    USD: 0.031,  // 1 TWD = 0.031 USD
    JPY: 4.5,    // 1 TWD = 4.5 JPY
  },
  USD: {
    TWD: 32.3,   // 1 USD = 32.3 TWD
    JPY: 145,    // 1 USD = 145 JPY
  },
  JPY: {
    TWD: 0.22,   // 1 JPY = 0.22 TWD
    USD: 0.0069, // 1 JPY = 0.0069 USD
  },
};

/**
 * 幣值轉換函數
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) return amount;
  
  const rate = EXCHANGE_RATES[fromCurrency as keyof typeof EXCHANGE_RATES]?.[toCurrency as keyof typeof EXCHANGE_RATES['TWD']];
  if (!rate) {
    console.warn(`No exchange rate found for ${fromCurrency} to ${toCurrency}`);
    return amount;
  }
  
  return amount * rate;
}

/**
 * 檢測 Facebook 廣告帳戶的幣值
 * 根據帳戶所在地區或設定推測幣值
 * 注意：這個函數已被棄用，請使用 FbAuditService.getAccountCurrency() 來獲取真實的帳戶貨幣
 */
export function detectFacebookAccountCurrency(accountId: string): string {
  // 警告：這個函數僅作為後備方案，實際應用中應使用 Facebook API 查詢真實貨幣
  console.warn('detectFacebookAccountCurrency 已被棄用，請使用 FbAuditService.getAccountCurrency()');
  return 'USD';
}