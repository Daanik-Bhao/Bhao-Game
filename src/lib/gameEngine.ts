import type { GameState, PlayerState, GameCard, CardEffect, DecisionChoice, DecisionOption, AssetClass } from '../types/game'
import { calculateRankRP } from '../data/rankRules'
import type { LevelConfig } from '../types/level'
import { createGameDeck, createLevelDeck, DEFENSE_CARDS } from '../data/cards'
import { SEASONS } from '../data/mockData'
import { ASSETS, MAX_LIFESTYLE_LEVEL, inferAsset } from '../data/assets'
import { BUILTIN_LIFE_EVENTS } from '../data/lifeEvents'
import {
  rand, shuffle, newId, getCash, getHoldings, getNetWorth, syncWealth, addCash, applyLoss, addHolding,
  shiftMarketHoldings, rollMarket, applyMarketToPlayer, applyInflation, formatINR,
  INVEST_FRACTION, MIN_INVEST_CASH, MARKET_ASSETS,
} from './economy'
import type { LossResult, ForcedSale } from './economy'
import type { ConceptId, PlayerGameStats } from '../types/learning'
import {
  emptyStats, addConcepts, conceptsFromText, assetConcepts, categoryConcepts, speculativeValue, cashShare,
} from './learning'
import {
  createLevelState, withLevelExtras, levelDecisionBlock, noteBlockedDecision, applyLevelDecision,
  applyLevelRoundStart, canWinByTarget,
} from './levelRules'

export {
  getCash, getHoldings, getNetWorth, syncWealth, applyLoss, setRng, seededRng, rand,
  INVEST_FRACTION, MIN_INVEST_CASH, inflationPct,
} from './economy'

export const STARTING_WEALTH = 500000   // ₹5 Lakhs
export const WEALTH_GOAL = 5000000      // ₹50 Lakhs
export const TIME_LIMIT_MS = 20 * 60 * 1000  // 20 minutes per quick / ranked game
/** Campaign levels run on a round (turn) limit; the clock is only a generous backstop. */
export const CAMPAIGN_TIME_LIMIT_MS = 45 * 60 * 1000
export const TURN_TIME_LIMIT_MS = 60000 // 60 seconds per turn
/** Cards a player holds after the draw step. Unplayed cards stay in hand. */
export const HAND_SIZE = 5
/** Quick / ranked / multiplayer games end after this many rounds (years). */
export const MAX_ROUNDS = 20
export const MAX_ACTIVE_DEFENSES = 3
export const SAVE_STREAK_CAP = 3
/** Chance each round that a Life Event happens. */
export const LIFE_EVENT_CHANCE = 0.5

const LOG_MAX = 20
const BOT_NAMES = ['Rahul AI', 'Priya AI', 'Arjun AI', 'Sneha AI', 'Vikram AI']

function pushLogs(log: string[], ...newestFirst: string[]): string[] {
  return [...newestFirst, ...log].slice(0, LOG_MAX)
}

function createPlayer(id: string, name: string, isBot: boolean, rankPoints?: number, avatarUrl?: string | null, diffMultiplier?: number, startWealth = STARTING_WEALTH): PlayerState {
  return {
    id,
    name,
    isBot,
    wealth: startWealth,
    cash: startWealth,
    holdings: [],
    lifestyleLevel: 0,
    hand: [],
    activeDefenses: [],
    skippedTurns: 0,
    pendingGains: [],
    wealthFloor: 0,
    doubleInvestActive: false,
    investChoices: 0,
    spendChoices: 0,
    savingStreak: 0,
    greedIndex: 0,
    emiDamageTaken: false,
    diffMultiplier,
    stats: emptyStats(startWealth),
    profile: isBot ? { rank_points: rankPoints ?? 1500, avatar_url: null } : { rank_points: 0, avatar_url: avatarUrl ?? null },
  }
}

// ---------------------------------------------------------------------------
// Phase 4 stats (docs/phase4-design.md §1–2). Optional-safe: states without
// `stats` (old saves, multiplayer) get them created lazily on first touch.
// ---------------------------------------------------------------------------

/** Return the player with `stats`, creating them (from the game's starting wealth) if missing. */
export function ensureStats(player: PlayerState, state: GameState): PlayerState {
  if (player.stats) return player
  const start = getStartingWealth(state)
  const stats = emptyStats(start)
  return { ...player, stats: { ...stats, peakNetWorth: Math.max(start, getNetWorth(player)) } }
}

/** Update a player's stats (creating them first if needed). */
function patchStats(player: PlayerState, state: GameState, fn: (s: PlayerGameStats, p: PlayerState) => PlayerGameStats): PlayerState {
  const p = ensureStats(player, state)
  return { ...p, stats: fn(p.stats!, p) }
}

function withConcepts(s: PlayerGameStats, ids: ConceptId[]): PlayerGameStats {
  return ids.length ? addConcepts(s, ids) : s
}

/** Record forced sales (count, penalties, log) + the emergency-fund / liquidity concepts. */
function recordForcedSales(s: PlayerGameStats, sales: ForcedSale[], round: number): PlayerGameStats {
  if (!sales.length) return s
  const next: PlayerGameStats = {
    ...s,
    forcedSales: s.forcedSales + sales.length,
    exitPenaltiesPaid: s.exitPenaltiesPaid + sales.reduce((sum, x) => sum + x.penalty, 0),
    forcedSaleLog: [...(s.forcedSaleLog ?? []), ...sales.map(x => ({ asset: x.asset, round, sold: x.sold, penalty: x.penalty, penaltyPct: x.penaltyPct }))],
  }
  const ids: ConceptId[] = ['emergency_fund', 'liquidity']
  if (sales.some(x => x.asset === 'realestate')) ids.push('real_estate')
  return addConcepts(next, ids)
}

/** Diversification: 3+ asset classes held at once. */
function diversificationConcepts(p: PlayerState): ConceptId[] {
  return new Set(getHoldings(p).map(h => h.asset)).size >= 3 ? ['diversification'] : []
}

/** Keep peakNetWorth current for every player. */
function trackPeaks(state: GameState): GameState {
  let changed = false
  const players = state.players.map(p => {
    const q = ensureStats(p, state)
    const nw = getNetWorth(q)
    if (q === p && nw <= q.stats!.peakNetWorth) return p
    changed = true
    return { ...q, stats: { ...q.stats!, peakNetWorth: Math.max(q.stats!.peakNetWorth, nw) } }
  })
  return changed ? { ...state, players } : state
}

/** Push this year's net worth / cash share for every active player (round end). */
function recordRoundEnd(state: GameState): GameState {
  return {
    ...state,
    players: state.players.map(p => {
      if (p.hasForfeited) return p
      return patchStats(p, state, s => {
        const nw = getNetWorth(p)
        return {
          ...s,
          netWorthByRound: [...s.netWorthByRound, nw],
          cashShareByRound: [...(s.cashShareByRound ?? []), cashShare(p)],
          peakNetWorth: Math.max(s.peakNetWorth, nw),
        }
      })
    }),
  }
}

/** Game ended mid-year (goal, forfeits, time): record the final net worth once. */
function recordFinal(state: GameState): GameState {
  const round = state.round ?? 1
  return {
    ...state,
    players: state.players.map(p => {
      const q = ensureStats(p, state)
      if (q.stats!.netWorthByRound.length > round) return q
      return patchStats(q, state, s => ({
        ...s,
        netWorthByRound: [...s.netWorthByRound, getNetWorth(q)],
        cashShareByRound: [...(s.cashShareByRound ?? []), cashShare(q)],
      }))
    }),
  }
}

/**
 * Stats for a harmful card (rival attack or life event) reaching one player.
 * `lost` = net-worth drop; forced-sale penalties are subtracted so lossesTaken is "before penalties".
 */
