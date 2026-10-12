import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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

import * as Sentry from '@sentry/react'

// We use Sentry.ErrorBoundary instead of a custom class to capture crashes directly to the dashboard
function FallbackComponent() {
  return (
    <div style={{ padding: 40, color: 'white', background: '#dc2626', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1>Something went wrong.</h1>
      <p>Our team has been notified and we are working on a fix.</p>
    </div>
  )
}
// Wallet Loading Spinner for Suspense fallback
function PageLoader() {
  return <WalletLoader />
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return <PageLoader />
  }
  return user ? <>{children}</> : <Navigate to="/auth" replace />
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
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
        <Route path="/game/level/:levelId" element={<ProtectedRoute><Game /></ProtectedRoute>} />
        <Route path="/campaign" element={<ProtectedRoute><Campaign /></ProtectedRoute>} />
        <Route path="/tutorial" element={<ProtectedRoute><TutorialGame /></ProtectedRoute>} />
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
