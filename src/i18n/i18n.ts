import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslations from './locales/en.json'
import hiTranslations from './locales/hi.json'
import hinglishTranslations from './locales/hinglish.json'

const resources = {
  en: {
    translation: enTranslations
  },
  hi: {
    translation: hiTranslations
  },
  hinglish: {
    translation: hinglishTranslations
  }
}

export const SUPPORTED_LANGUAGES = Object.keys(resources)

function getStoredLanguage(): string {
  try {
    const stored = localStorage.getItem('language')
    if (stored && SUPPORTED_LANGUAGES.includes(stored)) return stored
  } catch {
    /* storage unavailable (private mode / sandboxed iframe) */
  }
  return 'en'
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getStoredLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  })

export default i18n
