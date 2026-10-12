import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { GlassPanel } from '../components/ui/GlassPanel'
import { useTranslation } from 'react-i18next'

export function Auth() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const [mode, setMode] = useState<'login' | 'register'>(params.get('mode') === 'register' ? 'register' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login, register, loginWithGoogle, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        if (username.length < 3) { setError('Username must be at least 3 characters'); setLoading(false); return }
        await register(email, password, username)
        localStorage.setItem('justRegistered', 'true')
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    try {
      await loginWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'transparent',
      fontFamily: '"Inter", "Plus Jakarta Sans", system-ui, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(32,160,96,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: -1 }} />

      {/* Background Watermark Elements */}
      <div className="watermark-bh" style={{
        position: 'absolute',
        top: '50%',
        left: '20%',
        transform: 'translate(-50%, -50%)',
        fontSize: '16vw',
        fontWeight: 800,
        color: '#15803D',
        opacity: 0.05,
        lineHeight: 0.8,
        letterSpacing: '-0.05em',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 0
      }}>
        BH
      </div>
      <div className="watermark-ao" style={{
        position: 'absolute',
        top: '50%',
        right: '20%',
        transform: 'translate(50%, -50%)',
        fontSize: '16vw',
        fontWeight: 800,
        color: '#15803D',
        opacity: 0.05,
        lineHeight: 0.8,
        letterSpacing: '-0.05em',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 0
      }}>
        AO
      </div>

      {/* Upward Progression Curve */}
      <svg
        style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          opacity: 0.05,
          pointerEvents: 'none',
          zIndex: 0
        }}
        viewBox="0 0 1000 600"
        preserveAspectRatio="none"
      >
        <path
          d="M-50 550 Q 200 500, 400 350 T 800 150 T 1050 50"
          fill="none"
          stroke="#15803D"
          strokeWidth="3"
        />
        <circle cx="200" cy="450" r="5" fill="none" stroke="#15803D" strokeWidth="2" />
        <circle cx="400" cy="350" r="4" fill="#15803D" />
        <circle cx="600" cy="225" r="5" fill="none" stroke="#15803D" strokeWidth="2" />
        <circle cx="800" cy="150" r="4" fill="#15803D" />
        <polygon points="1000,50 990,40 990,60" fill="#15803D" transform="rotate(-20 1000 50)" />
      </svg>

      {/* Embedded Game Cards */}
      <div className="bg-card" style={{
        position: 'absolute', top: '22%', left: '8%',
        width: 130, height: 90,
        background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(21,128,61,0.08)',
        borderRadius: 12, transform: 'rotate(-4deg)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 16,
        opacity: 0.6, pointerEvents: 'none', zIndex: 0,
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#15803D', opacity: 0.5, letterSpacing: '0.05em' }}>INVEST</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#15803D', marginTop: 8, opacity: 0.4 }}>+₹75,000</div>
      </div>

      <div className="bg-card" style={{
        position: 'absolute', bottom: '15%', left: '12%',
        width: 130, height: 90,
        background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(21,128,61,0.08)',
        borderRadius: 12, transform: 'rotate(6deg)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 16,
        opacity: 0.6, pointerEvents: 'none', zIndex: 0,
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#15803D', opacity: 0.5, letterSpacing: '0.05em' }}>SAVE</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#15803D', marginTop: 8, opacity: 0.4 }}>+₹25,000</div>
      </div>

      <div className="bg-card" style={{
        position: 'absolute', bottom: '22%', right: '10%',
        width: 130, height: 90,
        background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(21,128,61,0.08)',
        borderRadius: 12, transform: 'rotate(-8deg)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 16,
        opacity: 0.6, pointerEvents: 'none', zIndex: 0,
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#15803D', opacity: 0.5, letterSpacing: '0.05em' }}>SPEND</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#15803D', marginTop: 8, opacity: 0.4 }}>-₹40,000</div>
      </div>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ background: '#15803D', width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 700, boxShadow: '0 4px 12px rgba(21,128,61,0.2)' }}>
              ₹
            </div>
          </div>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontWeight: 800, fontSize: 40, fontFamily: '"Playfair Display", serif', color: '#15803D', letterSpacing: '-0.02em', margin: '0 0 4px 0' }}>
              BHAO
            </h1>
          </Link>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', margin: '0 0 16px 0', letterSpacing: '0.02em' }}>
            WELCOME
          </h2>
        </div>
 
        {/* Auth Card */}
        <GlassPanel padding="md">
          {/* Mode Toggle */}
          <div style={{ display: 'flex', marginBottom: 28, borderBottom: '2px solid #f3f4f6' }}>
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                style={{
                  flex: 1, padding: '12px 16px', border: 'none', cursor: 'pointer',
                  background: 'transparent',
                  color: mode === m ? '#15803D' : '#9ca3af',
                  fontSize: 14, fontWeight: 700, transition: 'all 0.2s', fontFamily: 'inherit',
                  borderBottom: mode === m ? '2px solid #15803D' : '2px solid transparent',
                  marginBottom: -2
                }}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>
 
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {mode === 'register' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="username" style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{t('auth.usernameLabel', 'Username')}</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <svg style={{ position: 'absolute', left: 14, color: '#9ca3af' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    aria-label={t('auth.usernamePlaceholder', 'Choose a username')}
                    placeholder={t('auth.usernamePlaceholder', 'Choose a username')}
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    style={{ width: '100%', borderRadius: 8, border: '1px solid #e5e7eb', padding: '12px 16px 12px 42px', fontSize: 14, color: '#1f2937', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' }}
                    onFocus={e => e.target.style.borderColor = '#15803D'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="email" style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Email</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <svg style={{ position: 'absolute', left: 14, color: '#9ca3af' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <input
                  id="email"
                  name="email"
                  type="email"
                  aria-label="Email Address"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ width: '100%', borderRadius: 8, border: '1px solid #e5e7eb', padding: '12px 16px 12px 42px', fontSize: 14, color: '#1f2937', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' }}
                  onFocus={e => e.target.style.borderColor = '#15803D'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="password" style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{mode === 'register' ? 'Create a password' : 'Password'}</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <svg style={{ position: 'absolute', left: 14, color: '#9ca3af' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  aria-label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ width: '100%', borderRadius: 8, border: '1px solid #e5e7eb', padding: '12px 42px 12px 42px', fontSize: 14, color: '#1f2937', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' }}
                  onFocus={e => e.target.style.borderColor = '#15803D'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
                <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex', alignItems: 'center' }}>
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>
 
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#b91c1c' }}>
                {error}
              </div>
            )}
 
            <Button type="submit" size="lg" loading={loading} style={{ width: '100%', marginTop: 4, background: '#15803D', color: '#fff', borderRadius: 8, padding: '14px', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 4px 12px rgba(21,128,61,0.2)' }}>
              {mode === 'login' ? t('auth.signIn', 'Sign In') : t('auth.submit')}
            </Button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            <div style={{ padding: '0 12px', fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>OR</div>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          </div>

          <button
            onClick={handleGoogleLogin}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px',
              fontSize: 15, fontWeight: 700, color: '#374151', cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = '#f9fafb'}
            onMouseOut={e => e.currentTarget.style.background = '#fff'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <div style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: '#6b7280' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              style={{ color: '#15803D', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: 0 }}
            >
              {mode === 'login' ? 'Register' : 'Sign in'}
            </button>
          </div>
        </GlassPanel>

        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 13, color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 600 }}>
          <svg width="16" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Learn. Decide. Invest. Win.
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&display=swap');

        @media (max-width: 768px) {
          .watermark-bh { font-size: 20vw !important; left: 50% !important; top: 22% !important; transform: translate(-50%, -50%) !important; opacity: 0.04 !important; }
          .watermark-ao { font-size: 20vw !important; right: 50% !important; top: 78% !important; transform: translate(50%, -50%) !important; opacity: 0.04 !important; }
          .bg-card { display: none !important; }
        }
      `}</style>
    </div>
  )
}
