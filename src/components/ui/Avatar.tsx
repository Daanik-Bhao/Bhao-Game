import type { CSSProperties } from 'react'
import { Bot } from 'lucide-react'
import { resolveAvatar } from './avatarPresets'
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

const ICON_SIZE = { default: 20, s: 18, m: 18, l: 28 } as const

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
  /**
   * Stored profile avatar (`profiles.avatar_url`): a preset (`/avatar/<id>`) shows its icon + colour.
   * Legacy photo URLs map to a preset; anything unknown falls back to the initial. Never loads an image.
   */
  avatar?: string | null
  className?: string
  /** Decorative by default (the name is usually shown next to it) */
  label?: string
}

/** Initial-in-a-circle avatar (spec §D.11), or the player's chosen icon preset. */
export function Avatar({ name, seat = 0, size = 'default', rank, bot, me, avatar, className = '', label }: AvatarProps) {
  const preset = resolveAvatar(avatar)
  const plainMe = me && !preset
  const style = plainMe ? undefined : ({ '--seat': seatColor(preset ? preset.seat : seat) } as CSSProperties)
  const cls = ['avatar', size !== 'default' ? `avatar--${size}` : '', plainMe ? 'avatar--me' : '', className].filter(Boolean).join(' ')
  const Icon = preset?.icon
  return (
    <span className={cls} style={style} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {Icon ? <Icon size={ICON_SIZE[size]} strokeWidth={2.25} aria-hidden="true" /> : initialOf(name)}
      {rank !== undefined && <em className="avatar__rank">#{rank}</em>}
      {bot && <span className="avatar__bot"><Bot size={12} strokeWidth={2.5} aria-hidden="true" /></span>}
    </span>
  )
}
