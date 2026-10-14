/**
 * Coach-mark steps of the guided first match. Text is built from the live
 * GameState so every number on screen is the engine's real number; the words
 * come from the locale files (tutorial.step.*).
 */
import type { GameCard, GameState, PlayerState } from '../../types/game'
import type { UIPhase } from '../game/GameBoard'
import { getCash, getHoldings, getNetWorth, inflationPct, previewDecision } from '../../lib/gameEngine'
import { formatINR } from '../../lib/economy'
import { ALL_CARDS } from '../../data/cards'
import { CARD_IDS, TUTORIAL_BOT_NAME, isCard } from '../../data/tutorialScript'
import i18n from '../../i18n/i18n'

export type StepId =
  | 'networth' | 'rival'
  | 'pickChai' | 'preview' | 'invest'
  | 'botTurn'
  | 'year' | 'lure'
  | 'pickSave'
  | 'botTurn2'
  | 'medical'
  | 'equip' | 'freePlay'
  | 'botTurn3'
  | 'scam'

export interface StepCtx {
  gs: GameState
  uiPhase: UIPhase
}

/** Where the spotlight goes: CSS selectors (first visible match wins) or a card in your hand. */
export type StepTarget = { selectors: string[] } | { card: string; preferSelectors?: string[] } | null

export interface StepDef {
  id: StepId
  /** 1-based lesson number for the progress dots (9 = summary screen) */
  lesson: number
  /** next = read and tap Next; action = do it on the board; wait = watch (bot playing) */
  kind: 'next' | 'action' | 'wait'
  title: () => string
  body: (ctx: StepCtx) => string
  /** Short "do this" line shown for action steps */
  todo?: (ctx: StepCtx) => string
  target: (ctx: StepCtx) => StepTarget
  /** action / wait steps: move on when this becomes true */
  done?: (ctx: StepCtx) => boolean
  /** Rahul may take his turn while this step is showing */
  allowBot?: boolean
}

export const LESSON_COUNT = 9

const t = (key: string, opts?: Record<string, unknown>): string => i18n.t(`tutorial.step.${key}`, opts)

/** The card's title as the board shows it (GameCard: short name first, Hindi in Hindi). */
export function tutorialCardTitle(id: string): string {
  const c: GameCard | undefined = ALL_CARDS.find(x => x.id === id)
  if (!c) return id
  return i18n.language === 'hi'
    ? (c.shortNameHi || c.nameHi || c.shortName || c.name)
    : (c.shortName || c.name)
}

const you = (gs: GameState): PlayerState => gs.players[0]
const rahul = (gs: GameState): PlayerState => gs.players[1]
const lines = (gs: GameState): string[] => gs.roundNews?.lines ?? []
const line = (gs: GameState, re: RegExp): RegExpMatchArray | null => {
  for (const l of lines(gs)) {
    const m = l.match(re)
    if (m) return m
  }
  return null
}
const pct = (n: number | undefined) => (n === undefined ? '?' : `${n >= 0 ? '+' : ''}${n}%`)

const PORTFOLIO = { selectors: ['[data-tour="hud"]', '.dk-rail .econ-portfolio', '.mb-wallet .econ-wallet-chip'] }
const PLAYERS = { selectors: ['[data-tour="rivals"]', '.desktop-players-strip', '.mb-players'] }
const HAND = { selectors: ['[data-tour="hand"]', '.dk-hand', '.mb-hand'] }
/** An open card sheet: its choice tiles, else its main button */
const SHEET = ['[data-tour="choices"]', '.sheet .sheet__footer .btn--primary']

