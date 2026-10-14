// @vitest-environment jsdom
/**
 * Pause really pauses (single player): while the pause menu, the quit dialog or the app is in
 * the background, the turn timer, the bots and the match clock are frozen, and they resume
 * exactly where they stopped. Multiplayer is never paused; its pause menu says so.
 */
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    guestProfile: { isGuest: true, id: 'guest-pause', username: 'Tester', avatar_url: null, created_at: '2026-01-01' },
    refreshProfile: async () => {},
  }),
}))
vi.mock('../../lib/auth', () => ({
  startMatch: vi.fn(async () => null),
  saveMatchResult: vi.fn(async () => null),
  spendCoins: vi.fn(async () => undefined),
}))
vi.mock('../../lib/audio', () => ({ playSound: () => {}, isSoundEnabled: true, toggleSound: () => true }))

import '../../i18n/i18n'
import { Game } from '../Game'
import { GameBoard } from '../../components/game/GameBoard'
import { TurnRing } from '../../components/game/TurnTimer'
import { initGame } from '../../lib/gameEngine'

beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: /min-width/.test(query), media: query, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
  class RO { observe() {} unobserve() {} disconnect() {} }
  Object.assign(globalThis, { ResizeObserver: RO })
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get() { return (this as HTMLElement).classList.contains('game-board-area') ? 1366 : 0 } })
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get() { return (this as HTMLElement).classList.contains('game-board-area') ? 768 : 0 } })
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1366 })
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 768 })
  window.scrollTo = () => {}
})

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.useFakeTimers()
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

const adv = (ms: number) => act(() => { vi.advanceTimersByTime(ms) })
const ringNum = () => Number(document.querySelector('.turn-ring__num')?.textContent)
const ringPaused = () => document.querySelector('.turn-ring')?.classList.contains('is-paused') ?? false
const turnText = () => document.querySelector('.topbar__turn b')?.textContent ?? ''
/** The human's turn was skipped by the timer (no ToastProvider here, so check whose turn it is). */
const timeUpShown = () => !/your turn/i.test(turnText())

function startPractice() {
  render(
    <MemoryRouter initialEntries={['/game?mode=practice']}>
      <Routes><Route path="/game" element={<Game />} /></Routes>
    </MemoryRouter>,
  )
  adv(50)
  fireEvent.click(screen.getByRole('button', { name: /start game/i }))
  adv(80)
  fireEvent.click(screen.getAllByRole('button', { name: /draw a card/i })[0])
  adv(80)
}

const openMenu = () => { fireEvent.click(screen.getByRole('button', { name: /^menu$/i })); adv(50) }
const resume = () => { fireEvent.click(screen.getByRole('button', { name: /^resume$/i })); adv(50) }

