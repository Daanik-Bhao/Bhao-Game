import { useMemo } from 'react'
import { ResultScreen } from '../../pages/game/ResultScreen'
import { makeFinishedGame } from '../mocks'
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

/** Owned by Agent 3: result screen, Lobby menu + waiting room, chat panel, report sheet… */
export const FLOW_SCREENS: GalleryScreen[] = [
  { path: 'result', title: 'Result + report card (practice)', group: 'Result', note: 'a real engine game played by bots', render: () => <ResultMock mode="practice" /> },
  { path: 'result-campaign', title: 'Result (campaign, stars)', group: 'Result', render: () => <ResultMock mode="campaign" /> },
  { path: 'result-ranked', title: 'Result (ranked, RP chip)', group: 'Result', render: () => <ResultMock mode="ranked" /> },
  { path: 'result-multiplayer', title: 'Result (multiplayer)', group: 'Result', render: () => <ResultMock mode="multiplayer" /> },
]
