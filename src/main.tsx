import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import './i18n/i18n'
import App from './App'

const sentryDsn = (import.meta.env.VITE_SENTRY_DSN as string | undefined)?.trim()

// Sentry is optional: without a DSN (local dev, forks, previews) it is skipped entirely.
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    // Don't attach IP addresses, cookies or request headers to events.
    sendDefaultPii: false,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Tracing: sample 10% in production, everything elsewhere.
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    // Session Replay: never record normal sessions, only the lead-up to an error.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