describe('single player: the pause menu really pauses', () => {
  it('freezes the turn timer (ring stops too) and resumes exactly where it stopped', () => {
    startPractice()
    expect(turnText()).toMatch(/your turn/i)
    adv(10_000)
    const before = ringNum()
    expect(before).toBeLessThanOrEqual(50)

    openMenu()
    expect(screen.getByText(/game paused/i)).toBeTruthy()
    expect(ringPaused()).toBe(true)
    const frozenAt = ringNum()
    adv(5 * 60_000) // far past the 60 s turn limit
    expect(ringNum()).toBe(frozenAt)
    expect(timeUpShown()).toBe(false)
    expect(turnText()).toMatch(/your turn/i)

    resume()
    expect(ringPaused()).toBe(false)
    expect(ringNum()).toBe(frozenAt)
    adv((frozenAt - 2) * 1000)
    expect(timeUpShown()).toBe(false)
    expect(turnText()).toMatch(/your turn/i)
    adv(3_000)
    expect(timeUpShown()).toBe(true)
  })

  it('bots wait while paused and play on after Resume', () => {
    startPractice()
    adv(61_000) // my turn times out -> first bot's turn
    const botTurn = turnText()
    expect(botTurn).not.toMatch(/your turn/i)

    openMenu()
    adv(30_000) // a bot normally plays after 2.5 s
    expect(turnText()).toBe(botTurn)

    resume()
    adv(3_000)
    expect(turnText()).not.toBe(botTurn)
  })

  it('the quit dialog opened from the pause menu keeps the match frozen', () => {
    startPractice()
    openMenu()
    const frozenAt = ringNum()
    fireEvent.click(screen.getByRole('button', { name: /quit game/i }))
    adv(50)
    expect(screen.getByRole('button', { name: /keep playing/i })).toBeTruthy()
    adv(5 * 60_000)
    expect(timeUpShown()).toBe(false)
    expect(ringNum()).toBe(frozenAt)

    fireEvent.click(screen.getByRole('button', { name: /keep playing/i }))
    adv(50)
    expect(ringPaused()).toBe(false)
    expect(ringNum()).toBe(frozenAt)
  })

  it('the rules opened from the pause menu keep the match frozen', () => {
    startPractice()
    openMenu()
    const frozenAt = ringNum()
    fireEvent.click(screen.getByRole('button', { name: /how to play/i }))
    adv(50)
    adv(5 * 60_000)
    expect(timeUpShown()).toBe(false)
    expect(ringNum()).toBe(frozenAt)
    expect(ringPaused()).toBe(true)
  })

  it('the app in the background freezes the match', () => {
    startPractice()
    adv(5_000)
    const at = ringNum()
    const vis = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    act(() => { document.dispatchEvent(new Event('visibilitychange')) })
    adv(5 * 60_000)
    expect(timeUpShown()).toBe(false)
    vis.mockReturnValue('visible')
    act(() => { document.dispatchEvent(new Event('visibilitychange')) })
    adv(50)
    expect(ringNum()).toBe(at)
    vis.mockRestore()
  })
})

describe('turn ring', () => {
  it('stops counting while pausedAt is set', () => {
    const start = Date.now() - 20_000
    const { rerender } = render(<TurnRing turnStartTime={start} timeLimit={60_000} pausedAt={Date.now()} />)
    expect(ringNum()).toBe(40)
    adv(15_000)
    expect(ringNum()).toBe(40)
    expect(ringPaused()).toBe(true)
    // Unpaused (the page shifts turnStartTime by the paused time): counts from 40 again.
    rerender(<TurnRing turnStartTime={start + 15_000} timeLimit={60_000} pausedAt={null} />)
    adv(250)
    expect(ringNum()).toBe(40)
    adv(5_000)
    expect(ringNum()).toBe(35)
  })
})

describe('multiplayer is never paused', () => {
  const noop = () => {}
  const board = (isMultiplayer: boolean, onPauseChange: (p: boolean) => void) => {
    const gs = initGame({ id: 'me', name: 'Me' }, 1)
    return (
      <GameBoard
        gameState={gs} myPlayerId="me" isMultiplayer={isMultiplayer} uiPhase="playing"
        onDrawCard={noop} onPlayCard={noop} onTargetSelect={noop} onDecision={noop} onTimeout={noop}
        onCancelTargeting={noop} daanikCoins={0} onBuyExtraCard={noop}
        initialSheet="menu" onPauseChange={onPauseChange} pausedAt={isMultiplayer ? 123 : null}
      />
    )
  }

  it('multiplayer pause menu says the game keeps running and does not report a pause', () => {
    const onPause = vi.fn()
    render(board(true, onPause))
    adv(50)
    expect(screen.getByText(/keeps running/i)).toBeTruthy()
    expect(screen.queryByText(/game paused/i)).toBeNull()
    expect(onPause).not.toHaveBeenCalled()
    // pausedAt is ignored in multiplayer: the ring is live.
    expect(ringPaused()).toBe(false)
  })

  it('single player reports the pause menu opening and closing', () => {
    const onPause = vi.fn()
    render(board(false, onPause))
    adv(50)
    expect(onPause).toHaveBeenLastCalledWith(true)
    resume()
    expect(onPause).toHaveBeenLastCalledWith(false)
  })
})
