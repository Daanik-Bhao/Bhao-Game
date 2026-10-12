import type { AssetClass, DecisionOption, GameCard, GameState, Holding, PlayerState } from '../../types/game'
import { formatWealth } from '../../types/game'
import { ASSETS, MAX_LIFESTYLE_LEVEL } from '../../data/assets'
import type { AssetInfo } from '../../data/assets'
import {
  canEquip, getCash, getHoldings, getNetWorth, getRoundLimit, inflationPct, previewDecision, MAX_ACTIVE_DEFENSES, SAVE_STREAK_CAP,
} from '../../lib/gameEngine'

/** "₹1.2L" (no sign). */
export function rupees(amount: number): string {
  return `₹${formatWealth(Math.abs(Math.round(amount)))}`
}

/** "+₹1.2L" / "−₹40K" / "₹0". Uses a real minus sign. */
export function signedRupees(amount: number): string {
  const r = Math.round(amount)
  if (r === 0) return '₹0'
  return `${r > 0 ? '+' : '−'}${rupees(r)}`
}

/** "+12%" / "−8.5%" */
export function signedPct(pct: number): string {
  const rounded = Math.round(pct * 10) / 10
  if (rounded === 0) return '0%'
  return `${rounded > 0 ? '+' : '−'}${Math.abs(rounded)}%`
}

export const RISK_META: Record<AssetInfo['risk'], { label: string; color: string; bg: string }> = {
  none: { label: 'No risk', color: '#a7f3d0', bg: 'rgba(16,185,129,0.22)' },
  low: { label: 'Low risk', color: '#bbf7d0', bg: 'rgba(34,197,94,0.22)' },
  medium: { label: 'Medium risk', color: '#fde68a', bg: 'rgba(234,179,8,0.24)' },
  high: { label: 'High risk', color: '#fed7aa', bg: 'rgba(249,115,22,0.26)' },
  extreme: { label: 'Extreme risk', color: '#fecaca', bg: 'rgba(239,68,68,0.3)' },
}

export function assetInfo(asset: AssetClass): AssetInfo {
  return ASSETS[asset]
}

// ---------------------------------------------------------------------------
// Decision preview view-model
// ---------------------------------------------------------------------------

export interface DecisionView {
  type: DecisionOption['type']
  /** Big number on the right of the option */
  headline: string
  headlineTone: 'gain' | 'loss' | 'neutral'
  /** Short lines under the label */
  details: string[]
  /** Teaching hint (lesson / streak / inflation) */
  hint?: string
  /** Invest only */
  asset?: AssetInfo
  disabled?: string
  /** Paying for this would force a sale of investments */
  forcedSale?: boolean
}

export function describeDecision(state: GameState, playerIndex: number, card: GameCard, opt: DecisionOption): DecisionView {
  const player = state.players[playerIndex]
  const p = previewDecision(state, playerIndex, card, opt.type)
  const tone = (n: number): DecisionView['headlineTone'] => (n > 0 ? 'gain' : n < 0 ? 'loss' : 'neutral')
  const forcedSale = opt.type !== 'invest' && p.netWorthDelta < p.cashDelta - 1

  if (opt.type === 'save') {
    const streak = Math.min(SAVE_STREAK_CAP, (player?.savingStreak ?? 0) + 1)
    const details = [`${signedRupees(p.cashDelta)} to cash`]
    let hint: string
    if (streak > 1) hint = `🔥 Save streak ×${streak}: +${streak * 5}% bonus`
    else hint = 'Save again next turn to start a streak bonus'
    if (player) details.push(`Idle cash loses ~${inflationPct(player)}%/yr to inflation`)
    return { type: 'save', headline: signedRupees(p.netWorthDelta), headlineTone: tone(p.netWorthDelta), details, hint, disabled: p.disabled, forcedSale }
  }

  if (opt.type === 'spend') {
    const level = player?.lifestyleLevel ?? 0
    const lifestyle = level >= MAX_LIFESTYLE_LEVEL
      ? 'lifestyle maxed'
      : 'lifestyle ↑ (inflation +1%)'
    const details = [`${signedRupees(p.netWorthDelta)}, +1 card, ${lifestyle}`]
    return {
      type: 'spend', headline: signedRupees(p.netWorthDelta), headlineTone: tone(p.netWorthDelta), details,
      hint: forcedSale ? '⚠️ Not enough cash: investments get sold at a penalty' : 'Lifestyle creep makes every future year cost more',
      disabled: p.disabled, forcedSale,
    }
  }

  // invest
  const asset = p.asset ? ASSETS[p.asset] : undefined
  const details: string[] = []
  if (asset) details.push(`avg ~${asset.meanPct}%/yr`)
  if (p.investAmount > 0) details.push(`Moves ${rupees(p.investAmount)} of your cash`)
  return {
    type: 'invest',
    headline: p.investAmount > 0 ? rupees(p.investAmount) : '—',
    headlineTone: 'neutral',
    details,
    hint: asset?.lesson,
    asset,
    disabled: p.disabled,
  }
}

