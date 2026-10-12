// Campaign (Artha Yatra) progress, persisted per player in localStorage, and — for
// signed-in players — merged up to Supabase (`campaign_progress` table, RPC
// `record_level_result`, migration 20261013200000_campaign_progress.sql).
// Stars are cosmetic (no coins), so client-reported results are acceptable.

// Supabase is loaded lazily so guest/offline code (and unit tests) never touch it.
const loadSupabase = () => import('./supabase')

const STORAGE_PREFIX = 'bhao_campaign_progress:'
const RESULTS_PREFIX = 'bhao_campaign_results:'
export const CAMPAIGN_PROGRESS_EVENT = 'bhao:campaign-progress'

/** Stars needed on a level to unlock the next one. */
export const STARS_TO_UNLOCK_NEXT = 1

/** Best result on one level. */
export interface LevelResult {
  stars: number
  bestNetWorth: number
  /** ISO time of the first completion (≥1★), null if never completed */
  completedAt: string | null
}

export type LevelResults = Record<string, LevelResult>

/** Storage owner key: the Supabase user id, or 'guest' for guest/offline play. */
export function progressOwnerKey(userId: string | null | undefined): string {
  return userId ? `user:${userId}` : 'guest'
}

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable: progress lasts for this page view only */
  }
}

function notify(ownerKey: string, levelId?: string): void {
  try {
    window.dispatchEvent(new CustomEvent(CAMPAIGN_PROGRESS_EVENT, { detail: { ownerKey, levelId } }))
  } catch {
    /* non-browser environment */
  }
}

function legacyCompleted(ownerKey: string): string[] {
  const parsed = readJson(STORAGE_PREFIX + ownerKey)
  return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
}

/** Levels completed (won at least once): legacy list ∪ results with ≥1★. */
export function getCompletedLevels(ownerKey: string): string[] {
  const out = legacyCompleted(ownerKey)
  for (const [id, r] of Object.entries(getLevelResults(ownerKey))) {
    if (r.stars >= 1 && !out.includes(id)) out.push(id)
  }
  return out
}

/** Mark a campaign level as completed (call when the human player wins that level). */
export function markLevelCompleted(ownerKey: string, levelId: string): void {
  const completed = legacyCompleted(ownerKey)
  if (completed.includes(levelId)) return
  completed.push(levelId)
  writeJson(STORAGE_PREFIX + ownerKey, completed)
  notify(ownerKey, levelId)
}

/** Current level = first level (in order) that isn't completed; null if all are done. */
export function getCurrentLevelId(levelIds: string[], completed: string[]): string | null {
  return levelIds.find(id => !completed.includes(id)) ?? null
}

// ---------------------------------------------------------------------------
// Stars + best net worth (Phase 5)
// ---------------------------------------------------------------------------

function clampStars(n: unknown): number {
  const v = Math.floor(Number(n) || 0)
  return Math.max(0, Math.min(3, v))
}

function sanitize(value: unknown): LevelResults {
  const out: LevelResults = {}
  if (!value || typeof value !== 'object' || Array.isArray(value)) return out
  for (const [id, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!raw || typeof raw !== 'object') continue
    const r = raw as Record<string, unknown>
    out[id] = {
      stars: clampStars(r.stars),
      bestNetWorth: Math.max(0, Math.round(Number(r.bestNetWorth) || 0)),
      completedAt: typeof r.completedAt === 'string' ? r.completedAt : null,
    }
  }
  return out
}

export function getLevelResults(ownerKey: string): LevelResults {
  return sanitize(readJson(RESULTS_PREFIX + ownerKey))
}

/** Best of two results for the same level: max stars, max net worth, earliest completion. */
export function bestOf(a: LevelResult | undefined, b: LevelResult | undefined): LevelResult {
  if (!a) return b ?? { stars: 0, bestNetWorth: 0, completedAt: null }
  if (!b) return a
  const times = [a.completedAt, b.completedAt].filter((t): t is string => !!t).sort()
  return {
    stars: Math.max(a.stars, b.stars),
    bestNetWorth: Math.max(a.bestNetWorth, b.bestNetWorth),
    completedAt: times[0] ?? null,
  }
}

/** Merge two result maps, keeping the best per level. Pure. */
export function mergeLevelResults(a: LevelResults, b: LevelResults): LevelResults {
  const out: LevelResults = { ...a }
  for (const [id, r] of Object.entries(b)) out[id] = bestOf(out[id], r)
  return out
}

/**
 * Record a finished campaign level (win or loss). Keeps the best stars / net worth;
 * a result with ≥1★ also marks the level completed. Returns the stored best.
 * Signed-in players: also pushed to the server (fire-and-forget) when Supabase is configured.
 */
