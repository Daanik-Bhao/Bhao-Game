// @vitest-environment jsdom
/**
 * Child-safe defaults for 13–17 players (docs/age-policy.md, Option B): quick chat only (typed
 * chat neither sent nor shown), no voice, hidden-from-leaderboard note. Adults are unaffected.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, cleanup, render, renderHook, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { RealtimeChannel } from '@supabase/supabase-js'
import i18n from '../../i18n/i18n'
import { useRoomComms } from '../../hooks/useRoomComms'
import { useMockComms } from '../../dev/mocks'
import { ChatPanel, CommsControls } from '../game/RoomComms'
import { LeaderboardView } from '../../pages/menus/LeaderboardView'

const players = [{ id: 'me', name: 'Me' }, { id: 'p2', name: 'Rahul' }]

function Panel({ childSafe }: { childSafe: boolean }) {
  const comms = useMockComms({ panelOpen: true, childSafe })
  return <MemoryRouter><CommsControls comms={comms} myId="me" /><ChatPanel comms={comms} players={players} myId="me" /></MemoryRouter>
}

beforeEach(async () => { await i18n.changeLanguage('en') })
afterEach(() => cleanup())

describe('chat panel', () => {
  it('child-safe: quick chat stays, the typing box and voice are gone', () => {
    render(<Panel childSafe />)
    expect(screen.getByRole('group', { name: /quick/i })).toBeTruthy()
    expect(screen.queryByPlaceholderText(/message/i)).toBeNull()
    expect(screen.queryByRole('button', { name: /join voice/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /voice off/i })).toBeNull()
    expect(screen.getByTestId('child-safe-chat').textContent).toMatch(/quick chat only/)
  })

  it('adults keep typed chat and voice', () => {
    render(<Panel childSafe={false} />)
    expect(screen.queryByTestId('child-safe-chat')).toBeNull()
    expect(screen.getAllByRole('button', { name: /voice/i }).length).toBeGreaterThan(0)
    expect(document.querySelector('.chat-input input')).not.toBeNull()
  })
})

describe('useRoomComms child-safe mode', () => {
  const channelRef = { current: null as RealtimeChannel | null }
  const setup = (childSafe: boolean) => renderHook(() => useRoomComms({
    channelRef, myId: 'me', playerIds: ['me', 'p2'], onlineIds: new Set(['me', 'p2']), childSafe,
  }))

  it('drops typed messages from others but shows quick chat; never sends typed text; voice stays off', async () => {
    const { result } = setup(true)
    act(() => {
      result.current.handleIncoming('chat', { id: 'a', from: 'p2', kind: 'text', text: 'add me on insta' })
      result.current.handleIncoming('chat', { id: 'b', from: 'p2', kind: 'quick', quickId: 'gg' })
    })
    expect(result.current.feed.map(f => f.kind)).toEqual(['quick'])
    let sent = ''
    act(() => { sent = result.current.sendText('hello') })
    expect(sent).toBe('empty')
    await act(async () => { await result.current.joinVoice() })
    expect(result.current.voice.joined).toBe(false)
    expect(result.current.childSafe).toBe(true)
  })

  it('adults still receive typed messages', () => {
    const { result } = setup(false)
    act(() => { result.current.handleIncoming('chat', { id: 'a', from: 'p2', kind: 'text', text: 'nice move' }) })
    expect(result.current.feed.map(f => f.kind)).toEqual(['text'])
  })
})

describe('leaderboard', () => {
  const rows = [{ id: '1', user_id: 'kid', username: 'player12345678', wins: 1, losses: 0, total_games: 1, highest_net_worth: 100 }]

  it('tells a 13–17 player they are hidden from the public list', () => {
    render(<MemoryRouter><LeaderboardView rows={rows} loading={false} meId="kid" onRefresh={() => undefined} hiddenFromPublic /></MemoryRouter>)
    expect(screen.getByRole('note').textContent).toMatch(/not shown on the public leaderboard/)
  })

  it('adults see their rank as before', () => {
    render(<MemoryRouter><LeaderboardView rows={rows} loading={false} meId="kid" onRefresh={() => undefined} /></MemoryRouter>)
    expect(screen.queryByRole('note')).toBeNull()
    expect(screen.getByText('#1')).toBeTruthy()
  })
})
