import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { sendComms, type CommsEvent } from '../lib/multiplayerEngine'
import {
  RateLimiter, appendFeed, makeCommsId, parseChatWire, parsePokeWire, sanitizeChatText,
  type ChatWire, type FeedItem, type PokeWire, type QuickChatId,
} from '../lib/roomChat'
import { VoiceError, VoiceMesh, parseVoiceSignal, voiceUnsupportedReason, type VoiceErrorCode, type VoiceSnapshot } from '../lib/voiceChat'
import { playSound } from '../lib/audio'
import { vibrate } from '../lib/native'

const EMPTY_VOICE: VoiceSnapshot = { joined: false, joining: false, muted: false, members: {}, speaking: [] }
const POKE_SHOW_MS = 2600
const BUBBLE_SHOW_MS = 4000

export interface IncomingPoke { id: string; from: string; emoji: string }

export interface RoomComms {
  feed: FeedItem[]
  unread: number
  panelOpen: boolean
  setPanelOpen: (open: boolean) => void
  /** Latest message from someone else, shown briefly while the panel is closed. */
  bubble: FeedItem | null
  /** A poke aimed at me (drives the full-screen animation). */
  pokeHit: IncomingPoke | null
  sendText: (text: string) => 'ok' | 'empty' | 'limited'
  sendQuick: (id: QuickChatId) => boolean
  poke: (to: string, emoji: string) => boolean
  silenced: Set<string>
  toggleSilenced: (playerId: string) => void
  voice: VoiceSnapshot
  voiceError: VoiceErrorCode | null
  clearVoiceError: () => void
  joinVoice: () => Promise<void>
  leaveVoice: () => void
  toggleMic: () => void
  /**
   * Child-safe room (a 13–17 player): quick chat and pokes only. Typed messages are neither
   * sent nor shown, and voice is off (no voice mesh is created, voice signals are ignored).
   */
  childSafe: boolean
  /** Route channel broadcasts here (from `subscribeToGame`'s `onComms`). */
  handleIncoming: (event: CommsEvent, payload: unknown) => void
  /** Call when the channel (re)subscribes. */
  onConnected: () => void
}

/**
 * Chat, pokes and voice for one multiplayer room. Cosmetic only: nothing here touches
 * the game state. `playerIds` = everyone in the game (messages from anyone else are
 * dropped); `onlineIds` = presence, used to drop voice peers that went away.
 */
