export type CardType = 'decision' | 'action' | 'defense' | 'situation'
export type CardTier = 'common' | 'rare' | 'epic' | 'legendary'
export type DecisionChoice = 'spend' | 'save' | 'invest'
export type MultiplayerMode = 'blitz' | 'standard' | 'epic'
/** Where an INVEST choice puts the money. Return/risk table lives in src/data/assets.ts */
export type AssetClass = 'fd' | 'debt' | 'gold' | 'index' | 'equity' | 'smallcap' | 'realestate' | 'crypto' | 'scam'
/** What kind of trouble a card causes; defense cards block whole categories. */
export type EventCategory = 'medical' | 'job' | 'market' | 'fraud' | 'tax' | 'property' | 'legal' | 'personal' | 'travel' | 'debt'
import type { LevelConfig, LevelState } from './level'
import type { PlayerGameStats } from './learning'
export interface CardEffect {
  type: 'wealth_change' | 'wealth_pct' | 'wealth_next_turn' | 'wealth_end_game' | 'skip_turn' | 'steal' | 'steal_pct' | 'attack_all_pct' | 'block_card' | 'reduce_attack_pct' | 'copy_card' | 'set_goal' | 'market_crash_player' | 'wealth_floor' | 'double_invest'
  value?: number
  target?: 'self' | 'target' | 'all' | 'others'
  condition?: string
  blocks?: string[]
  /** AoE attacks (attack_all_pct) only hit opponents unless this is explicitly true */
  includeSelf?: boolean
}

export interface DecisionOption {
  type: DecisionChoice
  label: string
  labelHi?: string
  shortLabel?: string
  shortLabelHi?: string
  description: string
  descriptionHi?: string
  shortDescription?: string
  shortDescriptionHi?: string
  effect: CardEffect
  /** 0-100: percentage chance that an INVEST choice will FAIL and apply failEffect instead */
  investRisk?: number
  /** Applied when investRisk triggers (e.g. -₹200K loss) */
  failEffect?: CardEffect
  mentorInsight?: string
  /** INVEST options only: the asset this money goes into (defaults inferred from investRisk) */
  asset?: AssetClass
}

export interface GameCard {
  id: string
  name: string
  nameHi?: string
  shortName?: string
  shortNameHi?: string
  type: CardType
  tier: CardTier
  flavor: string
  flavorHi?: string
  shortFlavor?: string
  shortFlavorHi?: string
  art?: string
  options?: DecisionOption[]
  effect?: CardEffect
  blocksCardTypes?: string[]
  debtAmount?: number
  interestRate?: number
  tenorMonths?: number
  mentorInsight?: string
  /** Action / life-event cards: the kind of trouble this is */
  category?: EventCategory
  /** True for misfortunes (illness, roof leak...) that come from the shared Life Event deck, not from a rival */
  lifeEvent?: boolean
  /** Defense cards: block any incoming card whose category is listed */
  blocksCategories?: EventCategory[]
  /** Life events only: the affected player is talked into moving |effect.value|% of their cash into this asset (e.g. a scam tip) */
  lureAsset?: AssetClass
}

/** An investment a player owns. Its value moves every round; it counts toward net worth. */
export interface Holding {
  id: string
  asset: AssetClass
  /** Card / label it came from, e.g. "Nifty 50 SIP" */
  name: string
  principal: number
  value: number
  /** Round in which it was bought */
  boughtRound: number
  /** % change applied at the last market tick (for UI arrows) */
  lastChangePct: number
}

export interface PlayerState {
  id: string
  name: string
  isBot: boolean
  wealth: number
  hand: GameCard[]
  activeDefenses: GameCard[]
  skippedTurns: number
  pendingGains: { amount: number; triggerAt: 'next_turn' | 'end_game'; cardId: string }[]
  wealthFloor: number
  doubleInvestActive: boolean
  investChoices: number
  spendChoices: number
  savingStreak: number
  greedIndex: number
  emiDamageTaken: boolean
  hasForfeited?: boolean
  diffMultiplier?: number
  /** Phase 3 economy. `wealth` stays = net worth (cash + holdings) so existing UI keeps working. */
  cash?: number
  holdings?: Holding[]
  /** Rises with each Spend: raises the inflation hit on cash (lifestyle creep) */
  lifestyleLevel?: number
  /** Phase 4: what this player did during the game, for the report card */
  stats?: PlayerGameStats
  profile?: {
    rank_points: number
    avatar_url: string | null
  }
}

export interface GameState {
  id: string
  players: PlayerState[]
  deck: GameCard[]
  discardPile: GameCard[]
  currentPlayerIndex: number
  turn: number
  phase: 'draw' | 'play' | 'effect' | 'end_turn' | 'game_over'
  drawnCard: GameCard | null
  playedCard: GameCard | null
  pendingDecision: { card: GameCard; playerIndex: number } | null
  pendingTarget: { card: GameCard; playerIndex: number; effect: CardEffect } | null
  winner: PlayerState | null
  log: string[]
  wealthGoal: number
  timeLimit: number
  startTime: number
  turnStartTime: number
  multiplayerMode?: MultiplayerMode
  levelConfig?: LevelConfig
  levelState?: LevelState
  /** Phase 3: one round = every active player has had a turn = one year of life */
  round?: number
  /** Shared Life Event deck (lifeEvent cards), drawn at the start of a round */
  eventDeck?: GameCard[]
  /** Most recent life event, for the UI */
  lastEvent?: { card: GameCard; round: number; affectedPlayerIds: string[] } | null
  /** Most recent market tick, for the UI: % change per asset class this round */
  lastMarketTick?: { round: number; changes: Partial<Record<AssetClass, number>> } | null
  /** True once the current player has used their free defense equip this turn */
  equippedThisTurn?: boolean
  /** Quick/ranked/multiplayer: game ends after this many rounds (campaign uses levelConfig.turnLimit) */
  maxRounds?: number
  /** Human-readable summary of the latest round start ("Year N"): market, inflation, life event */
  roundNews?: { round: number; lines: string[] } | null
}

export interface MogulRank {
  name: string
  emoji: string
  minRP: number
  maxRP: number
  color: string
}

export const MOGUL_RANKS: MogulRank[] = [
  { name: 'Rookie', emoji: '🌱', minRP: 0, maxRP: 499, color: '#6B7280' },
  { name: 'Hustler', emoji: '🔥', minRP: 500, maxRP: 1499, color: '#F97316' },
  { name: 'Grinder', emoji: '📈', minRP: 1500, maxRP: 3499, color: '#22C55E' },
  { name: 'Elite', emoji: '💎', minRP: 3500, maxRP: 6999, color: '#3B82F6' },
  { name: 'Mogul', emoji: '👑', minRP: 7000, maxRP: 14999, color: '#EAB308' },
  { name: 'Tycoon', emoji: '🏦', minRP: 15000, maxRP: 29999, color: '#F59E0B' },
  { name: 'Billionaire', emoji: '🌍', minRP: 30000, maxRP: 59999, color: '#8B5CF6' },
  { name: 'DAANIK Legend', emoji: '🚀', minRP: 60000, maxRP: Infinity, color: '#EC4899' },
]

export function getRankForRP(rp: number): MogulRank {
  return MOGUL_RANKS.find(r => rp >= r.minRP && rp <= r.maxRP) ?? MOGUL_RANKS[0]
}

export function formatWealth(amount: number): string {
  if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)}Cr`
  if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`
  return `${amount}`
}
