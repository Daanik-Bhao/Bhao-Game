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
export const LANGUAGE_STORAGE_KEY = 'language'

function getStoredLanguage(): string {
  try {
    // ?lang=hi|en|hinglish (shareable links, screenshots) wins over the saved choice
    const fromUrl = new URLSearchParams(window.location.search).get('lang')
    if (fromUrl && SUPPORTED_LANGUAGES.includes(fromUrl)) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, fromUrl)
      return fromUrl
    }
  } catch {
    /* no window / storage */
  }
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
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

/** Keeps <html lang> and the `lang-hi` class (Devanagari typography overrides) in sync, and remembers the choice. */
function applyLanguage(lng: string, remember = true) {
  if (typeof document !== 'undefined') {
    const root = document.documentElement
    root.lang = lng === 'hi' ? 'hi' : lng === 'hinglish' ? 'en-IN' : 'en'
    root.classList.toggle('lang-hi', lng === 'hi')
    root.classList.toggle('lang-hinglish', lng === 'hinglish')
  }
  if (!remember) return
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lng)
  } catch {
    /* storage unavailable: the language applies to this session only */
  }
}

applyLanguage(i18n.language, false)
i18n.on('languageChanged', lng => applyLanguage(lng))

export default i18n
