import { useEffect, useRef, useState } from 'react'
import type { CardEffect, DecisionOption, GameState, PlayerState } from '../../types/game'
import { formatWealth } from '../../types/game'
import { SEASONS } from '../../data/mockData'

/** "+50K", "-20K", "0" — always shows the sign for non-zero values. */
export function formatSignedWealth(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}${formatWealth(Math.abs(value))}`
}

/** Rupee amount an effect would add to / remove from the player's wealth right now. */
function effectAmount(effect: CardEffect | undefined, value: number, player: PlayerState | null): number {
  if (!effect) return 0
  if (effect.type === 'wealth_pct') {
    if (!player) return 0
    return Math.floor(player.wealth * (1 + value / 100)) - player.wealth
  }
  const doubles =
    !!player?.doubleInvestActive && value > 0 &&
    ((effect.type === 'wealth_change' && effect.target === 'self') || effect.type === 'wealth_end_game')
  return doubles ? value * 2 : value
}

export interface DecisionPreview {
  /** Expected wealth change, including the player's streak / lifestyle / season multipliers. */
  value: number
  /** Value before multipliers (same units as `value`). */
  baseValue: number
  /** Combined multiplier applied to positive gains (1 when none). */
  multiplier: number
  /** Wealth change if the invest risk fires. */
  failValue: number
}

/**
 * Mirrors the multiplier maths in gameEngine.processDecision so the preview
 * shows what the player will actually receive. Display only — the engine stays
 * the source of truth.
 */
export function getDecisionPreview(opt: DecisionOption, player: PlayerState | null): DecisionPreview {
  const raw = opt.effect.value ?? 0
  let multiplier = 1
  if (player) {
    if (opt.type === 'save') {
      multiplier = 1 + (player.savingStreak + 1) * 0.05
    } else if (opt.type === 'invest') {
      const tier = Math.min(3, 1 + Math.floor(player.spendChoices / 2))
      multiplier = tier === 1 ? 0.75 : tier === 3 ? 1.5 : 1
    }
  }
  if (opt.type === 'invest') {
    const season = SEASONS.find(s => s.is_active)
    if (season?.special_rule?.includes('INVEST gains')) {
      const match = season.special_rule.match(/(\d+)%/)
      if (match) multiplier *= 1 + parseInt(match[1]) / 100
    }
  }
  const scaled = multiplier !== 1 && raw > 0 ? Math.floor(raw * multiplier) : raw
  const failRaw = opt.failEffect?.value ?? 0
  return {
    value: effectAmount(opt.effect, scaled, player),
    baseValue: effectAmount(opt.effect, raw, player),
    multiplier: raw > 0 ? multiplier : 1,
    failValue: effectAmount(opt.failEffect, failRaw, player),
  }
}

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

export interface OpponentPlayEvent {
  key: number
  playerId: string
  name: string
  entry: string
}

const OPPONENT_ACTION_RE = / (played|defended|is skipping|took too long)/

/**
 * Watches the (newest-first) game log and reports the latest entry describing
 * an opponent's move. Clears itself after `durationMs`.
 */
export function useOpponentPlayFeed(gameState: GameState, myPlayerId: string, durationMs = 3200) {
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
      const actor = opponents.find(p => entry.startsWith(p.name + ' '))
      if (actor) {
        counter.current += 1
        setEvent({ key: counter.current, playerId: actor.id, name: actor.name, entry })
        return
      }
    }
  }, [log, players, myPlayerId])

  useEffect(() => {
    if (!event) return
    const timer = setTimeout(() => setEvent(null), durationMs)
    return () => clearTimeout(timer)
  }, [event, durationMs])

  return event
}

/** Remaining milliseconds of the current turn, ticking every 250ms. */
export function useTurnRemaining(turnStartTime: number, timeLimit: number) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [])
  return Math.max(0, timeLimit - Math.max(0, now - turnStartTime))
}
