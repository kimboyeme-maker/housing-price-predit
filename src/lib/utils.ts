import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number, digits = 2, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value)
}
