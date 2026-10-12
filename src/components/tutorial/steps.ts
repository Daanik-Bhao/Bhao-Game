/**
 * Coach-mark steps of the guided first match. Text is built from the live
 * GameState so every number on screen is the engine's real number.
 */
import type { GameState, PlayerState } from '../../types/game'
import type { UIPhase } from '../game/GameBoard'
import { getCash, getHoldings, getNetWorth, inflationPct, previewDecision } from '../../lib/gameEngine'
import { formatINR } from '../../lib/economy'
import { CARD_IDS, TUTORIAL_BOT_NAME, isCard } from '../../data/tutorialScript'

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
export type StepTarget = { selectors: string[] } | { card: string } | null

export interface StepDef {
  id: StepId
  /** 1-based lesson number for the progress dots (9 = summary screen) */
  lesson: number
  /** next = read and tap Next; action = do it on the board; wait = watch (bot playing) */
  kind: 'next' | 'action' | 'wait'
  title: string
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

const PORTFOLIO = { selectors: ['.dk-rail .econ-portfolio', '.mb-wallet .econ-wallet-chip', '.mb-statusbar .econ-wallet-chip'] }
const PLAYERS = { selectors: ['.desktop-players-strip', '.mb-players'] }
const HAND = { selectors: ['.dk-hand', '.mb-hand'] }

export const STEPS: StepDef[] = [
  {
    id: 'networth', lesson: 1, kind: 'next',
    title: 'Your money',
    body: ({ gs }) =>
      `Net worth = cash + investments. You start with ${formatINR(getCash(you(gs)))} in cash and no investments. ` +
      `Each round of BHAO is one year of your life. Grow your net worth toward ${formatINR(gs.wealthGoal)}.`,
    target: () => PORTFOLIO,
  },
  {
    id: 'rival', lesson: 1, kind: 'next',
    title: `Meet ${TUTORIAL_BOT_NAME}`,
    body: ({ gs }) => {
      const r = rahul(gs)
      const flat = getHoldings(r).find(h => h.asset === 'realestate')
      return `Rahul has the same ${formatINR(getNetWorth(r))} net worth, but ${formatINR(flat?.value ?? 0)} of it is a flat ` +
        `and only ${formatINR(getCash(r))} is cash. He invests every spare rupee and keeps no emergency fund. Keep an eye on him.`
    },
    target: () => PLAYERS,
  },
  {
    id: 'pickChai', lesson: 2, kind: 'action',
    title: 'Play a card',
    body: () =>
      'Each turn you play one card. This one is about the ₹150 a day you spend on chai and snacks — ₹4,500 a month.',
    todo: () => 'Tap “Daily Convenience Habit”, then ▶ Play.',
    target: ({ gs }) => {
      const c = you(gs).hand.find(h => isCard(h, CARD_IDS.chai))
      return c ? { card: c.id } : HAND
    },
    done: ({ gs, uiPhase }) => uiPhase === 'decision' && isCard(gs.pendingDecision?.card, CARD_IDS.chai),
  },
  {
    id: 'preview', lesson: 2, kind: 'next',
    title: 'Save, Spend or Invest?',
    body: () =>
      'Each choice shows what it does to your money right now. Save adds cash. Spend costs cash and makes your lifestyle ' +
      'more expensive. Invest moves cash into an investment — your net worth stays the same today, then grows (or dips) every year.',
    target: () => ({ selectors: ['.econ-dopts'] }),
  },
  {
    id: 'invest', lesson: 2, kind: 'action',
    title: 'Invest it',
    body: ({ gs }) => {
      const card = gs.pendingDecision?.card
      const amount = card ? previewDecision(gs, 0, card, 'invest').investAmount : 0
      return `An index fund owns a slice of India's top companies. Invest moves ${amount ? formatINR(amount) : 'part'} of your cash into it — ` +
        'no instant profit, it grows year by year.'
    },
    todo: () => 'Tap Invest.',
    target: () => ({ selectors: ['.econ-dopt-invest'] }),
    done: ({ gs }) => gs.currentPlayerIndex !== 0 || (gs.round ?? 1) > 1,
  },
  {
    id: 'botTurn', lesson: 3, kind: 'wait',
    title: 'Rahul’s turn',
    body: () => 'You play one card, then your turn ends. Now Rahul plays — he puts his cash into more property.',
    target: () => PLAYERS,
    done: ({ gs }) => (gs.round ?? 1) >= 2 && gs.currentPlayerIndex === 0,
    allowBot: true,
  },
  {
    id: 'year', lesson: 4, kind: 'next',
    title: 'A year passed',
    body: ({ gs }) => {
      const me = you(gs)
      const idx = getHoldings(me).find(h => h.asset === 'index')
      const ate = line(gs, new RegExp(`Inflation ate (₹[\\d,]+) of ${me.name}'s cash`))?.[1]
      const market = idx
        ? `The market moved: your index fund went ${pct(gs.lastMarketTick?.changes.index)}, ${formatINR(idx.principal)} → ${formatINR(idx.value)}. `
        : ''
      return market +
        `Inflation (${inflationPct(me)}% a year) ate ${ate ?? 'some'} of your idle cash: prices went up, so the same rupees buy less. ` +
        'Cash that just sits there quietly shrinks.'
    },
    target: () => PORTFOLIO,
  },
  {
    id: 'lure', lesson: 4, kind: 'next',
    title: 'Life event: a “hot tip”',
    body: ({ gs }) => {
      const amt = line(gs, /fell for it: (₹[\d,]+)/)?.[1]
      return `Each year can bring a life event. Rahul got a WhatsApp tip — “guaranteed 30% a month!” — and put ${amt ?? 'money'} into it. ` +
        'Let’s see how that goes.'
    },
    target: () => PLAYERS,
  },
  {
    id: 'pickSave', lesson: 5, kind: 'action',
    title: 'Keep a buffer',
    body: ({ gs }) =>
      `You have ${formatINR(getCash(you(gs)))} in cash. Investing all of it is risky: life throws surprise bills. ` +
      'Keep some cash as an emergency fund.',
    todo: ({ uiPhase }) => (uiPhase === 'decision' ? 'Tap Save.' : 'Tap “Travel vs Savings Dilemma”, then ▶ Play.'),
    target: ({ gs, uiPhase }) => {
      if (uiPhase === 'decision') return { selectors: ['.econ-dopt-save'] }
      const c = you(gs).hand.find(h => isCard(h, CARD_IDS.buffer))
      return c ? { card: c.id } : HAND
    },
    done: ({ gs }) => gs.currentPlayerIndex !== 0 || (gs.round ?? 1) > 2,
  },
  {
    id: 'botTurn2', lesson: 5, kind: 'wait',
    title: 'Saved!',
    body: ({ gs }) =>
      `Your cash is now ${formatINR(getCash(you(gs)))}. Rahul is playing — he invests again and keeps almost no cash.`,
    target: () => PLAYERS,
    done: ({ gs }) => (gs.round ?? 1) >= 3 && gs.currentPlayerIndex === 0,
    allowBot: true,
  },
  {
    id: 'medical', lesson: 6, kind: 'next',
    title: 'Medical emergency!',
    body: ({ gs }) => {
      const bill = line(gs, new RegExp(`💥 ${TUTORIAL_BOT_NAME}: -(₹[\\d,]+)`))?.[1]
      const sold = lines(gs).some(l => l.includes(`${TUTORIAL_BOT_NAME} had to sell`))
      const head = `Rahul slipped and needed hospital care${bill ? ` — his net worth fell by ${bill}` : ''}. `
      const lesson = sold
        ? 'He had too little cash, so he was forced to sell part of his flat in a hurry at a 15% penalty. '
        : ''
      return head + lesson +
        `You keep ${formatINR(getCash(you(gs)))} in cash, so a bill like that would be paid from cash and your investments keep growing. That is what an emergency fund is for.`
    },
    target: () => PLAYERS,
  },
  {
    id: 'equip', lesson: 7, kind: 'action',
    title: 'Get insured',
    body: () =>
      'You drew Health Insurance. Defense cards block a kind of trouble — this one blocks medical bills. ' +
      'Equipping a defense is free: it does not use up your turn.',
    todo: () => 'Tap the glowing “Good Health” card, then 🛡️ Equip.',
    target: ({ gs }) => {
      const c = you(gs).hand.find(h => isCard(h, CARD_IDS.insurance))
      return c ? { card: c.id } : HAND
    },
    done: ({ gs }) => you(gs).activeDefenses.some(d => isCard(d, CARD_IDS.insurance)),
  },
  {
    id: 'freePlay', lesson: 7, kind: 'action',
    title: 'Still your turn',
    body: () => 'Insurance is on. You can still play one card this turn — your call. Invest, save or spend: you know what each does now.',
    todo: () => 'Play any card.',
    target: () => HAND,
    done: ({ gs }) => gs.currentPlayerIndex !== 0 || (gs.round ?? 1) > 3,
  },
  {
    id: 'botTurn3', lesson: 7, kind: 'wait',
    title: 'Rahul’s turn',
    body: () => 'Rahul plays. Then another year passes…',
    target: () => PLAYERS,
    done: ({ gs }) => (gs.round ?? 1) >= 4 && gs.currentPlayerIndex === 0,
    allowBot: true,
  },
  {
    id: 'scam', lesson: 8, kind: 'next',
    title: 'Where did the hot tip go?',
    body: ({ gs }) => {
      const wiped = lines(gs).some(l => l.startsWith(`☠️ ${TUTORIAL_BOT_NAME}'s`))
      const blocked = lines(gs).some(l => l.includes('Health Insurance blocked'))
      return (wiped
        ? 'Rahul’s “guaranteed” tip crashed two years in a row and is now wiped out. Guaranteed high returns are how scams work. '
        : 'Rahul’s “guaranteed” tip keeps crashing. Guaranteed high returns are how scams work. ') +
        (blocked ? 'And a hospital bill hit you this year — your Health Insurance blocked it, so you paid nothing.' : '')
    },
    target: () => ({ selectors: ['.econ-year-strip', '.dk-rail .econ-defenses', '.desktop-players-strip', '.mb-players'] }),
  },
]

export function stepIndex(id: StepId): number {
  return STEPS.findIndex(s => s.id === id)
}
