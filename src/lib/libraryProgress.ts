// Gyaan Library progress: which concepts each player has unlocked, and which of
// those they have already looked at. Persisted per player in localStorage, keyed
// by the same owner key as campaign progress (see progressOwnerKey).
// Signed-in players also get a server copy (`library_progress` table, migration
// 20261014000100_library_progress.sql) so it follows them across devices:
// sync on sign-in pulls + unions, every local change is pushed (debounced,
// fire-and-forget). Union semantics everywhere: nothing is ever removed or un-seen.

import type { ConceptId } from '../types/learning'
import { ALL_CONCEPT_IDS } from '../data/concepts'

export { progressOwnerKey } from './campaignProgress'

// Supabase is loaded lazily so guest/offline code (and unit tests) never touch it.
const loadSupabase = () => import('./supabase')

const STORAGE_PREFIX = 'bhao_library_progress:'
export const LIBRARY_PROGRESS_EVENT = 'bhao:library-progress'
const USER_PREFIX = 'user:'
/** Local changes are pushed this long after the last one (batches a burst of unlocks). */
export const LIBRARY_PUSH_DELAY_MS = 1500

export interface LibraryProgress {
  /** Unlocked concepts, in the order they were unlocked */
  unlocked: ConceptId[]
  /** Unlocked concepts the player has already seen in the library */
  seen: ConceptId[]
}

const KNOWN_IDS = new Set<string>(ALL_CONCEPT_IDS)

function isConceptId(x: unknown): x is ConceptId {
  return typeof x === 'string' && KNOWN_IDS.has(x)
}

function cleanList(x: unknown): ConceptId[] {
  if (!Array.isArray(x)) return []
  return Array.from(new Set(x.filter(isConceptId)))
}

function read(ownerKey: string): LibraryProgress {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + ownerKey)
    if (!raw) return { unlocked: [], seen: [] }
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return { unlocked: [], seen: [] }
    const obj = parsed as Record<string, unknown>
    const unlocked = cleanList(obj.unlocked)
    const seen = cleanList(obj.seen).filter(id => unlocked.includes(id))
    return { unlocked, seen }
  } catch {
    return { unlocked: [], seen: [] }
  }
}

function write(ownerKey: string, progress: LibraryProgress): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + ownerKey, JSON.stringify(progress))
  } catch {
    /* storage unavailable: progress lasts for this page view only */
  }
  try {
    window.dispatchEvent(new CustomEvent(LIBRARY_PROGRESS_EVENT, { detail: { ownerKey } }))
  } catch {
    /* non-browser environment */
  }
}

export function getLibraryProgress(ownerKey: string): LibraryProgress {
  return read(ownerKey)
}

export function getUnlockedConcepts(ownerKey: string): ConceptId[] {
  return read(ownerKey).unlocked
}

/** Unlock concepts for a player. Returns only the ones that were not unlocked before. */
export function unlockConcepts(ownerKey: string, ids: readonly ConceptId[]): ConceptId[] {
  const progress = read(ownerKey)
  const newlyUnlocked = cleanList(ids).filter(id => !progress.unlocked.includes(id))
  if (newlyUnlocked.length === 0) return []
  write(ownerKey, { unlocked: [...progress.unlocked, ...newlyUnlocked], seen: progress.seen })
  scheduleLibraryPush(ownerKey)
  return newlyUnlocked
}

/** Unlocked concepts the player hasn't opened the library to look at yet. */
export function getUnseenConcepts(ownerKey: string): ConceptId[] {
  const { unlocked, seen } = read(ownerKey)
  return unlocked.filter(id => !seen.includes(id))
}

export function getUnseenCount(ownerKey: string): number {
  return getUnseenConcepts(ownerKey).length
}

/** Mark concepts as seen; with no ids, marks every unlocked concept as seen. */
export function markSeen(ownerKey: string, ids?: readonly ConceptId[]): void {
  const progress = read(ownerKey)
  const toMark = ids ? cleanList(ids).filter(id => progress.unlocked.includes(id)) : progress.unlocked
  const additions = toMark.filter(id => !progress.seen.includes(id))
  if (additions.length === 0) return
  write(ownerKey, { unlocked: progress.unlocked, seen: [...progress.seen, ...additions] })
  scheduleLibraryPush(ownerKey)
}

// ---------------------------------------------------------------------------
// Union (pure) + merge into storage
// ---------------------------------------------------------------------------

/**
 * Union of two library progress records: every concept unlocked in either (a's order
 * first, then b's extras), seen if seen in either. Unknown ids are dropped. Pure.
 */
export function unionLibraryProgress(a: LibraryProgress, b: LibraryProgress): LibraryProgress {
  const unlocked = cleanList([...a.unlocked, ...b.unlocked])
  const seenSet = new Set<string>([...a.seen, ...b.seen])
  return { unlocked, seen: unlocked.filter(id => seenSet.has(id)) }
}

