import { Coins, Crown, Gem, Landmark, Leaf, PiggyBank, Rocket, Sparkles, type LucideIcon } from 'lucide-react'

/**
 * In-app avatar presets (no image files, no network): a lucide icon on a seat colour (spec §D.11 style).
 *
 * The chosen preset is stored in `profiles.avatar_url` as `/avatar/<id>` — a value, not a real file path.
 * The leading "/" satisfies the DB check in `update_my_profile` (`^https://` or `^/`), so no schema change.
 */
export interface AvatarPreset {
  id: string
  icon: LucideIcon
  /** Index into SEAT_COLORS */
  seat: number
}

export const AVATAR_PRESETS: readonly AvatarPreset[] = [
  { id: 'piggy', icon: PiggyBank, seat: 0 },
  { id: 'coins', icon: Coins, seat: 1 },
  { id: 'leaf', icon: Leaf, seat: 2 },
  { id: 'crown', icon: Crown, seat: 3 },
  { id: 'gem', icon: Gem, seat: 4 },
  { id: 'bank', icon: Landmark, seat: 5 },
  { id: 'rocket', icon: Rocket, seat: 1 },
  { id: 'spark', icon: Sparkles, seat: 0 },
]

const PREFIX = '/avatar/'

/** Stored value for a preset id, e.g. `/avatar/piggy`. */
export function avatarValue(id: string): string {
  return PREFIX + id
}

/** Every value the profile picker offers, in display order. */
export const AVATAR_OPTIONS: readonly string[] = AVATAR_PRESETS.map(p => avatarValue(p.id))

/** Old hosted photos were named avatar1.jpg … avatar8.jpg; map them onto the preset in the same slot. */
const LEGACY_PHOTO = /\/avatar([1-9])\.(?:jpe?g|png|webp)(?:[?#].*)?$/i

/**
 * Resolve a stored `avatar_url` to a preset.
 * - `/avatar/<id>` → that preset
 * - a legacy hosted photo URL (`…/avatar3.jpg`) → preset #3, so a player's old pick stays distinct
 * - anything else (null, unknown URL) → null, and the caller shows the initial instead.
 * External images are never loaded, so avatars work offline.
 */
export function resolveAvatar(value: string | null | undefined): AvatarPreset | null {
  if (!value) return null
  if (value.startsWith(PREFIX)) {
    const id = value.slice(PREFIX.length)
    return AVATAR_PRESETS.find(p => p.id === id) ?? null
  }
  const legacy = LEGACY_PHOTO.exec(value)
  if (legacy) return AVATAR_PRESETS[Number(legacy[1]) - 1] ?? null
  return null
}
