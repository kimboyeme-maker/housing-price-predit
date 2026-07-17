import { useTranslation } from 'react-i18next'
import { useCurrency } from '@/context/currency'
import { formatMoney } from '@/lib/currency'
import { LOCALE_BY_LANG } from '@/i18n'

/** Current Intl locale derived from the active i18n language (reactive). */
export function useLocale(): string {
  const { i18n } = useTranslation()
  return LOCALE_BY_LANG[i18n.language?.split('-')[0]] ?? 'en-US'
}

/** Formatter bound to the selected currency + active locale. Input is USD-base. */
export function useMoney() {
  const locale = useLocale()
  const { currency } = useCurrency()
  return (amountUSD: number) => formatMoney(amountUSD, currency, locale)
}
