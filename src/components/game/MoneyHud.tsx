import { useTranslation } from 'react-i18next'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { formatMoney } from '../../lib/format'
import { AnimatedNumber } from '../AnimatedNumber'
import { ParticleBurst } from '../ParticleBurst'
import { LifestyleMeter } from './EconomyPanels'
import { portfolioView } from './economyUi'
import { yearDelta } from './boardUtils'
import { useLevelMeterText } from './LevelHUD'
import type { BoardModel } from './GameBoard'

/**
 * "My money" HUD (spec §E.12): net worth (roll-up), rank, yearly delta, goal bar, chips
 * Cash / Invested / Lifestyle (+ level meter in campaign). Tap → portfolio sheet.
 * `side` = compact-landscape left column (stacked rows).
 */
export function MoneyHud({ m, side }: { m: BoardModel; side?: boolean }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const meter = useLevelMeterText(m.gs)
  if (!m.me) return null
  const v = portfolioView(m.me, m.gs.wealthGoal)
  const delta = yearDelta(m.me)
  const up = (delta?.amount ?? 0) >= 0
  const Icon = up ? TrendingUp : TrendingDown
  const goal = formatMoney(m.gs.wealthGoal, { compact: true, lang })
  const compactMoney = (n: number) => formatMoney(n, { compact: true, abbr: true, lang })

  return (
    <div className={`mb-wallet hud-wrap${side ? ' hud-wrap--side' : ''}`}>
      <button
        type="button"
        className={`hud econ-wallet-chip${side ? ' hud--side' : ''}`}
        onClick={m.openPortfolio}
        aria-label={t('board.hudAria', { amount: formatMoney(v.netWorth, { lang }), rank: m.myRank })}
        data-tour="hud"
      >
        <span className="hud__nw">
          <span className="hud__cap caps">{t('econ.netWorth')}</span>
          <span className="hud__big num"><AnimatedNumber value={v.netWorth} formatFn={n => formatMoney(n, { lang })} /></span>
        </span>
        <span className="hud__rank">
          <span>{t('board.youAreRank', { rank: m.myRank })}</span>
          {delta && (
            <span className={`delta ${up ? 'delta--up' : 'delta--down'}`}>
              <Icon size={13} strokeWidth={2.5} aria-hidden="true" />
              {side
                ? formatMoney(Math.abs(delta.amount), { lang })
                : t('board.thisYear', { amount: formatMoney(Math.abs(delta.amount), { lang }) })}
            </span>
          )}
        </span>
        <span className="hud__goal">
          <span className="hud__bar" aria-hidden="true"><i style={{ width: `${v.progress * 100}%` }} /></span>
          <span>{side ? goal : t('board.goalShort', { goal })}</span>
        </span>
        <span className="hud__chips">
          <span className="hudchip"><span>{t('econ.cash')}</span><b className="num">{compactMoney(v.cash)}</b></span>
          <span className="hudchip"><span>{t('econ.invested')}</span><b className="num">{compactMoney(v.invested)}</b></span>
          <span className="hudchip"><span>{t('board.lifestyle')}</span><LifestyleMeter level={v.lifestyleLevel} /></span>
          {meter && <span className="hudchip hudchip--level"><span>{t('board.levelRule')}</span><b>{meter}</b></span>}
        </span>
        {m.fx && m.fx.tier !== 'small' && <span className="hud__fx" key={m.fx.key}><ParticleBurst diff={m.fx.delta} /></span>}
      </button>
    </div>
  )
}
