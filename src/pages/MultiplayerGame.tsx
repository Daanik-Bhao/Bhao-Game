import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import type { GameState, GameCard as GameCardType, DecisionChoice } from '../types/game'
import { formatWealth } from '../types/game'
import type { MpActionResponse, MpAction, MpEvent, MpPublicState } from '../types/multiplayer'
import { Wealth } from '../components/Wealth'
import { canEquip, previewDecision, assetLabel, TURN_TIME_LIMIT_MS } from '../lib/gameEngine'
import { computePlacements, toBoardState, withOwnHand, HEARTBEAT_MS } from '../lib/multiplayerAuthority'
import { invokeGameAction, leaveRoom, sendHeartbeat, subscribeToGame } from '../lib/multiplayerEngine'
import Confetti from 'react-confetti'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { ForfeitModal } from '../components/ForfeitModal'
import { playSound } from '../lib/audio'
import { GameBoard, UIPhase } from '../components/game/GameBoard'
import { useTranslation } from 'react-i18next'
import { usePreloadImages } from '../hooks/usePreloadImages'
import { GameReportPanel } from '../components/learning/GameReportPanel'
import { progressOwnerKey } from '../lib/campaignProgress'
import { useRoomComms } from '../hooks/useRoomComms'
import { ChatBubble, ChatPanel, CommsControls, PokeOverlay, voiceBadges } from '../components/game/RoomComms'

function GameClock({ startTime, timeLimit }: { startTime: number; timeLimit: number }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const elapsed = now - startTime
  const remaining = Math.max(0, timeLimit - elapsed)
  const minutesLeft = Math.floor(remaining / 60000)
  const secondsLeft = Math.floor((remaining % 60000) / 1000)

  return (
    <div style={{ fontSize: 14, color: minutesLeft < 5 ? '#ef4444' : '#64748b', fontWeight: minutesLeft < 5 ? 700 : 600, display: 'flex', alignItems: 'center', gap: 4 }}>
      ⏱ {minutesLeft}:{secondsLeft.toString().padStart(2, '0')}
    </div>
  )
}

type PagePhase = UIPhase | 'loading' | 'result'

/** Local-only UI hint while the player picks a choice / target. Never sent anywhere. */
type LocalPending =
  | { kind: 'decision'; card: GameCardType }
  | { kind: 'target'; card: GameCardType }
  | null

/** Wait this long past the (server) turn deadline before asking the server to tick. */
const TICK_SLACK_MS = 1500
/** While a deadline is overdue / someone looks offline, re-ask the server this often. */
const TICK_RETRY_MS = 5000
/** Someone merely looks offline (presence): check with the server at most this often. */
const OFFLINE_TICK_MS = 15000
const noop = () => { /* no extra-card purchase in multiplayer */ }

/**
 * Multiplayer game screen (Phase 5): the server owns the game. This page renders the
 * public room state + our own hand row (both via realtime), sends intents to the
 * `game-action` edge function, sends heartbeats and asks for a `tick` when a turn timer
 * runs out. It never mutates the game locally.
 */
