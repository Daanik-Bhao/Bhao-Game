import { useTranslation } from 'react-i18next'
import type { BoardModel } from './GameBoard'
import { TopBar } from './TopBar'
import { ActionBar, Hand, Standings, TableZone, YearBanner } from './BoardShared'
import { InvestmentsList, MoneySummary, ShieldsList } from './EconomyPanels'
import { FeedList, feedEntries } from './GameLog'
import { MAX_ACTIVE_DEFENSES } from '../../lib/gameEngine'
import './GameBoardDesktop.css'

/**
 * Desktop board (spec §E.24) inside the 1280×700 canvas: top bar, left column (my money,
 * investments, shields), table zone + hand, right column (standings, recent moves).
 */
export function GameBoardDesktop({ m }: { m: BoardModel }) {
  const { t } = useTranslation()
  const me = m.me
  return (
    <div className={`dk-board${m.sidePanelOpen ? ' has-panel' : ''}`}>
      <TopBar m={m} variant="desktop" />
      <aside className="dk-col dk-rail">
        {me && (
          <>
            <section className="dk-panel econ-portfolio" data-tour="hud">
              <h3 className="dk-panel__h caps">{t('board.myMoney')}</h3>
              <MoneySummary player={me} goal={m.gs.wealthGoal} rank={m.myRank} total={m.gs.players.length} variant="column" />
            </section>
            <section className="dk-panel dk-panel--grow">
              <h3 className="dk-panel__h caps">{t('econ.investments')}</h3>
              <InvestmentsList player={me} max={4} />
            </section>
            <section className="dk-panel econ-defenses" data-tour="shields">
              <h3 className="dk-panel__h caps">{t('board.shieldsOf', { n: me.activeDefenses?.length ?? 0, max: MAX_ACTIVE_DEFENSES })}</h3>
              <ShieldsList player={me} />
            </section>
          </>
        )}
      </aside>
      <main className="dk-centre">
        <TableZone m={m} />
        <YearBanner m={m} />
        <Hand m={m} size="full" />
        <ActionBar m={m} />
      </main>
      <aside className="dk-col">
        <section className="dk-panel">
          <h3 className="dk-panel__h caps">{t('board.standings')}</h3>
          <Standings m={m} />
        </section>
        <section className="dk-panel dk-panel--grow">
          <h3 className="dk-panel__h caps">{t('board.recentMoves')}</h3>
          {feedEntries(m.gs.log, 1).length
            ? <FeedList log={m.gs.log} n={4} meName={me?.name} className="board-feed--flat" />
            : <p className="invest-empty">{t('log.empty')}</p>}
        </section>
      </aside>
    </div>
  )
}
