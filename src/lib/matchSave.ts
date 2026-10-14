/**
 * Saved single-player match (Practice, Ranked vs bots, Campaign level).
 *
 * Android may kill the app process while it is in the background, which wipes
 * sessionStorage. The running match is therefore kept in localStorage (persisted on disk
 * by the WebView), one slot per profile, so a guest never sees a signed-in account's match
 * and vice versa. Multiplayer is server-authoritative and is never saved here.
 *
 * Times are stored as *elapsed* turn / match time at the moment of saving (frozen while
 * the match is paused), so a restored match resumes with exactly the time it had left.
 *
 * Kept free of engine imports: the Home screen reads it for the "Continue your match?" offer.
 */
import type { GameState } from '../types/game'

export const MATCH_SAVE_SCHEMA = 2
/** Saves older than this are discarded. */
export const MATCH_SAVE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000
const KEY_PREFIX = 'bhao.match.v2:'

export type SavedMatchMode = 'practice' | 'ranked' | 'campaign'
const MODES: readonly SavedMatchMode[] = ['practice', 'ranked', 'campaign']
const UI_PHASES = ['playing', 'decision', 'targeting'] as const
export type SavedUiPhase = typeof UI_PHASES[number]

/** What the Home offer shows without loading the engine. */
export interface SavedMatchSummary {
  round: number
  maxRounds: number
  netWorth: number
}

export interface SavedMatch {
  schema: typeof MATCH_SAVE_SCHEMA
  savedAt: number
  /** Profile slot: `user:<id>` or `guest:<id>` */
  owner: string
  mode: SavedMatchMode
  levelId: string | null
  /** Route to open to continue, e.g. `/game?mode=practice` or `/game/level/l2` */
  route: string
  botCount: number
  uiPhase: SavedUiPhase
  /** Outcome banners still waiting to be read (opaque to this module) */
  popupQueue: unknown[]
  /** Server match id (signed-in players); null = none */
  matchId: string | null
  /** Turn time already used when saved (ms) */
  turnElapsedMs: number
  /** Match clock already used when saved (ms) */
  matchElapsedMs: number
  summary: SavedMatchSummary
  gameState: GameState
}

/** Storage slot for a profile: `user:<id>` for accounts, `guest:<id>` for guests, null if neither. */
export function matchOwnerKey(userId: string | null | undefined, guestId: string | null | undefined): string | null {
  if (userId) return `user:${userId}`
  if (guestId) return `guest:${guestId}`
  return null
}

export const matchSaveKey = (owner: string) => `${KEY_PREFIX}${owner}`

function storage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null
  } catch {
    return null
  }
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const isStr = (v: unknown): v is string => typeof v === 'string'

/** Enough of a GameState to put it back on the board without crashing. */
export function isValidGameState(v: unknown): v is GameState {
  if (!isObj(v)) return false
  if (!isStr(v.id) || !Array.isArray(v.players) || v.players.length < 2) return false
  if (!Array.isArray(v.deck) || !Array.isArray(v.discardPile) || !Array.isArray(v.log)) return false
  if (!isNum(v.currentPlayerIndex) || !Number.isInteger(v.currentPlayerIndex)) return false
  if (v.currentPlayerIndex < 0 || v.currentPlayerIndex >= v.players.length) return false
  if (!isStr(v.phase) || v.phase === 'game_over') return false
  if (!['draw', 'play', 'effect', 'end_turn'].includes(v.phase)) return false
  if (!isNum(v.wealthGoal) || !isNum(v.timeLimit) || !isNum(v.startTime) || !isNum(v.turnStartTime)) return false
  return v.players.every(p => isObj(p) && isStr(p.id) && isStr(p.name) && isNum(p.wealth) && Array.isArray(p.hand)
    && p.hand.every(c => isObj(c) && isStr(c.id) && isStr(c.name) && isStr(c.type)))
}

/** Validates a parsed save. Returns null for anything unexpected (never throws). */
export function parseSavedMatch(raw: unknown, owner: string, now = Date.now()): SavedMatch | null {
  if (!isObj(raw)) return null
  if (raw.schema !== MATCH_SAVE_SCHEMA) return null
  if (!isNum(raw.savedAt) || now - raw.savedAt > MATCH_SAVE_MAX_AGE_MS || raw.savedAt - now > 60_000) return null
  if (raw.owner !== owner) return null
  if (!MODES.includes(raw.mode as SavedMatchMode)) return null
  if (!(raw.levelId === null || isStr(raw.levelId))) return null
  if ((raw.mode === 'campaign') !== isStr(raw.levelId)) return null
  if (!isStr(raw.route) || !raw.route.startsWith('/game')) return null
  if (!isNum(raw.botCount) || !UI_PHASES.includes(raw.uiPhase as SavedUiPhase)) return null
  if (!Array.isArray(raw.popupQueue) || !raw.popupQueue.every(isObj)) return null
  if (!(raw.matchId === null || isStr(raw.matchId))) return null
  if (!isNum(raw.turnElapsedMs) || !isNum(raw.matchElapsedMs) || raw.turnElapsedMs < 0 || raw.matchElapsedMs < 0) return null
  const s = raw.summary
  if (!isObj(s) || !isNum(s.round) || !isNum(s.maxRounds) || !isNum(s.netWorth)) return null
  if (!isValidGameState(raw.gameState)) return null
  return raw as unknown as SavedMatch
}

/** Reads this profile's saved match; drops it from storage when it is invalid, expired or corrupt. */
export function loadMatch(owner: string | null, now = Date.now()): SavedMatch | null {
  const store = storage()
  if (!owner || !store) return null
  const key = matchSaveKey(owner)
  let raw: string | null
  try {
    raw = store.getItem(key)
  } catch {
    return null
  }
  if (!raw) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    parsed = null
  }
  const save = parseSavedMatch(parsed, owner, now)
  if (!save) {
    try { store.removeItem(key) } catch { /* ignore */ }
  }
  return save
}

/** Writes the save (best effort: quota / private mode just means no save). */
export function storeMatch(save: SavedMatch): void {
  try {
    storage()?.setItem(matchSaveKey(save.owner), JSON.stringify(save))
  } catch {
    /* quota exceeded / storage unavailable */
  }
}

export function clearMatch(owner: string | null): void {
  if (!owner) return
  try {
    storage()?.removeItem(matchSaveKey(owner))
  } catch {
    /* ignore */
  }
}

/** The saved state with its clocks re-based on `now`: exactly the time that was left. */
export function restoredGameState(save: SavedMatch, now = Date.now()): GameState {
  return {
    ...save.gameState,
    turnStartTime: now - save.turnElapsedMs,
    startTime: now - save.matchElapsedMs,
  }
}
