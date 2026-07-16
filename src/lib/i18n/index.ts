import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '@/lib/i18n/locales/en.json'
import zh from '@/lib/i18n/locales/zh.json'

export const LANG_STORAGE_KEY = 'hl-purchase.lang'

export const SUPPORTED_LANGS = {
  ZH: 'zh',
  EN: 'en',
} as const

export type AppLanguage = (typeof SUPPORTED_LANGS)[keyof typeof SUPPORTED_LANGS]

function getInitialLanguage(): AppLanguage {
  const saved = localStorage.getItem(LANG_STORAGE_KEY)
  if (saved === SUPPORTED_LANGS.EN || saved === SUPPORTED_LANGS.ZH) {
    return saved
  }
  return SUPPORTED_LANGS.ZH
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: getInitialLanguage(),
  fallbackLng: SUPPORTED_LANGS.EN,
  interpolation: {
    escapeValue: false,
  },
})

export function setAppLanguage(lang: AppLanguage): void {
  localStorage.setItem(LANG_STORAGE_KEY, lang)
  void i18n.changeLanguage(lang)
}

export default i18n
