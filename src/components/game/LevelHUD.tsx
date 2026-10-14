import { useTranslation } from 'react-i18next'
import { Target } from 'lucide-react'
import type { GameState } from '../../types/game'
import { levelRulePillText } from '../campaign'

/** Level rule pill (spec §E.7): 44 px, target icon + mechanic short name. Renders nothing outside campaign levels. */
export function LevelRulePill({ gameState, onOpen, className = '' }: { gameState: GameState; onOpen: () => void; className?: string }) {
  const { t } = useTranslation()
  const text = levelRulePillText(gameState, t)
  if (!text) return null
  return (
    <button type="button" className={`rule-pill ${className}`.trim()} onClick={onOpen} aria-label={t('board.ruleAria', { rule: text })} data-tour="rule">
      <Target size={18} strokeWidth={2.25} aria-hidden="true" />
      <span>{text}</span>
    </button>
  )
}

/** Short level-meter text for the HUD's 4th chip (null outside campaign levels). */
export function useLevelMeterText(gameState: GameState): string | null {
  const { t } = useTranslation()
  return levelRulePillText(gameState, t)
}