function recordHit(
  s: PlayerGameStats, card: GameCard, round: number,
  o: { blocked: boolean; lost: number; sales: ForcedSale[]; specLost: number; skipped?: boolean; lured?: boolean; heldMarket: boolean },
): PlayerGameStats {
  const penalties = o.sales.reduce((sum, x) => sum + x.penalty, 0)
  const lossBefore = Math.max(0, o.lost - penalties)
  let next = recordForcedSales(s, o.sales, round)
  const ids: ConceptId[] = [...categoryConcepts(card), ...conceptsFromText(`${card.name} ${card.flavor ?? ''}`)]
  if (card.category === 'market' && o.heldMarket) ids.push('market_patience')
  if (card.lureAsset) ids.push(...assetConcepts(card.lureAsset).filter(c => c === 'scams' || c === 'crypto_risk'))
  if (o.specLost > 0) ids.push('asset_risk')
  next = withConcepts(next, ids)
  next = { ...next, speculativeLosses: next.speculativeLosses + Math.max(0, Math.round(o.specLost)) }
  const landed = !o.blocked && (lossBefore > 0 || o.skipped || o.lured)
  if (!o.blocked && !landed) return next
  return {
    ...next,
    attacksBlocked: next.attacksBlocked + (o.blocked ? 1 : 0),
    attacksTaken: next.attacksTaken + (landed ? 1 : 0),
    lossesTaken: next.lossesTaken + (o.blocked ? 0 : lossBefore),
    hits: [...(next.hits ?? []), {
      name: card.name, nameHi: card.nameHi, round, amount: o.blocked ? 0 : lossBefore, category: card.category,
      blocked: o.blocked, lifeEvent: !!card.lifeEvent, lureAsset: card.lureAsset,
    }],
  }
}

const holdsMarket = (p: PlayerState) => getHoldings(p).some(h => MARKET_ASSETS.includes(h.asset))

/** Phase-3 player fields for a brand-new player built elsewhere (e.g. multiplayer). */
export function withEconomyDefaults(player: PlayerState): PlayerState {
  return syncWealth(player)
}

/** Split `lifeEvent` cards out of a draw deck. */
export function splitLifeEvents(cards: GameCard[]): { deck: GameCard[]; events: GameCard[] } {
  return { deck: cards.filter(c => !c.lifeEvent), events: cards.filter(c => c.lifeEvent) }
}

/** Shared Life Event deck: lifeEvent cards from the game deck + built-in events. */
export function buildEventDeck(events: GameCard[]): GameCard[] {
  return shuffle([...events, ...BUILTIN_LIFE_EVENTS.map(c => ({ ...c, id: `${c.id}_ev` }))])
}

/** Fields every Phase-3 game state starts with. */
export function newEconomyState(cards: GameCard[], isCampaign: boolean): Pick<GameState, 'deck' | 'eventDeck' | 'round' | 'lastEvent' | 'lastMarketTick' | 'equippedThisTurn' | 'maxRounds' | 'roundNews'> {
  const { deck, events } = splitLifeEvents(cards)
  return {
    deck,
    eventDeck: buildEventDeck(events),
    round: 1,
    lastEvent: null,
    lastMarketTick: null,
    equippedThisTurn: false,
    maxRounds: isCampaign ? undefined : MAX_ROUNDS,
    roundNews: null,
  }
}

export function initGame(humanPlayer: { id: string; name: string; avatar_url?: string | null }, botCount: number): GameState {
  const players: PlayerState[] = [createPlayer(humanPlayer.id, humanPlayer.name, false, undefined, humanPlayer.avatar_url)]
  for (let i = 0; i < botCount; i++) {
    players.push(createPlayer(`bot_${i}`, BOT_NAMES[i] ?? `Bot ${i + 1}`, true, 1000 + i * 500))
  }

  return {
    id: newId(),
    players,
    ...newEconomyState(createGameDeck(), false),
    discardPile: [],
    currentPlayerIndex: 0,
    turn: 1,
    phase: 'draw',
    drawnCard: null,
    playedCard: null,
    pendingDecision: null,
    pendingTarget: null,
    winner: null,
    log: [`Game started! First to ₹50 Lakhs wins — or richest after ${MAX_ROUNDS} years.`],
    wealthGoal: WEALTH_GOAL,
    timeLimit: TIME_LIMIT_MS,
    startTime: Date.now(),
    turnStartTime: Date.now(),
  }
}

export function initLevelGame(humanPlayer: { id: string; name: string; avatar_url?: string | null }, level: LevelConfig): GameState {
  const levelIndex = parseInt(level.id.replace('level_', '')) - 1
  const diffMap: Record<string, number> = { easy: 1000, medium: 2000, hard: 3000 }
  const multMap: Record<string, number> = { easy: 0.8, medium: 1.0, hard: 1.2 }
  const players: PlayerState[] = [createPlayer(humanPlayer.id, humanPlayer.name, false, undefined, humanPlayer.avatar_url, undefined, level.startingCorpus)]
  for (let i = 0; i < level.botCount; i++) {
    players.push(createPlayer(`bot_${i}`, BOT_NAMES[i] ?? `Bot ${i + 1}`, true, diffMap[level.botDifficulty], null, multMap[level.botDifficulty], level.startingCorpus))
  }

  return {
    id: newId(),
    players,
    ...newEconomyState(withLevelExtras(createLevelDeck(levelIndex, level.botDifficulty), level, DEFENSE_CARDS), true),
    discardPile: [],
    currentPlayerIndex: 0,
    turn: 1,
    phase: 'draw',
    drawnCard: null,
    playedCard: null,
    pendingDecision: null,
    pendingTarget: null,
    winner: null,
    log: [`BHAO: ${level.name} started! Reach ${formatINR(level.targetCorpus)} within ${level.turnLimit} years.`],
    wealthGoal: level.targetCorpus,
    timeLimit: CAMPAIGN_TIME_LIMIT_MS,
    startTime: Date.now(),
    turnStartTime: Date.now(),
    levelConfig: level,
    levelState: createLevelState(level),
  }
}

function refillDeck(state: GameState): GameState {
  const onlyDefenseLeftInDeck = state.deck.length > 0 && state.deck.every(c => c.type === 'defense')

  if (state.deck.length > 0 && !onlyDefenseLeftInDeck) return state

  if (state.discardPile.length > 0) {
    const shuffled = shuffle([...state.deck, ...state.discardPile.filter(c => !c.lifeEvent)])
    if (!shuffled.every(c => c.type === 'defense')) {
      return { ...state, deck: shuffled, discardPile: [], log: pushLogs(state.log, 'Deck reshuffled.') }
    }
  }

  // Create a completely fresh deck to guarantee action/decision cards
  const fresh = splitLifeEvents(createGameDeck()).deck.map(c => ({ ...c, id: `${c.id}_${newId().slice(0, 6)}` }))
  return { ...state, deck: fresh, discardPile: [], log: pushLogs(state.log, 'Fresh deck created.') }
}

export function drawCard(state: GameState, playerIndex: number): { state: GameState; card: GameCard | null } {
  const ready = refillDeck(state)
  const deck = [...ready.deck]

  // Underdog System: if player is in last place and < 50% of leader's wealth, higher chance for epic/legendary actions
  const player = ready.players[playerIndex]
  const activeOpponents = ready.players.filter((p, i) => i !== playerIndex && !p.hasForfeited)
  const leaderWealth = activeOpponents.length > 0 ? Math.max(...activeOpponents.map(p => p.wealth)) : 0
  const isUnderdog = activeOpponents.length > 0 &&
                     activeOpponents.every(p => p.wealth > player.wealth) &&
                     player.wealth < leaderWealth * 0.5

  let cardIndexToDraw = 0
  if (isUnderdog && deck.length >= 3) {
    const peek = deck.slice(0, 3)
    const strongCardIdx = peek.findIndex(c => c.type === 'action' && (c.tier === 'epic' || c.tier === 'legendary'))
    if (strongCardIdx !== -1) {
      cardIndexToDraw = strongCardIdx
    }
  }

  const card = deck[cardIndexToDraw] ?? null
  if (card) {
    deck.splice(cardIndexToDraw, 1)
  }

  const players = ready.players.map((p, i) => {
    if (i !== playerIndex || !card) return p
    return { ...p, hand: [...p.hand, card] }
  })
  return {
    state: { ...ready, players, deck, drawnCard: card },
    card,
  }
}

