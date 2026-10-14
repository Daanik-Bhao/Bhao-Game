import { useEffect, useMemo, useState } from 'react'
import { ChatPanel, CommsControls } from '../../components/game/RoomComms'
import { LobbyMenuView, WaitingRoomView, type LobbyTab } from '../../pages/lobby/LobbyViews'
import type { MultiplayerMode } from '../../types/game'
import { ResultScreen } from '../../pages/game/ResultScreen'
import { makeFinishedGame, MOCK_PLAYERS, useMockComms } from '../mocks'
import { computeLevelStars } from '../../lib/levelRules'
import type { GalleryScreen } from './types'

const noop = () => {}

function ResultMock({ mode }: { mode: 'practice' | 'campaign' | 'multiplayer' | 'ranked' }) {
  const state = useMemo(() => makeFinishedGame(2), [])
  const stars = useMemo(() => (mode === 'campaign' ? computeLevelStars(state, state.players[0].id) : null), [mode, state])
  return (
    <ResultScreen
      gameState={state}
      humanIndex={0}
      mode={mode}
      levelStars={stars}
      rpChange={mode === 'ranked' ? 24 : 0}
      ownerKey="ux-gallery"
      onPlayAgain={noop}
      onHome={noop}
      onNextLevel={mode === 'campaign' ? noop : undefined}
      onBackToLobby={mode === 'multiplayer' ? noop : undefined}
      onOpenLibrary={noop}
    />
  )
}

function LobbyMenuMock({ initialTab }: { initialTab: LobbyTab }) {
  const [tab, setTab] = useState<LobbyTab>(initialTab)
  const [max, setMax] = useState(3)
  const [mode, setMode] = useState<MultiplayerMode>('standard')
  const [code, setCode] = useState('')
  return (
    <LobbyMenuView tab={tab} onTab={setTab} maxPlayers={max} onMaxPlayers={setMax} mode={mode} onMode={setMode}
      joinCode={code} onJoinCode={setCode} loading={false} error="" onCreate={noop} onJoin={noop} onBack={noop} />
  )
}

const WAIT_PLAYERS = [
  { id: 'me', name: 'Tester', ready: false, host: true, me: true, seat: 0 },
  { id: 'r', name: 'Rahul', ready: true, host: false, me: false, seat: 1 },
]

function WaitingMock({ host }: { host: boolean }) {
  const [ready, setReady] = useState(false)
  const players = host ? WAIT_PLAYERS : WAIT_PLAYERS.map(p => ({ ...p, me: !p.me, ready: p.id === 'me' ? true : ready }))
  return (
    <WaitingRoomView code="K7Q2MX" maxPlayers={4} mode="standard" players={players} isHost={host} myReady={ready}
      canStart={host} loading={false} error="" onToggleReady={() => setReady(r => !r)} onStart={noop} onLeave={noop} />
  )
}

function ChatMock({ report = false }: { report?: boolean }) {
  const comms = useMockComms({ panelOpen: true, voice: 'live' })
  const onReport = async () => { await new Promise(r => setTimeout(r, 600)) }
  return (
    <div className="surface-table" style={{ minHeight: '100dvh' }}>
      <div className="uxg-dock-demo">
        <CommsControls comms={comms} myId="me" />
      </div>
      <ChatPanel comms={comms} players={MOCK_PLAYERS} myId="me" onReport={onReport} />
      {report && <AutoOpenReport />}
    </div>
  )
}

/** Clicks the first report button so the report dialog shows (gallery only). */
function AutoOpenReport() {
  useEffect(() => {
    const id = setTimeout(() => {
      document.querySelector<HTMLButtonElement>('.chat-people button[aria-haspopup="dialog"]')?.click()
    }, 400)
    return () => clearTimeout(id)
  }, [])
  return null
}

function DockMock() {
  const off = useMockComms({ voice: 'off', unread: 3 })
  const live = useMockComms({ voice: 'live', unread: 0 })
  const muted = useMockComms({ voice: 'muted', unread: 12 })
  return (
    <div className="surface-table uxg-table" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[off, live, muted].map((c, i) => <div key={i} className="uxg-dock-demo"><CommsControls comms={c} myId="me" /></div>)}
    </div>
  )
}

/** Owned by Agent 3: result screen, Lobby menu + waiting room, chat panel, report sheet… */
export const FLOW_SCREENS: GalleryScreen[] = [
  { path: 'comms-dock', title: 'Comms dock buttons (voice off / mic on / muted, unread badge)', group: 'Multiplayer', render: () => <DockMock /> },
  { path: 'chat', title: 'Chat panel (voice live)', group: 'Multiplayer', render: () => <ChatMock /> },
  { path: 'chat-report', title: 'Report dialog', group: 'Multiplayer', render: () => <ChatMock report /> },
  { path: 'lobby-create', title: 'Lobby: create room', group: 'Multiplayer', render: () => <LobbyMenuMock initialTab="create" /> },
  { path: 'lobby-join', title: 'Lobby: join room', group: 'Multiplayer', render: () => <LobbyMenuMock initialTab="join" /> },
  { path: 'lobby-waiting-host', title: 'Waiting room (host)', group: 'Multiplayer', render: () => <WaitingMock host /> },
  { path: 'lobby-waiting-guest', title: 'Waiting room (guest)', group: 'Multiplayer', render: () => <WaitingMock host={false} /> },
  { path: 'result', title: 'Result + report card (practice)', group: 'Result', note: 'a real engine game played by bots', render: () => <ResultMock mode="practice" /> },
  { path: 'result-campaign', title: 'Result (campaign, stars)', group: 'Result', render: () => <ResultMock mode="campaign" /> },
  { path: 'result-ranked', title: 'Result (ranked, RP chip)', group: 'Result', render: () => <ResultMock mode="ranked" /> },
  { path: 'result-multiplayer', title: 'Result (multiplayer)', group: 'Result', render: () => <ResultMock mode="multiplayer" /> },
]
