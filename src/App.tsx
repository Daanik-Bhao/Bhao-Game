import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import React from 'react'
import { Suspense, lazy } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { WalletLoader } from './components/WalletLoader'

// Automatically reload the page if a dynamically imported chunk fails to load 
// (which happens when a new version is deployed to Vercel while a user has the app open)
const retryLazy = (componentImport: () => Promise<any>) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    )
    try {
      const component = await componentImport()
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false')
      return component
    } catch (error: any) {
      if (!pageHasAlreadyBeenForceRefreshed && (error.message?.includes('Failed to fetch dynamically imported module') || error.message?.includes('Importing a module script failed'))) {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true')
        window.location.reload()
        return { default: () => <PageLoader /> } // Return empty while reloading
      }
      throw error
    }
  })

// Lazy loaded pages to reduce initial bundle size
const Landing = retryLazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })))
const Auth = retryLazy(() => import('./pages/Auth').then(m => ({ default: m.Auth })))
const Dashboard = retryLazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Game = retryLazy(() => import('./pages/Game').then(m => ({ default: m.Game })))
const Lobby = retryLazy(() => import('./pages/Lobby').then(m => ({ default: m.Lobby })))
const MultiplayerGame = retryLazy(() => import('./pages/MultiplayerGame').then(m => ({ default: m.MultiplayerGame })))
const Campaign = retryLazy(() => import('./pages/Campaign').then(m => ({ default: m.Campaign })))
const TutorialGame = retryLazy(() => import('./pages/TutorialGame').then(m => ({ default: m.TutorialGame })))
const GuestHome = retryLazy(() => import('./pages/GuestHome').then(m => ({ default: m.GuestHome })))
const SignInRequired = retryLazy(() => import('./pages/SignInRequired').then(m => ({ default: m.SignInRequired })))
const Privacy = retryLazy(() => import('./pages/Legal').then(m => ({ default: m.Privacy })))
const Terms = retryLazy(() => import('./pages/Legal').then(m => ({ default: m.Terms })))

import * as Sentry from '@sentry/react'

// We use Sentry.ErrorBoundary instead of a custom class to capture crashes directly to the dashboard
function FallbackComponent() {
  const buttonStyle: React.CSSProperties = {
    padding: '12px 22px', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
  }
  return (
    <div role="alert" style={{ padding: '40px 16px', color: '#0b2b22', background: '#EEEFE0', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 12 }}>
      <div style={{ fontSize: 48 }} aria-hidden="true">🪙</div>
      <h1 style={{ margin: 0, fontSize: 26, color: '#004030' }}>Oops, BHAO hit a snag.</h1>
      <p style={{ margin: 0, maxWidth: 420, color: '#4b5563', lineHeight: 1.5 }}>
        Something went wrong on this screen. Reloading usually fixes it. If it keeps happening, email support@daanik.com.
      </p>
      <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => window.location.reload()} style={{ ...buttonStyle, background: '#004030', color: '#fff', border: 'none' }}>
          Reload
        </button>
        <button onClick={() => window.location.assign('/')} style={{ ...buttonStyle, background: 'transparent', color: '#004030', border: '2px solid #004030' }}>
          Go Home
        </button>
      </div>
    </div>
  )
}
// Wallet Loading Spinner for Suspense fallback
function PageLoader() {
  return <WalletLoader />
}

/** Requires a real (Supabase) account. Guests/anonymous users get a friendly sign-in prompt. */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return <PageLoader />
  }
  return user ? <>{children}</> : <SignInRequired reason="online" />
}

/** Offline modes (bots, campaign, tutorial): a signed-in user or a guest may play. */
function PlayableRoute({ children }: { children: React.ReactNode }) {
  const { user, isGuest, loading } = useAuth()
  if (loading) return <PageLoader />
  return user || isGuest ? <>{children}</> : <SignInRequired reason="play" />
}

/** Bot games for guests are always casual practice; ranked needs an account. */
function GameRoute() {
  const { user, isGuest, loading } = useAuth()
  const location = useLocation()
  if (loading) return <PageLoader />
  if (!user && !isGuest) return <SignInRequired reason="play" />
  if (!user) {
    const mode = new URLSearchParams(location.search).get('mode')
    if (!mode || mode === 'ranked') return <Navigate to="/game?mode=practice" replace />
  }
  return <Game />
}

/** Signed-in users get the full dashboard; guests get the offline guest home. */
function HomeRoute() {
  const { user, isGuest, loading } = useAuth()
  if (loading) return <PageLoader />
  if (user) return <Dashboard />
  if (isGuest) return <GuestHome />
  return <Navigate to="/auth" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/dashboard" element={<HomeRoute />} />
        <Route path="/game" element={<GameRoute />} />
        <Route path="/game/level/:levelId" element={<PlayableRoute><Game /></PlayableRoute>} />
        <Route path="/campaign" element={<PlayableRoute><Campaign /></PlayableRoute>} />
        <Route path="/tutorial" element={<PlayableRoute><TutorialGame /></PlayableRoute>} />
        <Route path="/multiplayer" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
        <Route path="/multiplayer/:roomId" element={<ProtectedRoute><MultiplayerGame /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Sentry.ErrorBoundary fallback={<FallbackComponent />}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Sentry.ErrorBoundary>
    </BrowserRouter>
  )
}