/** Draw step: refill the hand up to HAND_SIZE. Cards already in hand stay. */
export function startDrawPhase(state: GameState, playerIndex: number): { state: GameState; card: GameCard | null } {
  let currentState = state
  let lastDrawnCard: GameCard | null = null
  let guard = 0
  while (currentState.players[playerIndex].hand.length < HAND_SIZE && guard++ < HAND_SIZE) {
    const res = drawCard(currentState, playerIndex)
    currentState = res.state
    if (!res.card) break
    lastDrawnCard = res.card
  }
  return { state: currentState, card: lastDrawnCard }
}

/**
 * Set a player's net worth while honouring their wealth floor (Bankruptcy Shield).
 * Gains go to cash; losses go through applyLoss (cash, then forced sales, then floor).
 */
export function setWealthWithFloor(player: PlayerState, proposedWealth: number): { player: PlayerState; brokenShields: GameCard[] } {
  const current = getNetWorth(player)
  const proposed = Math.round(proposedWealth)
  if (proposed >= current) return { player: addCash(player, proposed - current), brokenShields: [] }
  const res = applyLoss(player, current - proposed)
  return { player: res.player, brokenShields: res.brokenShields }
}

// ---------------------------------------------------------------------------
// Defenses
// ---------------------------------------------------------------------------

/** Can the current player still use their one free equip this turn? */
export function canEquip(state: GameState, playerIndex: number, card?: GameCard): boolean {
  const p = state.players[playerIndex]
  if (!p || state.equippedThisTurn) return false
  if (card && card.type !== 'defense') return false
  return p.activeDefenses.length < MAX_ACTIVE_DEFENSES
}

/**
 * Equip a defense card from a player's hand — free, does NOT end the turn,
 * once per turn, max 3 active. A wealth_floor defense (Bankruptcy Shield)
 * also arms the player's wealth floor. Returns the state unchanged if not allowed.
 */
export function equipDefense(state: GameState, playerIndex: number, card: GameCard): GameState {
  if (!canEquip(state, playerIndex, card)) return state
  const players = state.players.map((p, i) => {
    if (i !== playerIndex) return p
    const hand = p.hand.filter(c => c.id !== card.id)
    const activeDefenses = [...p.activeDefenses, card]
    const wealthFloor = card.effect?.type === 'wealth_floor'
      ? Math.max(p.wealthFloor, card.effect.value ?? 0)
      : p.wealthFloor
    const equipped = { ...p, hand, activeDefenses, wealthFloor }
    return patchStats(equipped, state, st => withConcepts(
      { ...st, defensesEquipped: (st.defensesEquipped ?? 0) + 1 },
      [
        // A broad "covers everything" defense teaches the emergency fund, not each category
        ...((card.blocksCategories?.length ?? 0) <= 2 ? (card.blocksCategories ?? []).flatMap(c => categoryConcepts({ category: c })) : []),
        ...conceptsFromText(card.name, true),
      ],
    ))
  })
  return {
    ...state,
    players,
    equippedThisTurn: true,
    log: pushLogs(state.log, `🛡️ ${state.players[playerIndex].name} equipped ${card.name}`),
  }
}

/** Does this defense block that incoming card (legacy name list or category)? */
export function defenseBlocks(defense: GameCard, incoming: GameCard): boolean {
  if (defense.type !== 'defense') return false
  if (incoming.category && defense.blocksCategories?.includes(incoming.category)) return true
  const e = defense.effect
  if (!e || e.type !== 'block_card') return false
  return !!(e.blocks?.includes('any') || e.blocks?.includes(incoming.name))
}

/** True if the card would hurt whoever it lands on (defenses only trigger on these). */
export function isHarmful(card: GameCard): boolean {
  const e = card.effect
  if (!e) return false
  switch (e.type) {
    case 'wealth_pct':
    case 'wealth_change':
      return (e.value ?? 0) < 0
    case 'steal':
    case 'steal_pct':
    case 'attack_all_pct':
    case 'market_crash_player':
    case 'skip_turn':
      return true
    default:
      return false
  }
}

/** If the player has a matching defense, consume it and return the new player + used card. */
function tryBlock(player: PlayerState, incoming: GameCard): { player: PlayerState; used: GameCard | null } {
  if (!isHarmful(incoming)) return { player, used: null }
  const def = player.activeDefenses.find(c => defenseBlocks(c, incoming))
  if (!def) return { player, used: null }
  return { player: { ...player, activeDefenses: player.activeDefenses.filter(c => c.id !== def.id) }, used: def }
}

// ---------------------------------------------------------------------------
// Effects
// ---------------------------------------------------------------------------

interface EffectCtx {
  players: PlayerState[]
  discarded: GameCard[]
  logs: string[]
  /** Forced sales per player index (for stats) */
  sales: Record<number, ForcedSale[]>
}

function takeLoss(ctx: EffectCtx, idx: number, amount: number): LossResult {
  const res = applyLoss(ctx.players[idx], amount)
  ctx.players[idx] = res.player
  ctx.discarded.push(...res.brokenShields)
  ctx.logs.push(...res.logs)
  if (res.forcedSales.length) ctx.sales[idx] = [...(ctx.sales[idx] ?? []), ...res.forcedSales]
  return res
}

/**
 * Apply an effect. `card` (optional) supplies the category: a `market` card
 * moves market holdings instead of cash (docs §6).
 */
