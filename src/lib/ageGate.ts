/**
 * Device-side age records (docs/age-policy.md, Option B). Only an age band and a timestamp
 * are kept, never the year of birth.
 *
 * - `bhao_age_band`: this device's answer for guest play `{ band, at }` (13to17 | adult).
 * - `bhao_age_block`: an under-13 answer `{ until }`: guest play and sign-up are blocked on
 *   this device until then (a soft cooldown against an instant retry with another year).
 * - `bhao_account_age_band`: the age band of the account signed in on this device (or last
 *   signed in), so telemetry can be decided before the app (and Supabase) has loaded.
 * - `bhao_pending_signup`: an email sign-up that is waiting for the email to be confirmed
 *   `{ email, band, username, at }`; the profile is created at the first sign-in.
 * - `bhao_pending_username:<userId>`: the name a 13–17 player picked at sign-up. It is not
 *   sent to the server until a parent has said yes (the account gets a neutral name first).
 *
 * Every read tolerates missing / corrupted / unavailable storage.
 */
import { UNDER_AGE_COOLDOWN_MS } from '../config/consent'
import { isAgeBand, type AccountAgeBand, type AgeBand } from './ageBand'

export const DEVICE_AGE_KEY = 'bhao_age_band'
export const UNDER_AGE_BLOCK_KEY = 'bhao_age_block'
export const ACCOUNT_AGE_KEY = 'bhao_account_age_band'
export const PENDING_SIGNUP_KEY = 'bhao_pending_signup'
export const PENDING_USERNAME_PREFIX = 'bhao_pending_username:'

/** A pending email sign-up is forgotten after this long. */
const PENDING_SIGNUP_TTL_MS = 7 * 24 * 60 * 60 * 1000

export interface DeviceAgeRecord { band: AccountAgeBand; at: string }

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown): void {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable: the answer lives for this session only */
  }
}

function isAccountBand(v: unknown): v is AccountAgeBand {
  return isAgeBand(v) && v !== 'under13'
}

/** This device's guest-play answer, or null when the question has not been answered. */
export function getDeviceAge(): DeviceAgeRecord | null {
  const v = read(DEVICE_AGE_KEY) as Partial<DeviceAgeRecord> | null
  return v && isAccountBand(v.band) && typeof v.at === 'string' ? { band: v.band, at: v.at } : null
}

/** End of the under-13 cooldown (ms epoch) while it is still running, else null. */
export function getUnderAgeBlock(now: number = Date.now()): number | null {
  const v = read(UNDER_AGE_BLOCK_KEY) as { until?: unknown } | null
  const until = v && typeof v.until === 'number' ? v.until : null
  if (until === null) return null
  if (until <= now) {
    write(UNDER_AGE_BLOCK_KEY, null)
    return null
  }
  // A clock moved back (or an edited value) never blocks for more than one cooldown.
  if (until - now > UNDER_AGE_COOLDOWN_MS) return blockUnderAge(now)
  return until
}

/** Start the under-13 cooldown on this device (also forgets an earlier answer). */
export function blockUnderAge(now: number = Date.now()): number {
  const until = now + UNDER_AGE_COOLDOWN_MS
  write(UNDER_AGE_BLOCK_KEY, { until })
  write(DEVICE_AGE_KEY, null)
  return until
}

/**
 * Store this device's answer. Under 13 starts the cooldown and returns 'blocked';
 * otherwise the band is kept (with the time) and the answer is returned.
 */
export function recordDeviceAge(band: AgeBand, now: Date = new Date()): AgeBand | 'blocked' {
  if (band === 'under13') {
    blockUnderAge(now.getTime())
    return 'blocked'
  }
  write(DEVICE_AGE_KEY, { band, at: now.toISOString() })
  write(UNDER_AGE_BLOCK_KEY, null)
  return band
}

/** Age band of the account signed in on this device (null when signed out / unknown). */
export function getAccountAgeBand(): AccountAgeBand | null {
  const v = read(ACCOUNT_AGE_KEY)
  return isAccountBand(v) ? v : null
}

export function rememberAccountAgeBand(band: AccountAgeBand | null): void {
  write(ACCOUNT_AGE_KEY, band)
}

export interface PendingSignup { email: string; band: AccountAgeBand; username: string; at: number }

export function savePendingSignup(email: string, band: AccountAgeBand, username: string, now: number = Date.now()): void {
  write(PENDING_SIGNUP_KEY, { email: email.trim().toLowerCase(), band, username, at: now })
}

/** The pending sign-up for this email (case-insensitive), if fresh. */
export function takePendingSignup(email: string | null | undefined, now: number = Date.now()): PendingSignup | null {
  const v = read(PENDING_SIGNUP_KEY) as Partial<PendingSignup> | null
  if (!v || !email || typeof v.email !== 'string' || typeof v.at !== 'number' || typeof v.username !== 'string' || !isAccountBand(v.band)) return null
  if (now - v.at > PENDING_SIGNUP_TTL_MS) {
    write(PENDING_SIGNUP_KEY, null)
    return null
  }
  if (v.email !== email.trim().toLowerCase()) return null
  return { email: v.email, band: v.band, username: v.username, at: v.at }
}

export function clearPendingSignup(): void {
  write(PENDING_SIGNUP_KEY, null)
}

export function savePendingUsername(userId: string, username: string): void {
  if (username.trim()) write(PENDING_USERNAME_PREFIX + userId, username.trim())
}

export function takePendingUsername(userId: string): string | null {
  const v = read(PENDING_USERNAME_PREFIX + userId)
  return typeof v === 'string' && v.trim() ? v : null
}

export function clearPendingUsername(userId: string): void {
  write(PENDING_USERNAME_PREFIX + userId, null)
}

/**
 * True when this device may run behaviour-style telemetry (Sentry Session Replay and
 * performance tracing). Only for a known adult: the signed-in account's band wins, else the
 * device answer. Unknown age counts as "not allowed" (the safe default for a child).
 */
export function allowsFullTelemetry(): boolean {
  const account = getAccountAgeBand()
  if (account) return account === 'adult'
  return getDeviceAge()?.band === 'adult'
}
