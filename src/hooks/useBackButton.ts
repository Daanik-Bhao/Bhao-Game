import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { backStack, decideBackFallback, type BackHandler } from '../lib/backButton'
import { keepAwake, minimizeApp, onAppResume, setUnhandledBackHandler } from '../lib/native'

/**
 * Handle the Android back button while `enabled`. The handler is (re)pushed on top of the
 * stack whenever `enabled` turns true, so the UI opened most recently closes first.
 * Return `false` from the handler to pass the press on. Inert on the web.
 */
export function useBackButton(handler: BackHandler, enabled = true) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler
  useEffect(() => {
    if (!enabled) return
    return backStack.register(() => handlerRef.current())
  }, [enabled])
}

/**
 * Router fallback for back presses nobody handled (mount once inside the router):
 * root screens minimise the app, others go back in history (or home if there is none).
 */
export function useNativeBackNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const stateRef = useRef({ navigate, location })
  stateRef.current = { navigate, location }

  useEffect(() => {
    setUnhandledBackHandler((nativeCanGoBack) => {
      const { navigate: nav, location: loc } = stateRef.current
      // 'default' is the key of the first entry this app session created.
      const canGoBack = nativeCanGoBack && loc.key !== 'default'
      switch (decideBackFallback(loc.pathname, canGoBack)) {
        case 'minimize': void minimizeApp(); break
        case 'back': nav(-1); break
        case 'home': nav('/', { replace: true }); break
      }
    })
    return () => setUnhandledBackHandler(null)
  }, [])
}

/** Keep the screen on while `active` (a game in progress); released on false / unmount. */
export function useKeepAwake(active: boolean) {
  useEffect(() => {
    if (!active) return
    keepAwake(true)
    return () => keepAwake(false)
  }, [active])
}

/** Run `cb` whenever the app returns to the foreground (latest `cb` is always used). */
export function useAppResume(cb: () => void, enabled = true) {
  const cbRef = useRef(cb)
  cbRef.current = cb
  useEffect(() => {
    if (!enabled) return
    return onAppResume(() => cbRef.current())
  }, [enabled])
}