function applyEffect(state: GameState, effect: CardEffect, sourcePlayerIndex: number, targetPlayerIndex: number, card?: GameCard, exclude: Set<number> = new Set()): { state: GameState; logs: string[]; sales: Record<number, ForcedSale[]> } {
  const ctx: EffectCtx = { players: [...state.players], discarded: [], logs: [], sales: {} }
  const players = ctx.players
  const isMarket = card?.category === 'market'
  const source = players[sourcePlayerIndex]

  switch (effect.type) {
    case 'wealth_change': {
      const val = Math.round(effect.value ?? 0)
      const doubled = (source.doubleInvestActive && effect.target === 'self' && val > 0) ? val * 2 : val
      const idx = effect.target === 'self' ? sourcePlayerIndex : targetPlayerIndex
      if (doubled >= 0) players[idx] = addCash(players[idx], doubled)
      else takeLoss(ctx, idx, -doubled)
      break
    }
    case 'wealth_pct': {
      const pct = effect.value ?? 0
      const idx = effect.target === 'self' ? sourcePlayerIndex : targetPlayerIndex
      if (isMarket) {
        players[idx] = shiftMarketHoldings(players[idx], pct)
      } else {
        const delta = Math.round(getNetWorth(players[idx]) * pct / 100)
        if (delta >= 0) players[idx] = addCash(players[idx], delta)
        else takeLoss(ctx, idx, -delta)
      }
      break
    }
    case 'wealth_next_turn': {
      const pending = { amount: Math.round(effect.value ?? 0), triggerAt: 'next_turn' as const, cardId: newId() }
      players[sourcePlayerIndex] = { ...source, pendingGains: [...source.pendingGains, pending] }
      break
    }
    case 'wealth_end_game': {
      // "Long-term investment" pays out now
      const val = Math.round(effect.value ?? 0)
      const doubled = (source.doubleInvestActive && val > 0) ? val * 2 : val
      if (doubled >= 0) players[sourcePlayerIndex] = addCash(source, doubled)
      else takeLoss(ctx, sourcePlayerIndex, -doubled)
      break
    }
    case 'steal':
    case 'steal_pct': {
      const targetNW = getNetWorth(players[targetPlayerIndex])
      const amount = effect.type === 'steal'
        ? Math.min(effect.value ?? 0, targetNW)
        : Math.round(targetNW * (effect.value ?? 0) / 100)
      const res = takeLoss(ctx, targetPlayerIndex, amount)
      // Thief only gains what was actually taken
      players[sourcePlayerIndex] = addCash(players[sourcePlayerIndex], res.paid)
      break
    }
    case 'attack_all_pct': {
      // Hits every opponent exactly once. The caster is spared unless the card
      // explicitly opts in via includeSelf. Forfeited / defended players are left alone.
      // Scaled down with more players to prevent runaway dominance.
      const rawPct = effect.value ?? 0
      const scaleFactor = players.length <= 2 ? 1.0 : players.length === 3 ? 0.8 : 0.65
      const scaledPct = rawPct * scaleFactor
      for (let i = 0; i < players.length; i++) {
        if (i === sourcePlayerIndex && !effect.includeSelf) continue
        if (players[i].hasForfeited || exclude.has(i)) continue
        if (isMarket) players[i] = shiftMarketHoldings(players[i], -scaledPct)
        else takeLoss(ctx, i, Math.round(getNetWorth(players[i]) * scaledPct / 100))
      }
      break
    }
    case 'skip_turn': {
      const target = players[targetPlayerIndex]
      players[targetPlayerIndex] = { ...target, skippedTurns: target.skippedTurns + (effect.value ?? 1) }
      break
    }
    case 'market_crash_player': {
      const pct = effect.value ?? 50
      if (isMarket) players[targetPlayerIndex] = shiftMarketHoldings(players[targetPlayerIndex], -pct)
      else takeLoss(ctx, targetPlayerIndex, Math.round(getNetWorth(players[targetPlayerIndex]) * pct / 100))
      break
    }
    case 'wealth_floor': {
      players[sourcePlayerIndex] = { ...source, wealthFloor: Math.max(source.wealthFloor, effect.value ?? 0) }
      break
    }
    case 'double_invest': {
      players[sourcePlayerIndex] = { ...source, doubleInvestActive: true }
      break
    }
  }

  return {
    state: {
      ...state,
      players,
      discardPile: ctx.discarded.length ? [...state.discardPile, ...ctx.discarded] : state.discardPile,
    },
    logs: ctx.logs,
    sales: ctx.sales,
  }
}

// ---------------------------------------------------------------------------
// Decisions
// ---------------------------------------------------------------------------

export interface DecisionPreview {
  /** Change in cash */
  cashDelta: number
  /** Rupees moved from cash into a holding (invest only) */
  investAmount: number
  /** Where invested money goes */
  asset?: AssetClass
  /** Change in net worth (cash + holdings), incl. forced-sale penalties */
  netWorthDelta: number
  /** Why the choice can't be made right now */
  disabled?: string
}

/** Asset an invest option buys (content field, else inferred from the old investRisk). */
export function getInvestAsset(option: DecisionOption): AssetClass {
  return option.asset ?? inferAsset(option.investRisk)
}

interface DecisionOutcome {
  player: PlayerState
  logs: string[]
  brokenShields: GameCard[]
  investAmount: number
  asset?: AssetClass
  disabled?: string
  forcedSales: ForcedSale[]
}

/** Pure money maths for one decision choice on one player (docs §4). */
function resolveDecision(player: PlayerState, card: GameCard, option: DecisionOption, round: number): DecisionOutcome {
  const base = syncWealth(player)
  const nw = base.wealth
  const e = option.effect
  const logs: string[] = []
  let brokenShields: GameCard[] = []
  let forcedSales: ForcedSale[] = []
  const loss = (p: PlayerState, amount: number) => {
    const res = applyLoss(p, amount)
    brokenShields = res.brokenShields
    forcedSales = res.forcedSales
    logs.push(...res.logs)
    return res.player
  }
  /** Signed rupee amount of the option's effect (NaN for effect types we don't price). */
  const rawAmount = e.type === 'wealth_pct' ? nw * (e.value ?? 0) / 100 : e.type === 'wealth_change' ? (e.value ?? 0) : NaN

  if (option.type === 'save') {
    const streak = Math.min(SAVE_STREAK_CAP, base.savingStreak + 1)
    const mult = 1 + streak * 0.05
    let p: PlayerState = { ...base, savingStreak: streak }
    const amt = Number.isNaN(rawAmount) ? 0 : Math.round(rawAmount > 0 ? rawAmount * mult : rawAmount)
    p = amt >= 0 ? addCash(p, amt) : loss(p, -amt)
    if (streak > 1) logs.push(`🔥 Saving Streak x${streak}!`)
    return { player: p, logs, brokenShields, investAmount: 0, forcedSales }
  }

  if (option.type === 'spend') {
    let p: PlayerState = {
      ...base,
      savingStreak: 0,
      spendChoices: base.spendChoices + 1,
      lifestyleLevel: Math.min(MAX_LIFESTYLE_LEVEL, (base.lifestyleLevel ?? 0) + 1),
    }
    const amt = Number.isNaN(rawAmount) ? 0
      : e.type === 'wealth_pct' ? -Math.abs(Math.round(rawAmount))
      : Math.round(rawAmount)
    p = amt >= 0 ? addCash(p, amt) : loss(p, -amt)
    return { player: p, logs, brokenShields, investAmount: 0, forcedSales }
  }

  // invest
  const asset = getInvestAsset(option)
  const cash = getCash(base)
  if (cash < MIN_INVEST_CASH) {
    return { player: base, logs, brokenShields, investAmount: 0, asset, forcedSales, disabled: `Need at least ${formatINR(MIN_INVEST_CASH)} cash to invest` }
  }
  const amount = Math.round(cash * INVEST_FRACTION[card.tier])
  const p = addHolding({ ...base, savingStreak: 0, investChoices: base.investChoices + 1, doubleInvestActive: false }, asset, option.label && option.label !== 'Invest' ? option.label : card.name, amount, round)
  return { player: p, logs, brokenShields, investAmount: amount, asset, forcedSales }
}

/**
 * What a choice would do right now — for the decision sheet. Pure, no state change.
 */
export function previewDecision(state: GameState, playerIndex: number, card: GameCard, choice: DecisionChoice): DecisionPreview {
  const option = card.options?.find(o => o.type === choice)
  const player = state.players[playerIndex]
  if (!option || !player) return { cashDelta: 0, investAmount: 0, netWorthDelta: 0, disabled: 'Not available' }
  const blocked = levelDecisionBlock(state, playerIndex, option)
  if (blocked) return { cashDelta: 0, investAmount: 0, asset: getInvestAsset(option), netWorthDelta: 0, disabled: blocked }
  const out = resolveDecision(player, card, option, state.round ?? 1)
  return {
    cashDelta: getCash(out.player) - getCash(player),
    investAmount: out.investAmount,
    asset: out.asset,
    netWorthDelta: getNetWorth(out.player) - getNetWorth(player),
    disabled: out.disabled,
  }
}

/** "📈 Index Fund SIP" */
export function assetLabel(asset: AssetClass): string {
  return `${ASSETS[asset].emoji} ${ASSETS[asset].name}`
}

