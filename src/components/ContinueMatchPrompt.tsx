import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Modal } from './ui'
import { ARTHA_YATRA_LEVELS } from '../data/levels'
import { formatMoney } from '../lib/format'
import { clearMatch, loadMatch, type SavedMatch } from '../lib/matchSave'

/** Owners who closed the offer this session (backdrop / Android back): don't ask again until relaunch. */
const askedLater = new Set<string>()

/** Test hook: forget "later" answers. */
export function resetContinuePromptForTests() {
  askedLater.clear()
}

function useModeLabel(save: SavedMatch | null): string {
  const { t } = useTranslation()
  if (!save) return ''
  if (save.mode === 'campaign' && save.levelId) {
    const idx = ARTHA_YATRA_LEVELS.findIndex(l => l.id === save.levelId)
    const level = ARTHA_YATRA_LEVELS[idx]
    if (level) return t('board.mode.level', { n: idx + 1, name: t(`campaign.levels.${level.id}.name`, { defaultValue: level.name }) })
  }
  return save.mode === 'ranked' ? t('board.mode.ranked') : t('board.mode.practice')
}

/**
 * Home: "Continue your match?" when this profile has a saved single-player match
 * (src/lib/matchSave.ts), e.g. after Android killed the app mid-match.
 * Continue opens the match (it resumes paused); Start new deletes the save.
 */
export function ContinueMatchPrompt({ owner, hold = false }: { owner: string | null; hold?: boolean }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [save, setSave] = useState<SavedMatch | null>(() => (owner && !askedLater.has(owner) ? loadMatch(owner) : null))
  const mode = useModeLabel(save)
  if (!save || !owner) return null

  const later = () => {
    askedLater.add(owner)
    setSave(null)
  }
  const startNew = () => {
    clearMatch(owner)
    setSave(null)
  }
  const resume = () => {
    setSave(null)
    navigate(save.route)
  }

  const { round, maxRounds, netWorth } = save.summary
  const year = t('board.yearOf', { n: Math.min(round, maxRounds), max: maxRounds })
  return (
    <Modal
      open={!hold}
      onClose={later}
      gullu="happy"
      gulluSize={80}
      title={t('resumeMatch.title')}
      body={t('resumeMatch.body', { mode, year, netWorth: formatMoney(netWorth, { compact: true, lang: i18n.language }) })}
      className="resume-match"
      actions={(
        <>
          <Button variant="primary" size="l" block onClick={resume} data-autofocus>{t('resumeMatch.continue')}</Button>
          <Button variant="outline" size="l" block onClick={startNew}>{t('resumeMatch.startNew')}</Button>
        </>
      )}
    >
      <p className="modal__hint">{t('resumeMatch.hint')}</p>
    </Modal>
  )
}
