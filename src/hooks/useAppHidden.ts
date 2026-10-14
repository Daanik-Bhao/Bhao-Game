import { useEffect, useState } from 'react'

/**
 * True while the app is in the background (Android home / phone call / app switch; a hidden
 * tab on the web). Timers keep running in a backgrounded WebView, so match pages use this to
 * freeze the turn timer, the bots and the match clock.
 */
export function useAppHidden(): boolean {
  const [hidden, setHidden] = useState(() => typeof document !== 'undefined' && document.visibilityState === 'hidden')
  useEffect(() => {
    const onVisibility = () => setHidden(document.visibilityState === 'hidden')
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])
  return hidden
}