/** Stats + concepts for one decision (docs/phase4-design.md §2). */
function recordDecision(player: PlayerState, state: GameState, card: GameCard, option: DecisionOption, out: DecisionOutcome): PlayerState {
  const round = state.round ?? 1
  return patchStats(player, state, (s0, p) => {
    let s = recordForcedSales(s0, out.forcedSales, round)
    const ids: ConceptId[] = []
    if (option.type === 'save') {
      const streak = (s.currentSaveStreak ?? 0) + 1
      s = { ...s, saves: s.saves + 1, currentSaveStreak: streak, maxSaveStreak: Math.max(s.maxSaveStreak, streak) }
      if (streak >= 3) ids.push('pay_yourself_first')
    } else if (option.type === 'spend') {
      s = { ...s, spends: s.spends + 1, currentSaveStreak: 0 }
      if ((p.lifestyleLevel ?? 0) >= 2) ids.push('lifestyle_creep')
    } else {
      const asset = out.asset ?? getInvestAsset(option)
      s = {
        ...s,
        invests: s.invests + 1,
        currentSaveStreak: 0,
        investedByAsset: { ...s.investedByAsset, [asset]: (s.investedByAsset[asset] ?? 0) + out.investAmount },
      }
      ids.push(...assetConcepts(asset), ...diversificationConcepts(p))
    }
    ids.push(...conceptsFromText(`${card.name} ${card.flavor ?? ''} ${option.label} ${option.description ?? ''}`))
    return withConcepts(s, ids)
  })
}

