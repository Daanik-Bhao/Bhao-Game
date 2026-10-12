import { useLayoutEffect, useRef, useState } from 'react'
import type { GameState, GameCard } from '../../types/game'
import { GameBoardDesktop } from './GameBoardDesktop'
import { GameBoardMobile } from './GameBoardMobile'
import { OpponentPlayToast } from './BoardShared'
import { useOpponentPlayFeed } from './boardUtils'
import { useIsMobile } from '../../hooks/useIsMobile'
import './GameBoard.css'

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
  onPass?: (cardId: string) => void; onEquip?: (card: GameCard) => void // Phase 3: Pass discards + ends turn; Equip is free (once per turn)
  /**
   * Show the opponents strip on the large (desktop) layout. Defaults to
   * `isMultiplayer` (or a viewport <= 950px wide), because the single-player
   * page renders its own opponent bar in the wide-screen HUD. The compact
   * layout always shows players.
   */
  showOpponents?: boolean
  /** Force a layout instead of picking one from the available space. */
  layout?: 'auto' | 'desktop' | 'compact'
}

/** Props the inner boards receive in addition to the public ones. */
export interface InnerBoardProps extends GameBoardProps {
  highlightPlayerId?: string
  /** Viewport is <= 950px wide (page HUDs switch to their compact variant). */
  narrowViewport?: boolean
}

/** Design size of the desktop board; it is scaled uniformly to fit. */
export const DESKTOP_DESIGN_W = 1280
export const DESKTOP_DESIGN_H = 700
/** Below this scale the desktop board gets too small to tap — use the compact layout. */
const MIN_DESKTOP_SCALE = 0.7
const MAX_DESKTOP_SCALE = 1.35

interface FitBox { w: number; h: number; top: number }

/**
 * Sizes the board to the space between its top edge and the bottom of the
 * visual viewport, and reports the usable (safe-area-padded) size.
 */
function useBoardFit() {
  const rootRef = useRef<HTMLDivElement>(null)
  const areaRef = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState<FitBox | null>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const area = areaRef.current
    if (!root || !area) return
    let raf = 0
    const measure = () => {
      const rect = root.getBoundingClientRect()
      const vh = window.visualViewport?.height ?? window.innerHeight
      const top = Math.max(0, Math.round(rect.top))
      root.style.height = `${Math.max(240, Math.floor(vh - top))}px`
      root.dataset.atTop = top < 8 ? 'true' : 'false'
      // Reading after the writes above forces layout, so these reflect the new height.
      const next: FitBox = { w: area.clientWidth, h: area.clientHeight, top }
      setFit(prev => (prev && prev.w === next.w && prev.h === next.h && prev.top === next.top ? prev : next))
    }
    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    }
    measure()
    const ro = new ResizeObserver(schedule)
    ro.observe(root)
    ro.observe(area)
    window.addEventListener('resize', schedule)
    window.addEventListener('orientationchange', schedule)
    window.visualViewport?.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', schedule)
      window.removeEventListener('orientationchange', schedule)
      window.visualViewport?.removeEventListener('resize', schedule)
    }
  }, [])

  return { rootRef, areaRef, fit }
}

export function GameBoard(props: GameBoardProps) {
  const { layout = 'auto', gameState, myPlayerId } = props
  const { rootRef, areaRef, fit } = useBoardFit()
  const fallbackCompact = useIsMobile()
  const opponentEvent = useOpponentPlayFeed(gameState, myPlayerId)

  const scale = fit ? Math.min(fit.w / DESKTOP_DESIGN_W, fit.h / DESKTOP_DESIGN_H) : 1
  const compact =
    layout === 'compact' ? true :
    layout === 'desktop' ? false :
    fit ? scale < MIN_DESKTOP_SCALE : fallbackCompact
  const orientation: 'portrait' | 'landscape' = fit && fit.h > fit.w ? 'portrait' : 'landscape'

  const narrowViewport = typeof window !== 'undefined' && window.innerWidth <= 950
  const inner: InnerBoardProps = { ...props, highlightPlayerId: opponentEvent?.playerId, narrowViewport }

  return (
    <div ref={rootRef} className={`game-board-root ${compact ? 'is-compact' : 'is-desktop'}`}>
      <div ref={areaRef} className="game-board-area">
        {fit && (compact ? (
          <GameBoardMobile {...inner} orientation={orientation} areaHeight={fit.h} />
        ) : (
          <div
            className="game-board-canvas"
            style={{
              width: DESKTOP_DESIGN_W,
              height: DESKTOP_DESIGN_H,
              transform: `translate(-50%, -50%) scale(${Math.min(MAX_DESKTOP_SCALE, scale)})`,
            }}
          >
            <GameBoardDesktop {...inner} />
          </div>
        ))}
        <OpponentPlayToast event={opponentEvent} />
      </div>
    </div>
  )
}