// ---------------------------------------------------------------------------
// Hand: what can be done with a card right now
// ---------------------------------------------------------------------------

export interface CardPlayability {
  /** The primary action for this card */
  action: 'play' | 'equip'
  /** Primary action is allowed right now */
  ok: boolean
  /** Why not (when !ok) */
  reason?: string
}

export function cardPlayability(state: GameState, playerIndex: number, card: GameCard, myTurnToPlay: boolean): CardPlayability {
  if (card.type === 'defense') {
    if (!myTurnToPlay) return { action: 'equip', ok: false, reason: 'Wait for your turn' }
    if (canEquip(state, playerIndex, card)) return { action: 'equip', ok: true }
    const p = state.players[playerIndex]
    if (state.equippedThisTurn) return { action: 'equip', ok: false, reason: 'One equip per turn — already used' }
    if (p && p.activeDefenses.length >= MAX_ACTIVE_DEFENSES) return { action: 'equip', ok: false, reason: `Defense slots full (${MAX_ACTIVE_DEFENSES}/${MAX_ACTIVE_DEFENSES})` }
    return { action: 'equip', ok: false, reason: 'Cannot equip now' }
  }
  if (!myTurnToPlay) return { action: 'play', ok: false, reason: 'Wait for your turn' }
  if (card.type === 'decision' || card.type === 'action') return { action: 'play', ok: true }
  return { action: 'play', ok: false, reason: 'This card cannot be played' }
}

// ---------------------------------------------------------------------------
// Portfolio
// ---------------------------------------------------------------------------

export interface PortfolioView {
  cash: number
  invested: number
  netWorth: number
  goal: number
  progress: number
  holdings: Holding[]
  lifestyleLevel: number
  inflation: number
  defenses: GameCard[]
  savingStreak: number
}

export function portfolioView(player: PlayerState, goal: number): PortfolioView {
  const cash = getCash(player)
  const netWorth = getNetWorth(player)
  const holdings = [...getHoldings(player)].sort((a, b) => b.value - a.value)
  return {
    cash,
    invested: netWorth - cash,
    netWorth,
    goal,
    progress: goal > 0 ? Math.max(0, Math.min(1, netWorth / goal)) : 0,
    holdings,
    lifestyleLevel: player.lifestyleLevel ?? 0,
    inflation: inflationPct(player),
    defenses: player.activeDefenses ?? [],
    savingStreak: player.savingStreak ?? 0,
  }
}

export function yearLabel(state: GameState): { round: number; max: number } {
  return { round: state.round ?? 1, max: getRoundLimit(state) }
}

/** Short text describing what a defense card blocks. */
export function defenseBlurb(card: GameCard): string {
  if (card.blocksCategories?.length) return `Blocks ${card.blocksCategories.join(', ')}`
  const e = card.effect
  if (e?.type === 'wealth_floor') return `Net worth can't drop below ${rupees(e.value ?? 0)}`
  if (e?.type === 'reduce_attack_pct') return `Cuts attacks by ${e.value ?? 0}%`
  if (e?.blocks?.includes('any')) return 'Blocks any attack'
  if (e?.blocks?.length) return `Blocks ${e.blocks.join(', ')}`
  return card.shortFlavor || card.flavor
}
