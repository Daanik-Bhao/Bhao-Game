import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { GameState, GameCard as GameCardType, DecisionChoice } from '../types/game'
import type { MpActionResponse, MpAction, MpEvent, MpPublicState } from '../types/multiplayer'
import { canEquip, previewDecision, TURN_TIME_LIMIT_MS } from '../lib/gameEngine'
import { computePlacements, toBoardState, withOwnHand, HEARTBEAT_MS } from '../lib/multiplayerAuthority'
import { fetchGameSnapshot, invokeGameAction, leaveRoom, sendHeartbeat, subscribeToGame } from '../lib/multiplayerEngine'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { ForfeitModal } from '../components/ForfeitModal'
import { playSound } from '../lib/audio'
import { GameBoard, UIPhase } from '../components/game/GameBoard'
import { useTranslation } from 'react-i18next'
import { progressOwnerKey } from '../lib/campaignProgress'
import { useRoomComms } from '../hooks/useRoomComms'
import { reportPlayer } from '../lib/reports'
import { useAppResume, useBackButton, useKeepAwake } from '../hooks/useBackButton'
import { ChatBubble, ChatPanel, CommsControls, PokeOverlay, voiceBadges } from '../components/game/RoomComms'
import { Modal, OfflineBanner, PageLoader, useToast, useToastPlacement } from '../components/ui'
import { OutcomeBanner, type OutcomeInfo } from '../components/game/OutcomeBanner'
import { ResultScreen } from './game/ResultScreen'
import './game/game-screens.css'
import { localizeEngineText } from '../components/game/economyUi'

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
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const { user, profile, refreshProfile, isMinor } = useAuth()
  const { t } = useTranslation()

  const [publicGs, setPublicGs] = useState<MpPublicState | null>(null)
  const [myHand, setMyHand] = useState<{ hand: GameCardType[]; version: number } | null>(null)
  const [pending, setPending] = useState<LocalPending>(null)
  const [busy, setBusy] = useState(false)
  const [outcome, setOutcome] = useState<OutcomeInfo | null>(null)
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
  const resultHandledRef = useRef(false)
  /** Bumped to rebuild the realtime subscription (e.g. it closed while the app was in the background). */
  const [channelEpoch, setChannelEpoch] = useState(0)
  const resyncInFlightRef = useRef(false)

  // Social layer: chat, pokes and voice (cosmetic, never part of the game state).
  const playerIds = useMemo(() => publicGs?.players.map(p => p.id) ?? [], [publicGs?.players])
  // 13–17 players: quick chat only, no typed chat, no voice (docs/age-policy.md, child-safe defaults).
  const comms = useRoomComms({ channelRef, myId: myPlayerId, playerIds, onlineIds: onlinePlayers, childSafe: isMinor })
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

  // Notifications go through the shared toast queue (spec §D.7), shown under the board's top bar.
  const toast = useToast()
  useToastPlacement('top')
  const notify = useCallback((text: string, error = false) => {
    toast.show(text, { tone: error ? 'loss' : 'info', duration: error ? 4500 : 3000 })
  }, [toast])

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
  }, [roomId, myPlayerId, applyPublic, applyHand, showEmote, channelEpoch])

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
      if (!res.ok) notify(res.message ? localizeEngineText(res.message) : t('game.actionFailed'), true)
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
      notify(gameState.equippedThisTurn ? t('result.oneDefense') : t('result.slotsFull', { max: 3 }), true)
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
      notify(localizeEngineText(preview.disabled), true)
      return
    }
    const res = await send({ type: 'decision', cardId: card.id, choice })
    setPending(null)
    if (res?.ok) {
      // Outcome banner (spec §E.14) — the server's result arrives via realtime; the preview is the same rule.
      setOutcome({
        kind: choice,
        delta: preview.netWorthDelta,
        investAmount: choice === 'invest' ? preview.investAmount : undefined,
        asset: choice === 'invest' ? preview.asset : undefined,
        cardName: card.name,
        insight: card.options?.find(o => o.type === choice)?.mentorInsight ?? card.mentorInsight,
      })
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

  // --- Back to the foreground (app resume / tab visible again): heartbeat now, refetch the
  //     room + our hand, and rebuild the realtime channel if it died in the background ---
  const resync = useCallback(async () => {
    if (!roomId || !myPlayerId) return
    sendHeartbeat(roomId).catch(() => { /* the interval retries */ })
    const channelState = channelRef.current ? String(channelRef.current.state) : 'closed'
    if (channelState === 'closed' || channelState === 'errored') {
      // A closed channel never rejoins on its own; an errored one may sit in back-off for a
      // long time after a background stint. A fresh subscription re-fetches on SUBSCRIBED.
      setChannelEpoch(e => e + 1)
    }
    if (resyncInFlightRef.current) return
    resyncInFlightRef.current = true
    try {
      const snap = await fetchGameSnapshot(roomId, myPlayerId)
      if (snap.publicState) applyPublic(snap.publicState)
      if (snap.hand) applyHand(snap.hand.hand, snap.hand.version)
    } catch (e) {
      console.warn('[mp] resync failed', e)
    } finally {
      resyncInFlightRef.current = false
    }
  }, [roomId, myPlayerId, applyPublic, applyHand])
  useAppResume(() => { void resync() }, !!roomId && !!myPlayerId)

  // --- Android back button + keep-awake ---
  const gameInProgress = uiPhase !== 'loading' && uiPhase !== 'result'
  useKeepAwake(gameInProgress)
  // Back never silently leaves a running game: drop a half-made pick, else ask to forfeit.
  useBackButton(() => {
    if (pending) { setPending(null); return }
    setShowForfeitModal(true)
  }, gameInProgress)
  // Result screen: leave the room the same way the Dashboard button does.
  useBackButton(() => {
    if (roomId && myPlayerId) leaveRoom(roomId, myPlayerId).catch(() => { /* ignore */ })
    navigate('/dashboard')
  }, uiPhase === 'result')
  // Overlays register when they open, so they sit above the handlers above.
  useBackButton(() => comms.setPanelOpen(false), comms.panelOpen)
  useBackButton(() => setShowForfeitModal(false), showForfeitModal)

  // ---- Render ----

  if (uiPhase === 'loading' || !gameState) {
    return <PageLoader delay={0} />
  }

  if (uiPhase === 'result') {
    // Same order the server used for placements (winner first, forfeits last)
    const order = computePlacements(gameState).map(pl => pl.playerId)
    const leaveTo = async (path: string) => {
      if (roomId && myPlayerId) {
        await leaveRoom(roomId, myPlayerId).catch(() => { })
      }
      navigate(path)
    }
    const myIndex = Math.max(0, gameState.players.findIndex(p => p.id === myPlayerId))
    return (
      <ResultScreen
        gameState={gameState}
        humanIndex={myIndex}
        mode="multiplayer"
        levelStars={null}
        rpChange={0}
        ownerKey={progressOwnerKey(user?.id ?? myPlayerId)}
        order={order}
        onHome={() => void leaveTo('/dashboard')}
        onBackToLobby={() => void leaveTo('/multiplayer')}
        onOpenLibrary={() => void leaveTo('/library')}
      />
    )
  }

  const mpMode = publicGs?.multiplayerMode
  return (
    <div className="game-page mp-page">
      <OfflineBanner />
      <ForfeitModal
        open={showForfeitModal}
        ranked
        onCancel={() => setShowForfeitModal(false)}
        onConfirm={handleForfeit}
      />
      <Modal
        open={connectionStatus === 'disconnected'}
        gullu="worried"
        title={t('game.connectionLost')}
        body={t('game.reconnecting')}
      >
        <span className="loader-dots mp-reconnect" aria-hidden="true"><i /><i /><i /></span>
      </Modal>
      {busy && <div role="status" className="mp-busy">{t('game.sendingMove')}</div>}
      <ChatBubble comms={comms} nameOf={nameOfPlayer} myId={myPlayerId} />
      <PokeOverlay comms={comms} nameOf={nameOfPlayer} />
      <ChatPanel
        comms={comms}
        players={commsPlayers}
        myId={myPlayerId}
        onReport={user ? (playerId, reason, details) =>
          reportPlayer({ reportedId: playerId, roomId, reason, details, feed: comms.feed }) : undefined}
      />
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
        modeTitle={t('game.mpTitle')}
        modeSubtitle={mpMode ? t(`lobby.modes.${mpMode}`) : undefined}
        onQuit={() => setShowForfeitModal(true)}
      />
      <OutcomeBanner info={outcome} onNext={() => setOutcome(null)} />
    </div>
  )
}
