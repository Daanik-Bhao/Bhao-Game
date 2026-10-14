import { useEffect, useMemo, useState } from 'react'
import { Mic, MessageCircle } from 'lucide-react'
import { GameBoard, type BoardSheet, type UIPhase } from '../../components/game/GameBoard'
import { OutcomeBanner, type OutcomeInfo } from '../../components/game/OutcomeBanner'
import { ForfeitModal } from '../../components/ForfeitModal'
import { ALL_CARDS } from '../../data/cards'
import { ARTHA_YATRA_LEVELS } from '../../data/levels'
import { addCash, addHolding } from '../../lib/economy'
import { initGame, initLevelGame } from '../../lib/gameEngine'
import type { GameCard, GameState, PlayerState } from '../../types/game'
import type { GalleryScreen } from './types'

/* Mock matches built with the real engine (initGame) plus small edits, so every number is real. */

const pick = (pred: (c: GameCard) => boolean, skip = 0) => ALL_CARDS.filter(pred)[skip]
const DECISION = pick(c => c.type === 'decision' && !!c.options?.length && c.tier === 'rare') ?? pick(c => c.type === 'decision')
const DECISION2 = pick(c => c.type === 'decision' && c.tier === 'legendary') ?? pick(c => c.type === 'decision', 3)
const ATTACK = pick(c => c.type === 'action' && c.effect?.target === 'target')
const SHIELD = pick(c => c.type === 'defense' && !!c.blocksCategories?.length) ?? pick(c => c.type === 'defense')
const EXTRA = pick(c => c.type === 'decision' && c.tier === 'common', 2)
const HAND = [EXTRA, DECISION, ATTACK, SHIELD, DECISION2].filter(Boolean).map((c, i) => ({ ...c, id: `${c.id}#g${i}` }))

function withYearHistory(p: PlayerState, startOfYear: number, round: number): PlayerState {
  const hist = Array.from({ length: round }, (_, i) => Math.round(startOfYear * (0.7 + (0.3 * i) / Math.max(1, round - 1))))
  return { ...p, stats: { ...(p.stats ?? ({} as NonNullable<PlayerState['stats']>)), netWorthByRound: hist } as NonNullable<PlayerState['stats']> }
}

function mockMatch(opts: { bots?: number; turn?: 'me' | 'rival'; phase?: 'draw' | 'play'; campaign?: boolean } = {}): GameState {
  const { bots = 3, turn = 'me', phase = 'play', campaign = false } = opts
  const base = campaign
    ? initLevelGame({ id: 'me', name: 'Tester' }, ARTHA_YATRA_LEVELS[0])
    : initGame({ id: 'me', name: 'Tester' }, bots)
  const round = 3
  const players = base.players.map((p, i) => {
    let q: PlayerState = { ...p, hand: [] }
    if (i === 0) {
      q = addHolding(q, 'index', 'Nifty 50 SIP', 210000, 1)
      q = addHolding(q, 'gold', 'Gold', 90000, 2)
      q = addCash(q, 440500)
      q = { ...q, hand: phase === 'draw' ? HAND.slice(0, 4) : HAND, lifestyleLevel: 2, activeDefenses: [] }
      return withYearHistory(q, 1192300, round)
    }
    q = addCash(q, [910000, 480000, 220000, 640000, 120000][i - 1] ?? 0)
    if (i === 1) q = { ...q, activeDefenses: SHIELD ? [SHIELD] : [] }
    return withYearHistory(q, [1305000, 1010000, 711000, 990000, 600000][i - 1] ?? 600000, round)
  })
  return {
    ...base,
    players,
    round,
    phase,
    currentPlayerIndex: turn === 'me' ? 0 : 1,
    playedCard: DECISION2 ?? null,
    turnStartTime: Date.now(),
    lastMarketTick: { round, changes: { index: 8, gold: 4, fd: 7, equity: 11 } },
    roundNews: { round, lines: ['📅 Year 3', '📊 Market: 📈 +8%  🪙 +4%', `💸 Inflation ate ₹26,430 of Tester's cash`] },
    log: [
      `${players[players.length - 1].name} played ${EXTRA?.name ?? 'Card'} → SAVE (+₹26,000)`,
      `🛡️ ${players[1].name} equipped ${SHIELD?.name ?? 'Shield'}`,
      `${players[1].name} played ${DECISION2?.name ?? 'Card'} → INVEST — ₹40,000 moved into 🪙 Gold`,
      `💸 Inflation ate ₹26,430 of Tester's cash`,
      '📊 Market: 📈 +8%  🪙 +4%',
      '📅 Year 3',
      ...base.log,
    ],
  }
}

