import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { ArrowLeft, Info } from 'lucide-react'
import { Button } from '../components/ui'
import { DELETE_CONFIRM_WORD } from '../components/deleteAccount'
import { ADMITS_MINORS, MIN_AGE } from '../config/age'
import { SUPPORT_EMAIL as CONTACT_EMAIL } from '../config/contact'
import './menus.css'

/** Bump when the Privacy Policy, Terms or the delete-account page change. */
const LAST_UPDATED = new Date(2026, 9, 14)

/** Rich-text tags allowed in legal strings: <strong>, <em>, <mail>, <privacyLink>, <deleteLink>. */
const RICH = {
  strong: <strong />,
  em: <em />,
  mail: <a href={`mailto:${CONTACT_EMAIL}`} />,
  privacyLink: <Link to="/privacy" />,
  deleteLink: <Link to="/delete-account" />,
}

/** One legal string with its tags rendered; {{email}} and {{age}} are always available. */
function Rich({ k, values }: { k: string; values?: Record<string, string | number> }) {
  return <Trans i18nKey={k} values={{ email: CONTACT_EMAIL, age: MIN_AGE, ...values }} components={RICH} />
}

/** Legal pages (spec §E.3): paper page, sub-screen bar with back, reading column ≤ 680px / 75ch. */
function LegalLayout({ title, draft = true, children }: { title: string; draft?: boolean; children: ReactNode }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  // Back to wherever the reader came from (Profile, Auth, Landing footer); a direct visit goes home.
  const back = () => (location.key !== 'default' ? navigate(-1) : navigate('/'))
  const date = LAST_UPDATED.toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <div className="page legal">
      <header className="screen-bar">
        <Button variant="ghost" className="screen-bar__back" icon={<ArrowLeft size={22} aria-hidden="true" />} aria-label={t('common.back')} onClick={back} />
        <span className="screen-bar__title">{title}</span>
      </header>
      <main className="page__main legal__main">
        <article className="legal__doc">
          <nav className="legal__nav" aria-label={t('legal.navLabel')}>
            <Link to="/">{t('legal.home')}</Link>
            <Link to="/privacy" aria-current={location.pathname === '/privacy' ? 'page' : undefined}>{t('legal.privacyShort')}</Link>
            <Link to="/terms" aria-current={location.pathname === '/terms' ? 'page' : undefined}>{t('legal.termsShort')}</Link>
            <Link to="/delete-account" aria-current={location.pathname === '/delete-account' ? 'page' : undefined}>{t('legal.deleteShort')}</Link>
          </nav>
          <h1 className="page-title legal__title">{title}</h1>
          <p className="legal__meta">{t('legal.lastUpdated', { date })}</p>
          {i18n.language !== 'en' && <p className="legal__meta">{t('legal.translationNote')}</p>}
          {draft && (
            <p role="note" className="notice notice--risk legal__draft">
              <Info size={18} strokeWidth={2.25} aria-hidden="true" />
              <span>{t('legal.draftNote')}</span>
            </p>
          )}
          <div className="legal__body">{children}</div>
        </article>
      </main>
    </div>
  )
}

/** Numbered section heading + its keyed content. */
function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <>
      <h2>{n}. {title}</h2>
      {children}
    </>
  )
}

const ACCOUNT_ITEMS = ['details', 'profile', 'stats', 'matches', 'campaign', 'library', 'multiplayer'] as const
const DEVICE_ITEMS = ['session', 'prefs', 'progress', 'flags', 'cache'] as const
const SERVICE_ITEMS = ['supabase', 'google', 'sentry', 'vercel', 'relay'] as const

