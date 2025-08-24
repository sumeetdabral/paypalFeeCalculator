export const PAYPAL_FEES = {
  DOMESTIC: {
    STANDARD: {
      percentage: 0.029, // 2.9%
      fixed: 0.30, // $0.30
    },
    MICROPAYMENT: {
      percentage: 0.05, // 5%
      fixed: 0.05, // $0.05
    },
  },
  INTERNATIONAL: {
    STANDARD: {
      percentage: 0.044, // 4.4%
      fixed: 0.30, // $0.30 (varies by country)
    },
  },
  GOODS_AND_SERVICES: {
    percentage: 0.029,
    fixed: 0.30,
  },
  FRIENDS_AND_FAMILY: {
    percentage: 0,
    fixed: 0,
  },
} as const;

export const TRANSACTION_TYPES = {
  DOMESTIC: 'domestic',
  INTERNATIONAL: 'international',
  MICROPAYMENT: 'micropayment',
} as const;

export const PAYMENT_TYPES = {
  GOODS_AND_SERVICES: 'goods_and_services',
  FRIENDS_AND_FAMILY: 'friends_and_family',
} as const;

export const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
  EUR: { symbol: '€', name: 'Euro', code: 'EUR' },
  GBP: { symbol: '£', name: 'British Pound', code: 'GBP' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', code: 'CAD' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', code: 'AUD' },
  JPY: { symbol: '¥', name: 'Japanese Yen', code: 'JPY' },
} as const;

export const COUNTRIES = [
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'CA', name: 'Canada', currency: 'CAD' },
  { code: 'AU', name: 'Australia', currency: 'AUD' },
  { code: 'JP', name: 'Japan', currency: 'JPY' },
  { code: 'DE', name: 'Germany', currency: 'EUR' },
  { code: 'FR', name: 'France', currency: 'EUR' },
  { code: 'IT', name: 'Italy', currency: 'EUR' },
  { code: 'ES', name: 'Spain', currency: 'EUR' },
  { code: 'NL', name: 'Netherlands', currency: 'EUR' },
] as const;