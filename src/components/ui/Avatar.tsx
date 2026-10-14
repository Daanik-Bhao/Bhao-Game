import type { CSSProperties } from 'react'
import { Bot } from 'lucide-react'
import './ui.css'

/** Seat colours (spec §D.11) — the one colour constant allowed outside tokens.css. */
export const SEAT_COLORS = ['#7C4DCC', '#C2431A', '#2E7D6B', '#B8860B', '#2E47D1', '#46607A'] as const

export function seatColor(seat: number): string {
  const i = ((seat % SEAT_COLORS.length) + SEAT_COLORS.length) % SEAT_COLORS.length
  return SEAT_COLORS[i]
}

/** First letter of a name (handles Devanagari and emoji-safe code points). */
export function initialOf(name: string | undefined | null): string {
  const s = (name ?? '').trim()
  if (!s) return '?'
  const first = Array.from(s)[0]
  return first.toLocaleUpperCase()
}

export interface AvatarProps {
  name: string
  /** Seat index → colour. Omit with `me` for the light "you" style. */
  seat?: number
  /** 40 (menus, default) · s = 34 (rival chip) · m = 36 (standings) · l = 56 */
  size?: 'default' | 's' | 'm' | 'l'
  /** Rank badge "#1" (table) */
  rank?: number
  bot?: boolean
  /** Brand-soft style used for the signed-in user in app bars */
  me?: boolean
  imageUrl?: string | null
  className?: string
  /** Decorative by default (the name is usually shown next to it) */
  label?: string
}

/** Initial-in-a-circle avatar (spec §D.11). */
export function Avatar({ name, seat = 0, size = 'default', rank, bot, me, imageUrl, className = '', label }: AvatarProps) {
  const style = me ? undefined : ({ '--seat': seatColor(seat) } as CSSProperties)
  const cls = ['avatar', size !== 'default' ? `avatar--${size}` : '', me ? 'avatar--me' : '', className].filter(Boolean).join(' ')
  return (
    <span className={cls} style={style} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {imageUrl ? <img src={imageUrl} alt="" /> : initialOf(name)}
      {rank !== undefined && <em className="avatar__rank">#{rank}</em>}
      {bot && <span className="avatar__bot"><Bot size={12} strokeWidth={2.5} aria-hidden="true" /></span>}
    </span>
  )
}
