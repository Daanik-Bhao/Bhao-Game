// Guest → account progress merge (offered once, on sign-in).
//
// Guests keep campaign results and Gyaan Library unlocks under the 'guest' owner key in
// localStorage. When an account signs in on a device whose guest progress beats the
// account's, the app offers (once) to bring it in:
//   - campaign: the server RPC `import_guest_campaign_progress` (migration
//     20261014000000_guest_campaign_import.sql) accepts the claims ONCE per account,
//     clamps them, enforces the unlock chain and flags them `imported`; the client stores
//     exactly what the server returns. Never written through `record_level_result`.
//   - library: union of guest unlocks into the account's library (cosmetic, own rows).
// Decisions are remembered per account ('merged' | 'declined'), and a device's guest
// progress is merged into at most one account, so nobody is asked twice.
// See docs/phase5-design.md "Guest progress merge".

import {
  localLevelResults, progressOwnerKey, rowsToResults, storeMergedResults,
  type LevelResults, type ServerRow,
} from './campaignProgress'
import { getLibraryProgress, mergeLibraryProgress, type LibraryProgress } from './libraryProgress'

const loadSupabase = () => import('./supabase')

const DECISION_PREFIX = 'bhao_guest_merge:'
const CLAIMED_KEY = 'bhao_guest_merge_claimed'
/** Same limit as the server RPC. */
export const MAX_IMPORT_LEVELS = 50

export type GuestMergeDecision = 'merged' | 'declined'

export interface GuestMergeOffer {
  /** Campaign levels whose stars would go up (after the unlock-chain cap), lowest first */
  levels: string[]
  /** Total stars the account would gain */
  stars: number
  /** Gyaan Library concepts the account doesn't have yet */
  concepts: number
}

// ---------------------------------------------------------------------------
// Pure logic (mirrors the server rules; unit-tested)
// ---------------------------------------------------------------------------

/** 'level_12' → 12, anything else → null (same pattern as the server). */
export function levelNumber(levelId: string): number | null {
  const m = /^level_(\d{1,3})$/.exec(levelId)
  return m ? Number(m[1]) : null
}

/**
 * Guest claims the server would accept on top of `account`: valid ids, ≥1★, at most 3★,
 * and level N only when level N-1 has ≥1★ on the account or in an earlier accepted claim
 * (level 1 always). Lowest level first. Pure.
 */
export function capToUnlockChain(account: LevelResults, claims: LevelResults): LevelResults {
  const ordered = Object.keys(claims)
    .map(id => ({ id, n: levelNumber(id) }))
    .filter((x): x is { id: string; n: number } => x.n !== null)
    .sort((a, b) => a.n - b.n)
  const out: LevelResults = {}
  const starsOf = (n: number) => Math.max(account[`level_${n}`]?.stars ?? 0, out[`level_${n}`]?.stars ?? 0)
  for (const { id, n } of ordered) {
    const c = claims[id]
    const stars = Math.max(0, Math.min(3, Math.floor(c.stars)))
    if (stars < 1) continue
    if (n > 1 && starsOf(n - 1) < 1) continue
    out[id] = { ...c, stars }
  }
  return out
}

/** What a guest merge would add to an account, or null when it would add nothing. Pure. */
export function computeGuestMergeOffer(
  guest: LevelResults,
  account: LevelResults,
  guestLibrary: LibraryProgress,
  accountLibrary: LibraryProgress,
): GuestMergeOffer | null {
  const accepted = capToUnlockChain(account, guest)
  const levels: string[] = []
  let stars = 0
  for (const [id, r] of Object.entries(accepted)) {
    const have = account[id]?.stars ?? 0
    if (r.stars > have) {
      levels.push(id)
      stars += r.stars - have
    }
  }
  const concepts = guestLibrary.unlocked.filter(id => !accountLibrary.unlocked.includes(id)).length
  if (levels.length === 0 && concepts === 0) return null
  return { levels, stars, concepts }
}

