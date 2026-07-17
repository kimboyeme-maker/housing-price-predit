// Currency support. The model outputs prices in USD (dataset base); we convert
// to the user-selected currency for display using static demo rates.
// Swap RATES for a live FX source if real accuracy is needed.

export type CurrencyCode = 'USD' | 'CNY' | 'HKD' | 'JPY' | 'CAD' | 'SGD'

export const CURRENCIES: { code: CurrencyCode; label: string; flag: string }[] = [
  { code: 'USD', label: 'US Dollar', flag: '🇺🇸' },
  { code: 'CNY', label: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'HKD', label: 'Hong Kong Dollar', flag: '🇭🇰' },
  { code: 'JPY', label: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'CAD', label: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'SGD', label: 'Singapore Dollar', flag: '🇸🇬' },
]

// Approximate rates relative to 1 USD (demo values).
export const RATES: Record<CurrencyCode, number> = {
  USD: 1,
  CNY: 7.2,
  HKD: 7.8,
  JPY: 157,
  CAD: 1.37,
  SGD: 1.35,
}

export function convertFromUSD(amountUSD: number, currency: CurrencyCode): number {
  return amountUSD * RATES[currency]
}

/** Format a USD-base amount into the selected currency + locale. */
export function formatMoney(amountUSD: number, currency: CurrencyCode, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'JPY' ? 0 : 0,
  }).format(convertFromUSD(amountUSD, currency))
}
