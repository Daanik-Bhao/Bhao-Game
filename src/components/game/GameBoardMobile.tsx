import type { BoardModel } from './GameBoard'
import { TopBar } from './TopBar'
import { MoneyHud } from './MoneyHud'
import { ActionBar, DockSlot, Hand, RivalsStrip, TableCentre, YearBanner } from './BoardShared'
import './GameBoardMobile.css'

interface GameBoardMobileProps {
  m: BoardModel
  orientation: 'portrait' | 'landscape'
  /** Usable board width in px (tablet hand cards from 600) */
  width: number
}

/**
 * Compact board (spec §E.12 phone portrait, §E.23 phone landscape, §E.25 tablet).
 * Pure layout: every piece of state lives in GameBoard so a layout switch loses nothing.
 */
export function GameBoardMobile({ m, orientation, width }: GameBoardMobileProps) {
  if (orientation === 'landscape') {
    return (
      <div className={`mb-board mb-landscape${m.sidePanelOpen ? ' has-panel' : ''}`}>
        <TopBar m={m} variant="landscape" />
        <div className="mbl-body">
          <aside className="mbl-side">
            <MoneyHud m={m} side />
          </aside>
          <main className="mbl-main">
            <TableCentre m={m} landscape />
            <YearBanner m={m} />
            <Hand m={m} size="hand" />
          </main>
        </div>
      </div>
    )
  }

  const tablet = width >= 600
  return (
    <div className={`mb-board mb-portrait${tablet ? ' mb-tablet' : ''}`}>
      <TopBar m={m} variant="portrait" />
      <RivalsStrip m={m} />
      <div className={`mb-table${m.p.extraControls || m.p.onSendEmote ? ' has-dock' : ''}`}>
        <TableCentre m={m} />
        <YearBanner m={m} />
        <DockSlot m={m} variant="stack" />
      </div>
      <MoneyHud m={m} />
      <Hand m={m} size={tablet ? 'tablet' : 'hand'} />
      <ActionBar m={m} />
    </div>
  )
}
