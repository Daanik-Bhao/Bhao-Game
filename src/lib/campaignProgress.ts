// Campaign (Artha Yatra) progress, persisted per player in localStorage.
// TODO: persist progress server-side (e.g. a `campaign_progress` table keyed by
// user id) so signed-in players keep it across devices; localStorage is the
// source of truth for now, for guests and signed-in users alike.

const STORAGE_PREFIX = 'bhao_campaign_progress:'
export const CAMPAIGN_PROGRESS_EVENT = 'bhao:campaign-progress'

/** Storage owner key: the Supabase user id, or 'guest' for guest/offline play. */
export function progressOwnerKey(userId: string | null | undefined): string {
  return userId ? `user:${userId}` : 'guest'
}

export function getCompletedLevels(ownerKey: string): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + ownerKey)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

/** Mark a campaign level as completed (call when the human player wins that level). */
export function markLevelCompleted(ownerKey: string, levelId: string): void {
  const completed = getCompletedLevels(ownerKey)
  if (completed.includes(levelId)) return
  completed.push(levelId)
  try {
    localStorage.setItem(STORAGE_PREFIX + ownerKey, JSON.stringify(completed))
  } catch {
    /* storage unavailable: progress lasts for this page view only */
  }
  try {
    window.dispatchEvent(new CustomEvent(CAMPAIGN_PROGRESS_EVENT, { detail: { ownerKey, levelId } }))
  } catch {
    /* non-browser environment */
  }
}

/** Current level = first level (in order) that isn't completed; null if all are done. */
export function getCurrentLevelId(levelIds: string[], completed: string[]): string | null {
  return levelIds.find(id => !completed.includes(id)) ?? null
}
