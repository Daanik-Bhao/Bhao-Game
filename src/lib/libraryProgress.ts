// Gyaan Library progress: which concepts each player has unlocked, and which of
// those they have already looked at. Persisted per player in localStorage, keyed
// by the same owner key as campaign progress (see progressOwnerKey).
// TODO: persist server-side for signed-in players so it follows them across devices.

import type { ConceptId } from '../types/learning'
import { ALL_CONCEPT_IDS } from '../data/concepts'

export { progressOwnerKey } from './campaignProgress'

const STORAGE_PREFIX = 'bhao_library_progress:'
export const LIBRARY_PROGRESS_EVENT = 'bhao:library-progress'

interface LibraryProgress {
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

export function getUnlockedConcepts(ownerKey: string): ConceptId[] {
  return read(ownerKey).unlocked
}

/** Unlock concepts for a player. Returns only the ones that were not unlocked before. */
export function unlockConcepts(ownerKey: string, ids: readonly ConceptId[]): ConceptId[] {
  const progress = read(ownerKey)
  const newlyUnlocked = cleanList(ids).filter(id => !progress.unlocked.includes(id))
  if (newlyUnlocked.length === 0) return []
  write(ownerKey, { unlocked: [...progress.unlocked, ...newlyUnlocked], seen: progress.seen })
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
}