const noop = () => {}

interface DemoProps {
  state: GameState
  uiPhase?: UIPhase
  openCard?: string
  sheet?: BoardSheet
  multiplayer?: boolean
  outcome?: OutcomeInfo
  forfeit?: boolean
  yearTick?: boolean
}

/** Board with no-op engine callbacks; decision / targeting phases are local state so sheets open and close. */
function BoardDemo({ state, uiPhase: initialPhase = 'playing', openCard, sheet, multiplayer, outcome, forfeit, yearTick }: DemoProps) {
  const [gs, setGs] = useState(state)
  const [uiPhase, setUiPhase] = useState<UIPhase>(initialPhase)
  const [banner, setBanner] = useState<OutcomeInfo | null>(outcome ?? null)
  const [quit, setQuit] = useState(!!forfeit)
  useEffect(() => {
    if (!yearTick) return
    const id = setTimeout(() => setGs(g => ({ ...g, round: (g.round ?? 1) + 1, roundNews: { round: (g.round ?? 1) + 1, lines: ['📅 Year 4'] } })), 400)
    return () => clearTimeout(id)
  }, [yearTick])
  const comms = useMemo(() => multiplayer ? (
    <>
      <button type="button" className="dockbtn" aria-label="Chat (placeholder)"><MessageCircle size={22} aria-hidden="true" /><span className="badge badge--float">2</span></button>
      <button type="button" className="dockbtn" aria-label="Mic (placeholder)"><Mic size={22} aria-hidden="true" /></button>
    </>
  ) : undefined, [multiplayer])
  return (
    <div className="game-page">
      <GameBoard
        gameState={gs}
        myPlayerId="me"
        isMultiplayer={!!multiplayer}
        uiPhase={uiPhase}
        onDrawCard={() => setGs(g => ({ ...g, phase: 'play', players: g.players.map((p, i) => (i === 0 ? { ...p, hand: HAND } : p)) }))}
        onPlayCard={card => {
          if (card.type === 'decision') { setGs(g => ({ ...g, pendingDecision: { card, playerIndex: 0 } })); setUiPhase('decision') }
          else if (card.type === 'action' && card.effect?.target === 'target') { setGs(g => ({ ...g, pendingTarget: { card, playerIndex: 0, effect: card.effect! } })); setUiPhase('targeting') }
        }}
        onTargetSelect={() => { setGs(g => ({ ...g, pendingTarget: null })); setUiPhase('playing') }}
        onDecision={choice => { setBanner({ kind: choice, delta: choice === 'spend' ? -35000 : 50000, cardName: gs.pendingDecision?.card.name, investAmount: 50000, asset: 'index', concept: 'emergency_fund', insight: gs.pendingDecision?.card.options?.find(o => o.type === choice)?.mentorInsight }); setGs(g => ({ ...g, pendingDecision: null })); setUiPhase('playing') }}
        onTimeout={noop}
        onCancelTargeting={() => { setGs(g => ({ ...g, pendingDecision: null, pendingTarget: null })); setUiPhase('playing') }}
        daanikCoins={0}
        onBuyExtraCard={noop}
        onPass={noop}
        onEquip={noop}
        onSendEmote={multiplayer ? noop : undefined}
        extraControls={comms}
        voiceBadges={multiplayer ? { bot_0: 'speaking', bot_1: 'muted', bot_2: 'on' } : undefined}
        activeEmotes={multiplayer ? { bot_1: '🚀' } : undefined}
        onlinePlayers={multiplayer ? new Set(['me', 'bot_0', 'bot_1', 'bot_2']) : undefined}
        modeTitle={multiplayer ? 'Ranked' : gs.levelConfig ? 'Level 1 · Brahmacharya' : 'Practice'}
        modeSubtitle={multiplayer ? 'Friends room K7Q2M' : 'vs 3 bots · race to ₹50 L'}
        onQuit={() => setQuit(true)}
        initialOpenCardId={openCard}
        initialSheet={sheet}
      />
      <OutcomeBanner info={banner} onNext={() => setBanner(null)} />
      <ForfeitModal open={quit} ranked={!!multiplayer} onCancel={() => setQuit(false)} onConfirm={() => setQuit(false)} />
    </div>
  )
}

