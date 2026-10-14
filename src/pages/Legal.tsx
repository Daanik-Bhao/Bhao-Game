import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { ArrowLeft, Info } from 'lucide-react'
import { Button } from '../components/ui'
import { DELETE_CONFIRM_WORD } from '../components/deleteAccount'
import { MIN_AGE } from '../config/age'
import { SUPPORT_EMAIL as CONTACT_EMAIL } from '../config/contact'
import './menus.css'

const LAST_UPDATED = '13 October 2026'

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
          <p className="legal__meta">{t('legal.lastUpdated', { date: LAST_UPDATED })}</p>
          {i18n.language !== 'en' && <p className="legal__meta">{t('legal.englishOnly')}</p>}
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

export function Privacy() {
  const { t } = useTranslation()
  return (
    <LegalLayout title={t('legal.privacy')}>
      <p>
        BHAO ("we", "us") is a financial-literacy card game, played in a browser or as the BHAO Android app. This page
        explains what information the app handles, why, and the choices you have. Questions:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

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

      <h2>1. {t('legal.sections.privacy.h1')}</h2>
      <p>
        You can play the tutorial, campaign and practice games without an account. In guest mode we do not create any
        account on our servers. A random guest name and your campaign progress are stored only in your browser's local
        storage on your device.
      </p>

      <h2>2. {t('legal.sections.privacy.h2')}</h2>
      <ul>
        <li><strong>Account details:</strong> your email address and a password (stored hashed), or your Google account email if you sign in with Google. Authentication is provided by Supabase.</li>
        <li><strong>Profile:</strong> your username and chosen avatar.</li>
        <li><strong>Game data:</strong> games played and won, win streaks, rank points, XP, in-game coins, daily-reward and contract progress, and multiplayer room state.</li>
      </ul>
      <p>Your username, avatar and game statistics may be shown to other players, for example on leaderboards and in multiplayer rooms.</p>
      <p>There are no real-money purchases in BHAO, so we never collect payment information.</p>

      <h2>3. {t('legal.sections.privacy.chat')}</h2>
      <ul>
        <li>
          <strong>Voice chat and the microphone:</strong> in multiplayer rooms you can choose to join voice chat. Only then
          does the app ask for microphone permission, and you can mute yourself or leave at any time. Voice goes directly
          between the players' devices (peer-to-peer, encrypted). It is <strong>not recorded and not stored</strong> by us.
          As with any peer-to-peer call, the other players' devices can see your network (IP) address while connected; if
          a direct connection isn't possible, a relay server may pass the encrypted audio along without storing it.
        </li>
        <li>
          <strong>Text chat, quick chat and pokes:</strong> these are sent live to the players in the same room and are{' '}
          <strong>not stored</strong> on our servers. They disappear when you leave the room. Links and long numbers are
          hidden and common swear words are masked automatically.
        </li>
        <li>You can mute any player in a room. Muting hides their chat and pokes and silences their voice for you.</li>
      </ul>

      <h2>4. {t('legal.sections.privacy.reports')}</h2>
      <p>
        You can report a player from the room chat. A report stores who reported, who was reported, the room, the reason
        chosen, any details typed, and <strong>the reported player's recent chat messages</strong> (up to 10, as they
        appeared on the reporter's device) so we can check what happened. Voice is never part of a report because it is
        not recorded. Only our moderation team can see reports; the reported player is not told who reported them. We use
        reports to warn, suspend or ban players who break the rules, and delete them once they are no longer needed.
      </p>

      <h2>5. {t('legal.sections.privacy.h3')}</h2>
      <p>
        If error tracking is enabled, we use Sentry to receive crash and error reports (for example the error message,
        the page you were on, your browser and device type). We configure Sentry not to send personal information such as
        your IP address or cookies by default. When an error happens, Sentry may also capture a short recording of the
        screen activity leading up to it to help us reproduce the bug; text and inputs are masked by default.
      </p>

      <h2>6. {t('legal.sections.privacy.h4')}</h2>
      <p>We use your browser's local storage (not advertising cookies) to remember:</p>
      <ul>
        <li>your sign-in session (managed by Supabase),</li>
        <li>language and sound preferences,</li>
        <li>guest profile, tutorial and campaign progress,</li>
        <li>cached app files so BHAO can load quickly and work offline (service worker).</li>
      </ul>

      <h2>7. {t('legal.sections.privacy.h5')}</h2>
      <ul>
        <li><strong>Supabase</strong> – account authentication, database, and the live connection that carries multiplayer moves and chat.</li>
        <li><strong>Google</strong> – optional "Sign in with Google" and STUN servers that help players' devices find each other for voice chat (they see your IP address, never your audio).</li>
        <li><strong>Sentry</strong> – error tracking (when enabled).</li>
        <li><strong>Vercel</strong> – website hosting.</li>
      </ul>
      <p>These providers process data on our behalf and may store it outside India.</p>

      <h2>8. {t('legal.sections.privacy.h6')}</h2>
      <p>
        We do not sell your personal data and we do not show third-party ads. BHAO has no real-money purchases and uses
        virtual coins only; we do not collect bank, UPI or payment details. We do not record voice chat or store text
        chat. Nothing in the game is financial advice.
      </p>

      <h2>9. {t('legal.sections.privacy.h7')}</h2>
      <p>
        We keep account data while your account exists. You can permanently delete your account and game data at any
        time inside the app from <em>Dashboard → Profile → Delete my account</em>, or by emailing us. Deleting your
        account also deletes reports you made and reports made about you. Error reports are kept by Sentry for a limited
        period and then deleted automatically. You can clear guest data by clearing the app's or browser's site data.
        Steps and timelines: <Link to="/delete-account">{t('legal.deletePage.title')}</Link>.
      </p>

      <h2>10. {t('legal.sections.privacy.h8')}</h2>
      <p>
        Depending on where you live (including under India's Digital Personal Data Protection Act, 2023), you may have the
        right to access, correct or erase your personal data and to raise a grievance. Email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will respond within a reasonable time.
      </p>

      <h2>11. {t('legal.sections.privacy.h9')}</h2>
      <p>
        You must be <strong>at least {MIN_AGE} years old</strong> to use BHAO, because multiplayer rooms let you voice- and
        text-chat with other players, including strangers. BHAO is not directed at children under {MIN_AGE} and we do not
        knowingly collect their data. If you are under 18, please use BHAO with the consent of a parent or guardian.
        Parents who believe their child has created an account without consent can contact us to have it deleted.
      </p>

      <h2>12. {t('legal.sections.privacy.h10')}</h2>
      <p>We will update this page when our practices change and revise the "Last updated" date above.</p>
    </LegalLayout>
  )
}

export function Terms() {
  const { t } = useTranslation()
  return (
    <LegalLayout title={t('legal.terms')}>
      <p>
        These terms apply when you use BHAO, in a browser or as an installed app. By playing you agree to them. Questions:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>1. {t('legal.sections.terms.h1')}</h2>
      <p>
        BHAO is a card game for entertainment and financial-literacy education. Scenarios, returns and market events in
        the game are simplified and fictional. <strong>Nothing in BHAO is financial, investment, tax or legal advice.</strong>{' '}
        Talk to a qualified professional before making real financial decisions.
      </p>

      <h2>2. {t('legal.sections.terms.h2')}</h2>
      <p>
        BHAO has <strong>no real-money purchases</strong>. In-game coins are earned only by playing. Coins, rank points, XP
        and cards have no real-world monetary value, can't be bought, sold or exchanged for money, and are not your
        property. BHAO is not gambling. We may adjust or reset them, for example to fix bugs or balance the game.
      </p>

      <h2>3. {t('legal.sections.terms.h3')}</h2>
      <ul>
        <li>You must be at least {MIN_AGE} years old to use BHAO.</li>
        <li>Keep your login details safe; you're responsible for activity on your account.</li>
        <li>Choose a username that isn't offensive, impersonating, or infringing anyone's rights.</li>
        <li>You can delete your account at any time from your profile inside the app.</li>
      </ul>

      <h2>4. {t('legal.sections.terms.h4')}</h2>
      <p>
        Don't cheat, exploit bugs, use bots or scripts, harass other players, or try to break or overload the service. We
        may suspend or delete accounts that do.
      </p>

      <h2>5. {t('legal.sections.terms.community')}</h2>
      <p>In multiplayer chat and voice, be respectful. Don't:</p>
      <ul>
        <li>abuse, threaten, bully or use hate speech against anyone;</li>
        <li>share or ask for sexual content;</li>
        <li>spam, advertise, or run scams (for example asking for UPI IDs, OTPs, passwords or money);</li>
        <li>share your own or anyone else's personal information (phone number, address, school and so on).</li>
      </ul>
      <p>
        Use the <strong>mute</strong> button to stop hearing or seeing a player, and the <strong>report</strong> button to
        tell us about them. A report includes the player's recent chat messages (voice is not recorded). We review reports
        and may warn, suspend or delete accounts that break these rules.
      </p>

      <h2>6. {t('legal.sections.terms.h5')}</h2>
      <p>
        BHAO is provided "as is". We work to keep it running but can't promise it will always be available, error-free,
        or that progress will never be lost. Online features may change or end.
      </p>

      <h2>7. {t('legal.sections.terms.h6')}</h2>
      <p>
        To the extent allowed by law, we are not liable for indirect losses or for decisions you make based on the game.
        Nothing in these terms limits rights you have under applicable consumer law.
      </p>

      <h2>8. {t('legal.sections.terms.h7')}</h2>
      <p>See our <Link to="/privacy">Privacy Policy</Link> for how we handle your data.</p>

      <h2>9. {t('legal.sections.terms.h8')}</h2>
      <p>
        We may update these terms; continued use after an update means you accept it. These terms are governed by the laws
        of India.
      </p>
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