/** Privacy Policy. Every statement here is checked against the code; see docs/play-store.md §5. */
export function Privacy() {
  const { t } = useTranslation()
  const p = 'legal.privacyDoc'
  const deletePath = { profile: t('nav.profile'), button: t('profile.delete.button') }
  return (
    <LegalLayout title={t('legal.privacy')}>
      <p><Rich k={`${p}.intro`} /></p>

      <section aria-labelledby="privacy-key-points" className="legal__keypoints">
        <h2 id="privacy-key-points">{t('legal.keyPoints.title')}</h2>
        <ul>
          <li>{t('legal.keyPoints.voice')}</li>
          <li>{t('legal.keyPoints.chat')}</li>
          <li>{t('legal.keyPoints.age', { age: MIN_AGE })}</li>
          <li>{t('legal.keyPoints.money')}</li>
          <li>{t('legal.keyPoints.delete')}</li>
        </ul>
      </section>

      <Section n={1} title={t(`${p}.guest.title`)}>
        <p>{t(`${p}.guest.p1`)}</p>
        <p><Rich k={`${p}.guest.p2`} /></p>
      </Section>

      <Section n={2} title={t(`${p}.account.title`)}>
        <ul>
          {ACCOUNT_ITEMS.map(k => <li key={k}><Rich k={`${p}.account.${k}`} /></li>)}
        </ul>
        <p>{t(`${p}.account.shown`)}</p>
        <p>{t(`${p}.account.logs`)}</p>
        <p>{t(`${p}.account.noPayment`)}</p>
      </Section>

      <Section n={3} title={t(`${p}.chat.title`)}>
        <ul>
          <li><Rich k={`${p}.chat.voice`} /></li>
          <li><Rich k={`${p}.chat.text`} /></li>
          <li>{t(`${p}.chat.mute`)}</li>
        </ul>
      </Section>

      <Section n={4} title={t(`${p}.reports.title`)}>
        <p><Rich k={`${p}.reports.p1`} /></p>
        <p>{t(`${p}.reports.p2`)}</p>
      </Section>

      <Section n={5} title={t(`${p}.errors.title`)}>
        <p>{t(`${p}.errors.p1`)}</p>
        <p>{t(`${p}.errors.p2`)}</p>
      </Section>

      <Section n={6} title={t(`${p}.device.title`)}>
        <p>{t(`${p}.device.intro`)}</p>
        <ul>
          {DEVICE_ITEMS.map(k => <li key={k}>{t(`${p}.device.${k}`)}</li>)}
        </ul>
        <p>{t(`${p}.device.end`)}</p>
      </Section>

      <Section n={7} title={t(`${p}.services.title`)}>
        <ul>
          {SERVICE_ITEMS.map(k => <li key={k}><Rich k={`${p}.services.${k}`} /></li>)}
        </ul>
        <p>{t(`${p}.services.p1`)}</p>
        <p>{t(`${p}.services.p2`)}</p>
      </Section>

      <Section n={8} title={t(`${p}.dont.title`)}>
        <p>{t(`${p}.dont.p1`)}</p>
      </Section>

      <Section n={9} title={t(`${p}.retention.title`)}>
        <p>{t(`${p}.retention.p1`)}</p>
        <p><Rich k={`${p}.retention.p2`} values={deletePath} /></p>
        <p>{t(`${p}.retention.p3`)}</p>
        <p>{t(`${p}.retention.p4`)}</p>
      </Section>

      <Section n={10} title={t(`${p}.rights.title`)}>
        <p><Rich k={`${p}.rights.p1`} /></p>
      </Section>

      <Section n={11} title={t(`${p}.children.title`)}>
        <p>
          <Rich k={`${p}.children.p1`} />
          {ADMITS_MINORS && <> {t(`${p}.children.minors`)}</>}
        </p>
      </Section>

      <Section n={12} title={t(`${p}.changes.title`)}>
        <p>{t(`${p}.changes.p1`)}</p>
      </Section>
    </LegalLayout>
  )
}

const COMMUNITY_RULES = ['abuse', 'sexual', 'scams', 'personal'] as const

