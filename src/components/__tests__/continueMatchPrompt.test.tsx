// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import i18n from '../../i18n/i18n'
import { ContinueMatchPrompt, resetContinuePromptForTests } from '../ContinueMatchPrompt'
import { MATCH_SAVE_SCHEMA, loadMatch, storeMatch, type SavedMatch } from '../../lib/matchSave'
import { initGame } from '../../lib/gameEngine'
import { ARTHA_YATRA_LEVELS } from '../../data/levels'

const OWNER = 'guest:g-prompt'

function save(over: Partial<SavedMatch> = {}): SavedMatch {
  return {
    schema: MATCH_SAVE_SCHEMA, savedAt: Date.now(), owner: OWNER, mode: 'practice', levelId: null,
    route: '/game?mode=practice', botCount: 2, uiPhase: 'playing', popupQueue: [], matchId: null,
    turnElapsedMs: 0, matchElapsedMs: 0, summary: { round: 3, maxRounds: 10, netWorth: 420000 },
    gameState: initGame({ id: 'h', name: 'Me' }, 2), ...over,
  }
}

function Where() {
  const l = useLocation()
  return <div data-testid="where">{l.pathname + l.search}</div>
}

function renderHome(owner: string | null = OWNER) {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/dashboard" element={<ContinueMatchPrompt owner={owner} />} />
        <Route path="/game" element={<Where />} />
        <Route path="/game/level/:levelId" element={<Where />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => { localStorage.clear(); resetContinuePromptForTests() })
afterEach(async () => { cleanup(); await act(async () => { await i18n.changeLanguage('en') }) })

describe('Continue your match?', () => {
  it('shows nothing without a saved match', () => {
    renderHome()
    expect(screen.queryByText(/continue your match/i)).toBeNull()
  })

  it('offers the saved match and Continue opens its route', () => {
    storeMatch(save())
    renderHome()
    expect(screen.getByText(/continue your match/i)).toBeTruthy()
    expect(screen.getByText(/practice/i)).toBeTruthy()
    expect(screen.getByText(/year 3 of 10/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /^continue$/i }))
    expect(screen.getByTestId('where').textContent).toBe('/game?mode=practice')
    // The save stays: the game page restores from it.
    expect(loadMatch(OWNER)).not.toBeNull()
  })

  it('Continue routes a campaign save back into its level', () => {
    const level = ARTHA_YATRA_LEVELS[1]
    storeMatch(save({ mode: 'campaign', levelId: level.id, route: `/game/level/${level.id}` }))
    renderHome()
    expect(screen.getByText(/level 2/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /^continue$/i }))
    expect(screen.getByTestId('where').textContent).toBe(`/game/level/${level.id}`)
  })

  it('Start new deletes the save', () => {
    storeMatch(save())
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: /start new/i }))
    expect(loadMatch(OWNER)).toBeNull()
    expect(screen.queryByText(/continue your match/i)).toBeNull()
  })

  it('another profile does not get the offer', () => {
    storeMatch(save())
    renderHome('user:other')
    expect(screen.queryByText(/continue your match/i)).toBeNull()
  })

  it('is translated (hi, hinglish)', async () => {
    storeMatch(save())
    await act(async () => { await i18n.changeLanguage('hi') })
    const { unmount } = renderHome()
    expect(screen.getByText('अपना मैच जारी रखें?')).toBeTruthy()
    unmount()
    await act(async () => { await i18n.changeLanguage('hinglish') })
    renderHome()
    expect(screen.getByText('Apna match continue karein?')).toBeTruthy()
  })
})