export const STEPS: StepDef[] = [
  {
    id: 'networth', lesson: 1, kind: 'next',
    title: () => t('networth.title'),
    body: ({ gs }) => t('networth.body', { cash: formatINR(getCash(you(gs))), goal: formatINR(gs.wealthGoal) }),
    target: () => PORTFOLIO,
  },
  {
    id: 'rival', lesson: 1, kind: 'next',
    title: () => t('rival.title', { name: TUTORIAL_BOT_NAME }),
    body: ({ gs }) => {
      const r = rahul(gs)
      const flat = getHoldings(r).find(h => h.asset === 'realestate')
      return t('rival.body', { netWorth: formatINR(getNetWorth(r)), flat: formatINR(flat?.value ?? 0), cash: formatINR(getCash(r)) })
    },
    target: () => PLAYERS,
  },
  {
    id: 'pickChai', lesson: 2, kind: 'action',
    title: () => t('pickChai.title'),
    body: () => t('pickChai.body'),
    todo: () => t('pickChai.todo', { card: tutorialCardTitle(CARD_IDS.chai) }),
    target: ({ gs }) => {
      const c = you(gs).hand.find(h => isCard(h, CARD_IDS.chai))
      return c ? { card: c.id } : HAND
    },
    done: ({ gs, uiPhase }) => uiPhase === 'decision' && isCard(gs.pendingDecision?.card, CARD_IDS.chai),
  },
  {
    id: 'preview', lesson: 2, kind: 'next',
    title: () => t('preview.title'),
    body: () => t('preview.body'),
    target: () => ({ selectors: ['[data-tour="choices"]', '.econ-dopts'] }),
  },
  {
    id: 'invest', lesson: 2, kind: 'action',
    title: () => t('invest.title'),
    body: ({ gs }) => {
      const card = gs.pendingDecision?.card
      const amount = card ? previewDecision(gs, 0, card, 'invest').investAmount : 0
      return amount ? t('invest.body', { amount: formatINR(amount) }) : t('invest.bodyPart')
    },
    todo: () => t('invest.todo'),
    target: () => ({ selectors: ['[data-tour="choice-invest"]', '.econ-dopt-invest'] }),
    done: ({ gs }) => gs.currentPlayerIndex !== 0 || (gs.round ?? 1) > 1,
  },
  {
    id: 'botTurn', lesson: 3, kind: 'wait',
    title: () => t('botTurn.title'),
    body: () => t('botTurn.body'),
    target: () => PLAYERS,
    done: ({ gs }) => (gs.round ?? 1) >= 2 && gs.currentPlayerIndex === 0,
    allowBot: true,
  },
  {
    id: 'year', lesson: 4, kind: 'next',
    title: () => t('year.title'),
    body: ({ gs }) => {
      const me = you(gs)
      const idx = getHoldings(me).find(h => h.asset === 'index')
      const ate = line(gs, new RegExp(`Inflation ate (₹[\\d,]+) of ${me.name}'s cash`))?.[1]
      const market = idx
        ? t('year.market', { pct: pct(gs.lastMarketTick?.changes.index), from: formatINR(idx.principal), to: formatINR(idx.value) }) + ' '
        : ''
      return market + t(ate ? 'year.inflation' : 'year.inflationSome', { pct: inflationPct(me), amount: ate })
    },
    target: () => PORTFOLIO,
  },
  {
    id: 'lure', lesson: 4, kind: 'next',
    title: () => t('lure.title'),
    body: ({ gs }) => {
      const amt = line(gs, /fell for it: (₹[\d,]+)/)?.[1]
      return amt ? t('lure.body', { amount: amt }) : t('lure.bodyNoAmount')
    },
    target: () => PLAYERS,
  },
  {
    id: 'pickSave', lesson: 5, kind: 'action',
    title: () => t('pickSave.title'),
    body: ({ gs }) => t('pickSave.body', { cash: formatINR(getCash(you(gs))) }),
    todo: ({ uiPhase }) => (uiPhase === 'decision' ? t('pickSave.todoSave') : t('pickSave.todoCard', { card: tutorialCardTitle(CARD_IDS.buffer) })),
    target: ({ gs, uiPhase }) => {
      if (uiPhase === 'decision') return { selectors: ['[data-tour="choice-save"]', '.econ-dopt-save'] }
      const c = you(gs).hand.find(h => isCard(h, CARD_IDS.buffer))
      return c ? { card: c.id } : HAND
    },
    done: ({ gs }) => gs.currentPlayerIndex !== 0 || (gs.round ?? 1) > 2,
  },
  {
    id: 'botTurn2', lesson: 5, kind: 'wait',
    title: () => t('botTurn2.title'),
    body: ({ gs }) => t('botTurn2.body', { cash: formatINR(getCash(you(gs))) }),
    target: () => PLAYERS,
    done: ({ gs }) => (gs.round ?? 1) >= 3 && gs.currentPlayerIndex === 0,
    allowBot: true,
  },
  {
    id: 'medical', lesson: 6, kind: 'next',
    title: () => t('medical.title'),
    body: ({ gs }) => {
      const bill = line(gs, new RegExp(`💥 ${TUTORIAL_BOT_NAME}: -(₹[\\d,]+)`))?.[1]
      const sold = lines(gs).some(l => l.includes(`${TUTORIAL_BOT_NAME} had to sell`))
      const head = bill ? t('medical.headBill', { amount: bill }) : t('medical.head')
      const lesson = sold ? ' ' + t('medical.sold') : ''
      return `${head}${lesson} ${t('medical.you', { cash: formatINR(getCash(you(gs))) })}`
    },
    target: () => PLAYERS,
  },
  {
    id: 'equip', lesson: 7, kind: 'action',
    title: () => t('equip.title'),
    body: () => t('equip.body'),
    todo: () => t('equip.todo', { card: tutorialCardTitle(CARD_IDS.insurance) }),
    target: ({ gs }) => {
      const c = you(gs).hand.find(h => isCard(h, CARD_IDS.insurance))
      return c ? { card: c.id, preferSelectors: ['.sheet .sheet__footer .btn--primary'] } : HAND
    },
    done: ({ gs }) => you(gs).activeDefenses.some(d => isCard(d, CARD_IDS.insurance)),
  },
  {
    id: 'freePlay', lesson: 7, kind: 'action',
    title: () => t('freePlay.title'),
    body: () => t('freePlay.body'),
    todo: () => t('freePlay.todo'),
    target: () => ({ selectors: [...SHEET, ...HAND.selectors] }),
    done: ({ gs }) => gs.currentPlayerIndex !== 0 || (gs.round ?? 1) > 3,
  },
  {
    id: 'botTurn3', lesson: 7, kind: 'wait',
    title: () => t('botTurn.title'),
    body: () => t('botTurn3.body'),
    target: () => PLAYERS,
    done: ({ gs }) => (gs.round ?? 1) >= 4 && gs.currentPlayerIndex === 0,
    allowBot: true,
  },
  {
    id: 'scam', lesson: 8, kind: 'next',
    title: () => t('scam.title'),
    body: ({ gs }) => {
      const wiped = lines(gs).some(l => l.startsWith(`☠️ ${TUTORIAL_BOT_NAME}'s`))
      const blocked = lines(gs).some(l => l.includes('Health Insurance blocked'))
      return t(wiped ? 'scam.wiped' : 'scam.crashing') + (blocked ? ' ' + t('scam.blocked') : '')
    },
    target: () => ({ selectors: ['[data-tour="year"]', '[data-tour="shields"]', ...PLAYERS.selectors] }),
  },
]

export function stepIndex(id: StepId): number {
  return STEPS.findIndex(s => s.id === id)
}
