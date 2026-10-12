import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

const CONTACT_EMAIL = 'support@daanik.com'
const LAST_UPDATED = '12 October 2026'

function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main style={{ minHeight: '100vh', padding: 'max(24px, env(safe-area-inset-top)) 16px 48px', color: 'var(--text-dark)' }}>
      <article className="glass-panel" style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(20px, 4vw, 40px)', borderRadius: 20, lineHeight: 1.65, fontSize: 16 }}>
        <nav style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 14 }}>
          <Link to="/" style={{ color: 'var(--green-primary)', fontWeight: 700 }}>← BHAO home</Link>
          <Link to="/privacy" style={{ color: 'var(--text-muted)' }}>Privacy</Link>
          <Link to="/terms" style={{ color: 'var(--text-muted)' }}>Terms</Link>
        </nav>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--green-primary)', fontSize: 'clamp(28px, 5vw, 40px)', margin: '0 0 4px' }}>{title}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 16px' }}>Last updated: {LAST_UPDATED}</p>
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
  return (
    <LegalLayout title="Privacy Policy">
      <p>
        BHAO ("we", "us") is a financial-literacy card game. This page explains what information the app handles, why, and
        the choices you have. Questions: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2 style={h2}>1. Playing as a guest</h2>
      <p>
        You can play the tutorial, campaign and practice games without an account. In guest mode we do not create any
        account on our servers. A random guest name and your campaign progress are stored only in your browser's local
        storage on your device.
      </p>

      <h2 style={h2}>2. Information we collect when you create an account</h2>
      <ul>
        <li><strong>Account details:</strong> your email address and a password (stored hashed), or your Google account email if you sign in with Google. Authentication is provided by Supabase.</li>
        <li><strong>Profile:</strong> your username and chosen avatar.</li>
        <li><strong>Game data:</strong> games played and won, win streaks, rank points, XP, in-game coins, daily-reward and contract progress, and multiplayer room state.</li>
      </ul>
      <p>Your username, avatar and game statistics may be shown to other players, for example on leaderboards and in multiplayer rooms.</p>

      <h2 style={h2}>3. Error tracking</h2>
      <p>
        If error tracking is enabled, we use Sentry to receive crash and error reports (for example the error message,
        the page you were on, your browser and device type). We configure Sentry not to send personal information such as
        your IP address or cookies by default. When an error happens, Sentry may also capture a short recording of the
        screen activity leading up to it to help us reproduce the bug; text and inputs are masked by default.
      </p>

      <h2 style={h2}>4. Data stored on your device</h2>
      <p>We use your browser's local storage (not advertising cookies) to remember:</p>
      <ul>
        <li>your sign-in session (managed by Supabase),</li>
        <li>language and sound preferences,</li>
        <li>guest profile and campaign progress,</li>
        <li>cached app files so BHAO can load quickly and work offline (service worker).</li>
      </ul>

      <h2 style={h2}>5. Third-party services</h2>
      <ul>
        <li><strong>Supabase</strong> – account authentication and database.</li>
        <li><strong>Google</strong> – optional "Sign in with Google", and Google Fonts for typography.</li>
        <li><strong>Sentry</strong> – error tracking (when enabled).</li>
        <li><strong>Vercel</strong> – website hosting.</li>
        <li>Some avatar images may be loaded from external image hosts.</li>
      </ul>
      <p>These providers process data on our behalf and may store it outside India.</p>

      <h2 style={h2}>6. What we don't do</h2>
      <p>
        We do not sell your personal data and we do not show third-party ads. BHAO uses virtual coins only; we do not
        collect bank, UPI or payment details. Nothing in the game is financial advice.
      </p>

      <h2 style={h2}>7. Keeping and deleting your data</h2>
      <p>
        We keep account data while your account exists. You can permanently delete your account and game data at any
        time from <em>Dashboard → Profile → Delete my account</em>, or by emailing us. Error reports are kept by Sentry for
        a limited period and then deleted automatically. You can clear guest data by clearing your browser's site data.
      </p>

      <h2 style={h2}>8. Your rights</h2>
      <p>
        Depending on where you live (including under India's Digital Personal Data Protection Act, 2023), you may have the
        right to access, correct or erase your personal data and to raise a grievance. Email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will respond within a reasonable time.
      </p>

      <h2 style={h2}>9. Children</h2>
      <p>
        BHAO is designed to teach money skills and may be used by teenagers. If you are under 18, please use BHAO with the
        consent of a parent or guardian. Parents who believe their child has created an account without consent can
        contact us to have it deleted.
      </p>

      <h2 style={h2}>10. Changes</h2>
      <p>We will update this page when our practices change and revise the "Last updated" date above.</p>
    </LegalLayout>
  )
}

export function Terms() {
  return (
    <LegalLayout title="Terms of Service">
      <p>
        These terms apply when you use BHAO, in a browser or as an installed app. By playing you agree to them. Questions:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2 style={h2}>1. The game</h2>
      <p>
        BHAO is a card game for entertainment and financial-literacy education. Scenarios, returns and market events in
        the game are simplified and fictional. <strong>Nothing in BHAO is financial, investment, tax or legal advice.</strong>{' '}
        Talk to a qualified professional before making real financial decisions.
      </p>

      <h2 style={h2}>2. Virtual items</h2>
      <p>
        In-game coins, rank points, XP and cards have no real-world monetary value, cannot be exchanged for money and are
        not your property. We may adjust or reset them, for example to fix bugs or balance the game.
      </p>

      <h2 style={h2}>3. Your account</h2>
      <ul>
        <li>Keep your login details safe; you're responsible for activity on your account.</li>
        <li>Choose a username that isn't offensive, impersonating, or infringing anyone's rights.</li>
        <li>You can delete your account at any time from your profile.</li>
      </ul>

      <h2 style={h2}>4. Fair play</h2>
      <p>
        Don't cheat, exploit bugs, use bots or scripts, harass other players, or try to break or overload the service. We
        may suspend or delete accounts that do.
      </p>

      <h2 style={h2}>5. Availability</h2>
      <p>
        BHAO is provided "as is". We work to keep it running but can't promise it will always be available, error-free,
        or that progress will never be lost. Online features may change or end.
      </p>

      <h2 style={h2}>6. Liability</h2>
      <p>
        To the extent allowed by law, we are not liable for indirect losses or for decisions you make based on the game.
        Nothing in these terms limits rights you have under applicable consumer law.
      </p>

      <h2 style={h2}>7. Privacy</h2>
      <p>See our <Link to="/privacy">Privacy Policy</Link> for how we handle your data.</p>

      <h2 style={h2}>8. Changes and governing law</h2>
      <p>
        We may update these terms; continued use after an update means you accept it. These terms are governed by the laws
        of India.
      </p>
    </LegalLayout>
  )
}
