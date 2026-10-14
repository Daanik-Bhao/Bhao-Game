import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Hourglass, MailCheck, RefreshCw } from 'lucide-react'
import { Button, Input } from '../ui'
import { useAuth } from '../../hooks/useAuth'
import { useLang } from '../../i18n/lang'
import {
  getMyConsentStatus, looksLikeEmail, requestParentConsent, resendParentConsent,
  type ConsentErrorCode, type MyConsentStatus,
} from '../../lib/parentConsent'
import { CONSENT_TOKEN_TTL_DAYS } from '../../config/consent'
import { SUPPORT_EMAIL } from '../../config/contact'
import './age.css'

/** Seconds until `iso` (0 when past / missing). */
export function secondsUntil(iso: string | null, now: number): number {
  if (!iso) return 0
  const t = Date.parse(iso)
  return Number.isFinite(t) ? Math.max(0, Math.ceil((t - now) / 1000)) : 0
}

/** "0:45", "12:05", or "3 h" for long waits (daily cap). */
export function formatWait(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m >= 60 ? `${Math.ceil(m / 60)} h` : `${m}:${String(s).padStart(2, '0')}`
}

type CardError = { code: ConsentErrorCode; wait?: number }

/**
 * "Waiting for your parent's OK" (13–17 account in `pending_consent`). The child enters a
 * parent's email; the `parent-consent` function emails a consent link (rate-limited on the
 * server). Then: check again, resend (after a cooldown) or change the email.
 */
export function ParentConsentCard() {
  const { t } = useTranslation()
  const lang = useLang()
  const { refreshProfile, isOnlineAvailable } = useAuth()
  const [status, setStatus] = useState<MyConsentStatus | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState<'send' | 'resend' | 'check' | null>(null)
  const [error, setError] = useState<CardError | null>(null)
  const [justSent, setJustSent] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  const load = useCallback(async () => {
    const res = await getMyConsentStatus()
    if (res.ok) setStatus(res.status)
    setLoaded(true)
  }, [])

  useEffect(() => { void load() }, [load])

  const waitSeconds = secondsUntil(status?.nextSendAt ?? null, now)
  // Tick once a second only while a cooldown is showing.
  useEffect(() => {
    if (waitSeconds <= 0) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [waitSeconds])

  const afterSend = async (res: Awaited<ReturnType<typeof requestParentConsent>>) => {
    setBusy(null)
    if (!res.ok) {
      setError({ code: res.error, wait: res.retryAfterSeconds })
      return
    }
    setEditing(false)
    setJustSent(true)
    setEmail('')
    setNow(Date.now())
    await load()
  }

  const send = async () => {
    if (!looksLikeEmail(email)) {
      setError({ code: 'invalid_email' })
      return
    }
    setBusy('send')
    setError(null)
    await afterSend(await requestParentConsent(email, lang))
  }

  const resend = async () => {
    setBusy('resend')
    setError(null)
    await afterSend(await resendParentConsent(lang))
  }

  const checkAgain = async () => {
    setBusy('check')
    setError(null)
    await refreshProfile()
    await load()
    setBusy(null)
  }

  const errorText = (e: CardError) => {
    switch (e.code) {
      case 'invalid_email': return t('consent.child.err.invalidEmail')
      case 'rate_limited': return e.wait ? t('consent.child.err.rateLimitedWait', { time: formatWait(e.wait) }) : t('consent.child.err.rateLimited')
      case 'email_not_configured':
      case 'email_failed': return t('consent.child.err.emailDown', { email: SUPPORT_EMAIL })
      case 'not_configured': return t('consent.child.err.offlineSetup')
      case 'network': return t('consent.child.err.network')
      default: return t('consent.child.err.generic')
    }
  }

  const sentTo = status?.parentEmailMasked ?? null
  const showForm = editing || (loaded && !sentTo)
  const waitLabel = t('consent.child.resendIn', { time: formatWait(waitSeconds) })

  return (
    <section className="panel consent-card" aria-labelledby="consent-card-title">
      <div className="consent-card__head">
        <span className="icon-box icon-box--risk"><Hourglass size={22} strokeWidth={2.25} aria-hidden="true" /></span>
        <h2 id="consent-card-title" className="consent-card__title">{t('consent.child.title')}</h2>
      </div>
      <p className="consent-card__body">{t('consent.child.body')}</p>

      {!isOnlineAvailable ? (
        <p className="caption-text">{t('consent.child.err.offlineSetup')}</p>
      ) : showForm ? (
        <form className="consent-card__form" onSubmit={e => { e.preventDefault(); void send() }} noValidate>
          <Input
            type="email"
            label={t('consent.child.emailLabel')}
            hint={t('consent.child.emailHint')}
            placeholder="parent@example.com"
            value={email}
            autoComplete="off"
            inputMode="email"
            onChange={e => { setEmail(e.target.value); setError(null) }}
          />
          {error && <p className="notice notice--error" role="alert">{errorText(error)}</p>}
          <Button type="submit" block loading={busy === 'send'} disabled={!email.trim() || waitSeconds > 0}>
            {waitSeconds > 0 ? waitLabel : t('consent.child.send')}
          </Button>
          {editing && <Button variant="ghost" block onClick={() => { setEditing(false); setError(null) }}>{t('consent.child.cancel')}</Button>}
        </form>
      ) : sentTo ? (
        <div className="consent-card__sent">
          <p className="consent-card__status" role="status">
            <MailCheck size={20} strokeWidth={2.25} aria-hidden="true" />
            <span>{t(justSent ? 'consent.child.sentNow' : 'consent.child.sent', { email: sentTo, days: CONSENT_TOKEN_TTL_DAYS })}</span>
          </p>
          {error && <p className="notice notice--error" role="alert">{errorText(error)}</p>}
          <Button block loading={busy === 'check'} icon={<RefreshCw size={20} aria-hidden="true" />} onClick={() => void checkAgain()}>
            {t('consent.child.checkAgain')}
          </Button>
          <div className="consent-card__row">
            <Button variant="outline" loading={busy === 'resend'} disabled={waitSeconds > 0 || (busy !== null && busy !== 'resend')} onClick={() => void resend()}>
              {waitSeconds > 0 ? waitLabel : t('consent.child.resend')}
            </Button>
            <Button variant="ghost" onClick={() => { setEditing(true); setError(null) }}>{t('consent.child.change')}</Button>
          </div>
        </div>
      ) : (
        <p className="caption-text" role="status">{t('consent.child.loading')}</p>
      )}
      <p className="caption-text">{t('consent.child.meanwhile')}</p>
    </section>
  )
}
