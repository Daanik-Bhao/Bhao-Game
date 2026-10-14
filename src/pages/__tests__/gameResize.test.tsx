// @vitest-environment jsdom
/**
 * Spec §F.5: crossing the desktop ↔ compact breakpoint (resize, rotation, fold) must not reset
 * the match, and a remount / reload / app kill restores the running match from localStorage.
 */
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    guestProfile: { isGuest: true, id: 'guest-test', username: 'Tester', avatar_url: null, created_at: '2026-01-01' },
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

const SAVE_KEY = 'bhao.match.v2:guest:guest-test'

// ---- viewport + layout mocks: the board measures .game-board-area (clientWidth / clientHeight) ----
let vw = 1366
let vh = 768
const roCallbacks = new Set<() => void>()

function setViewport(w: number, h: number) {
  vw = w
  vh = h
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: w })
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: h })
}

beforeAll(() => {
  window.matchMedia = ((query: string) => {
    const maxH = query.match(/max-height:\s*(\d+)px/)
    const minW = query.match(/min-width:\s*(\d+)px/)
    const maxW = query.match(/max-width:\s*(\d+)px/)
    const matches = (maxH ? vh <= Number(maxH[1]) : false) || (minW ? vw >= Number(minW[1]) : false) || (maxW ? vw <= Number(maxW[1]) : false)
    return { matches, media: query, onchange: null, addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false }
  }) as unknown as typeof window.matchMedia
  class RO {
    cb: () => void
    constructor(cb: () => void) { this.cb = cb; roCallbacks.add(cb) }
    observe() {}
    unobserve() {}
    disconnect() { roCallbacks.delete(this.cb) }
  }
  const w = window as unknown as { ResizeObserver: typeof RO }
  w.ResizeObserver = RO
  ;(globalThis as unknown as { ResizeObserver: typeof RO }).ResizeObserver = RO
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get() { return (this as HTMLElement).classList.contains('game-board-area') ? vw : 0 } })
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get() { return (this as HTMLElement).classList.contains('game-board-area') ? vh : 0 } })
  window.scrollTo = () => {}
})

beforeEach(() => {
  sessionStorage.clear()
  localStorage.clear()
  setViewport(1366, 768)
})
afterEach(() => cleanup())

async function flush(ms = 50) {
  await act(async () => { await new Promise(r => setTimeout(r, ms)) })
}

async function resize(w: number, h: number) {
  setViewport(w, h)
  await act(async () => {
    window.dispatchEvent(new Event('resize'))
    roCallbacks.forEach(cb => cb())
  })
  await flush(80)
}

function renderGame() {
  return render(
    <MemoryRouter initialEntries={['/game?mode=practice']}>
      <Routes><Route path="/game" element={<Game />} /></Routes>
    </MemoryRouter>,
  )
}

const handIds = () => Array.from(document.querySelectorAll('[data-tour="hand-card"] [data-card-id]')).map(el => el.getAttribute('data-card-id'))
const yearText = () => document.querySelector('[data-tour="year"]')?.getAttribute('aria-label')

async function startAndDraw() {
  renderGame()
  await flush()
  fireEvent.click(screen.getByRole('button', { name: /start game/i }))
  await flush(80)
  fireEvent.click(screen.getAllByRole('button', { name: /draw a card/i })[0])
  await flush(80)
}

describe('F.5 — breakpoint crossing keeps the match', () => {
  it('desktop → compact → desktop keeps the board, hand and year (no setup screen)', async () => {
    await startAndDraw()
    expect(document.querySelector('.dk-board')).not.toBeNull()
    const hand = handIds()
    const year = yearText()
    expect(hand.length).toBe(5)

    await resize(700, 768)
    expect(document.querySelector('.mb-board')).not.toBeNull()
    expect(document.querySelector('.dk-board')).toBeNull()
    expect(screen.queryByRole('button', { name: /start game/i })).toBeNull()
    expect(handIds()).toEqual(hand)
    expect(yearText()).toBe(year)

    await resize(390, 844)
    await resize(844, 390)
    await resize(1366, 768)
    expect(document.querySelector('.dk-board')).not.toBeNull()
    expect(handIds()).toEqual(hand)
    expect(yearText()).toBe(year)
  })

  it('an open card sheet survives the layout switch', async () => {
    await startAndDraw()
    const first = document.querySelector<HTMLElement>('[data-tour="hand-card"] [data-card-id]')!
    const id = first.getAttribute('data-card-id')
    fireEvent.click(first)
    await flush(80)
    expect(document.querySelector('.cardsheet')).not.toBeNull()
    await resize(390, 844)
    expect(document.querySelector('.mb-board')).not.toBeNull()
    expect(document.querySelector('.cardsheet')).not.toBeNull()
    expect(document.querySelector(`[data-card-id="${id}"]`)?.getAttribute('aria-pressed')).toBe('true')
  })

  it('restores the running match from the saved match (localStorage) after a remount / app kill, paused', async () => {
    await startAndDraw()
    const hand = handIds()
    const year = yearText()
    await flush(400) // debounced save
    const key = Object.keys(localStorage).find(k => k.startsWith('bhao.match.v2:'))
    expect(key).toBe(SAVE_KEY)
    cleanup()
    await flush()

    renderGame()
    await flush(80)
    expect(screen.queryByRole('button', { name: /start game/i })).toBeNull()
    expect(document.querySelector('[data-tour="hand"]')).not.toBeNull()
    expect(handIds()).toEqual(hand)
    expect(yearText()).toBe(year)
    // Resumes paused: the pause menu is open and the turn ring is stopped.
    expect(screen.getByRole('button', { name: /^resume$/i })).toBeTruthy()
    expect(document.querySelector('.turn-ring.is-paused')).not.toBeNull()
  })

  it('ignores a save older than 7 days and drops it', async () => {
    await startAndDraw()
    await flush(400)
    const snap = JSON.parse(localStorage.getItem(SAVE_KEY)!)
    snap.savedAt = Date.now() - 8 * 24 * 60 * 60 * 1000
    localStorage.setItem(SAVE_KEY, JSON.stringify(snap))
    cleanup()
    renderGame()
    await flush(80)
    expect(screen.getByRole('button', { name: /start game/i })).toBeTruthy()
    expect(localStorage.getItem(SAVE_KEY)).toBeNull()
  })

  it('never crashes on a corrupt save and drops it', async () => {
    localStorage.setItem(SAVE_KEY, '{"schema":2,"gameState":')
    renderGame()
    await flush(80)
    expect(screen.getByRole('button', { name: /start game/i })).toBeTruthy()
    expect(localStorage.getItem(SAVE_KEY)).toBeNull()
  })

  it('ignores a save from another schema version', async () => {
    await startAndDraw()
    await flush(400)
    const snap = JSON.parse(localStorage.getItem(SAVE_KEY)!)
    snap.schema = 1
    localStorage.setItem(SAVE_KEY, JSON.stringify(snap))
    cleanup()
    renderGame()
    await flush(80)
    expect(screen.getByRole('button', { name: /start game/i })).toBeTruthy()
  })

  it('quitting the match deletes the save', async () => {
    await startAndDraw()
    await flush(400)
    expect(localStorage.getItem(SAVE_KEY)).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /^menu$/i }))
    await flush(80)
    fireEvent.click(screen.getByRole('button', { name: /quit game/i }))
    await flush(80)
    const buttons = screen.getAllByRole('button', { name: /quit game/i })
    fireEvent.click(buttons[buttons.length - 1])
    await flush(80)
    expect(localStorage.getItem(SAVE_KEY)).toBeNull()
  })
})
