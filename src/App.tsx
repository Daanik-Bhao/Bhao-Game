import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import React from 'react'
import { Suspense, lazy } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { MotionConfig } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { PageLoader } from './components/ui/misc'
import { Button } from './components/ui/Button'
import { ToastProvider } from './components/ui/toast'
import { Gullu } from './components/mascot/Gullu'
import { useReducedEffects } from './hooks/useReducedEffects'
import { useNativeBackNavigation } from './hooks/useBackButton'

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
const Library = retryLazy(() => import('./pages/Library').then(m => ({ default: m.Library })))
const GuestHome = retryLazy(() => import('./pages/GuestHome').then(m => ({ default: m.GuestHome })))
const SignInRequired = retryLazy(() => import('./pages/SignInRequired').then(m => ({ default: m.SignInRequired })))
const Privacy = retryLazy(() => import('./pages/Legal').then(m => ({ default: m.Privacy })))
const Terms = retryLazy(() => import('./pages/Legal').then(m => ({ default: m.Terms })))

import * as Sentry from '@sentry/react'

// Sentry.ErrorBoundary (not a custom class) so crashes reach the dashboard. Spec §D.12.
function FallbackComponent() {
  const { t } = useTranslation()
  return (
    <div role="alert" className="page error-page">
      <Gullu mood="worried" size={96} />
      <h1 className="page-title">{t('common.error.title')}</h1>
      <p className="lede error-page__body">{t('common.error.body')}</p>
      <div className="error-page__actions">
        <Button variant="primary" onClick={() => window.location.reload()}>{t('common.error.reload')}</Button>
        <Button variant="outline" onClick={() => window.location.assign('/')}>{t('common.error.home')}</Button>
      </div>
    </div>
  )
}

// Dev-only component gallery (/__ux): registered and imported only in dev builds, so it is
// tree-shaken from production. See src/dev/UxGallery.tsx.
const UxGallery = import.meta.env.DEV ? lazy(() => import('./dev/UxGallery').then(m => ({ default: m.UxGallery }))) : null

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

/** Android back button: router fallback when no screen handled the press. */
function NativeBackNavigation() {
  useNativeBackNavigation()
  return null
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
        <Route path="/library" element={<PlayableRoute><Library /></PlayableRoute>} />
        <Route path="/tutorial" element={<PlayableRoute><TutorialGame /></PlayableRoute>} />
        <Route path="/multiplayer" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
        <Route path="/multiplayer/:roomId" element={<ProtectedRoute><MultiplayerGame /></ProtectedRoute>} />
        {UxGallery && <Route path="/__ux/*" element={<UxGallery />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  const { reduced } = useReducedEffects()
  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'user'}>
      <BrowserRouter>
        <NativeBackNavigation />
        <Sentry.ErrorBoundary fallback={<FallbackComponent />}>
          <ToastProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </ToastProvider>
        </Sentry.ErrorBoundary>
      </BrowserRouter>
    </MotionConfig>
  )
}
