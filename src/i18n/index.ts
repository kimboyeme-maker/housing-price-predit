import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { resources } from './resources'

// Map a per-language Intl locale for number/currency/date formatting.
export const LOCALE_BY_LANG: Record<string, string> = { en: 'en-US', zh: 'zh-CN' }

/** Languages deliberately shipped with complete translation resources. */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
] as const

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'hpp.lang',
      caches: ['localStorage'],
    },
  })

export function currentLocale(): string {
  return LOCALE_BY_LANG[i18n.language?.split('-')[0]] ?? 'en-US'
}

export default i18n
