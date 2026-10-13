/* Dev-only mock data for the /__ux gallery (never imported by production code). */
import { useMemo, useState } from 'react'
import type { RoomComms } from '../hooks/useRoomComms'
import type { FeedItem } from '../lib/roomChat'

export const MOCK_PLAYERS = [
  { id: 'me', name: 'Tester' },
  { id: 'p-rahul', name: 'Rahul' },
  { id: 'p-priya', name: 'Priya' },
  { id: 'p-aman', name: 'Aman' },
]

const MOCK_FEED: FeedItem[] = [
  { id: 'f1', at: 1, from: 'p-rahul', kind: 'quick', quickId: 'niceMove' },
  { id: 'f2', at: 2, from: 'me', kind: 'text', text: 'Thanks! Saving for the crash 😄' },
  { id: 'f3', at: 3, from: 'p-priya', kind: 'poke', to: 'p-aman', emoji: '👉' },
  { id: 'f4', at: 4, from: 'p-aman', kind: 'text', text: 'Bachke! Market crash card coming.' },
]

/** A fake RoomComms (chat, pokes, voice) that works without Supabase or a microphone. */
export function useMockComms(opts: { panelOpen?: boolean; unread?: number; voice?: 'off' | 'live' | 'muted' } = {}): RoomComms {
  const [panelOpen, setPanelOpen] = useState(!!opts.panelOpen)
  const [feed, setFeed] = useState<FeedItem[]>(MOCK_FEED)
  const [silenced, setSilenced] = useState<Set<string>>(new Set())
  const [voice, setVoice] = useState(opts.voice ?? 'off')
  return useMemo<RoomComms>(() => ({
    feed,
    unread: panelOpen ? 0 : opts.unread ?? 2,
    panelOpen,
    setPanelOpen,
    bubble: null,
    pokeHit: null,
    sendText: text => { if (!text.trim()) return 'empty'; setFeed(f => [...f, { id: String(f.length + 1), at: Date.now(), from: 'me', kind: 'text', text }]); return 'ok' },
    sendQuick: id => { setFeed(f => [...f, { id: String(f.length + 1), at: Date.now(), from: 'me', kind: 'quick', quickId: id }]); return true },
    poke: (to, emoji) => { setFeed(f => [...f, { id: String(f.length + 1), at: Date.now(), from: 'me', kind: 'poke', to, emoji }]); return true },
    silenced,
    toggleSilenced: id => setSilenced(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n }),
    voice: {
      joined: voice !== 'off',
      joining: false,
      muted: voice === 'muted',
      members: voice === 'off' ? { 'p-rahul': { id: 'p-rahul', muted: false, connected: true } } as unknown as RoomComms['voice']['members']
        : { me: { id: 'me', muted: voice === 'muted', connected: true }, 'p-rahul': { id: 'p-rahul', muted: false, connected: true }, 'p-priya': { id: 'p-priya', muted: true, connected: true } } as unknown as RoomComms['voice']['members'],
      speaking: ['p-rahul'],
    },
    voiceError: null,
    clearVoiceError: () => {},
    joinVoice: async () => setVoice('live'),
    leaveVoice: () => setVoice('off'),
    toggleMic: () => setVoice(v => (v === 'live' ? 'muted' : 'live')),
    handleIncoming: () => {},
    onConnected: () => {},
  }), [feed, panelOpen, silenced, voice, opts.unread])
}
import { doBotTurn, initGame } from '../lib/gameEngine'
import type { GameState } from '../types/game'

/** A finished practice game played out by the real engine (the human is driven by the bot AI). */
export function makeFinishedGame(botCount = 2, humanName = 'Tester'): GameState {
  let state = initGame({ id: 'human', name: humanName }, botCount)
  state = { ...state, players: state.players.map((p, i) => (i === 0 ? { ...p, isBot: true } : p)) }
  for (let i = 0; i < 2000 && state.phase !== 'game_over'; i++) {
    state = doBotTurn(state).state
  }
  return { ...state, phase: 'game_over', players: state.players.map((p, i) => (i === 0 ? { ...p, isBot: false } : p)) }
}
