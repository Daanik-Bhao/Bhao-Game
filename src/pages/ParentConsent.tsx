import { useEffect, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { CircleCheck, Info, ShieldCheck } from 'lucide-react'
import { Button, Input, Modal, PageLoader, Wordmark } from '../components/ui'
import { Gullu } from '../components/mascot/Gullu'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { YearSelect } from '../components/age/YearSelect'
import { useLang } from '../i18n/lang'
import { isAdultBirthYear } from '../lib/ageBand'
import {
  approveConsent, declineConsent, viewConsentRequest, viewWithdrawToken, withdrawConsent,
  type ConsentErrorCode,
} from '../lib/parentConsent'
import { CONSENT_NOTICE_VERSION } from '../config/consent'
import { SUPPORT_EMAIL } from '../config/contact'
import './menus.css'
import '../components/age/age.css'

/** What the notice lists (keys under consent.parent.*). Bump CONSENT_NOTICE_VERSION when these change. */
export const CONSENT_DATA_ITEMS = ['account', 'profile', 'age', 'progress', 'reports', 'errors', 'parent'] as const
export const CONSENT_LIMIT_ITEMS = ['leaderboard', 'rooms', 'voice', 'chat', 'tracking', 'money'] as const
const PARENT_RIGHT_ITEMS = ['withdraw', 'access', 'grievance'] as const

const MAIL = { mail: <a href={`mailto:${SUPPORT_EMAIL}`} /> }

/** Paper page with the BHAO wordmark and a language switcher (no sign-in, no tab bar). */
function ParentLayout({ title, children }: { title: string; children: ReactNode }) {
  const { t } = useTranslation()
  return (
    <div className="page parent-page">
      <header className="screen-bar parent-page__bar">
        <Wordmark to="/" />
        <span className="screen-bar__title parent-page__bar-title">{title}</span>
        <div className="screen-bar__actions"><LanguageSwitcher /></div>
      </header>
      <main className="page__main legal__main">
        <article className="legal__doc parent-page__doc">
          <div className="legal__body">{children}</div>
          <p className="legal__meta parent-page__foot">
            <Link to="/privacy">{t('legal.privacyShort')}</Link>
            <span aria-hidden="true"> · </span>
            <Link to="/terms">{t('legal.termsShort')}</Link>
            <span aria-hidden="true"> · </span>
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </p>
        </article>
      </main>
    </div>
  )
}

/** Full-page outcome / error message. */
function Outcome({ mood, title, body, children }: { mood: 'cheer' | 'think' | 'worried' | 'happy'; title: string; body: ReactNode; children?: ReactNode }) {
  return (
    <section className="parent-outcome" role="status">
      <Gullu mood={mood} size={88} />
      <h1 className="page-title">{title}</h1>
      <p className="lede">{body}</p>
      {children}
    </section>
  )
}

/** Message for a token problem (invalid, expired, already used, service not set up). */
function TokenProblem({ code, withdraw = false }: { code: ConsentErrorCode; withdraw?: boolean }) {
  const { t } = useTranslation()
  const key = code === 'expired' ? 'expired'
    : code === 'used' ? 'used'
      : code === 'invalid_token' || code === 'bad_request' ? 'invalid'
        : code === 'not_configured' ? 'unavailable'
          : 'error'
  return (
    <Outcome
      mood="think"
      title={t(`consent.parent.problem.${key}.title`)}
      body={<Trans i18nKey={withdraw && key === 'invalid' ? 'consent.withdraw.invalid' : `consent.parent.problem.${key}.body`} values={{ email: SUPPORT_EMAIL }} components={MAIL} />}
    />
  )
}

function Notice() {
  const { t } = useTranslation()
  return (
    <>
      <p>{t('consent.parent.intro')}</p>
      <h2>{t('consent.parent.dataTitle')}</h2>
      <ul>{CONSENT_DATA_ITEMS.map(k => <li key={k}>{t(`consent.parent.data.${k}`)}</li>)}</ul>
      <p>{t('consent.parent.dataNot')}</p>
      <h2>{t('consent.parent.limitsTitle')}</h2>
      <ul>{CONSENT_LIMIT_ITEMS.map(k => <li key={k}>{t(`consent.limits.${k}`)}</li>)}</ul>
      <h2>{t('consent.parent.rightsTitle')}</h2>
      <ul>
        {PARENT_RIGHT_ITEMS.map(k => (
          <li key={k}><Trans i18nKey={`consent.parent.rights.${k}`} values={{ email: SUPPORT_EMAIL }} components={MAIL} /></li>
        ))}
      </ul>
    </>
  )
}

/**
 * `/parent-consent?token=…` — the link in the consent email. Public, no login. Shows what BHAO
 * is, exactly what is collected for the child and the child-safety limits; the parent then
 * declares they are the parent/guardian and an adult (name + year of birth) and approves or
 * declines. Approve → the child's account becomes `active_minor`; decline → it is deleted.
 */
export function ParentConsent() {
  const { t } = useTranslation()
  const lang = useLang()
  const [params] = useSearchParams()
  const token = params.get('token')?.trim() ?? ''
  const [phase, setPhase] = useState<'loading' | 'ready' | 'approved' | 'declined' | 'problem'>(token ? 'loading' : 'problem')
  const [problem, setProblem] = useState<ConsentErrorCode>('invalid_token')
  const [name, setName] = useState('')
  const [year, setYear] = useState<number | null>(null)
  const [declared, setDeclared] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; year?: string; declared?: string; form?: string }>({})
  const [busy, setBusy] = useState<'approve' | 'decline' | null>(null)
  const [confirmDecline, setConfirmDecline] = useState(false)

  useEffect(() => {
    if (!token) return
    let alive = true
    void viewConsentRequest(token).then(res => {
      if (!alive) return
      if (res.ok) setPhase('ready')
      else {
        setProblem(res.error)
        setPhase('problem')
      }
    })
    return () => { alive = false }
  }, [token])

  const serverError = (code: ConsentErrorCode) => {
    if (code === 'expired' || code === 'used' || code === 'invalid_token' || code === 'not_configured') {
      setProblem(code)
      setPhase('problem')
      return
    }
    if (code === 'not_adult') setErrors({ year: t('consent.parent.err.notAdult') })
    else if (code === 'invalid_name') setErrors({ name: t('consent.parent.err.name') })
    else if (code === 'declaration_required') setErrors({ declared: t('consent.parent.err.declaration') })
    else setErrors({ form: t('consent.parent.err.generic') })
  }

  const approve = async (e: React.FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (name.trim().length < 2) next.name = t('consent.parent.err.name')
    if (year === null) next.year = t('consent.parent.err.year')
    else if (!isAdultBirthYear(year, new Date().getFullYear())) next.year = t('consent.parent.err.notAdult')
    if (!declared) next.declared = t('consent.parent.err.declaration')
    setErrors(next)
    if (Object.keys(next).length || year === null) return
    setBusy('approve')
    const res = await approveConsent({ token, parentName: name, parentBirthYear: year, declaration: declared, lang })
    setBusy(null)
    if (res.ok) setPhase('approved')
    else serverError(res.error)
  }

  const decline = async () => {
    setBusy('decline')
    const res = await declineConsent(token)
    setBusy(null)
    setConfirmDecline(false)
    if (res.ok) setPhase('declined')
    else serverError(res.error)
  }

  const title = t('consent.parent.pageTitle')
  if (phase === 'loading') return <PageLoader />

  return (
    <ParentLayout title={title}>
      {phase === 'problem' && <TokenProblem code={problem} />}

      {phase === 'approved' && (
        <Outcome mood="cheer" title={t('consent.parent.approvedTitle')} body={t('consent.parent.approvedBody')} />
      )}

      {phase === 'declined' && (
        <Outcome mood="happy" title={t('consent.parent.declinedTitle')} body={t('consent.parent.declinedBody')} />
      )}

      {phase === 'ready' && (
        <>
          <div className="parent-page__hero">
            <Gullu mood="happy" size={72} />
            <h1 className="page-title legal__title">{t('consent.parent.title')}</h1>
          </div>
          <Notice />

          <form className="panel parent-form" onSubmit={approve} noValidate aria-labelledby="parent-form-title">
            <h2 id="parent-form-title" className="parent-form__title">
              <ShieldCheck size={22} strokeWidth={2.25} aria-hidden="true" />{t('consent.parent.formTitle')}
            </h2>
            <Input
              label={t('consent.parent.nameLabel')}
              value={name}
              autoComplete="name"
              maxLength={100}
              onChange={e => setName(e.target.value)}
              error={errors.name}
            />
            <YearSelect
              value={year}
              onChange={setYear}
              label={t('consent.parent.yearLabel')}
              hint={t('consent.parent.yearHint')}
              error={errors.year}
            />
            <label className="parent-check">
              <input
                type="checkbox"
                checked={declared}
                onChange={e => setDeclared(e.target.checked)}
                aria-invalid={errors.declared ? true : undefined}
                aria-describedby={errors.declared ? 'parent-check-error' : undefined}
              />
              <span>{t('consent.parent.declaration')}</span>
            </label>
            {errors.declared && <span id="parent-check-error" className="field__hint field__hint--error">{errors.declared}</span>}
            {errors.form && <p className="notice notice--error" role="alert">{errors.form}</p>}
            <p className="caption-text parent-form__method">
              <Info size={16} strokeWidth={2.25} aria-hidden="true" />
              <span>{t('consent.parent.methodNote', { version: CONSENT_NOTICE_VERSION })}</span>
            </p>
            <Button type="submit" size="l" block loading={busy === 'approve'} disabled={busy !== null} icon={<CircleCheck size={22} aria-hidden="true" />}>
              {t('consent.parent.approve')}
            </Button>
            <Button variant="outline" size="l" block className="btn--danger-text" disabled={busy !== null} onClick={() => setConfirmDecline(true)}>
              {t('consent.parent.decline')}
            </Button>
          </form>

          <Modal
            open={confirmDecline}
            onClose={busy ? undefined : () => setConfirmDecline(false)}
            title={t('consent.parent.declineConfirmTitle')}
            body={t('consent.parent.declineConfirmBody')}
            gullu="think"
            actions={
              <>
                <Button variant="danger" loading={busy === 'decline'} onClick={() => void decline()}>{t('consent.parent.declineConfirm')}</Button>
                <Button variant="outline" disabled={busy !== null} onClick={() => setConfirmDecline(false)}>{t('consent.parent.keepIt')}</Button>
              </>
            }
          />
        </>
      )}
    </ParentLayout>
  )
}

