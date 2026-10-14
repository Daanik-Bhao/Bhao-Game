import { useTranslation } from 'react-i18next'
import { BookOpen, Globe, LogOut, Pause, Play, Radio, ScrollText, Sparkles, Timer, Volume2 } from 'lucide-react'
import { Button, Sheet, SettingRow, Switch } from '../ui'
import { LanguageSwitcher } from '../LanguageSwitcher'
import { useReducedEffects, useSoundSetting } from '../../hooks/useReducedEffects'
import { formatClock, useMatchRemaining } from './boardUtils'
import type { BoardModel } from './GameBoard'

function ClockLine({ m }: { m: BoardModel }) {
  const { t } = useTranslation()
  const remaining = useMatchRemaining(m.gs, m.pausedAt)
  return (
    <p className="pause__clock">
      <Timer size={18} strokeWidth={2.25} aria-hidden="true" />
      <span className="num">{t('board.clockLeft', { time: formatClock(remaining) })}</span>
    </p>
  )
}

/**
 * Pause menu (spec §E.12): mode title, match clock, Resume, How to play, Game log, settings, Quit.
 * Single player: the match is frozen while it is open. Multiplayer keeps running (shared server
 * clock), and the menu says so.
 */
export function PauseMenu({ m, open, onClose }: { m: BoardModel; open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const { setting, setReduceEffects } = useReducedEffects()
  const { soundOn, setSoundOn } = useSoundSetting()
  const icon = (I: typeof Play) => <I size={20} strokeWidth={2.25} aria-hidden="true" />
  return (
    <Sheet open={open} onClose={onClose} title={m.modeTitle} className="pause">
      {m.modeSubtitle && <p className="pause__sub">{m.modeSubtitle}</p>}
      <ClockLine m={m} />
      {m.p.isMultiplayer ? (
        <p className="pause__note is-live" role="note">
          <Radio size={18} strokeWidth={2.25} aria-hidden="true" />
          <span>{t('board.pauseLive')}</span>
        </p>
      ) : (
        <p className="pause__note" role="status">
          <Pause size={18} strokeWidth={2.25} aria-hidden="true" />
          <span>{t('board.pausedNote')}</span>
        </p>
      )}
      <Button variant="primary" size="l" block icon={icon(Play)} onClick={onClose} data-autofocus>{t('board.resume')}</Button>
      <div className="pause__list">
        <button type="button" className="pause__row" onClick={() => { onClose(); m.openRules() }}>{icon(BookOpen)}<span>{t('board.howToPlay')}</span></button>
        <button type="button" className="pause__row" onClick={() => { onClose(); m.openLog() }}>{icon(ScrollText)}<span>{t('board.gameLog')}</span></button>
        <SettingRow icon={icon(Volume2)} label={t('common.settings.sound')}>
          <Switch checked={soundOn} onChange={setSoundOn} label={t('common.settings.sound')} />
        </SettingRow>
        <SettingRow icon={icon(Sparkles)} label={t('common.settings.reduceEffects')}>
          <Switch checked={setting} onChange={setReduceEffects} label={t('common.settings.reduceEffects')} />
        </SettingRow>
        <div className="pause__lang">
          <span className="setting-row__label">{icon(Globe)}{t('common.settings.language')}</span>
          <LanguageSwitcher variant="segmented" />
        </div>
      </div>
      {m.p.onQuit && (
        <Button variant="ghost" block className="btn--danger-text pause__quit" icon={icon(LogOut)} onClick={() => { onClose(); m.p.onQuit?.() }}>
          {t('board.quitGame')}
        </Button>
      )}
    </Sheet>
  )
}
