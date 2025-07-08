// Multi-currency pricing configuration
export type Currency = 'TWD' | 'USD' | 'JPY';
export type Locale = 'zh-TW' | 'en' | 'ja';

export interface PricingConfig {
  currency: Currency;
  monthly: {
    amount: number;
    displayPrice: string;
  };
  annual: {
    amount: number;
    displayPrice: string;
  };
  lifetime: {
    amount: number;
    displayPrice: string;
  };
}

// Currency pricing based on regional economics
export const PRICING_CONFIG: Record<Locale, PricingConfig> = {
  'zh-TW': {
    currency: 'TWD',
    monthly: {
      amount: 690,        // NT$690/month
      displayPrice: 'NT$690'
    },
    annual: {
      amount: 6900,       // NT$6,900/year (17% savings)
      displayPrice: 'NT$6,900'
    },
    lifetime: {
      amount: 5990,       // NT$5,990 one-time
      displayPrice: 'NT$5,990'
    }
  },
  'en': {
    currency: 'USD', 
    monthly: {
      amount: 1900,       // $19.00/month (stored as cents)
      displayPrice: '$19'
    },
    annual: {
      amount: 19000,      // $190.00/year (17% savings)
      displayPrice: '$190'
    },
    lifetime: {
      amount: 16900,      // $169.00 one-time (stored as cents)
      displayPrice: '$169'
    }
  },
  'ja': {
    currency: 'JPY',
    monthly: {
      amount: 2000,       // ¥2,000/month
      displayPrice: '¥2,000'
    },
    annual: {
      amount: 20000,      // ¥20,000/year (17% savings)
      displayPrice: '¥20,000'
    },
    lifetime: {
      amount: 17250,      // ¥17,250 one-time
      displayPrice: '¥17,250'
    }
  }
};

// Map locale to currency for Stripe
export const getCurrencyForLocale = (locale: Locale): Currency => {
  return PRICING_CONFIG[locale].currency;
};

// Get pricing config for locale
export const getPricingForLocale = (locale: Locale): PricingConfig => {
  return PRICING_CONFIG[locale];
};

// Convert amount based on currency requirements
export const formatAmountForStripe = (amount: number, currency: Currency): number => {
  // JPY and TWD don't use decimal places in Stripe
  // USD uses cents (multiply by 100)
  if (currency === 'USD') {
    return amount; // Already in cents from config
  }
  return amount; // TWD and JPY use whole numbers
};

// Regional price equivalents (approximate)
// TWD 690 ≈ USD 19 ≈ JPY 2,000 (monthly)
// TWD 5,990 ≈ USD 169 ≈ JPY 17,250 (lifetime)