export function MultiplayerGame() {
  usePreloadImages()
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const { user, profile, refreshProfile } = useAuth()
  const { t } = useTranslation()
  const [showLog, setShowLog] = useState(false)

  const [publicGs, setPublicGs] = useState<MpPublicState | null>(null)
  const [myHand, setMyHand] = useState<{ hand: GameCardType[]; version: number } | null>(null)
  const [pending, setPending] = useState<LocalPending>(null)
  const [busy, setBusy] = useState(false)
  const [notification, setNotification] = useState<{ text: string; error?: boolean } | null>(null)
  const [showForfeitModal, setShowForfeitModal] = useState(false)
  const [onlinePlayers, setOnlinePlayers] = useState<Set<string>>(new Set())
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('connected')
  const [activeEmotes, setActiveEmotes] = useState<Record<string, string>>({})

  const myPlayerId = profile?.id ?? ''

  const publicRef = useRef<MpPublicState | null>(null)
  const handRef = useRef<{ hand: GameCardType[]; version: number } | null>(null)
  const busyRef = useRef(false)
  const tickInFlightRef = useRef(false)
  const lastTickAtRef = useRef(0)
  const channelRef = useRef<RealtimeChannel | null>(null)
  /** server clock − local clock, learned from function responses */
  const clockOffsetRef = useRef(0)
  const eventsSeenRef = useRef(0)
  const notifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resultHandledRef = useRef(false)

  // Social layer: chat, pokes and voice (cosmetic, never part of the game state).
  const playerIds = useMemo(() => publicGs?.players.map(p => p.id) ?? [], [publicGs?.players])
  const comms = useRoomComms({ channelRef, myId: myPlayerId, playerIds, onlineIds: onlinePlayers })
  const commsRef = useRef(comms)
  commsRef.current = comms
  const commsPlayers = useMemo(
    () => publicGs?.players.map(p => ({ id: p.id, name: p.name, left: p.hasForfeited })) ?? [],
    [publicGs?.players],
  )
  const nameOfPlayer = useCallback(
    (id: string) => id === myPlayerId ? t('board.you') : (commsPlayers.find(p => p.id === id)?.name ?? '?'),
    [commsPlayers, myPlayerId, t],
  )

  const notify = useCallback((text: string, error = false) => {
    setNotification({ text, error })
    if (notifyTimerRef.current) clearTimeout(notifyTimerRef.current)
    notifyTimerRef.current = setTimeout(() => setNotification(null), error ? 4500 : 3000)
  }, [])

  const showEmote = useCallback((playerId: string, emoji: string) => {
    setActiveEmotes(prev => ({ ...prev, [playerId]: emoji }))
    setTimeout(() => {
      setActiveEmotes(prev => {
        const next = { ...prev }
        delete next[playerId]
        return next
      })
    }, 3000)
  }, [])

  // --- Events (sounds + toasts) from the server, once per version ---
  const handleEvents = useCallback((pub: MpPublicState) => {
    if (pub.version <= eventsSeenRef.current) return
    const first = eventsSeenRef.current === 0
    eventsSeenRef.current = pub.version
    if (first) return // initial load: don't replay the last move
    const nameOf = (id?: string | null) => pub.players.find(p => p.id === id)?.name ?? ''
    for (const ev of (pub.lastEvents ?? []) as MpEvent[]) {
      switch (ev.type) {
        case 'draw':
          if (ev.playerId === myPlayerId) playSound('draw')
          break
        case 'decision':
        case 'pass':
          playSound('play')
          break
        case 'equip':
          playSound('defend')
          if (ev.playerId === myPlayerId) notify(t('game.equippedDefense'))
          break
        case 'action':
          playSound('attack')
          if (ev.targetId === myPlayerId) notify(t('game.hitTarget', { card: ev.cardName ?? '', name: nameOf(ev.targetId) }), true)
          else if (ev.playerId === myPlayerId) {
            notify(ev.targetId
              ? t('game.hitTarget', { card: ev.cardName ?? '', name: nameOf(ev.targetId) })
              : t('game.playedCard', { card: ev.cardName ?? '' }))
          }
          break
        case 'timeout':
          playSound('lose')
          notify(t('game.timeRanOut', { name: nameOf(ev.playerId) }))
          break
        case 'forfeit':
          notify(t('game.forfeited', { name: nameOf(ev.playerId) }))
          break
        case 'disconnect':
          notify(t('game.disconnected', { name: nameOf(ev.playerId) }))
          break
        default:
          break
      }
    }
  }, [myPlayerId, notify, t])

  // --- Apply server data (version-gated, so out-of-order realtime messages are ignored) ---
  const applyPublic = useCallback((pub: MpPublicState) => {
    const cur = publicRef.current
    if (cur && pub.version < cur.version) return
    publicRef.current = pub
    setPublicGs(pub)
    handleEvents(pub)
  }, [handleEvents])

  const applyHand = useCallback((hand: GameCardType[], version: number) => {
    const cur = handRef.current
    if (cur && version < cur.version) return
    handRef.current = { hand, version }
    setMyHand(handRef.current)
  }, [])

  const applyResponse = useCallback((res: MpActionResponse) => {
    if (typeof res.serverNow === 'number') clockOffsetRef.current = res.serverNow - Date.now()
    if (res.view) {
      applyPublic(res.view)
      const mine = res.view.players.find(p => p.id === myPlayerId)
      if (mine && typeof res.version === 'number') applyHand(mine.hand, res.version)
    }
  }, [applyPublic, applyHand, myPlayerId])

  // --- Realtime subscription + initial load ---
  useEffect(() => {
    if (!roomId || !myPlayerId) return
    const channel = subscribeToGame(roomId, myPlayerId, {
      onPublic: applyPublic,
      onHand: applyHand,
      onPresence: setOnlinePlayers,
      onEmote: (playerId, emoji) => { if (!commsRef.current.silenced.has(playerId)) showEmote(playerId, emoji) },
      onStatus: (status) => {
        setConnectionStatus(status)
        if (status === 'connected') commsRef.current.onConnected()
      },
      onComms: (event, payload) => commsRef.current.handleIncoming(event, payload),
    })
    channelRef.current = channel
    return () => {
      channelRef.current = null
      channel.unsubscribe()
    }
  }, [roomId, myPlayerId, applyPublic, applyHand, showEmote])

  // --- Heartbeat every 10 s (the server forfeits players whose heartbeat goes stale) ---
  useEffect(() => {
    if (!roomId || !myPlayerId) return
    const beat = () => { sendHeartbeat(roomId).catch(() => { /* the next beat retries */ }) }
    beat()
    const id = setInterval(beat, HEARTBEAT_MS)
    return () => clearInterval(id)
  }, [roomId, myPlayerId])

  // --- Send an intent; the action buttons are hidden while it is in flight ---
  const send = useCallback(async (action: MpAction): Promise<MpActionResponse | null> => {
    if (!roomId || busyRef.current) return null
    busyRef.current = true
    setBusy(true)
    try {
      const res = await invokeGameAction(roomId, action)
      applyResponse(res)
      if (!res.ok) notify(res.message ?? 'Something went wrong — please try again.', true)
      return res
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }, [roomId, applyResponse, notify])

  /** Ask the server to apply timeouts / disconnects. Silent: the server decides. */
  const requestTick = useCallback(async () => {
    if (!roomId || tickInFlightRef.current) return
    const pub = publicRef.current
    if (!pub || pub.phase === 'game_over') return
    tickInFlightRef.current = true
    lastTickAtRef.current = Date.now()
    try {
      applyResponse(await invokeGameAction(roomId, { type: 'tick' }))
    } finally {
      tickInFlightRef.current = false
    }
  }, [roomId, applyResponse])

  // --- Tick when the turn deadline (server time) passes, and keep nudging while it is overdue
  //     or while an active player looks offline (the server forfeits stale heartbeats) ---
  useEffect(() => {
    if (!publicGs || publicGs.phase === 'game_over') return
    const isMine = publicGs.players[publicGs.currentPlayerIndex]?.id === myPlayerId
    // Spread the other clients' ticks out a little; the active player ticks first.
    const jitter = isMine ? 0 : 500 + Math.floor(Math.random() * 1500)
    const deadlineLocal = publicGs.turnStartTime + TURN_TIME_LIMIT_MS - clockOffsetRef.current
    const first = setTimeout(requestTick, Math.max(0, deadlineLocal - Date.now()) + TICK_SLACK_MS + jitter)
    const retry = setInterval(() => {
      const overdue = Date.now() > deadlineLocal + TICK_SLACK_MS
      const someoneOffline = onlinePlayers.size > 0 && publicGs.players.some(p => !p.hasForfeited && !onlinePlayers.has(p.id))
      if (overdue || (someoneOffline && Date.now() - lastTickAtRef.current >= OFFLINE_TICK_MS)) requestTick()
    }, TICK_RETRY_MS + jitter)
    return () => {
      clearTimeout(first)
      clearInterval(retry)
    }
  }, [publicGs, myPlayerId, onlinePlayers, requestTick])

  // --- View: public state + own hand (+ local pick hint), shifted onto the local clock ---
  const gameState: GameState | null = useMemo(() => {
    if (!publicGs) return null
    const merged = toBoardState(withOwnHand(publicGs, myPlayerId, myHand?.hand ?? null))
    const offset = clockOffsetRef.current
    const myIndex = merged.players.findIndex(p => p.id === myPlayerId)
    const board: GameState = {
      ...merged,
      startTime: merged.startTime - offset,
      turnStartTime: merged.turnStartTime - offset,
      pendingDecision: pending?.kind === 'decision' ? { card: pending.card, playerIndex: myIndex } : null,
      pendingTarget: pending?.kind === 'target' && pending.card.effect
        ? { card: pending.card, playerIndex: myIndex, effect: pending.card.effect }
        : null,
    }
    // While a request is in flight, hide the action buttons (no double sends).
    return busy && board.phase !== 'game_over' ? { ...board, phase: 'effect' } : board
  }, [publicGs, myHand, myPlayerId, pending, busy])

  const myPlayerIndex = gameState?.players.findIndex(p => p.id === myPlayerId) ?? -1
  const myPlayer = myPlayerIndex >= 0 ? gameState?.players[myPlayerIndex] ?? null : null
  const isMyTurn = !!publicGs && publicGs.phase === 'play' && publicGs.players[publicGs.currentPlayerIndex]?.id === myPlayerId

  // Drop a half-made pick if the turn moved on (timeout, forfeit...) or the card is gone
  useEffect(() => {
    if (!pending) return
    if (!isMyTurn || (myHand && !myHand.hand.some(c => c.id === pending.card.id))) setPending(null)
  }, [isMyTurn, pending, myHand])

  const uiPhase: PagePhase = !gameState
    ? 'loading'
    : gameState.phase === 'game_over'
      ? 'result'
      : pending?.kind === 'decision' ? 'decision' : pending?.kind === 'target' ? 'targeting' : 'playing'

  // Game over: the server already settled RP / XP / coins — play the sound and refresh the profile.
  useEffect(() => {
    if (!publicGs || publicGs.phase !== 'game_over' || resultHandledRef.current) return
    resultHandledRef.current = true
    playSound(publicGs.winner?.id === myPlayerId ? 'win' : 'lose')
    setTimeout(() => { refreshProfile() }, 1500)
  }, [publicGs, myPlayerId, refreshProfile])

  // "Year N" news (market, inflation, life event) whenever a new round starts
  const lastNewsRoundRef = useRef(0)
  useEffect(() => {
    const news = publicGs?.roundNews
    if (!news || news.round <= lastNewsRoundRef.current || publicGs?.phase === 'game_over') return
    lastNewsRoundRef.current = news.round
    notify(news.lines.slice(0, 4).join(' · '))
  }, [publicGs?.roundNews, publicGs?.phase, notify])

  // --- Game action handlers: intents only, the server applies the rules ---

  async function handleDrawCard() {
    if (!publicGs || publicGs.phase !== 'draw' || publicGs.players[publicGs.currentPlayerIndex]?.id !== myPlayerId) return
    await send({ type: 'draw' })
  }

  const sendEmote = useCallback(async (emoji: string) => {
    if (!myPlayerId) return
    showEmote(myPlayerId, emoji)
    // Emotes are cosmetic: realtime broadcast only, never part of the game state.
    await channelRef.current?.send({ type: 'broadcast', event: 'emote', payload: { playerId: myPlayerId, emoji } })
  }, [myPlayerId, showEmote])

  async function handlePlayCard(card: GameCardType) {
    if (!gameState || !isMyTurn || busyRef.current) return
    if (card.type === 'decision') {
      setPending({ kind: 'decision', card })
    } else if (card.type === 'action') {
      if (card.effect?.target === 'target') {
        const opponents = gameState.players.map((p, i) => ({ p, i })).filter(x => x.i !== myPlayerIndex && !x.p.hasForfeited)
        if (opponents.length === 1) {
          await send({ type: 'action', cardId: card.id, targetIndex: opponents[0].i })
        } else {
          setPending({ kind: 'target', card })
        }
      } else {
        await send({ type: 'action', cardId: card.id })
      }
    } else if (card.type === 'defense') {
      await handleEquip(card)
    }
  }

  /** Free equip (once per turn, max 3) — does not end the turn. */
  async function handleEquip(card: GameCardType) {
    if (!gameState || !isMyTurn || busyRef.current) return
    if (canEquip(gameState, myPlayerIndex, card)) {
      await send({ type: 'equip', cardId: card.id })
      return
    }
    if ((myPlayer?.hand ?? []).some(c => c.type !== 'defense')) {
      notify(gameState.equippedThisTurn ? 'You can equip one defense per turn. Play a decision or action card.' : 'Defense slots full (3). Play a decision or action card.', true)
      return
    }
    // Only un-equippable defenses left: discard this one as a Pass so the turn can't get stuck
    await handlePass(card.id)
  }

  /** Pass: discard one card and end the turn. */
  async function handlePass(cardId: string) {
    if (!isMyTurn || busyRef.current) return
    setPending(null)
    await send({ type: 'pass', cardId })
  }

  async function handleDecision(choice: DecisionChoice) {
    if (!gameState || pending?.kind !== 'decision') return
    const card = pending.card
    const preview = previewDecision(gameState, myPlayerIndex, card, choice)
    if (preview.disabled) {
      notify(preview.disabled, true)
      return
    }
    const res = await send({ type: 'decision', cardId: card.id, choice })
    setPending(null)
    if (res?.ok) {
      const insight = card.options?.find(o => o.type === choice)?.mentorInsight
      const moved = choice === 'invest' && preview.asset ? ` ₹${preview.investAmount.toLocaleString()} moved into ${assetLabel(preview.asset)}.` : ''
      notify(`${choice.charAt(0).toUpperCase() + choice.slice(1)}!${moved}${insight ? ` 💡 ${insight}` : ''}`)
    }
  }

  async function handleTargetSelect(targetIndex: number) {
    if (pending?.kind !== 'target') return
    await send({ type: 'action', cardId: pending.card.id, targetIndex })
    setPending(null)
  }

  const handleTimeout = useCallback(() => { requestTick() }, [requestTick])

  const handleForfeit = async () => {
    setShowForfeitModal(false)
    if (!roomId || !myPlayerId) {
      navigate('/dashboard')
      return
    }
    // The server records the forfeit as a last-place loss; no client-side result or coin writes.
    const gameRunning = !!publicRef.current && publicRef.current.phase !== 'game_over'
    Promise.resolve().then(async () => {
      try {
        if (gameRunning) await invokeGameAction(roomId, { type: 'forfeit' })
        await leaveRoom(roomId, myPlayerId).catch(() => { /* ignore */ })
      } catch (e) {
        console.error(e)
      }
    })
    navigate('/dashboard')
  }

  // ---- Render ----

  if (uiPhase === 'loading' || !gameState) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--green-black)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          border: '3px solid var(--green-primary)',
          borderTopColor: 'var(--gold)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <div style={{ color: 'var(--gray)', fontSize: 18 }}>Loading game...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (uiPhase === 'result') {
    // Same order the server used for placements (winner first, forfeits last)
    const byId = new Map(gameState.players.map(p => [p.id, p]))
    const sorted = computePlacements(gameState).map(pl => byId.get(pl.playerId)!).filter(Boolean)
    const myFinalPlayer = gameState.players.find(p => p.id === myPlayerId)
    const isWinner = gameState.winner?.id === myPlayerId
    const placement = sorted.findIndex(p => p.id === myPlayerId) + 1
    const ordinal = placement === 1 ? 'st' : placement === 2 ? 'nd' : placement === 3 ? 'rd' : 'th'
    const leaveTo = async (path: string) => {
      if (roomId && myPlayerId) {
        await leaveRoom(roomId, myPlayerId).catch(() => { })
      }
      navigate(path)
    }

    return (
      <div style={{ minHeight: '100vh', background: 'var(--green-black)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(16px, 4vw, 24px)', paddingBottom: 0 }}>
        {isWinner && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} colors={['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#f1f5f9']} />}
        <div style={{ width: '100%', maxWidth: 900, textAlign: 'center', zIndex: 10 }}>
          <div style={{ fontSize: 'clamp(50px, 15vw, 80px)', marginBottom: 16 }}>
            {isWinner ? '🏆' : placement === 2 ? '🥈' : placement === 3 ? '🥉' : '💪'}
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 8vw, 40px)', fontWeight: 800, fontFamily: 'var(--font-display)', color: isWinner ? 'var(--gold)' : 'var(--green-light)', marginBottom: 8 }}>
            {isWinner ? 'Victory!' : `${placement}${ordinal} Place`}
          </h1>
          <p style={{ color: 'var(--gray)', marginBottom: 20, fontSize: 20 }}>
            {t('game.finalWealth', { amount: formatWealth(myFinalPlayer?.wealth ?? 0) })}
          </p>

          {myFinalPlayer && (
            <GameReportPanel
              state={gameState}
              playerId={myFinalPlayer.id}
              ownerKey={progressOwnerKey(user?.id ?? myPlayerId)}
              onOpenLibrary={() => leaveTo('/library')}
            />
          )}

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', marginBottom: 16, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
            <div style={{ flex: '1 1 280px', background: 'var(--green-deep)', border: '1px solid var(--green-primary)', borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {t('game.finalRankings')}
              </h3>
              {sorted.map((p, i) => (
                <div key={p.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: i < sorted.length - 1 ? '1px solid var(--green-primary)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 25, width: 28 }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                    <span style={{
                      fontSize: 18,
                      fontWeight: p.id === myPlayerId ? 700 : 500,
                      color: p.id === myPlayerId ? 'var(--green-bright)' : 'var(--green-light)',
                    }}>
                      {p.name}{p.id === myPlayerId ? ' (you)' : ''}
                    </span>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--green-bright)', fontFamily: 'Space Grotesk, sans-serif' }}>
                    <Wealth amount={p.wealth} />
                  </span>
                </div>
              ))}
            </div>

            {/* Match Highlights (collapsed by default; the report card above is the summary) */}
            {gameState.log && gameState.log.length > 0 && (
              <div style={{ flex: '1 1 100%', display: 'flex', justifyContent: 'center' }}>
                <button className="rc-log-toggle" aria-expanded={showLog} onClick={() => setShowLog(v => !v)}>
                  {showLog ? 'Hide game log ▲' : 'Show game log ▼'}
                </button>
              </div>
            )}
            {showLog && gameState.log && gameState.log.length > 0 && (
              <div style={{ flex: '1 1 280px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, textAlign: 'left', maxHeight: 250, overflowY: 'auto' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray)', marginBottom: 8, textTransform: 'uppercase' }}>Match Highlights</h3>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 14, color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {gameState.log.slice(0, 15).map((entry, idx) => (
                    <li key={idx} style={{ opacity: 1 - (idx * 0.05), lineHeight: 1.4 }}>• {entry}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', position: 'sticky', bottom: 0, padding: '12px 0 max(16px, env(safe-area-inset-bottom))', background: 'linear-gradient(to bottom, rgba(0,16,16,0), var(--green-black) 35%)', zIndex: 20 }}>
            <div className="btn-rebound" style={{ boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)', borderRadius: 8 }}>
              <Button style={{ minWidth: 200, height: 48 }} onClick={() => leaveTo('/multiplayer')}>Play Again</Button>
            </div>
            <div className="btn-rebound">
              <Button variant="secondary" style={{ minWidth: 200, height: 48 }} onClick={() => leaveTo('/dashboard')}>Dashboard</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'transparent', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }}>
        <button onClick={() => setShowForfeitModal(true)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          ← LEAVE
        </button>
        <div className="desktop-only" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: '#0f172a', position: 'absolute', left: '50%', transform: 'translateX(-50%)', letterSpacing: '-0.02em' }}>
          BH<span style={{ color: '#10b981' }}>AO</span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <GameClock startTime={gameState.startTime} timeLimit={gameState.timeLimit} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
            <span style={{ color: '#16a34a', fontSize: 12, fontWeight: 700 }}>ONLINE</span>
          </div>
        </div>
      </div>

      {showForfeitModal && (
        <ForfeitModal
          onCancel={() => setShowForfeitModal(false)}
          onConfirm={handleForfeit}
        />
      )}

      {connectionStatus === 'disconnected' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000, color: 'white', flexDirection: 'column', gap: 16
        }}>
          <div style={{ width: 44, height: 44, border: '4px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>Connection Lost</h2>
          <p style={{ color: '#94a3b8', fontSize: 18 }}>Attempting to reconnect to game server...</p>
        </div>
      )}

      {notification && (
        <div role={notification.error ? 'alert' : 'status'} style={{
          position: 'fixed', top: 68, right: 20, maxWidth: 'calc(100vw - 40px)',
          background: notification.error ? '#450a0a' : '#1e293b',
          border: `1px solid ${notification.error ? '#ef4444' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 10, padding: '11px 18px',
          fontSize: 18, color: '#f1f5f9', zIndex: 200,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          {notification.error ? '⚠️ ' : ''}{notification.text}
        </div>
      )}
      {busy && (
        <div role="status" style={{
          position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          background: '#0f172a', color: '#e2e8f0', borderRadius: 999, padding: '8px 16px',
          fontSize: 14, fontWeight: 600, zIndex: 210, boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        }}>
          Sending move…
        </div>
      )}
      <ChatBubble comms={comms} nameOf={nameOfPlayer} myId={myPlayerId} />
      <PokeOverlay comms={comms} nameOf={nameOfPlayer} />
      <ChatPanel comms={comms} players={commsPlayers} myId={myPlayerId} />
      {gameState && (
        <GameBoard
          gameState={gameState}
          myPlayerId={myPlayerId}
          isMultiplayer={true}
          uiPhase={uiPhase}
          onlinePlayers={onlinePlayers}
          activeEmotes={activeEmotes}
          onDrawCard={handleDrawCard}
          onPlayCard={handlePlayCard}
          onTargetSelect={handleTargetSelect}
          onDecision={handleDecision}
          onTimeout={handleTimeout}
          onCancelTargeting={() => setPending(null)}
          // Multiplayer has no coin-bought advantages (Phase 5): no extra-card purchase.
          daanikCoins={0}
          onBuyExtraCard={noop}
          onSendEmote={sendEmote}
          extraControls={<CommsControls comms={comms} myId={myPlayerId} />}
          voiceBadges={voiceBadges(comms)}
          onPass={handlePass}
          onEquip={handleEquip}
        />
      )}
    </div>
  )
}
