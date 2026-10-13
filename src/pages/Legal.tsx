import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const CONTACT_EMAIL = 'support@daanik.com'
const LAST_UPDATED = '13 October 2026'

function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  const { t, i18n } = useTranslation()
  return (
    <main style={{ minHeight: '100vh', padding: 'max(24px, env(safe-area-inset-top)) 16px 48px', color: 'var(--text-dark)' }}>
      <article className="glass-panel" style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(20px, 4vw, 40px)', borderRadius: 20, lineHeight: 1.65, fontSize: 16 }}>
        <nav style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 14 }}>
          <Link to="/" style={{ color: 'var(--green-primary)', fontWeight: 700 }}>← {t('legal.home')}</Link>
          <Link to="/privacy" style={{ color: 'var(--text-muted)' }}>{t('legal.privacyShort')}</Link>
          <Link to="/terms" style={{ color: 'var(--text-muted)' }}>{t('legal.termsShort')}</Link>
        </nav>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--green-primary)', fontSize: 'clamp(28px, 5vw, 40px)', margin: '0 0 4px' }}>{title}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 16px' }}>{t('legal.lastUpdated', { date: LAST_UPDATED })}</p>
        {i18n.language !== 'en' && (
          <p lang="en" style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 12px' }}>{t('legal.englishOnly')}</p>
        )}
        <p role="note" style={{ background: 'rgba(224,80,32,0.08)', border: '1px solid rgba(224,80,32,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 14 }}>
          This document is a plain-language template and has not yet been reviewed by a lawyer. It will be updated before
          BHAO's wider public launch.
        </p>
        {children}
      </article>
    </main>
  )
}

const h2 = { fontSize: 22, margin: '28px 0 8px', color: 'var(--text-dark)' } as const

