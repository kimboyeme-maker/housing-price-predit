import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a decimal without coupling domain values to a currency symbol. */
export function formatNumber(value: number, digits = 2, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value)
}
