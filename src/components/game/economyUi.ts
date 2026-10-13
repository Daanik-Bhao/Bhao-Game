import type { AssetClass, DecisionOption, GameCard, GameState, Holding, PlayerState } from '../../types/game'
import { ASSETS, MAX_LIFESTYLE_LEVEL } from '../../data/assets'
import type { AssetInfo } from '../../data/assets'
import { ALL_CARDS } from '../../data/cards'
import { BUILTIN_LIFE_EVENTS } from '../../data/lifeEvents'
import i18n from '../../i18n/i18n'
import { pickLang } from '../../i18n/lang'
import { formatMoney } from '../../lib/format'
import {
  canEquip, getCash, getHoldings, getNetWorth, getRoundLimit, inflationPct, previewDecision, MAX_ACTIVE_DEFENSES, SAVE_STREAK_CAP,
} from '../../lib/gameEngine'

/** "₹1.2 L" (no sign, compact, short units — fits chips and tiles in every language). */
export function rupees(amount: number): string {
  return formatMoney(Math.abs(Math.round(amount)), { compact: true, abbr: true, lang: i18n.language })
}

/** "₹12,40,500" (no sign, full Indian grouping). */
export function rupeesFull(amount: number): string {
  return formatMoney(Math.abs(Math.round(amount)), { lang: i18n.language })
}

/** "+₹1.2L" / "−₹40K" / "₹0". Uses a real minus sign. */
export function signedRupees(amount: number): string {
  return formatMoney(Math.round(amount), { compact: true, abbr: true, signed: true, lang: i18n.language })
}

/** "+12%" / "−8.5%" */
export function signedPct(pct: number): string {
  const rounded = Math.round(pct * 10) / 10
  if (rounded === 0) return '0%'
  return `${rounded > 0 ? '+' : '−'}${Math.abs(rounded)}%`
}

/** Chip tone for an asset risk level (tokens only). */
export const RISK_TONE: Record<AssetInfo['risk'], 'save' | 'risk' | 'attack'> = {
  none: 'save', low: 'save', medium: 'risk', high: 'risk', extreme: 'attack',
}

const t = (key: string, opts?: Record<string, unknown>): string => i18n.t(key, opts)

/** "Low risk" / "कम जोखिम" / "Low risk" */
export function riskLabel(risk: AssetInfo['risk']): string {
  return t(`econ.risk.${risk}`)
}

/** Asset name in the current language (Hinglish keeps the English name). */
export function assetName(asset: AssetInfo): string {
  return pickLang(asset.name, asset.nameHi, i18n.language)
}

/** One-line teaching hint for an asset class. */
export function assetLesson(asset: AssetInfo): string {
  return t(`econ.assetLesson.${asset.id}`, { defaultValue: asset.lesson })
}

const HI_CARD_NAMES = new Map<string, string>()
for (const c of [...ALL_CARDS, ...BUILTIN_LIFE_EVENTS]) if (c.nameHi) HI_CARD_NAMES.set(c.name, c.nameHi)

/** A card name from the engine/log in the current language. */
export function cardNameFor(name: string): string {
  return pickLang(name, HI_CARD_NAMES.get(name), i18n.language)
}

/** The engine's messages are English; translate the ones the board shows. */
export function localizeEngineText(msg: string): string {
  const need = msg.match(/^Need at least (₹[\d,]+) cash to invest$/)
  if (need) return t('econ.needCash', { amount: need[1] })
  if (msg === 'Not available') return t('econ.notAvailable')
  return msg
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
  const disabled = p.disabled ? localizeEngineText(p.disabled) : undefined

  if (opt.type === 'save') {
    const streak = Math.min(SAVE_STREAK_CAP, (player?.savingStreak ?? 0) + 1)
    const details = [t('econ.save.toCash', { amount: signedRupees(p.cashDelta) })]
    const hint = streak > 1 ? t('econ.save.streak', { streak, bonus: streak * 5 }) : t('econ.save.startStreak')
    if (player) details.push(t('econ.save.inflation', { pct: inflationPct(player) }))
    return { type: 'save', headline: signedRupees(p.netWorthDelta), headlineTone: tone(p.netWorthDelta), details, hint, disabled, forcedSale }
  }

  if (opt.type === 'spend') {
    const level = player?.lifestyleLevel ?? 0
    const lifestyle = level >= MAX_LIFESTYLE_LEVEL ? t('econ.spend.lifestyleMax') : t('econ.spend.lifestyleUp')
    const details = [t('econ.spend.details', { amount: signedRupees(p.netWorthDelta), lifestyle })]
    return {
      type: 'spend', headline: signedRupees(p.netWorthDelta), headlineTone: tone(p.netWorthDelta), details,
      hint: forcedSale ? t('econ.spend.forcedSale') : t('econ.spend.creep'),
      disabled, forcedSale,
    }
  }

  // invest
  const asset = p.asset ? ASSETS[p.asset] : undefined
  const details: string[] = []
  if (asset) details.push(t('econ.invest.avg', { pct: asset.meanPct }))
  if (p.investAmount > 0) details.push(t('econ.invest.moves', { amount: rupees(p.investAmount) }))
  return {
    type: 'invest',
    headline: p.investAmount > 0 ? rupees(p.investAmount) : '—',
    headlineTone: 'neutral',
    details,
    hint: asset ? assetLesson(asset) : undefined,
    asset,
    disabled,
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
    if (!myTurnToPlay) return { action: 'equip', ok: false, reason: t('econ.play.waitTurn') }
    if (canEquip(state, playerIndex, card)) return { action: 'equip', ok: true }
    const p = state.players[playerIndex]
    if (state.equippedThisTurn) return { action: 'equip', ok: false, reason: t('econ.play.oneEquip') }
    if (p && p.activeDefenses.length >= MAX_ACTIVE_DEFENSES) return { action: 'equip', ok: false, reason: t('econ.play.slotsFull', { max: MAX_ACTIVE_DEFENSES }) }
    return { action: 'equip', ok: false, reason: t('econ.play.cannotEquip') }
  }
  if (!myTurnToPlay) return { action: 'play', ok: false, reason: t('econ.play.waitTurn') }
  if (card.type === 'decision' || card.type === 'action') return { action: 'play', ok: true }
  return { action: 'play', ok: false, reason: t('econ.play.cannotPlay') }
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
  const lang = i18n.language
  if (card.blocksCategories?.length) {
    return t('econ.def.blocks', { what: card.blocksCategories.map(c => t(`econ.category.${c}`, { defaultValue: c })).join(', ') })
  }
  const e = card.effect
  if (e?.type === 'wealth_floor') return t('econ.def.floor', { amount: rupees(e.value ?? 0) })
  if (e?.type === 'reduce_attack_pct') return t('econ.def.cut', { pct: e.value ?? 0 })
  if (e?.blocks?.includes('any')) return t('econ.def.any')
  if (e?.blocks?.length) return t('econ.def.blocks', { what: e.blocks.map(cardNameFor).join(', ') })
  return lang === 'hi'
    ? (card.shortFlavorHi || card.flavorHi || card.shortFlavor || card.flavor)
    : (card.shortFlavor || card.flavor)
}
