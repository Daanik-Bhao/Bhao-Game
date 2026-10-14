import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Eye, EyeOff, Info, Play } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { SUPABASE_NOT_CONFIGURED_MESSAGE } from '../lib/supabase'
import { Button, Input, Tabs } from '../components/ui'
import { Gullu } from '../components/mascot/Gullu'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import googleG from './google-g.svg'
import './menus.css'

/** Sign in / create account (spec §E.2): guest first (primary), Google second (outline), email form. */
export function Auth() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const [mode, setMode] = useState<'login' | 'register'>(params.get('mode') === 'register' ? 'register' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  // The "not configured" error comes from lib code in English; show the translated notice instead.
  const errorText = (err: unknown, fallback: string) =>
    !(err instanceof Error) ? fallback : err.message === SUPABASE_NOT_CONFIGURED_MESSAGE ? t('auth.unavailable') : err.message
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { login, register, loginWithGoogle, user, playAsGuest, isOnlineAvailable } = useAuth()
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
        if (username.length < 3) { setError(t('auth.usernameShort')); setLoading(false); return }
        await register(email, password, username)
        localStorage.setItem('justRegistered', 'true')
      }
      navigate('/dashboard')
    } catch (err) {
      setError(errorText(err, t('auth.genericError')))
    } finally {
      setLoading(false)
    }
  }

  const handlePlayAsGuest = () => {
    playAsGuest()
    navigate('/dashboard')
  }

  const handleGoogleLogin = async () => {
    if (googleLoading) return
    setError('')
    setGoogleLoading(true)
    try {
      // Web: the page redirects to Google. Android app: resolves when the Custom
      // Tab flow ends; on success the auth state change navigates to /dashboard.
      await loginWithGoogle()
    } catch (err) {
      setError(errorText(err, t('auth.googleFailed')))
    } finally {
      setGoogleLoading(false)
    }
  }

  const switchMode = (m: 'login' | 'register') => { setMode(m); setError('') }

  return (
    <div className="page auth">
      <header className="screen-bar">
        <Button variant="ghost" className="screen-bar__back" icon={<ArrowLeft size={22} aria-hidden="true" />} aria-label={t('common.back')} onClick={() => navigate('/')} />
      </header>
      <main className="page__main auth__main">
        <div className="auth__hero">
          <Gullu mood="wow" size={88} />
          <h1 className="page-title">{t('auth.title')}</h1>
          <p className="lede">{t('auth.subtitle')}</p>
        </div>

        <div className="auth__buttons">
          <Button size="l" block icon={<Play size={22} strokeWidth={2.25} aria-hidden="true" />} onClick={handlePlayAsGuest}>
            {t('auth.playGuest')}
          </Button>
          <Button
            variant="outline"
            size="l"
            block
            className="auth__google"
            loading={googleLoading}
            icon={<img src={googleG} width={20} height={20} alt="" aria-hidden="true" />}
            onClick={handleGoogleLogin}
          >
            {googleLoading ? t('auth.googleOpening') : t('auth.google')}
          </Button>
          <p className="auth__guest-note">{t('auth.guestNote')}</p>
        </div>

        {!isOnlineAvailable && (
          <p className="notice notice--risk" role="status">
            <Info size={18} strokeWidth={2.25} aria-hidden="true" />
            <span>{t('auth.unavailable')}</span>
          </p>
        )}

        <div className="auth__divider" role="separator"><span>{t('auth.orEmail')}</span></div>

        <Tabs
          ariaLabel={t('auth.modeLabel')}
          value={mode}
          onChange={switchMode}
          className="auth__tabs"
          items={[
            { value: 'login', label: t('auth.signInTab'), controls: 'auth-form' },
            { value: 'register', label: t('auth.registerTab'), controls: 'auth-form' },
          ]}
        />

        <form id="auth-form" className="auth__form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <Input
              id="username"
              name="username"
              label={t('auth.usernameLabel')}
              placeholder={t('auth.usernamePlaceholder')}
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          )}
          <Input
            id="email"
            name="email"
            type="email"
            label={t('auth.emailLabel')}
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <div className="auth__password">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              label={mode === 'register' ? t('auth.passwordNew') : t('auth.passwordLabel')}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              minLength={6}
              required
            />
            <Button
              variant="ghost"
              size="s"
              className="auth__show"
              icon={showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              aria-pressed={showPassword}
              onClick={() => setShowPassword(v => !v)}
            >
              {showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            </Button>
          </div>

          {error && <p className="notice notice--error" role="alert">{error}</p>}

          <Button type="submit" variant="secondary" size="l" block loading={loading}>
            {mode === 'login' ? t('auth.signIn') : t('auth.submit')}
          </Button>
        </form>

        <div className="auth__lang">
          <LanguageSwitcher variant="segmented" />
        </div>

        <p className="auth__legal">
          {t('auth.agree')}{' '}
          <Link to="/privacy">{t('legal.privacyShort')}</Link>
          <span aria-hidden="true"> · </span>
          <Link to="/terms">{t('legal.termsShort')}</Link>
        </p>
      </main>
    </div>
  )
}
