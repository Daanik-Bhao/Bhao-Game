import { useEffect, useRef, useState } from 'react'
import type { DecisionOption, GameState, PlayerState } from '../../types/game'
import { getNetWorth } from '../../lib/gameEngine'

export const DECISION_ORDER: Record<string, number> = { spend: 1, save: 2, invest: 3 }

export function sortDecisionOptions(options: DecisionOption[] | undefined): DecisionOption[] {
  return [...(options || [])].sort((a, b) => (DECISION_ORDER[a.type] || 0) - (DECISION_ORDER[b.type] || 0))
}

/** Players that may be targeted: not me, and still in the game (not forfeited). */
export function isTargetable(player: PlayerState, myPlayerId: string): boolean {
  return player.id !== myPlayerId && !player.hasForfeited
}

export function getTargetableIndices(gameState: GameState, myPlayerId: string): number[] {
  return gameState.players.flatMap((p, i) => (isTargetable(p, myPlayerId) ? [i] : []))
}

export const EMOTES = ['💰', '😭', '📉', '🚀', '😡']

/** 1-based standing of every player by net worth (ties share the better rank). */
export function standings(gameState: GameState): Map<string, number> {
  const worth = gameState.players.map(p => ({ id: p.id, nw: getNetWorth(p), out: !!p.hasForfeited }))
  const sorted = [...worth].sort((a, b) => Number(a.out) - Number(b.out) || b.nw - a.nw)
  const ranks = new Map<string, number>()
  sorted.forEach((p, i) => {
    const prev = sorted[i - 1]
    ranks.set(p.id, prev && prev.nw === p.nw && prev.out === p.out ? ranks.get(prev.id)! : i + 1)
  })
  return ranks
}

/** Net worth at the start of the current year (end of the last recorded round). */
export function yearStartNetWorth(player: PlayerState): number | null {
  const hist = player.stats?.netWorthByRound
  if (!hist || hist.length === 0) return null
  return hist[hist.length - 1]
}

/** Change in net worth this year: ₹ and % (null when unknown). */
export function yearDelta(player: PlayerState): { amount: number; pct: number } | null {
  const start = yearStartNetWorth(player)
  if (start === null) return null
  const now = getNetWorth(player)
  const amount = now - start
  return { amount, pct: start > 0 ? (amount / start) * 100 : 0 }
}

export interface OpponentPlayEvent {
  key: number
  playerId: string
  name: string
  entry: string
}

const OPPONENT_ACTION_RE = / (played|defended|is skipping|took too long|passed|equipped)/

/**
 * Watches the (newest-first) game log and reports each new entry describing an
 * opponent's move (once). The board turns them into toasts.
 */
export function useOpponentPlayFeed(gameState: GameState, myPlayerId: string) {
  const { log, players } = gameState
  const prevHead = useRef<string | undefined>(log[0])
  const counter = useRef(0)
  const [event, setEvent] = useState<OpponentPlayEvent | null>(null)

  useEffect(() => {
    const head = log[0]
    if (head === prevHead.current) return
    const prevIdx = prevHead.current === undefined ? log.length : log.indexOf(prevHead.current)
    prevHead.current = head
    const fresh = log.slice(0, prevIdx < 0 ? Math.min(3, log.length) : prevIdx)
    const opponents = players
      .filter(p => p.id !== myPlayerId)
      .sort((a, b) => b.name.length - a.name.length)
    for (const entry of fresh) {
      if (!OPPONENT_ACTION_RE.test(entry)) continue
      const clean = entry.replace(/^\P{L}+/u, '')
      const actor = opponents.find(p => clean.startsWith(p.name + ' '))
      if (actor) {
        counter.current += 1
        setEvent({ key: counter.current, playerId: actor.id, name: actor.name, entry })
        return
      }
    }
  }, [log, players, myPlayerId])

  return event
}

/** A clock that re-renders every `stepMs`. */
export function useNow(stepMs = 250, active = true) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), stepMs)
    return () => clearInterval(id)
  }, [stepMs, active])
  return now
}

/** Remaining milliseconds of the current turn, ticking every 250ms. */
export function useTurnRemaining(turnStartTime: number, timeLimit: number) {
  const now = useNow(250)
  return Math.max(0, timeLimit - Math.max(0, now - turnStartTime))
}

/** Remaining milliseconds of the whole match (match clock). */
export function useMatchRemaining(gameState: GameState) {
  const now = useNow(1000)
  return Math.max(0, gameState.timeLimit - Math.max(0, now - gameState.startTime))
}

/** "14:21" */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export type FeedbackTier = 'small' | 'medium' | 'large'

/** Feedback tier of a ₹ change (spec §B.7): small < ₹50K, medium ₹50K–₹2L, large ≥ ₹2L. */
export function feedbackTier(delta: number, attackOnMe = false): FeedbackTier {
  const abs = Math.abs(delta)
  if (attackOnMe || abs >= 200000) return 'large'
  if (abs >= 50000) return 'medium'
  return 'small'
}