export function Terms() {
  const { t } = useTranslation()
  const p = 'legal.termsDoc'
  return (
    <LegalLayout title={t('legal.terms')}>
      <p><Rich k={`${p}.intro`} /></p>

      <Section n={1} title={t(`${p}.game.title`)}>
        <p><Rich k={`${p}.game.p1`} /></p>
      </Section>

      <Section n={2} title={t(`${p}.virtual.title`)}>
        <p><Rich k={`${p}.virtual.p1`} /></p>
      </Section>

      <Section n={3} title={t(`${p}.account.title`)}>
        <ul>
          <li>
            {t(`${p}.account.age`, { age: MIN_AGE })}
            {ADMITS_MINORS && <> {t(`${p}.account.minors`)}</>}
          </li>
          <li>{t(`${p}.account.login`)}</li>
          <li>{t(`${p}.account.username`)}</li>
          <li>{t(`${p}.account.guest`)}</li>
          <li><Rich k={`${p}.account.delete`} /></li>
        </ul>
      </Section>

      <Section n={4} title={t(`${p}.fairPlay.title`)}>
        <p>{t(`${p}.fairPlay.p1`)}</p>
      </Section>

      <Section n={5} title={t(`${p}.community.title`)}>
        <p>{t(`${p}.community.intro`)}</p>
        <ul>
          {COMMUNITY_RULES.map(k => <li key={k}>{t(`${p}.community.${k}`)}</li>)}
        </ul>
        <p><Rich k={`${p}.community.p2`} /></p>
      </Section>

      <Section n={6} title={t(`${p}.availability.title`)}>
        <p>{t(`${p}.availability.p1`)}</p>
      </Section>

      <Section n={7} title={t(`${p}.liability.title`)}>
        <p>{t(`${p}.liability.p1`)}</p>
      </Section>

      <Section n={8} title={t(`${p}.privacy.title`)}>
        <p><Rich k={`${p}.privacy.p1`} /></p>
      </Section>

      <Section n={9} title={t(`${p}.changes.title`)}>
        <p>{t(`${p}.changes.p1`)}</p>
      </Section>
    </LegalLayout>
  )
}

const DELETED_ITEMS = ['account', 'profile', 'progress', 'matches', 'campaign', 'rooms', 'reports'] as const
const TIMING_ITEMS = ['app', 'email', 'backups', 'errors'] as const

/**
 * Public "Delete your BHAO account" page (`/delete-account`). Google Play needs it as a web link, so it
 * works without signing in. The in-app labels come from the keys the Profile screen itself uses, so the
 * steps always match the UI in every language.
 */
export function DeleteAccountInfo() {
  const { t } = useTranslation()
  const p = 'legal.deletePage'
  const labels = {
    profile: t('nav.profile'),
    zone: t('profile.dangerZone'),
    button: t('profile.delete.button'),
    confirm: t('profile.delete.confirm'),
    word: DELETE_CONFIRM_WORD,
  }
  return (
    <LegalLayout title={t(`${p}.title`)} draft={false}>
      <p>{t(`${p}.lede`)}</p>

      <h2>{t(`${p}.inApp.title`)}</h2>
      <ol>
        <li>{t(`${p}.inApp.step1`)}</li>
        <li><Rich k={`${p}.inApp.step2`} values={labels} /></li>
        <li><Rich k={`${p}.inApp.step3`} values={labels} /></li>
        <li><Rich k={`${p}.inApp.step4`} values={labels} /></li>
      </ol>
      <p>{t(`${p}.inApp.done`)}</p>

      <h2>{t(`${p}.email.title`)}</h2>
      <p><Rich k={`${p}.email.p1`} /></p>
      <p>{t(`${p}.email.p2`)}</p>

      <h2>{t(`${p}.deleted.title`)}</h2>
      <ul>
        {DELETED_ITEMS.map(k => <li key={k}>{t(`${p}.deleted.${k}`)}</li>)}
      </ul>

      <h2>{t(`${p}.timing.title`)}</h2>
      <ul>
        {TIMING_ITEMS.map(k => <li key={k}><Rich k={`${p}.timing.${k}`} /></li>)}
      </ul>

      <h2>{t(`${p}.notStored.title`)}</h2>
      <ul>
        <li>{t(`${p}.notStored.chat`)}</li>
        <li>{t(`${p}.notStored.device`)}</li>
      </ul>

      <h2>{t(`${p}.guest.title`)}</h2>
      <p>{t(`${p}.guest.p1`)}</p>

      <p><Rich k={`${p}.more`} /></p>
    </LegalLayout>
  )
}
