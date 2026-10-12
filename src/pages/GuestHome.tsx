import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'

/** Home screen for guests: offline modes only, with a nudge to sign in for online play. */
export function GuestHome() {
  const { guestProfile, exitGuest, isOnlineAvailable } = useAuth()
  const navigate = useNavigate()

  const tiles = [
    { icon: '🎓', title: 'Tutorial', desc: 'Learn the cards in 2 minutes.', to: '/tutorial' },
    { icon: '🏔️', title: 'Campaign', desc: 'Play through the life-stage levels.', to: '/campaign' },
    { icon: '🤖', title: 'Practice vs Bots', desc: 'A quick game against computer players.', to: '/game?mode=practice' },
  ]

  return (
    <main style={{ minHeight: '100vh', padding: 'max(24px, env(safe-area-inset-top)) 16px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 12 }}>
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--green-primary)', textDecoration: 'none' }}>BHAO</Link>
          <span style={{ fontSize: 14, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Playing as <strong>{guestProfile?.username ?? 'Guest'}</strong>
          </span>
        </header>

        <h1 style={{ fontSize: 28, fontFamily: 'var(--font-display)', color: 'var(--text-dark)', margin: '0 0 8px' }}>Ready to play?</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 24px', fontSize: 16 }}>
          Guest progress is saved only on this device.
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
        </div>

        <section className="glass-panel" style={{ marginTop: 24, padding: 20, borderRadius: 16, border: '1px dashed var(--green-primary)' }}>
          <h2 style={{ fontSize: 18, margin: '0 0 6px', color: 'var(--text-dark)' }}>🌐 Sign in to play online</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 14px' }}>
            Multiplayer rooms, ranked play, leaderboards, coins and daily contracts need a free account.
          </p>
          {isOnlineAvailable ? (
            <Link to="/auth?mode=register"><Button size="sm">Create free account</Button></Link>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Online play is unavailable right now.</p>
          )}
        </section>

        <footer style={{ marginTop: 32, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', fontSize: 14 }}>
          <button onClick={() => { exitGuest(); navigate('/') }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', fontSize: 14 }}>
            Exit guest mode
          </button>
          <Link to="/privacy" style={{ color: 'var(--text-muted)' }}>Privacy</Link>
          <Link to="/terms" style={{ color: 'var(--text-muted)' }}>Terms</Link>
        </footer>
      </div>
    </main>
  )
}