export function useRoomComms({ channelRef, myId, playerIds, onlineIds, childSafe = false }: {
  channelRef: MutableRefObject<RealtimeChannel | null>
  myId: string
  playerIds: string[]
  onlineIds: Set<string>
  /** 13–17 player: quick chat + pokes only, no typed chat, no voice (docs/age-policy.md). */
  childSafe?: boolean
}): RoomComms {
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [unread, setUnread] = useState(0)
  const [panelOpen, setPanelOpenState] = useState(false)
  const [bubble, setBubble] = useState<FeedItem | null>(null)
  const [pokeHit, setPokeHit] = useState<IncomingPoke | null>(null)
  const [silenced, setSilenced] = useState<Set<string>>(new Set())
  const [voice, setVoice] = useState<VoiceSnapshot>(EMPTY_VOICE)
  const [voiceError, setVoiceError] = useState<VoiceErrorCode | null>(null)

  const panelOpenRef = useRef(false)
  const silencedRef = useRef(silenced)
  silencedRef.current = silenced
  const playersRef = useRef(new Set(playerIds))
  playersRef.current = new Set(playerIds)
  const meshRef = useRef<VoiceMesh | null>(null)
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pokeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // What I may send…
  const myChatLimit = useRef(new RateLimiter(5, 10_000))
  const myPokeLimit = useRef(new RateLimiter(1, 2_500))
  const myPokeBurst = useRef(new RateLimiter(6, 30_000))
  // …and what I accept from each sender (a modified client could flood the channel).
  const inChatLimit = useRef(new RateLimiter(8, 10_000))
  const inPokeLimit = useRef(new RateLimiter(5, 10_000))
  const inVoiceLimit = useRef(new RateLimiter(40, 10_000))

  const setPanelOpen = useCallback((open: boolean) => {
    panelOpenRef.current = open
    setPanelOpenState(open)
    if (open) {
      setUnread(0)
      setBubble(null)
    }
  }, [])

  const showBubble = useCallback((item: FeedItem) => {
    setBubble(item)
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
    bubbleTimer.current = setTimeout(() => setBubble(null), BUBBLE_SHOW_MS)
  }, [])

  const addFromOthers = useCallback((item: FeedItem) => {
    setFeed(f => appendFeed(f, item))
    if (!panelOpenRef.current) {
      setUnread(n => n + 1)
      showBubble(item)
      playSound('chat')
    }
  }, [showBubble])

  // --- voice mesh lifecycle ---------------------------------------------------
  useEffect(() => {
    if (!myId || childSafe) return
    const mesh = new VoiceMesh({
      selfId: myId,
      transport: { send: sig => { void sendComms(channelRef.current, 'voice', sig) } },
      onChange: setVoice,
    })
    meshRef.current = mesh
    const leaveOnUnload = () => mesh.destroy()
    window.addEventListener('pagehide', leaveOnUnload)
    return () => {
      window.removeEventListener('pagehide', leaveOnUnload)
      mesh.destroy()
      meshRef.current = null
      setVoice(EMPTY_VOICE)
    }
  }, [myId, channelRef, childSafe])

  // Drop voice peers who are no longer in the room.
  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh || onlineIds.size === 0) return
    Object.keys(mesh.snapshot().members).forEach(id => {
      if (id !== myId && !onlineIds.has(id)) mesh.removeMember(id)
    })
  }, [onlineIds, myId])

  useEffect(() => () => {
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
    if (pokeTimer.current) clearTimeout(pokeTimer.current)
  }, [])

  // --- incoming ---------------------------------------------------------------
  const handleIncoming = useCallback((event: CommsEvent, payload: unknown) => {
    if (event === 'chat') {
      const msg = parseChatWire(payload)
      if (!msg || msg.from === myId || !playersRef.current.has(msg.from)) return
      // Child-safe: typed messages from others are dropped; preset quick chat still shows.
      if (childSafe && msg.kind === 'text') return
      if (!inChatLimit.current.allow(msg.from) || silencedRef.current.has(msg.from)) return
      addFromOthers({ ...msg, at: Date.now() })
    } else if (event === 'poke') {
      const p = parsePokeWire(payload)
      if (!p || p.from === myId || !playersRef.current.has(p.from) || !playersRef.current.has(p.to)) return
      if (!inPokeLimit.current.allow(p.from) || silencedRef.current.has(p.from)) return
      setFeed(f => appendFeed(f, { id: p.id, at: Date.now(), from: p.from, kind: 'poke', to: p.to, emoji: p.emoji }))
      if (p.to === myId) {
        setPokeHit({ id: p.id, from: p.from, emoji: p.emoji })
        if (pokeTimer.current) clearTimeout(pokeTimer.current)
        pokeTimer.current = setTimeout(() => setPokeHit(null), POKE_SHOW_MS)
        playSound('poke')
        vibrate([90, 50, 90])
      }
    } else if (event === 'voice') {
      const sig = parseVoiceSignal(payload)
      if (!sig || !playersRef.current.has(sig.from) || !inVoiceLimit.current.allow(sig.from)) return
      void meshRef.current?.handleSignal(sig)
    }
  }, [myId, addFromOthers, childSafe])

  const onConnected = useCallback(() => {
    meshRef.current?.announce()
  }, [])

  // --- outgoing ---------------------------------------------------------------
  const sendText = useCallback((raw: string): 'ok' | 'empty' | 'limited' => {
    const text = sanitizeChatText(raw)
    if (!text || !myId || childSafe) return 'empty'
    if (!myChatLimit.current.allow()) return 'limited'
    const wire: ChatWire = { id: makeCommsId(), from: myId, kind: 'text', text }
    setFeed(f => appendFeed(f, { ...wire, at: Date.now() }))
    void sendComms(channelRef.current, 'chat', wire)
    return 'ok'
  }, [myId, channelRef, childSafe])

  const sendQuick = useCallback((quickId: QuickChatId) => {
    if (!myId || !myChatLimit.current.allow()) return false
    const wire: ChatWire = { id: makeCommsId(), from: myId, kind: 'quick', quickId }
    setFeed(f => appendFeed(f, { ...wire, at: Date.now() }))
    void sendComms(channelRef.current, 'chat', wire)
    return true
  }, [myId, channelRef])

  const poke = useCallback((to: string, emoji: string) => {
    if (!myId || to === myId || !myPokeLimit.current.allow() || !myPokeBurst.current.allow()) return false
    const wire: PokeWire = { id: makeCommsId(), from: myId, to, emoji }
    if (!parsePokeWire(wire)) return false
    setFeed(f => appendFeed(f, { ...wire, at: Date.now(), kind: 'poke' }))
    void sendComms(channelRef.current, 'poke', wire)
    return true
  }, [myId, channelRef])

  const toggleSilenced = useCallback((playerId: string) => {
    setSilenced(prev => {
      const next = new Set(prev)
      if (next.has(playerId)) next.delete(playerId)
      else next.add(playerId)
      meshRef.current?.setPeerSilenced(playerId, next.has(playerId))
      return next
    })
  }, [])

  // --- voice controls -----------------------------------------------------------
  const joinVoice = useCallback(async () => {
    if (childSafe) return
    const reason = voiceUnsupportedReason()
    if (reason) {
      setVoiceError(reason)
      return
    }
    setVoiceError(null)
    try {
      await meshRef.current?.join()
    } catch (e) {
      setVoiceError(e instanceof VoiceError ? e.code : 'mic_denied')
    }
  }, [childSafe])

  const leaveVoice = useCallback(() => meshRef.current?.leave(), [])

  const toggleMic = useCallback(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const snap = mesh.snapshot()
    if (snap.joined) mesh.setMuted(!snap.muted)
  }, [])

  const clearVoiceError = useCallback(() => setVoiceError(null), [])

  return {
    feed, unread, panelOpen, setPanelOpen, bubble, pokeHit,
    sendText, sendQuick, poke, silenced, toggleSilenced,
    voice, voiceError, clearVoiceError, joinVoice, leaveVoice, toggleMic,
    childSafe, handleIncoming, onConnected,
  }
}
