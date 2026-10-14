import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Modal } from '../ui'
import { Gullu } from '../mascot/Gullu'
import { LanguageSwitcher } from '../LanguageSwitcher'
import { ageBandFromBirthYear, type AgeBand } from '../../lib/ageBand'
import { MIN_AGE } from '../../config/age'
import { SUPPORT_EMAIL } from '../../config/contact'
import { YearSelect } from './YearSelect'
import '../../pages/menus.css'
import './age.css'

/**
 * The age question (docs/age-policy.md, Option B): a neutral year-of-birth picker, not
 * "Are you 13+? yes/no". Only the resulting band leaves this component.
 *
 * `kind="device"`: before the first guest game on this device.
 * `kind="account"`: an account without an age record (first Google sign-in, or an account
 * made before the question existed). Under 13 then closes the account, so it asks to confirm.
 */
export function AgeQuestion({ kind, onAnswer, currentYear = new Date().getFullYear() }: {
  kind: 'device' | 'account'
  onAnswer: (band: AgeBand) => Promise<void> | void
  currentYear?: number
}) {
  const { t } = useTranslation()
  const [year, setYear] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirmUnder, setConfirmUnder] = useState(false)

  const answer = async (band: AgeBand) => {
    setBusy(true)
    setError('')
    try {
      await onAnswer(band)
    } catch {
      setError(t('age.saveFailed'))
      setBusy(false)
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (year === null || busy) return
    const band = ageBandFromBirthYear(year, currentYear)
    if (band === 'under13' && kind === 'account') setConfirmUnder(true)
    else void answer(band)
  }

  return (
    <div className="page signin age">
      <main className="page__main signin__main">
        <div className="panel signin__card">
          <Gullu mood="happy" size={88} />
          <h1 className="page-title signin__title">{kind === 'account' ? t('age.accountTitle') : t('age.title')}</h1>
          <p className="signin__body">{t('age.body')}</p>
          <form className="age__form" onSubmit={submit}>
            <YearSelect value={year} onChange={setYear} label={t('age.yearLabel')} hint={t('age.privacyHint')} currentYear={currentYear} />
            {error && <p className="notice notice--error" role="alert">{error}</p>}
            <Button type="submit" size="l" block loading={busy} disabled={year === null}>{t('age.continue')}</Button>
          </form>
          <div className="age__lang"><LanguageSwitcher variant="segmented" /></div>
          <p className="age__links">
            <Link to="/privacy">{t('legal.privacyShort')}</Link>
            <span aria-hidden="true"> · </span>
            <Link to="/terms">{t('legal.termsShort')}</Link>
          </p>
        </div>
      </main>

      <Modal
        open={confirmUnder}
        onClose={() => setConfirmUnder(false)}
        title={t('age.confirmTitle', { year: year ?? '' })}
        body={t('age.confirmBody', { age: MIN_AGE })}
        gullu="think"
        actions={
          <>
            <Button variant="danger" loading={busy} onClick={() => { setConfirmUnder(false); void answer('under13') }}>{t('age.confirmYes')}</Button>
            <Button variant="outline" onClick={() => setConfirmUnder(false)}>{t('age.changeYear')}</Button>
          </>
        }
      />
    </div>
  )
}

/** Friendly "come back later" for an under-13 answer. No account, no guest play on this device for a while. */
export function UnderAgeBlock() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <div className="page signin age">
      <main className="page__main signin__main">
        <div className="panel signin__card">
          <Gullu mood="think" size={88} />
          <h1 className="page-title signin__title">{t('age.blockTitle', { age: MIN_AGE })}</h1>
          <p className="signin__body">{t('age.blockBody', { age: MIN_AGE })}</p>
          <p className="caption-text">{t('age.blockGrownUps', { email: SUPPORT_EMAIL })}</p>
          <div className="signin__actions">
            <Button variant="outline" size="l" block onClick={() => navigate('/')}>{t('age.blockHome')}</Button>
          </div>
          <p className="age__links">
            <Link to="/privacy">{t('legal.privacyShort')}</Link>
            <span aria-hidden="true"> · </span>
            <Link to="/terms">{t('legal.termsShort')}</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
