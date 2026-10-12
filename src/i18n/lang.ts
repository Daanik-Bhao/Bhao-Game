import { useTranslation } from 'react-i18next'

export type Lang = 'en' | 'hi' | 'hinglish'

export const LANGS: Lang[] = ['en', 'hi', 'hinglish']

export function asLang(lng: string | undefined): Lang {
  return lng === 'hi' || lng === 'hinglish' ? lng : 'en'
}

/**
 * Picks the text for the current language from data that has English + Hindi fields.
 * Hindi falls back to English when the Hindi field is empty; Hinglish uses English
 * (the data has no Hinglish fields — short UI labels live in the locale files instead).
 */
export function pickLang(en: string, hi: string | undefined | null, lang: string): string
export function pickLang(en: string | undefined, hi: string | undefined | null, lang: string): string | undefined
export function pickLang(en: string | undefined, hi: string | undefined | null, lang: string): string | undefined {
  return lang === 'hi' && hi ? hi : en
}

/** Current language, re-rendering on change. */
export function useLang(): Lang {
  const { i18n } = useTranslation()
  return asLang(i18n.language)
}

/** Indian-style lakh label: "₹10.5 lakh" / "₹10.5 लाख". */
export function formatLakhIn(amount: number, lang: string, digits = 1): string {
  return `₹${(amount / 100000).toFixed(digits)} ${lang === 'hi' ? 'लाख' : 'lakh'}`
}