function decisionState(): { state: GameState; card: GameCard } {
  const s = mockMatch()
  const card = s.players[0].hand.find(c => c.type === 'decision' && c.tier === DECISION?.tier) ?? s.players[0].hand[1]
  return { state: { ...s, pendingDecision: { card, playerIndex: 0 } }, card }
}

const G = 'Game board (helper B)'
const note = 'Same route at 390×844, 844×390, 768×1024, 1366×768'

export const BOARD_SCREENS: GalleryScreen[] = [
  { path: 'board-play', title: 'Board — play (your turn)', group: G, note, render: () => <BoardDemo state={mockMatch()} /> },
  { path: 'board-draw', title: 'Board — draw state', group: G, note, render: () => <BoardDemo state={mockMatch({ phase: 'draw' })} /> },
  {
    path: 'board-sheet-decision', title: 'Card sheet — decision (choice tiles)', group: G, note,
    render: () => { const d = decisionState(); return <BoardDemo state={d.state} uiPhase="decision" /> },
  },
  { path: 'board-sheet-attack', title: 'Card sheet — attack card', group: G, render: () => <BoardDemo state={mockMatch()} openCard={HAND[2]?.id} /> },
  { path: 'board-sheet-shield', title: 'Card sheet — shield card', group: G, render: () => <BoardDemo state={mockMatch()} openCard={HAND[3]?.id} /> },
  {
    path: 'board-outcome', title: 'Outcome banner — smart save', group: G,
    render: () => <BoardDemo state={mockMatch({ turn: 'rival' })} outcome={{ kind: 'save', delta: 50000, cardName: DECISION?.name, concept: 'emergency_fund', insight: DECISION?.options?.find(o => o.type === 'save')?.mentorInsight }} />,
  },
  {
    path: 'board-outcome-spend', title: 'Outcome banner — treat yourself (amber)', group: G,
    render: () => <BoardDemo state={mockMatch({ turn: 'rival' })} outcome={{ kind: 'spend', delta: -35000, cardName: DECISION?.name, concept: 'lifestyle_creep', insight: DECISION?.options?.find(o => o.type === 'spend')?.mentorInsight }} />,
  },
  {
    path: 'board-outcome-attack', title: 'Outcome banner — attack on you', group: G,
    render: () => <BoardDemo state={mockMatch({ turn: 'rival' })} outcome={{ kind: 'attack', delta: -30000, cardName: ATTACK?.name, sourceName: 'Rahul AI', concept: 'tax_saving' }} />,
  },
  {
    path: 'board-targeting', title: 'Board — targeting (choose a rival)', group: G,
    render: () => { const s = mockMatch(); return <BoardDemo state={{ ...s, pendingTarget: ATTACK ? { card: s.players[0].hand[2], playerIndex: 0, effect: ATTACK.effect! } : null }} uiPhase="targeting" /> },
  },
  { path: 'board-rival-turn', title: "Board — rival's turn (read-only hand)", group: G, render: () => <BoardDemo state={mockMatch({ turn: 'rival' })} /> },
  { path: 'board-year', title: 'Board — year change banner (fires after 0.4 s)', group: G, render: () => <BoardDemo state={mockMatch({ turn: 'rival' })} yearTick /> },
  { path: 'board-campaign', title: 'Board — campaign level 1 (rule pill + level chip)', group: G, render: () => <BoardDemo state={mockMatch({ campaign: true })} /> },
  { path: 'board-multiplayer', title: 'Board — multiplayer, 4 rivals, comms dock slot', group: G, note: 'Placeholder dock buttons; real CommsControls plug in here', render: () => <BoardDemo state={mockMatch({ bots: 4 })} multiplayer /> },
  { path: 'board-pause', title: 'Pause menu', group: G, render: () => <BoardDemo state={mockMatch()} sheet="menu" /> },
  { path: 'board-log', title: 'Game log sheet', group: G, render: () => <BoardDemo state={mockMatch()} sheet="log" /> },
  { path: 'board-portfolio', title: 'Portfolio sheet', group: G, render: () => <BoardDemo state={mockMatch()} sheet="portfolio" /> },
  { path: 'board-year-sheet', title: 'Year summary sheet', group: G, render: () => <BoardDemo state={mockMatch()} sheet="year" /> },
  { path: 'board-forfeit', title: 'Forfeit modal (quit game)', group: G, render: () => <BoardDemo state={mockMatch()} forfeit /> },
]