/**
 * `/parent-consent/withdraw?token=…` — the long-lived link in every consent email and in the
 * confirmation email. Withdrawing consent deletes the child's account (and all its data).
 */
export function ParentWithdraw() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const token = params.get('token')?.trim() ?? ''
  const [phase, setPhase] = useState<'loading' | 'ready' | 'done' | 'problem'>(token ? 'loading' : 'problem')
  const [problem, setProblem] = useState<ConsentErrorCode>('invalid_token')
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    let alive = true
    void viewWithdrawToken(token).then(res => {
      if (!alive) return
      if (res.ok) setPhase('ready')
      else {
        setProblem(res.error)
        setPhase('problem')
      }
    })
    return () => { alive = false }
  }, [token])

  const withdraw = async () => {
    setBusy(true)
    setError('')
    const res = await withdrawConsent(token)
    setBusy(false)
    setConfirm(false)
    if (res.ok) setPhase('done')
    else if (res.error === 'invalid_token' || res.error === 'not_configured') {
      setProblem(res.error)
      setPhase('problem')
    } else setError(t('consent.parent.err.generic'))
  }

  if (phase === 'loading') return <PageLoader />

  return (
    <ParentLayout title={t('consent.withdraw.pageTitle')}>
      {phase === 'problem' && <TokenProblem code={problem} withdraw />}
      {phase === 'done' && <Outcome mood="happy" title={t('consent.withdraw.doneTitle')} body={t('consent.withdraw.doneBody')} />}
      {phase === 'ready' && (
        <>
          <div className="parent-page__hero">
            <Gullu mood="think" size={72} />
            <h1 className="page-title legal__title">{t('consent.withdraw.title')}</h1>
          </div>
          <p>{t('consent.withdraw.body')}</p>
          <ul>
            <li>{t('consent.withdraw.item1')}</li>
            <li>{t('consent.withdraw.item2')}</li>
            <li>{t('consent.withdraw.item3')}</li>
          </ul>
          <p><Trans i18nKey="consent.withdraw.help" values={{ email: SUPPORT_EMAIL }} components={MAIL} /></p>
          {error && <p className="notice notice--error" role="alert">{error}</p>}
          <div className="parent-form parent-form--plain">
            <Button variant="danger" size="l" block onClick={() => setConfirm(true)}>{t('consent.withdraw.button')}</Button>
          </div>
          <Modal
            open={confirm}
            onClose={busy ? undefined : () => setConfirm(false)}
            title={t('consent.withdraw.confirmTitle')}
            body={t('consent.withdraw.confirmBody')}
            gullu="worried"
            actions={
              <>
                <Button variant="danger" loading={busy} onClick={() => void withdraw()}>{t('consent.withdraw.confirm')}</Button>
                <Button variant="outline" disabled={busy} onClick={() => setConfirm(false)}>{t('consent.parent.keepIt')}</Button>
              </>
            }
          />
        </>
      )}
    </ParentLayout>
  )
}
