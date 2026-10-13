import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { LibraryEntryCard } from '../components/learning/LibraryEntryCard'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

/** Home screen for guests: offline modes only, with a nudge to sign in for online play. */
export function GuestHome() {
  const { guestProfile, exitGuest, isOnlineAvailable } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const tiles = [
    { icon: '🎓', title: t('guest.tutorial'), desc: t('guest.tutorialDesc'), to: '/tutorial' },
    { icon: '🏔️', title: t('guest.campaign'), desc: t('guest.campaignDesc'), to: '/campaign' },
    { icon: '🤖', title: t('guest.practice'), desc: t('guest.practiceDesc'), to: '/game?mode=practice' },
  ]

  return (
    <main style={{ minHeight: '100vh', padding: 'max(24px, env(safe-area-inset-top)) 16px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--green-primary)', textDecoration: 'none' }}>BHAO</Link>
          <LanguageSwitcher />
          <span style={{ flexBasis: '100%', fontSize: 14, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {t('guest.playingAs')} <strong>{guestProfile?.username ?? t('guest.guest')}</strong>
          </span>
        </header>

        <h1 style={{ fontSize: 28, fontFamily: 'var(--font-display)', color: 'var(--text-dark)', margin: '0 0 8px' }}>{t('guest.ready')}</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 24px', fontSize: 16 }}>
          {t('guest.deviceOnly')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tiles.map(tile => (
            <button
              key={tile.to}
              onClick={() => navigate(tile.to)}
              className="glass-panel"
              style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 16, border: '1px solid var(--green-primary)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', width: '100%' }}
            >
              <span style={{ fontSize: 32 }} aria-hidden="true">{tile.icon}</span>
              <span>
                <span style={{ display: 'block', fontWeight: 700, fontSize: 18, color: 'var(--text-dark)' }}>{tile.title}</span>
                <span style={{ display: 'block', fontSize: 14, color: 'var(--text-muted)' }}>{tile.desc}</span>
              </span>
            </button>
          ))}
          <LibraryEntryCard variant="tile" />
        </div>

        <section className="glass-panel" style={{ marginTop: 24, padding: 20, borderRadius: 16, border: '1px dashed var(--green-primary)' }}>
          <h2 style={{ fontSize: 18, margin: '0 0 6px', color: 'var(--text-dark)' }}>🌐 {t('guest.signInTitle')}</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 14px' }}>
            {t('guest.signInBody')}
          </p>
          {isOnlineAvailable ? (
            <Link to="/auth?mode=register"><Button size="s">{t('guest.createAccount')}</Button></Link>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{t('guest.onlineUnavailable')}</p>
          )}
        </section>

        <footer style={{ marginTop: 32, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', fontSize: 14 }}>
          <button onClick={() => { exitGuest(); navigate('/') }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', fontSize: 14 }}>
            {t('guest.exit')}
          </button>
          <Link to="/privacy" style={{ color: 'var(--text-muted)' }}>{t('legal.privacyShort')}</Link>
          <Link to="/terms" style={{ color: 'var(--text-muted)' }}>{t('legal.termsShort')}</Link>
        </footer>
      </div>
    </main>
  )
}