export function processDecision(state: GameState, playerIndex: number, choice: DecisionChoice, card: GameCard): GameState {
  const option = card.options?.find(o => o.type === choice)
  if (!option) return state

  const player = state.players[playerIndex]
  const blocked = levelDecisionBlock(state, playerIndex, option)
  if (blocked) return noteBlockedDecision({ ...state, log: pushLogs(state.log, `⚠️ ${blocked}`) })
  const oldNW = getNetWorth(player)
  const out = resolveDecision(player, card, option, state.round ?? 1)
  if (out.disabled) {
    return { ...state, log: pushLogs(state.log, `⚠️ ${out.disabled}`) }
  }

  const decided = recordDecision(out.player, state, card, option, out)
  let newState: GameState = {
    ...state,
    players: state.players.map((p, i) => (i === playerIndex ? decided : p)),
    discardPile: out.brokenShields.length ? [...state.discardPile, ...out.brokenShields] : state.discardPile,
  }

  const logs = [...out.logs]
  // Spend draws a free card
  if (choice === 'spend') {
    const drawResult = drawCard(newState, playerIndex)
    newState = drawResult.state
    if (drawResult.card) logs.push(`🃏 Drew a free card!`)
  }

  const diff = getNetWorth(newState.players[playerIndex]) - oldNW
  const diffStr = diff > 0 ? ` (+₹${Math.abs(diff).toLocaleString()})` : diff < 0 ? ` (-₹${Math.abs(diff).toLocaleString()})` : ''
  let logEntry = `${player.name} played ${card.name} → ${choice.toUpperCase()}${diffStr}`
  if (choice === 'invest' && out.asset) logEntry += ` — ${formatINR(out.investAmount)} moved into ${assetLabel(out.asset)}`

  // Campaign level rule (docs/phase5-design.md Track N); no-op outside campaign levels
  const ruled = applyLevelDecision(newState, playerIndex, choice, player)
  newState = ruled.state
  logs.push(...ruled.lines)

  const hand = newState.players[playerIndex].hand.filter(c => c.id !== card.id)
  const updatedPlayers = newState.players.map((p, i) => (i === playerIndex ? { ...p, hand } : p))

  return checkWinCondition({
    ...newState,
    players: updatedPlayers,
    discardPile: [...newState.discardPile, card],
    playedCard: card,
    pendingDecision: null,
    log: pushLogs(newState.log, logEntry, ...logs),
  })
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export function processAction(state: GameState, playerIndex: number, card: GameCard, targetIndex: number): GameState {
  if (!card.effect) return state
  const effect = card.effect
  const isAoE = effect.target === 'all' || effect.target === 'others'

  const players = [...state.players]
  const discardPile = [...state.discardPile]
  const defended = new Set<number>()
  const defendLogs: string[] = []

  // Auto-defense: equipped defenses block matching cards (by name or category)
  const candidates = isAoE
    ? players.map((_, i) => i).filter(i => (i !== playerIndex || effect.includeSelf) && !players[i].hasForfeited)
    : effect.target === 'target' ? [targetIndex] : []
  for (const i of candidates) {
    const res = tryBlock(players[i], card)
    if (res.used) {
      players[i] = res.player
      discardPile.push(res.used)
      defended.add(i)
      defendLogs.push(`🛡️ ${players[i].name}'s ${res.used.name} blocked ${card.name}!`)
    }
  }

  const oldSource = getNetWorth(state.players[playerIndex])
  const oldTarget = getNetWorth(state.players[targetIndex])
  let newState: GameState = { ...state, players, discardPile }
  const effectLogs: string[] = []
  const allSales: Record<number, ForcedSale[]> = {}
  const collect = (r: { sales: Record<number, ForcedSale[]> }) => {
    for (const [k, v] of Object.entries(r.sales)) allSales[+k] = [...(allSales[+k] ?? []), ...v]
  }

  const markEmiDamage = (s: GameState, idx: number): GameState => ({
    ...s,
    players: s.players.map((p, i) => (i === idx ? { ...p, emiDamageTaken: true } : p)),
  })

  if (isAoE) {
    if (effect.type === 'attack_all_pct') {
      // attack_all_pct iterates over every opponent itself — apply it exactly once.
      const r = applyEffect(newState, effect, playerIndex, playerIndex, card, defended)
      newState = r.state
      effectLogs.push(...r.logs)
      collect(r)
      if (card.id.startsWith('ac_emi_bomb')) {
        for (let i = 0; i < newState.players.length; i++) {
          if ((i !== playerIndex || effect.includeSelf) && !defended.has(i)) newState = markEmiDamage(newState, i)
        }
      }
    } else {
      // Per-target AoE effects (e.g. skip_turn on 'others') are applied once per affected player
      for (let i = 0; i < newState.players.length; i++) {
        if (effect.target === 'others' && i === playerIndex) continue
        if (defended.has(i)) continue
        const r = applyEffect(newState, effect, playerIndex, i, card)
        newState = r.state
        effectLogs.push(...r.logs)
        collect(r)
        if (card.id.startsWith('ac_emi_bomb')) newState = markEmiDamage(newState, i)
      }
    }
  } else if (!defended.has(targetIndex)) {
    const r = applyEffect(newState, effect, playerIndex, targetIndex, card)
    newState = r.state
    effectLogs.push(...r.logs)
    collect(r)
    if (card.id.startsWith('ac_emi_bomb')) newState = markEmiDamage(newState, targetIndex)
  }

  const targetDiff = getNetWorth(newState.players[targetIndex]) - oldTarget
  const sourceDiff = getNetWorth(newState.players[playerIndex]) - oldSource
  const targetDiffStr = targetDiff < 0 ? ` (-₹${Math.abs(targetDiff).toLocaleString()})` : targetDiff > 0 ? ` (+₹${Math.abs(targetDiff).toLocaleString()})` : ''
  const sourceDiffStr = sourceDiff > 0 ? ` (+₹${Math.abs(sourceDiff).toLocaleString()})` : ''

  const sourceHand = newState.players[playerIndex].hand.filter(c => c.id !== card.id)
  const round = state.round ?? 1
  const harmful = isHarmful(card)
  const finalPlayers = newState.players.map((p0, i) => {
    const p = i === playerIndex ? { ...p0, hand: sourceHand } : p0
    const sales = allSales[i] ?? []
    const isVictim = harmful && i !== playerIndex && candidates.includes(i)
    if (!isVictim) return sales.length ? patchStats(p, state, s => recordForcedSales(s, sales, round)) : p
    const before = state.players[i]
    return patchStats(p, state, s => recordHit(s, card, round, {
      blocked: defended.has(i),
      lost: getNetWorth(before) - getNetWorth(p),
      sales,
      specLost: card.category === 'market' ? Math.max(0, speculativeValue(before) - speculativeValue(p)) : 0,
      skipped: effect.type === 'skip_turn',
      heldMarket: holdsMarket(before),
    }))
  })

  const targetName = state.players[targetIndex].name
  let logEntry = isAoE
    ? `${state.players[playerIndex].name} played ${card.name} — affects all!`
    : `${state.players[playerIndex].name} played ${card.name} → ${targetName}${targetDiffStr}${sourceDiffStr}`
  if (!isAoE && defended.has(targetIndex)) logEntry += ` 🛡️ (${targetName} Auto-Defended!)`

  return checkWinCondition({
    ...newState,
    players: finalPlayers,
    discardPile: [...newState.discardPile, card],
    playedCard: card,
    pendingTarget: null,
    log: pushLogs(newState.log, logEntry, ...effectLogs, ...(isAoE ? defendLogs : [])),
  })
}

export function processDefense(state: GameState, defenderIndex: number, defenseCard: GameCard, _attackCard: GameCard): GameState {
  const discard = [...state.discardPile, defenseCard]
  const hand = state.players[defenderIndex].hand.filter(c => c.id !== defenseCard.id)
  const updatedPlayers = state.players.map((p, i) =>
    i === defenderIndex
      ? patchStats({ ...p, hand }, state, st => ({ ...st, attacksBlocked: st.attacksBlocked + 1 }))
      : p
  )

  const logEntry = `${state.players[defenderIndex].name} defended with ${defenseCard.name}!`
  return {
    ...state,
    players: updatedPlayers,
    discardPile: discard,
    pendingTarget: null,
    log: pushLogs(state.log, logEntry),
  }
}

/** Pass: discard one chosen card from hand and end the turn. */
export function passTurn(state: GameState, playerIndex: number, discardCardId: string): GameState {
  const player = state.players[playerIndex]
  const card = player?.hand.find(c => c.id === discardCardId)
  if (!player) return state
  const next: GameState = card
    ? {
        ...state,
        players: state.players.map((p, i) => (i === playerIndex ? { ...p, hand: p.hand.filter(c => c.id !== card.id) } : p)),
        discardPile: [...state.discardPile, card],
        pendingDecision: null,
        pendingTarget: null,
        log: pushLogs(state.log, `${player.name} passed (discarded ${card.name}).`),
      }
    : { ...state, log: pushLogs(state.log, `${player.name} passed.`) }
  return advanceTurn(next)
}

function processPendingGains(state: GameState, playerIndex: number): GameState {
  const player = state.players[playerIndex]
  let total = 0
  const remaining = player.pendingGains.filter(g => {
    if (g.triggerAt === 'next_turn') {
      total += g.amount
      return false
    }
    return true
  })
  if (remaining.length === player.pendingGains.length) return state
  const { player: settled, brokenShields } = setWealthWithFloor({ ...player, pendingGains: remaining }, getNetWorth(player) + total)
  const updatedPlayers = state.players.map((p, i) => (i === playerIndex ? settled : p))
  return {
    ...state,
    players: updatedPlayers,
    discardPile: brokenShields.length ? [...state.discardPile, ...brokenShields] : state.discardPile,
  }
}

// ---------------------------------------------------------------------------
// Rounds: market tick → inflation → life event (docs §2)
// ---------------------------------------------------------------------------

function seasonMeanBoost(): number {
  const activeSeason = SEASONS.find(s => s.is_active)
  if (activeSeason?.special_rule?.includes('INVEST gains')) {
    const match = activeSeason.special_rule.match(/(\d+)%/)
    if (match) return 1 + parseInt(match[1]) / 100
  }
  return 1
}

/** Last round of this game (campaign: the level's turn limit). */
export function getRoundLimit(state: GameState): number {
  return state.levelConfig ? state.levelConfig.turnLimit : (state.maxRounds ?? MAX_ROUNDS)
}

function activeIndices(state: GameState): number[] {
  return state.players.map((p, i) => (p.hasForfeited ? -1 : i)).filter(i => i >= 0)
}

/** Life-event version of an effect: always lands on the affected player themself. */
function lifeEventEffect(effect: CardEffect): CardEffect {
  const v = Math.abs(effect.value ?? 0)
  switch (effect.type) {
    case 'attack_all_pct':
    case 'steal_pct':
    case 'market_crash_player':
      return { type: 'wealth_pct', value: -v, target: 'self' }
    case 'steal':
      return { type: 'wealth_change', value: -v, target: 'self' }
    default:
      return { ...effect, target: 'self' }
  }
}

/** Apply a life event card to one random active player, or everyone if it targets all/others. */
export function applyLifeEvent(state: GameState, card: GameCard): { state: GameState; lines: string[]; affected: string[] } {
  if (!card.effect) return { state, lines: [], affected: [] }
  const active = activeIndices(state)
  if (!active.length) return { state, lines: [], affected: [] }
  const everyone = !card.lureAsset && (card.effect.target === 'all' || card.effect.target === 'others')
  // Lures pick a bot when there is one, so human players watch the scam lesson happen to others
  const pool = card.lureAsset && active.some(i => state.players[i].isBot) ? active.filter(i => state.players[i].isBot) : active
  const targets = everyone ? active : [pool[Math.floor(rand() * pool.length)]]
  const effect = lifeEventEffect(card.effect)
  let s = state
  const lines: string[] = [`🎲 Life event: ${card.name}${everyone ? ' (everyone)' : ` — ${state.players[targets[0]].name}`}`]
  const round = state.round ?? 1
  const harmful = isHarmful({ ...card, effect })
  const setStats = (idx: number, fn: (st: PlayerGameStats) => PlayerGameStats) => {
    s = { ...s, players: s.players.map((p, i) => (i === idx ? patchStats(p, s, fn) : p)) }
  }
  for (const idx of targets) {
    const block = tryBlock(s.players[idx], { ...card, effect })
    if (block.used) {
      s = {
        ...s,
        players: s.players.map((p, i) => (i === idx ? block.player : p)),
        discardPile: [...s.discardPile, block.used],
      }
      lines.push(`🛡️ ${s.players[idx].name}'s ${block.used.name} blocked ${card.name}!`)
      setStats(idx, st => recordHit(st, card, round, { blocked: true, lost: 0, sales: [], specLost: 0, heldMarket: holdsMarket(s.players[idx]) }))
      continue
    }
    if (card.lureAsset) {
      const p = s.players[idx]
      const lure = card.lureAsset
      const amount = Math.round(getCash(p) * Math.abs(card.effect.value ?? 0) / 100)
      if (amount > 0) {
        s = { ...s, players: s.players.map((pl, i) => (i === idx ? addHolding(pl, lure, card.name, amount, s.round ?? 1) : pl)) }
        lines.push(`🎣 ${p.name} fell for it: ${formatINR(amount)} moved into ${assetLabel(lure)}`)
        setStats(idx, st => recordHit(
          { ...st, investedByAsset: { ...st.investedByAsset, [lure]: (st.investedByAsset[lure] ?? 0) + amount } },
          card, round, { blocked: false, lost: 0, sales: [], specLost: 0, lured: true, heldMarket: false },
        ))
      }
      continue
    }
    const beforePlayer = s.players[idx]
    const before = getNetWorth(beforePlayer)
    const r = applyEffect(s, effect, idx, idx, card)
    s = r.state
    const diff = getNetWorth(s.players[idx]) - before
    if (diff !== 0) lines.push(`${diff > 0 ? '🎉' : '💥'} ${s.players[idx].name}: ${diff > 0 ? '+' : '-'}${formatINR(Math.abs(diff))}`)
    lines.push(...r.logs)
    const sales = r.sales[idx] ?? []
    if (harmful) {
      const after = s.players[idx]
      setStats(idx, st => recordHit(st, card, round, {
        blocked: false,
        lost: -diff,
        sales,
        specLost: card.category === 'market' ? Math.max(0, speculativeValue(beforePlayer) - speculativeValue(after)) : 0,
        heldMarket: holdsMarket(beforePlayer),
      }))
    } else if (sales.length) {
      setStats(idx, st => recordForcedSales(st, sales, round))
    }
  }
  return { state: s, lines, affected: targets.map(i => state.players[i].id) }
}

/** Stats for one player's market tick: speculative losses, crashes, compounding. */
function recordMarketTick(before: PlayerState, after: PlayerState, changes: Partial<Record<AssetClass, number>>, round: number, state: GameState): PlayerState {
  const held = getHoldings(before)
  if (!held.length) return after
  return patchStats(after, state, st => {
    const ids: ConceptId[] = []
    let specLost = 0
    let worst = st.worstMarketDrop ?? null
    for (const h of held) {
      const pct = changes[h.asset] ?? 0
      const now = getHoldings(after).find(x => x.id === h.id)
      const value = now?.value ?? 0
      if ((h.asset === 'crypto' || h.asset === 'scam') && value < h.value) specLost += h.value - value
      if (pct <= -10) {
        ids.push('asset_risk')
        if (MARKET_ASSETS.includes(h.asset)) ids.push('market_patience')
        if (h.asset === 'crypto') ids.push('crypto_risk')
        if (!worst || pct < worst.pct) worst = { round, asset: h.asset, pct }
      }
      if (h.asset === 'scam' && value < h.value) ids.push('scams')
      if (now && (now.value >= 2 * now.principal || (round - now.boughtRound >= 3 && now.value > now.principal))) ids.push('compounding')
    }
    ids.push(...diversificationConcepts(after))
    return withConcepts({ ...st, speculativeLosses: st.speculativeLosses + Math.round(specLost), worstMarketDrop: worst }, ids)
  })
}

/** Runs when the turn wraps to the first player: one year passes. */
export function startNewRound(state: GameState): GameState {
  const newRound = (state.round ?? 1) + 1
  const lines: string[] = [`📅 Year ${newRound}`]

  // 1. Market tick — one shared roll per asset class
  const heldBefore = new Set<AssetClass>()
  state.players.forEach(p => getHoldings(p).forEach(h => heldBefore.add(h.asset)))
  const changes = rollMarket(seasonMeanBoost())
  let players = state.players.map(p => {
    if (p.hasForfeited) return p
    const { player, wiped } = applyMarketToPlayer(p, changes)
    wiped.forEach(h => lines.push(`☠️ ${p.name}'s ${assetLabel(h.asset)} was wiped out.`))
    return recordMarketTick(p, player, changes, newRound, state)
  })
  if (heldBefore.size) {
    const moves = [...heldBefore].map(a => `${ASSETS[a].emoji} ${changes[a] >= 0 ? '+' : ''}${changes[a]}%`).join('  ')
    lines.push(`📊 Market: ${moves}`)
  }

  // 2. Inflation on idle cash
  players = players.map(p => {
    if (p.hasForfeited) return p
    const { player, lost } = applyInflation(p)
    if (lost > 0) lines.push(`💸 Inflation ate ${formatINR(lost)} of ${p.name}'s cash`)
    return patchStats(player, state, st => {
      const ids: ConceptId[] = lost > 0 ? ['inflation'] : []
      // Money parked where it barely beats (or loses to) inflation
      const parked = getHoldings(player).some(h => h.asset === 'fd') || (newRound >= 3 && cashShare(player) > 0.6)
      if (parked) ids.push('fd_vs_inflation')
      return withConcepts({ ...st, inflationLost: st.inflationLost + lost }, ids)
    })
  })

  // The year that just ended goes on the net-worth chart (before the new year's life event)
  let s: GameState = recordRoundEnd({
    ...state,
    players,
    round: newRound,
    lastMarketTick: { round: newRound, changes },
  })

  // Round limit reached: the game ends after the final year's market + inflation
  if (newRound > getRoundLimit(s)) {
    return endByLimit({ ...s, roundNews: { round: newRound, lines } }, lines)
  }

  // Campaign level rule for the new year (salary, Auto-SIP, desire, family goals); no-op otherwise
  const ruled = applyLevelRoundStart(s)
  if (ruled.playerIndex >= 0) {
    s = ruled.state
    lines.push(...ruled.lines)
    if (ruled.forcedSales.length) {
      s = { ...s, players: s.players.map((p, i) => (i === ruled.playerIndex ? patchStats(p, s, st => recordForcedSales(st, ruled.forcedSales, newRound)) : p)) }
    }
  }

  // 3. Life event (50%)
  let lastEvent = state.lastEvent ?? null
  if (rand() < LIFE_EVENT_CHANCE) {
    let deck = s.eventDeck && s.eventDeck.length ? [...s.eventDeck] : buildEventDeck([])
    const card = deck.shift()!
    deck = [...deck, card] // cycle to the bottom
    const r = applyLifeEvent({ ...s, eventDeck: deck }, card)
    s = r.state
    lines.push(...r.lines)
    lastEvent = { card, round: newRound, affectedPlayerIds: r.affected }
  }

  return {
    ...s,
    lastEvent,
    roundNews: { round: newRound, lines },
    log: pushLogs(s.log, ...[...lines].reverse()),
  }
}

/** Game over because the round / time limit was hit. */
function endByLimit(state: GameState, extraLogs: string[] = [], reason = 'Round limit reached'): GameState {
  const log = pushLogs(state.log, ...[...extraLogs].reverse())
  const active = state.players.filter(p => !p.hasForfeited)
  if (state.levelConfig) {
    const human = state.players.find(p => !p.isBot)
    if (human && getNetWorth(human) >= state.wealthGoal) {
      return { ...state, winner: human, phase: 'game_over', log: pushLogs(log, `🏆 Level Complete! Reached the target corpus in time.`) }
    }
    const bestBot = [...active].filter(p => p.isBot).sort((a, b) => b.wealth - a.wealth)[0] ?? null
    return {
      ...state,
      winner: bestBot,
      phase: 'game_over',
      log: pushLogs(log, `❌ ${reason}! You needed ${formatINR(state.wealthGoal)} — try investing earlier and keeping an emergency fund.`),
    }
  }
  const winner = [...active].sort((a, b) => b.wealth - a.wealth)[0] ?? state.players[0]
  return { ...state, winner, phase: 'game_over', log: pushLogs(log, `⌛ ${reason}! ${winner.name} wins with the highest net worth.`) }
}

export function advanceTurn(state: GameState): GameState {
  const n = state.players.length
  let newState: GameState = { ...state, equippedThisTurn: false }

  // Find the next active player; crossing seat 0 starts a new round.
  let wrapped = state.currentPlayerIndex + 1 >= n
  let nextIndex = (state.currentPlayerIndex + 1) % n
  let loopCount = 0
  while ((newState.players[nextIndex].hasForfeited || newState.players[nextIndex].skippedTurns > 0) && loopCount < n) {
    const p = newState.players[nextIndex]
    if (!p.hasForfeited) {
      newState = {
        ...newState,
        players: newState.players.map((pl, i) => (i === nextIndex ? { ...pl, skippedTurns: pl.skippedTurns - 1 } : pl)),
        log: pushLogs(newState.log, `${p.name} is skipping their turn.`),
      }
    }
    if (nextIndex + 1 >= n) wrapped = true
    nextIndex = (nextIndex + 1) % n
    loopCount++
  }

  if (wrapped && n > 1) {
    newState = startNewRound(newState)
    if (newState.phase === 'game_over') return newState
  }

  // PROCESS PENDING GAINS FOR THE NEXT PLAYER
  newState = processPendingGains(newState, nextIndex)

  const checked = checkWinCondition(newState)
  if (checked.winner) return checked

  const elapsed = Date.now() - state.startTime
  if (elapsed >= state.timeLimit) {
    return endByLimit(recordFinal(checked), [], 'Time up')
  }

  return {
    ...checked,
    currentPlayerIndex: nextIndex,
    turn: checked.turn + 1,
    phase: 'draw',
    drawnCard: null,
    playedCard: null,
    pendingDecision: null,
    pendingTarget: null,
    turnStartTime: Date.now(),
  }
}

export function forceSkipTurn(state: GameState): GameState {
  const p = state.players[state.currentPlayerIndex]
  const logEntry = `⏱️ ${p.name} took too long! Turn skipped.`
  return advanceTurn({ ...state, pendingDecision: null, pendingTarget: null, log: pushLogs(state.log, logEntry) })
}

export function checkWinCondition(input: GameState): GameState {
  if (input.phase === 'game_over' && input.winner) return input
  let state = trackPeaks(input)
  const reached = state.players
    .filter(p => !p.hasForfeited && getNetWorth(p) >= state.wealthGoal && canWinByTarget(state, p))
    .sort((a, b) => getNetWorth(b) - getNetWorth(a))
  if (reached.length) {
    state = recordFinal(state)
    const winner = state.players.find(p => p.id === reached[0].id) ?? reached[0]
    return {
      ...state,
      winner,
      phase: 'game_over',
      log: pushLogs(state.log, `🏆 ${winner.name} reached the wealth goal and WINS!`),
    }
  }
  const activePlayers = state.players.filter(p => !p.hasForfeited)
  if (activePlayers.length === 1 && state.players.length > 1) {
    state = recordFinal(state)
    const remainingWinner = state.players.find(p => p.id === activePlayers[0].id) ?? activePlayers[0]
    return {
      ...state,
      winner: remainingWinner,
      phase: 'game_over',
      log: pushLogs(state.log, `🏆 Everyone else forfeited! ${remainingWinner.name} WINS!`),
    }
  }
  if ((state.round ?? 1) > getRoundLimit(state)) {
    return endByLimit(state)
  }
  return state
}

/** Starting wealth for this game: the campaign level's corpus, or the default. */
export function getStartingWealth(state: GameState): number {
  return state.levelConfig?.startingCorpus ?? STARTING_WEALTH
}

// ---------------------------------------------------------------------------
// Bots (docs §8)
// ---------------------------------------------------------------------------

/** Bots keep this share of net worth as cash — they "know" about emergency funds. */
export const BOT_CASH_BUFFER = 0.15
/** Chance (× difficulty) a bot spends its turn attacking a richer leader instead of making a money decision. */
export const BOT_ATTACK_LEADER_CHANCE = { value: 0.15 }

/** Chance a bot falls for a scam "hot tip": hard never, medium sometimes, easy often. */
export function botScamChance(bot: PlayerState): number {
  const diff = bot.diffMultiplier ?? 1.0
  if (diff >= 1.1) return 0
  if (diff < 1.0) return 0.5
  return 0.2
}

/** Bot choice for a decision card: save below the cash buffer, otherwise invest (avoiding scams). */
export function chooseBotDecision(_state: GameState, bot: PlayerState, card: GameCard, r: number = rand()): DecisionChoice {
  const options = card.options ?? []
  const invest = options.find(o => o.type === 'invest')
  const hasSave = options.some(o => o.type === 'save')
  const fallback: DecisionChoice = hasSave ? 'save' : (options.find(o => o.type !== 'spend')?.type ?? options[0]?.type ?? 'save')
  if (!invest) return fallback
  const cash = getCash(bot)
  const buffer = getNetWorth(bot) * BOT_CASH_BUFFER
  const frac = INVEST_FRACTION[card.tier]
  if (cash < MIN_INVEST_CASH || cash * (1 - frac) < buffer) return fallback
  const asset = getInvestAsset(invest)
  if (asset === 'scam') return r < botScamChance(bot) ? 'invest' : fallback
  if (asset === 'crypto' || asset === 'smallcap') return r < 0.5 ? 'invest' : fallback
  return 'invest'
}

export interface BotPolicy {
  /** Override the decision choice (used by the balance simulation). */
  chooseDecision?: (state: GameState, bot: PlayerState, card: GameCard) => DecisionChoice
}

/** Pick which decision card to play: the one with the best outcome for the chosen choice. */
function pickDecisionCard(state: GameState, botIndex: number, cards: GameCard[], policy?: BotPolicy): { card: GameCard; choice: DecisionChoice } | null {
  const bot = state.players[botIndex]
  let best: { card: GameCard; choice: DecisionChoice; score: number } | null = null
  for (const card of cards) {
    const choice = policy?.chooseDecision ? policy.chooseDecision(state, bot, card) : chooseBotDecision(state, bot, card)
    const pv = previewDecision(state, botIndex, card, choice)
    if (pv.disabled) continue
    const score = choice === 'invest' && pv.asset
      ? pv.investAmount * (ASSETS[pv.asset].meanPct / 100) + 1e9 // investing beats saving when the bot wants to invest
      : pv.netWorthDelta
    if (!best || score > best.score) best = { card, choice, score }
  }
  return best ? { card: best.card, choice: best.choice } : null
}

const TIER_RANK: Record<string, number> = { common: 0, rare: 1, epic: 2, legendary: 3 }

export function doBotTurn(state: GameState, policy?: BotPolicy): { state: GameState; delay: number } {
  const botIndex = state.currentPlayerIndex
  const bot = state.players[botIndex]
  const diffMult = bot.diffMultiplier ?? 1.0

  let s = startDrawPhase(state, botIndex).state
  if (!s.players[botIndex].hand.length) {
    return { state: advanceTurn(s), delay: 800 }
  }

  // Free equip: one defense per turn
  const defenseToEquip = s.players[botIndex].hand.find(c => c.type === 'defense')
  if (defenseToEquip && canEquip(s, botIndex, defenseToEquip)) {
    s = equipDefense(s, botIndex, defenseToEquip)
  }

  const hand = s.players[botIndex].hand
  const me = s.players[botIndex]
  const targetedAction = hand.find(c => c.type === 'action' && c.effect?.target === 'target')
  const aoeAction = hand.find(c => c.type === 'action' && (c.effect?.target === 'others' || c.effect?.target === 'all'))
  const decisions = hand.filter(c => c.type === 'decision' && c.options?.length)

  const opponents = s.players.map((p, i) => ({ p, i })).filter(x => x.i !== botIndex && !x.p.hasForfeited)
  const leader = [...opponents].sort((a, b) => getNetWorth(b.p) - getNetWorth(a.p))[0]
  const leaderAhead = !!leader && getNetWorth(leader.p) > getNetWorth(me)
  const r = rand()

  let finalState: GameState
  const decisionPick = decisions.length ? pickDecisionCard(s, botIndex, decisions, policy) : null

  if (targetedAction && leader && (!decisionPick || (leaderAhead && r < BOT_ATTACK_LEADER_CHANCE.value * diffMult))) {
    finalState = processAction(s, botIndex, targetedAction, leader.i)
  } else if (decisionPick) {
    finalState = processDecision(s, botIndex, decisionPick.choice, decisionPick.card)
  } else if (aoeAction) {
    finalState = processAction(s, botIndex, aoeAction, botIndex)
  } else {
    // Nothing worth playing: pass, discarding the least useful card
    const discard = [...hand].sort((a, b) => {
      const aw = a.type === 'defense' ? 0 : 1
      const bw = b.type === 'defense' ? 0 : 1
      return aw - bw || TIER_RANK[a.tier] - TIER_RANK[b.tier]
    })[0]
    return { state: passTurn(s, botIndex, discard.id), delay: 1000 }
  }

  if (finalState.phase === 'game_over') return { state: finalState, delay: 800 }
  return { state: advanceTurn(finalState), delay: 1200 }
}

/** Rank points for a finished match. Single source of truth: src/data/rankRules.ts (same table as the server). */
export function calculateRPChange(placement: number, totalPlayers: number, winStreak: number): number {
  return calculateRankRP(placement, totalPlayers, winStreak)
}
