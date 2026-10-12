import type { GameState, GameCard } from '../../types/game'
import { GameBoardDesktop } from './GameBoardDesktop'

export type UIPhase = 'playing' | 'decision' | 'targeting'

export interface GameBoardProps {
  gameState: GameState
  myPlayerId: string
  isMultiplayer: boolean
  uiPhase: UIPhase
  onlinePlayers?: Set<string>
  onDrawCard: () => void
  onPlayCard: (card: GameCard) => void
  onTargetSelect: (targetIndex: number) => void
  onDecision: (type: 'spend' | 'save' | 'invest') => void
  onTimeout: () => void
  onCancelTargeting: () => void
  daanikCoins: number
  onBuyExtraCard: () => void
  activeEmotes?: Record<string, string>
  onSendEmote?: (emoji: string) => void
}

export function GameBoard(props: GameBoardProps) {
  return <GameBoardDesktop {...props} />
}
