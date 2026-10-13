import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Globe } from 'lucide-react'
import { LANGS, asLang, type Lang } from '../i18n/lang'
import { Segmented } from './ui/Segmented'
import { useEscape } from './ui/overlay'
import './ui/ui.css'

/** Each language is named in its own script. */
const LANG_ATTR: Record<Lang, string> = { en: 'en', hi: 'hi', hinglish: 'en' }

/**
 * Language picker (spec §D.13).
 * - `pill` (app bars): 44px pill with globe + current code → popover with 3 rows (48px).
 * - `segmented` (Profile / settings / Auth): segmented control.
 * Not shown inside a match (the pause menu has a Language row instead).
 * The choice is saved and applied to <html lang> by src/i18n/i18n.ts.
 */
export function LanguageSwitcher({ variant = 'pill', className = '' }: {
  variant?: 'pill' | 'segmented' | 'cycle'
  className?: string
  /** @deprecated ignored (old board switcher) */
  tone?: 'light' | 'dark'
  /** @deprecated ignored */
  short?: boolean
}) {
  const { t, i18n } = useTranslation()
  const current = asLang(i18n.language)

  if (variant === 'segmented') {
    return (
      <Segmented
        className={className}
        ariaLabel={t('lang.label')}
        value={current}
        onChange={l => void i18n.changeLanguage(l)}
        options={LANGS.map(l => ({ value: l, label: t(`lang.${l}`), lang: LANG_ATTR[l] }))}
      />
    )
  }
  return <LanguagePill className={className} />
}

function LanguagePill({ className }: { className: string }) {
  const { t, i18n } = useTranslation()
  const current = asLang(i18n.language)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  useEscape(() => { setOpen(false); btnRef.current?.focus() }, open)
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    // Focus the checked option so arrow keys / Enter work right away.
    requestAnimationFrame(() => wrapRef.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus())
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const choose = (l: Lang) => {
    void i18n.changeLanguage(l)
    setOpen(false)
    btnRef.current?.focus()
  }
  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const items = Array.from(wrapRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? [])
    const i = items.indexOf(document.activeElement as HTMLButtonElement)
    const next = items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length]
    next?.focus()
  }

  return (
    <div ref={wrapRef} className={`lang-wrap ${className}`.trim()}>
      <button
        ref={btnRef}
        type="button"
        className="lang-pill"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={t('lang.current', { lang: t(`lang.${current}`) })}
        onClick={() => setOpen(o => !o)}
      >
        <Globe size={18} strokeWidth={2.25} aria-hidden="true" />
        <span lang={LANG_ATTR[current]}>{t(`lang.code.${current}`)}</span>
      </button>
      {open && (
        <div id={menuId} role="menu" aria-label={t('lang.label')} className="lang-menu paper" onKeyDown={onMenuKey}>
          {LANGS.map(l => (
            <button
              key={l}
              type="button"
              role="menuitemradio"
              aria-checked={l === current}
              lang={LANG_ATTR[l]}
              className="lang-menu__opt"
              onClick={() => choose(l)}
            >
              <span>{t(`lang.${l}`)}</span>
              {l === current && <Check size={18} strokeWidth={2.5} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
