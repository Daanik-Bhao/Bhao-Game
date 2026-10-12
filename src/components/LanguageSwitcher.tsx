import { useTranslation } from 'react-i18next'
import { LANGS, asLang, type Lang } from '../i18n/lang'
import './LanguageSwitcher.css'

/** Native names: each language is shown in its own script. */
const NAMES: Record<Lang, string> = { en: 'EN', hi: 'हिंदी', hinglish: 'Hinglish' }
const SHORT: Record<Lang, string> = { en: 'EN', hi: 'हि', hinglish: 'Hing' }

/**
 * Language picker. `segmented` shows all three options (home screens);
 * `cycle` is one small button that steps EN → हिंदी → Hinglish (game board).
 * The choice is saved to localStorage by src/i18n/i18n.ts.
 */
export function LanguageSwitcher({ variant = 'segmented', tone = 'light', short = false, className = '' }: {
  variant?: 'segmented' | 'cycle'
  tone?: 'light' | 'dark'
  /** cycle only: two-to-four letter label for crowded bars */
  short?: boolean
  className?: string
}) {
  const { t, i18n } = useTranslation()
  const current = asLang(i18n.language)

  if (variant === 'cycle') {
    const next = LANGS[(LANGS.indexOf(current) + 1) % LANGS.length]
    return (
      <button
        type="button"
        className={`lang-cycle tone-${tone} ${className}`}
        onClick={() => i18n.changeLanguage(next)}
        aria-label={t('lang.switchTo', { lang: NAMES[next] })}
        title={t('lang.switchTo', { lang: NAMES[next] })}
      >
        <span aria-hidden>🌐</span> {short ? SHORT[current] : NAMES[current]}
      </button>
    )
  }

  return (
    <div className={`lang-seg tone-${tone} ${className}`} role="group" aria-label={t('lang.label')}>
      {LANGS.map(l => (
        <button
          key={l}
          type="button"
          lang={l === 'hi' ? 'hi' : 'en'}
          className={`lang-opt${l === current ? ' is-on' : ''}`}
          aria-pressed={l === current}
          onClick={() => i18n.changeLanguage(l)}
        >
          {NAMES[l]}
        </button>
      ))}
    </div>
  )
}
