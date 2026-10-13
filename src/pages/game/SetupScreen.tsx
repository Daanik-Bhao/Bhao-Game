import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Info, Play } from 'lucide-react'
import { Avatar, Button, DCoin, Modal, Panel, Segmented } from '../../components/ui'
import { Gullu } from '../../components/mascot/Gullu'
import { formatMoney } from '../../lib/format'
import { useLang } from '../../i18n/lang'
import { MAX_ROUNDS, STARTING_WEALTH, WEALTH_GOAL } from '../../lib/gameEngine'
import './game-screens.css'

/** Daanik Coins a signed-in player earns for winning a practice game (server: src/data/rankRules). */
export const PRACTICE_WIN_COINS = 100
const BOT_NAMES = ['Rahul', 'Priya', 'Aman']

export interface SetupScreenProps {
  botCount: number
  setBotCount: (n: number) => void
  onStart: () => void
  onBack: () => void
  /** Signed-in players see the Daanik Coins line; guests never see coins */
  signedIn: boolean
}

/** Practice setup (spec §E.11): a full paper page, no confetti or coin bags. */
export function SetupScreen({ botCount, setBotCount, onStart, onBack, signedIn }: SetupScreenProps) {
  const { t } = useTranslation()
  const lang = useLang()
  const [coinInfo, setCoinInfo] = useState(false)
  const goal = formatMoney(WEALTH_GOAL, { compact: true, lang })
  const start = formatMoney(STARTING_WEALTH, { compact: true, lang })

  return (
    <div className="page setup">
      <header className="screen-bar">
        <Button variant="ghost" icon={<ArrowLeft size={22} />} aria-label={t('common.back')} onClick={onBack} className="screen-bar__back" />
        <h1 className="screen-bar__title">{t('setup.title')}</h1>
      </header>
      <main className="page__main page__main--list setup__main">
        <div className="setup__intro">
          <Gullu mood="think" size={72} />
          <p className="setup__race">{t('setup.race', { goal, years: MAX_ROUNDS })}</p>
        </div>

        <section className="setup__block" aria-labelledby="setup-opp">
          <h2 id="setup-opp" className="section-title">{t('setup.opponents')}</h2>
          <Segmented
            block
            tall
            ariaLabel={t('setup.opponents')}
            value={botCount}
            onChange={setBotCount}
            options={[1, 2, 3].map(n => ({
              value: n,
              ariaLabel: t('setup.botsAria', { count: n }),
              label: (
                <span className="setup__opt">
                  <span className="setup__stack" aria-hidden="true">
                    {BOT_NAMES.slice(0, n).map((name, i) => <Avatar key={name} name={name} seat={i} size="s" />)}
                  </span>
                  <span className="num">{n}</span>
                </span>
              ),
            }))}
          />
        </section>

        <Panel className="setup__summary">
          <p>{t('setup.summary', { count: botCount, min: 15, start })}</p>
          {signedIn && (
            <p className="setup__coins">
              <DCoin />
              <span>{t('setup.coinsWin', { n: PRACTICE_WIN_COINS })}</span>
              <Button variant="ghost" size="s" icon={<Info size={18} />} aria-label={t('setup.coinsInfoLabel')} onClick={() => setCoinInfo(true)} />
            </p>
          )}
        </Panel>
      </main>
      <div className="sticky-cta">
        <div className="sticky-cta__inner">
          <Button size="l" block icon={<Play size={20} />} onClick={onStart} data-autofocus>{t('setup.startGame')}</Button>
        </div>
      </div>
      <Modal
        open={coinInfo}
        onClose={() => setCoinInfo(false)}
        title={t('common.coins')}
        body={t('common.coinsInfo')}
        actions={<Button onClick={() => setCoinInfo(false)}>{t('common.gotIt')}</Button>}
      />
    </div>
  )
}