/** Guest results → RPC payload (completed levels only, lowest first, capped). Pure. */
export function toImportPayload(guest: LevelResults): { level_id: string; stars: number; net_worth: number }[] {
  return Object.entries(guest)
    .filter(([id, r]) => levelNumber(id) !== null && r.stars >= 1)
    .sort(([a], [b]) => (levelNumber(a) ?? 0) - (levelNumber(b) ?? 0))
    .slice(0, MAX_IMPORT_LEVELS)
    .map(([id, r]) => ({ level_id: id, stars: r.stars, net_worth: r.bestNetWorth }))
}

// ---------------------------------------------------------------------------
// Decisions (localStorage)
// ---------------------------------------------------------------------------

function getItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function setItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* storage unavailable: the server's once-per-account rule still holds */
  }
}

export function getGuestMergeDecision(userId: string): GuestMergeDecision | null {
  const v = getItem(DECISION_PREFIX + userId)
  return v === 'merged' || v === 'declined' ? v : null
}

export function setGuestMergeDecision(userId: string, decision: GuestMergeDecision): void {
  setItem(DECISION_PREFIX + userId, decision)
}

/** Account that already took this device's guest progress (null if none). */
export function guestProgressClaimedBy(): string | null {
  return getItem(CLAIMED_KEY)
}

/** The merge offer for this user on this device, or null (already decided, claimed, or nothing to add). */
export function getGuestMergeOffer(userId: string | null | undefined): GuestMergeOffer | null {
  if (!userId) return null
  if (getGuestMergeDecision(userId) || guestProgressClaimedBy()) return null
  const userKey = progressOwnerKey(userId)
  const guestKey = progressOwnerKey(null)
  return computeGuestMergeOffer(
    localLevelResults(guestKey),
    localLevelResults(userKey),
    getLibraryProgress(guestKey),
    getLibraryProgress(userKey),
  )
}

export function declineGuestMerge(userId: string): void {
  setGuestMergeDecision(userId, 'declined')
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

/** True when the account already imported guest progress (e.g. on another device). Never throws. */
export async function hasImportedGuestProgress(userId: string): Promise<boolean> {
  try {
    const { isSupabaseConfigured, supabase } = await loadSupabase()
    if (!isSupabaseConfigured) return false
    const { data, error } = await supabase
      .from('campaign_guest_imports')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
    return !error && !!data
  } catch {
    return false
  }
}

export interface GuestMergeResult {
  status: 'merged' | 'already' | 'failed'
  /** Levels the server accepted */
  accepted: number
}

interface ImportResponse {
  already_imported?: boolean
  accepted?: number
  progress?: ServerRow[]
}

/**
 * Bring this device's guest progress into the account. Campaign claims go through the
 * once-per-account server import; library unlocks are unioned locally (and pushed).
 * On 'failed' nothing is remembered, so the offer can come back (e.g. after being offline).
 */
export async function acceptGuestMerge(userId: string): Promise<GuestMergeResult> {
  const userKey = progressOwnerKey(userId)
  const guestKey = progressOwnerKey(null)
  const payload = toImportPayload(localLevelResults(guestKey))
  let status: GuestMergeResult['status'] = 'merged'
  let accepted = 0

  if (payload.length > 0) {
    try {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return { status: 'failed', accepted: 0 }
      const { isSupabaseConfigured, supabase } = await loadSupabase()
      if (!isSupabaseConfigured) return { status: 'failed', accepted: 0 }
      const { data, error } = await supabase.rpc('import_guest_campaign_progress', { p_levels: payload })
      if (error || !data) return { status: 'failed', accepted: 0 }
      const res = data as ImportResponse
      storeMergedResults(userKey, rowsToResults(res.progress ?? []))
      accepted = Math.max(0, Number(res.accepted) || 0)
      if (res.already_imported) status = 'already'
    } catch {
      return { status: 'failed', accepted: 0 }
    }
  }

  mergeLibraryProgress(userKey, getLibraryProgress(guestKey))
  setGuestMergeDecision(userId, 'merged')
  setItem(CLAIMED_KEY, userId)
  return { status, accepted }
}
