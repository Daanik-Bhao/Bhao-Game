import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Gullu, type GulluMood } from '../mascot/Gullu'
import './ui.css'

/** Count badge (spec §D.10): unread chat, log count. Sits on the opener only. */
export function Badge({ count, float, label, className = '' }: { count: number; float?: boolean; label?: string; className?: string }) {
  if (count <= 0) return null
  return (
    <span className={`badge${float ? ' badge--float' : ''} ${className}`.trim()} aria-label={label}>
      {count > 99 ? '99+' : count}
    </span>
  )
}

/** Empty state (spec §D.12): Gullu think 72, title, one line, one small primary button. */
export function EmptyState({ title, body, action, mood = 'think', className = '' }: {
  title: ReactNode; body?: ReactNode; action?: ReactNode; mood?: GulluMood; className?: string
}) {
  return (
    <div className={`empty ${className}`.trim()}>
      <Gullu mood={mood} size={72} />
      <p className="empty__title">{title}</p>
      {body && <p className="empty__body">{body}</p>}
      {action}
    </div>
  )
}

/** Skeleton block (paper-2 → paper-3 shimmer; static in reduced motion). */
export function Skeleton({ width, height = 18, className = '', style }: { width?: number | string; height?: number | string; className?: string; style?: CSSProperties }) {
  return <span aria-hidden="true" className={`skeleton ${className}`.trim()} style={{ display: 'block', width, height, ...style }} />
}

/** Route-level loader: paper + Gullu + 3 pulsing dots; only visible after a 300 ms delay. */
export function PageLoader({ delay = 300 }: { delay?: number }) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(delay <= 0)
  useEffect(() => {
    if (delay <= 0) return
    const id = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(id)
  }, [delay])
  return (
    <div className={`page-loader${visible ? '' : ' is-waiting'}`} role="status" aria-live="polite" aria-busy="true">
      <Gullu mood="happy" size={72} />
      <span className="loader-dots" aria-hidden="true"><i /><i /><i /></span>
      <span className="sr-only">{t('common.loading')}</span>
    </div>
  )
}

/** ₹ BHAO wordmark (Baloo). Links home when `to` is given. */
export function Wordmark({ to, large, className = '' }: { to?: string; large?: boolean; className?: string }) {
  const content = <><b className="wordmark__coin" aria-hidden="true">₹</b>BHAO</>
  const cls = `wordmark${large ? ' wordmark--l' : ''} ${className}`.trim()
  return to ? <Link to={to} className={cls} aria-label="BHAO">{content}</Link> : <span className={cls}>{content}</span>
}

/** Flat haldi "D" coin for Daanik Coins (never ₹ / $ / coin piles). */
export function DCoin({ className = '' }: { className?: string }) {
  return <span className={`dcoin ${className}`.trim()} aria-hidden="true">D</span>
}

/** On/off switch (role="switch"). */
export function Switch({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; id?: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="switch"
      onClick={() => onChange(!checked)}
    />
  )
}

/** Row in a settings list: icon + label on the left, a control on the right. */
export function SettingRow({ icon, label, children }: { icon?: ReactNode; label: ReactNode; children?: ReactNode }) {
  return (
    <div className="setting-row">
      <span className="setting-row__label">{icon}{label}</span>
      {children}
    </div>
  )
}
