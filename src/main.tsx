import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/fonts.css'
import './styles/tokens.css'
import './components/ui/ui.css'
import './index.css'
import './i18n/i18n'
import App from './App'
import { initNativeShell } from './lib/native'
import { initSentry } from './lib/telemetry'

// Sentry is optional: without a DSN (local dev, forks, previews) it is skipped entirely.
// Replay and performance tracing run only for a known adult on this device (child-safe
// default, decided from the stored age band before init; see src/lib/telemetry.ts).
initSentry(import.meta.env.VITE_SENTRY_DSN as string | undefined, import.meta.env.MODE, import.meta.env.PROD)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Android shell (status bar, splash, back button). No-op in the browser.
initNativeShell()