function sameProgress(a: LibraryProgress, b: LibraryProgress): boolean {
  return a.unlocked.length === b.unlocked.length && a.seen.length === b.seen.length
    && a.unlocked.every((id, i) => b.unlocked[i] === id) && a.seen.every(id => b.seen.includes(id))
}

/** Union `extra` into an owner's stored progress. Writes (and pushes for users) only if something changed. */
export function mergeLibraryProgress(ownerKey: string, extra: LibraryProgress): LibraryProgress {
  const current = read(ownerKey)
  const merged = unionLibraryProgress(current, extra)
  if (!sameProgress(current, merged)) {
    write(ownerKey, merged)
    scheduleLibraryPush(ownerKey)
  }
  return merged
}

// ---------------------------------------------------------------------------
// Server sync (signed-in players)
// ---------------------------------------------------------------------------

export interface LibraryServerRow {
  concept_id: string
  seen: boolean | null
}

/** Server rows → progress (unknown concepts ignored). Pure (exported for tests). */
export function rowsToLibraryProgress(rows: LibraryServerRow[] | null | undefined): LibraryProgress {
  const valid = (rows ?? []).filter(r => r && isConceptId(r.concept_id))
  const unlocked = cleanList(valid.map(r => r.concept_id))
  const seenIds = new Set(valid.filter(r => r.seen === true).map(r => r.concept_id))
  return { unlocked, seen: unlocked.filter(id => seenIds.has(id)) }
}

/** Progress → upsert rows for one user. Pure (exported for tests). */
export function libraryProgressToRows(userId: string, p: LibraryProgress): { user_id: string; concept_id: ConceptId; seen: boolean }[] {
  return p.unlocked.map(id => ({ user_id: userId, concept_id: id, seen: p.seen.includes(id) }))
}

/** True when `server` lacks a concept or a seen mark that `local` has. Pure. */
export function libraryNeedsPush(local: LibraryProgress, server: LibraryProgress): boolean {
  return local.unlocked.some(id => !server.unlocked.includes(id)) || local.seen.some(id => !server.seen.includes(id))
}

function userIdOf(ownerKey: string): string | null {
  return ownerKey.startsWith(USER_PREFIX) ? ownerKey.slice(USER_PREFIX.length) || null : null
}

function isOffline(): boolean {
  try {
    return typeof navigator !== 'undefined' && navigator.onLine === false
  } catch {
    return false
  }
}

const pushTimers = new Map<string, ReturnType<typeof setTimeout>>()

/** Debounced, fire-and-forget push of a signed-in player's library. Guests: no-op. */
export function scheduleLibraryPush(ownerKey: string, delayMs: number = LIBRARY_PUSH_DELAY_MS): void {
  const userId = userIdOf(ownerKey)
  if (!userId) return
  const pending = pushTimers.get(userId)
  if (pending) clearTimeout(pending)
  try {
    pushTimers.set(userId, setTimeout(() => {
      pushTimers.delete(userId)
      void pushLibraryProgress(userId)
    }, delayMs))
  } catch {
    /* no timers (non-browser): skip, the next sign-in sync catches up */
  }
}

/**
 * Upsert everything this device knows for the user. The server keeps it monotonic
 * (seen never turns false, earliest unlock time wins). Resolves false when skipped
 * (no Supabase, offline) or on error. Never throws.
 */
export async function pushLibraryProgress(userId: string): Promise<boolean> {
  try {
    if (isOffline()) return false
    const { isSupabaseConfigured, supabase } = await loadSupabase()
    if (!isSupabaseConfigured) return false
    const rows = libraryProgressToRows(userId, read(USER_PREFIX + userId))
    if (rows.length === 0) return true
    const { error } = await supabase.from('library_progress').upsert(rows, { onConflict: 'user_id,concept_id' })
    return !error
  } catch {
    return false
  }
}

/**
 * Pull the user's server library, union it with this device's copy (stored locally),
 * and push back anything the server is missing. Call after sign-in. No-op without
 * Supabase, a user, or a connection. Never throws.
 */
export async function syncLibraryProgress(userId: string | null | undefined): Promise<LibraryProgress | null> {
  if (!userId) return null
  try {
    if (isOffline()) return null
    const { isSupabaseConfigured, supabase } = await loadSupabase()
    if (!isSupabaseConfigured) return null
    const { data, error } = await supabase
      .from('library_progress')
      .select('concept_id, seen')
      .eq('user_id', userId)
    if (error) return null
    const server = rowsToLibraryProgress(data as LibraryServerRow[] | null)
    const ownerKey = USER_PREFIX + userId
    const current = read(ownerKey)
    const merged = unionLibraryProgress(current, server)
    if (!sameProgress(current, merged)) write(ownerKey, merged)
    if (libraryNeedsPush(merged, server)) void pushLibraryProgress(userId)
    return merged
  } catch {
    return null
  }
}
