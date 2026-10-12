import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'

interface SignInRequiredProps {
  /** 'online' = feature needs an account; 'play' = offline mode, guest is enough. */
  reason?: 'online' | 'play'
}

/** Friendly gate shown instead of a hard redirect when a page needs login (or a guest session). */
export function SignInRequired({ reason = 'online' }: SignInRequiredProps) {
  const { isGuest, playAsGuest, isOnlineAvailable } = useAuth()
  const navigate = useNavigate()

  const title = reason === 'online' ? 'Sign in to play online' : 'Ready to play?'
  const body = reason === 'online'
    ? 'Multiplayer, ranked games, leaderboards and coins need a free BHAO account so we can save your progress and match you with other players.'
    : 'Sign in to save your progress across devices, or jump straight in as a guest.'

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: 420, padding: 28, borderRadius: 20, textAlign: 'center', border: '1px solid var(--green-primary)' }}>
        <div style={{ fontSize: 44, marginBottom: 8 }} aria-hidden="true">{reason === 'online' ? '🌐' : '🎴'}</div>
        <h1 style={{ fontSize: 24, fontFamily: 'var(--font-display)', color: 'var(--green-primary)', margin: '0 0 8px' }}>{title}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.5, margin: '0 0 20px' }}>{body}</p>
        {!isOnlineAvailable && (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 16px' }}>Online features are unavailable right now.</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {isOnlineAvailable && (
            <Link to="/auth"><Button style={{ width: '100%' }}>Sign in or create account</Button></Link>
          )}
          {reason === 'play' && !isGuest && (
            <Button variant="secondary" onClick={() => playAsGuest()}>Play as Guest</Button>
          )}
          <Button variant="ghost" onClick={() => navigate(isGuest ? '/dashboard' : '/')} style={{ color: 'var(--text-muted)' }}>
            {isGuest ? 'Back to guest home' : 'Go home'}
          </Button>
        </div>
      </div>
    </main>
  )
}