export function recordLevelResult(ownerKey: string, levelId: string, stars: number, netWorth: number, now: Date = new Date()): LevelResult {
  const s = clampStars(stars)
  const fresh: LevelResult = { stars: s, bestNetWorth: Math.max(0, Math.round(netWorth)), completedAt: s >= 1 ? now.toISOString() : null }
  const results = getLevelResults(ownerKey)
  const best = bestOf(results[levelId], fresh)
  writeJson(RESULTS_PREFIX + ownerKey, { ...results, [levelId]: best })
  if (s >= 1) markLevelCompleted(ownerKey, levelId)
  notify(ownerKey, levelId)
  if (ownerKey.startsWith('user:')) void pushLevelResult(levelId, fresh)
  return best
}

/** Stars per level (0 if never played) — legacy completions without stars count as 1★. */
export function getLevelStars(ownerKey: string): Record<string, number> {
  const out: Record<string, number> = {}
  for (const id of legacyCompleted(ownerKey)) out[id] = 1
  for (const [id, r] of Object.entries(getLevelResults(ownerKey))) out[id] = Math.max(out[id] ?? 0, r.stars)
  return out
}

/** Unlock rule: the first level is always open; each next level needs ≥ STARS_TO_UNLOCK_NEXT on the previous one. */
export function isLevelUnlocked(levelIds: string[], levelId: string, stars: Record<string, number>): boolean {
  const i = levelIds.indexOf(levelId)
  if (i < 0) return false
  if (i === 0) return true
  return (stars[levelIds[i - 1]] ?? 0) >= STARS_TO_UNLOCK_NEXT
}

/** Total stars earned over the given levels. */
export function totalStars(levelIds: string[], stars: Record<string, number>): number {
  return levelIds.reduce((sum, id) => sum + Math.min(3, stars[id] ?? 0), 0)
}

// ---------------------------------------------------------------------------
// Server sync (signed-in players)
// ---------------------------------------------------------------------------

interface ServerRow {
  level_id: string
  stars: number
  best_net_worth: number | string
  completed_at: string | null
}

async function pushLevelResult(levelId: string, r: LevelResult): Promise<boolean> {
  try {
    const { isSupabaseConfigured, supabase } = await loadSupabase()
    if (!isSupabaseConfigured) return false
    const { error } = await supabase.rpc('record_level_result', {
      p_level_id: levelId,
      p_stars: r.stars,
      p_net_worth: r.bestNetWorth,
    })
    return !error
  } catch {
    return false
  }
}

/** Server rows → result map. Pure (exported for tests). */
export function rowsToResults(rows: ServerRow[] | null | undefined): LevelResults {
  const out: LevelResults = {}
  for (const row of rows ?? []) {
    if (!row || typeof row.level_id !== 'string') continue
    out[row.level_id] = bestOf(out[row.level_id], {
      stars: clampStars(row.stars),
      bestNetWorth: Math.max(0, Math.round(Number(row.best_net_worth) || 0)),
      completedAt: row.completed_at ?? null,
    })
  }
  return out
}

/**
 * Merge local progress (this user's + any guest progress on this device) up to the
 * server, then pull the server's best back into localStorage. Call after sign-in and
 * when the campaign screen opens. No-op without Supabase or a user. Never throws.
 */
export async function syncCampaignProgress(userId: string | null | undefined): Promise<LevelResults | null> {
  if (!userId) return null
  const ownerKey = progressOwnerKey(userId)
  try {
    const { isSupabaseConfigured, supabase } = await loadSupabase()
    if (!isSupabaseConfigured) return null
    const guestKey = progressOwnerKey(null)
    const legacyToResults = (key: string): LevelResults =>
      Object.fromEntries(legacyCompleted(key).map(id => [id, { stars: 1, bestNetWorth: 0, completedAt: null }]))
    const local = mergeLevelResults(
      mergeLevelResults(getLevelResults(ownerKey), legacyToResults(ownerKey)),
      mergeLevelResults(getLevelResults(guestKey), legacyToResults(guestKey)),
    )

    const { data, error } = await supabase
      .from('campaign_progress')
      .select('level_id, stars, best_net_worth, completed_at')
      .eq('user_id', userId)
    const server = error ? {} : rowsToResults(data as ServerRow[] | null)

    // Push anything the server doesn't have yet (or where local is better)
    for (const [levelId, r] of Object.entries(local)) {
      const s = server[levelId]
      if (!s || r.stars > s.stars || r.bestNetWorth > s.bestNetWorth) await pushLevelResult(levelId, r)
    }

    const merged = mergeLevelResults(local, server)
    writeJson(RESULTS_PREFIX + ownerKey, merged)
    const completed = legacyCompleted(ownerKey)
    for (const [id, r] of Object.entries(merged)) if (r.stars >= 1 && !completed.includes(id)) completed.push(id)
    writeJson(STORAGE_PREFIX + ownerKey, completed)
    notify(ownerKey)
    return merged
  } catch {
    return null
  }
}
