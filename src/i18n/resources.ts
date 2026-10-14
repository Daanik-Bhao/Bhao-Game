import enTranslations from './locales/en.json'
import hiTranslations from './locales/hi.json'
import hinglishTranslations from './locales/hinglish.json'

export type LocaleTree = { [k: string]: string | LocaleTree }
type LocalePart = { en?: LocaleTree; hi?: LocaleTree; hinglish?: LocaleTree }

/**
 * Locale "parts" (src/i18n/locales/parts/*.json, each `{ en, hi, hinglish }`) are deep-merged
 * over the main locale files. They let several people add keys during the redesign without
 * editing the same JSON file at once; they are folded back into en/hi/hinglish.json afterwards.
 */
const PARTS = import.meta.glob<LocalePart>('./locales/parts/*.json', { eager: true, import: 'default' })

function deepMerge(base: LocaleTree, extra: LocaleTree | undefined): LocaleTree {
  if (!extra) return base
  const out: LocaleTree = { ...base }
  for (const [k, v] of Object.entries(extra)) {
    const cur = out[k]
    out[k] = typeof v === 'object' && v !== null && typeof cur === 'object' ? deepMerge(cur, v) : v
  }
  return out
}

function build(lang: keyof LocalePart, base: LocaleTree): LocaleTree {
  return Object.keys(PARTS).sort().reduce((acc, file) => deepMerge(acc, PARTS[file]?.[lang]), base)
}

export const LOCALE_TREES = {
  en: build('en', enTranslations as LocaleTree),
  hi: build('hi', hiTranslations as LocaleTree),
  hinglish: build('hinglish', hinglishTranslations as LocaleTree),
}
