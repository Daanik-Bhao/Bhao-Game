import { useTranslation } from 'react-i18next'
import type { GameState } from '../../types/game'
import type { LevelStarsResult } from '../../lib/levelRules'
import { LevelStars } from '../../components/campaign'
import { GameReportPanel } from '../../components/learning/GameReportPanel'
import { Button } from '../../components/ui'
import { formatMoney } from '../../lib/format'
import './game-screens.css'

export interface ResultScreenProps {
  gameState: GameState
  humanIndex: number
  mode: string
  levelId?: string
  levelStars: LevelStarsResult | null
  /** Ranked only (0 otherwise) */
  rpChange: number
  ownerKey: string
  onPlayAgain: () => void
  onHome: () => void
  /** Campaign: set when the next level is unlocked */
  onNextLevel?: () => void
  onOpenLibrary: () => void
}

/** Result + report card (spec §E.20). Temporary layout — redesigned in Phase 2. */
export function ResultScreen({ gameState, humanIndex, levelStars, ownerKey, onPlayAgain, onHome, onNextLevel, onOpenLibrary }: ResultScreenProps) {
  const { t } = useTranslation()
  const human = gameState.players[humanIndex]
  return (
    <div className="page">
      <main className="page__main page__main--read">
        <h1 className="page-title">{formatMoney(human.wealth)}</h1>
        {levelStars && <LevelStars stars={levelStars.stars} criteria={levelStars.criteria} animate />}
        <GameReportPanel state={gameState} playerId={human.id} ownerKey={ownerKey} onOpenLibrary={onOpenLibrary} />
      </main>
      <div className="sticky-cta">
        <div className="sticky-cta__inner">
          <Button variant="outline" onClick={onHome}>{t('common.home')}</Button>
          <Button onClick={onNextLevel ?? onPlayAgain}>{t('result.playAgain')}</Button>
        </div>
      </div>
    </div>
  )
}