export function Privacy() {
  const { t } = useTranslation()
  return (
    <LegalLayout title={t('legal.privacy')}>
      <p>
        BHAO ("we", "us") is a financial-literacy card game, played in a browser or as the BHAO Android app. This page
        explains what information the app handles, why, and the choices you have. Questions:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <section aria-labelledby="privacy-key-points" style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: 10, padding: '10px 14px', margin: '16px 0' }}>
        <h2 id="privacy-key-points" style={{ fontSize: 17, margin: '0 0 4px' }}>{t('legal.keyPoints.title')}</h2>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>{t('legal.keyPoints.voice')}</li>
          <li>{t('legal.keyPoints.chat')}</li>
          <li>{t('legal.keyPoints.age')}</li>
          <li>{t('legal.keyPoints.money')}</li>
          <li>{t('legal.keyPoints.delete')}</li>
        </ul>
      </section>

      <h2 style={h2}>1. {t('legal.sections.privacy.h1')}</h2>
      <p>
        You can play the tutorial, campaign and practice games without an account. In guest mode we do not create any
        account on our servers. A random guest name and your campaign progress are stored only in your browser's local
        storage on your device.
      </p>

      <h2 style={h2}>2. {t('legal.sections.privacy.h2')}</h2>
      <ul>
        <li><strong>Account details:</strong> your email address and a password (stored hashed), or your Google account email if you sign in with Google. Authentication is provided by Supabase.</li>
        <li><strong>Profile:</strong> your username and chosen avatar.</li>
        <li><strong>Game data:</strong> games played and won, win streaks, rank points, XP, in-game coins, daily-reward and contract progress, and multiplayer room state.</li>
      </ul>
      <p>Your username, avatar and game statistics may be shown to other players, for example on leaderboards and in multiplayer rooms.</p>
      <p>There are no real-money purchases in BHAO, so we never collect payment information.</p>

      <h2 style={h2}>3. {t('legal.sections.privacy.chat')}</h2>
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

      <h2 style={h2}>4. {t('legal.sections.privacy.reports')}</h2>
      <p>
        You can report a player from the room chat. A report stores who reported, who was reported, the room, the reason
        chosen, any details typed, and <strong>the reported player's recent chat messages</strong> (up to 10, as they
        appeared on the reporter's device) so we can check what happened. Voice is never part of a report because it is
        not recorded. Only our moderation team can see reports; the reported player is not told who reported them. We use
        reports to warn, suspend or ban players who break the rules, and delete them once they are no longer needed.
      </p>

      <h2 style={h2}>5. {t('legal.sections.privacy.h3')}</h2>
      <p>
        If error tracking is enabled, we use Sentry to receive crash and error reports (for example the error message,
        the page you were on, your browser and device type). We configure Sentry not to send personal information such as
        your IP address or cookies by default. When an error happens, Sentry may also capture a short recording of the
        screen activity leading up to it to help us reproduce the bug; text and inputs are masked by default.
      </p>

      <h2 style={h2}>6. {t('legal.sections.privacy.h4')}</h2>
      <p>We use your browser's local storage (not advertising cookies) to remember:</p>
      <ul>
        <li>your sign-in session (managed by Supabase),</li>
        <li>language and sound preferences,</li>
        <li>guest profile, tutorial and campaign progress,</li>
        <li>cached app files so BHAO can load quickly and work offline (service worker).</li>
      </ul>

      <h2 style={h2}>7. {t('legal.sections.privacy.h5')}</h2>
      <ul>
        <li><strong>Supabase</strong> – account authentication, database, and the live connection that carries multiplayer moves and chat.</li>
        <li><strong>Google</strong> – optional "Sign in with Google", Google Fonts for typography, and STUN servers that help players' devices find each other for voice chat (they see your IP address, never your audio).</li>
        <li><strong>Sentry</strong> – error tracking (when enabled).</li>
        <li><strong>Vercel</strong> – website hosting.</li>
        <li>Some avatar images may be loaded from external image hosts.</li>
      </ul>
      <p>These providers process data on our behalf and may store it outside India.</p>

      <h2 style={h2}>8. {t('legal.sections.privacy.h6')}</h2>
      <p>
        We do not sell your personal data and we do not show third-party ads. BHAO has no real-money purchases and uses
        virtual coins only; we do not collect bank, UPI or payment details. We do not record voice chat or store text
        chat. Nothing in the game is financial advice.
      </p>

      <h2 style={h2}>9. {t('legal.sections.privacy.h7')}</h2>
      <p>
        We keep account data while your account exists. You can permanently delete your account and game data at any
        time inside the app from <em>Dashboard → Profile → Delete my account</em>, or by emailing us. Deleting your
        account also deletes reports you made and reports made about you. Error reports are kept by Sentry for a limited
        period and then deleted automatically. You can clear guest data by clearing the app's or browser's site data.
      </p>

      <h2 style={h2}>10. {t('legal.sections.privacy.h8')}</h2>
      <p>
        Depending on where you live (including under India's Digital Personal Data Protection Act, 2023), you may have the
        right to access, correct or erase your personal data and to raise a grievance. Email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will respond within a reasonable time.
      </p>

      <h2 style={h2}>11. {t('legal.sections.privacy.h9')}</h2>
      <p>
        You must be <strong>at least 13 years old</strong> to use BHAO, because multiplayer rooms let you voice- and
        text-chat with other players, including strangers. BHAO is not directed at children under 13 and we do not
        knowingly collect their data. If you are under 18, please use BHAO with the consent of a parent or guardian.
        Parents who believe their child has created an account without consent can contact us to have it deleted.
      </p>

      <h2 style={h2}>12. {t('legal.sections.privacy.h10')}</h2>
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

      <h2 style={h2}>1. {t('legal.sections.terms.h1')}</h2>
      <p>
        BHAO is a card game for entertainment and financial-literacy education. Scenarios, returns and market events in
        the game are simplified and fictional. <strong>Nothing in BHAO is financial, investment, tax or legal advice.</strong>{' '}
        Talk to a qualified professional before making real financial decisions.
      </p>

      <h2 style={h2}>2. {t('legal.sections.terms.h2')}</h2>
      <p>
        BHAO has <strong>no real-money purchases</strong>. In-game coins are earned only by playing. Coins, rank points, XP
        and cards have no real-world monetary value, can't be bought, sold or exchanged for money, and are not your
        property. BHAO is not gambling. We may adjust or reset them, for example to fix bugs or balance the game.
      </p>

      <h2 style={h2}>3. {t('legal.sections.terms.h3')}</h2>
      <ul>
        <li>You must be at least 13 years old to use BHAO.</li>
        <li>Keep your login details safe; you're responsible for activity on your account.</li>
        <li>Choose a username that isn't offensive, impersonating, or infringing anyone's rights.</li>
        <li>You can delete your account at any time from your profile inside the app.</li>
      </ul>

      <h2 style={h2}>4. {t('legal.sections.terms.h4')}</h2>
      <p>
        Don't cheat, exploit bugs, use bots or scripts, harass other players, or try to break or overload the service. We
        may suspend or delete accounts that do.
      </p>

      <h2 style={h2}>5. {t('legal.sections.terms.community')}</h2>
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

      <h2 style={h2}>6. {t('legal.sections.terms.h5')}</h2>
      <p>
        BHAO is provided "as is". We work to keep it running but can't promise it will always be available, error-free,
        or that progress will never be lost. Online features may change or end.
      </p>

      <h2 style={h2}>7. {t('legal.sections.terms.h6')}</h2>
      <p>
        To the extent allowed by law, we are not liable for indirect losses or for decisions you make based on the game.
        Nothing in these terms limits rights you have under applicable consumer law.
      </p>

      <h2 style={h2}>8. {t('legal.sections.terms.h7')}</h2>
      <p>See our <Link to="/privacy">Privacy Policy</Link> for how we handle your data.</p>

      <h2 style={h2}>9. {t('legal.sections.terms.h8')}</h2>
      <p>
        We may update these terms; continued use after an update means you accept it. These terms are governed by the laws
        of India.
      </p>
    </LegalLayout>
  )
}
