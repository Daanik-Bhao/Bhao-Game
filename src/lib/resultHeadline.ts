/**
 * Result screen headline (spec §E.20), rules evaluated in order:
 * won → grew ≥ 2× → grew > 0 → near miss (within 20 % of the goal) → shrank.
 * Pure; the screen maps `kind` to `result.headline.<kind>` and a Gullu mood.
 */
export type HeadlineKind = 'won' | 'grew2x' | 'grew' | 'nearMiss' | 'shrank'

export interface ResultHeadline {
  kind: HeadlineKind
  /** grew2x: multiple with one decimal, e.g. "2.9" */
  multiple?: string
  /** grew: whole percent */
  pct?: number
  /** nearMiss: ₹ still missing */
  gap?: number
  mood: 'cheer' | 'happy' | 'wow' | 'think'
  confetti: boolean
}

export function resultHeadline({ won, start, final, goal }: { won: boolean; start: number; final: number; goal: number }): ResultHeadline {
  if (won) return { kind: 'won', mood: 'cheer', confetti: true }
  if (start > 0 && final >= start * 2) {
    const m = Math.round((final / start) * 10) / 10
    return { kind: 'grew2x', multiple: (m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)), mood: 'cheer', confetti: false }
  }
  if (final > start) {
    const pct = start > 0 ? Math.max(1, Math.round(((final - start) / start) * 100)) : 0
    return { kind: 'grew', pct, mood: 'happy', confetti: false }
  }
  const gap = goal - final
  if (goal > 0 && gap > 0 && gap <= goal * 0.2) return { kind: 'nearMiss', gap, mood: 'wow', confetti: false }
  return { kind: 'shrank', mood: 'think', confetti: false }
}
