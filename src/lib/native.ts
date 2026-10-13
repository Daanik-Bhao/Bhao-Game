/**
 * Thin, guarded bridge to the Capacitor (Android) shell.
 *
 * Every export is safe to call in a normal browser: native plugins are only imported
 * (lazily) when `isNative()` is true, and every call swallows its own errors.
 */
import { Capacitor } from '@capacitor/core'
import { backStack } from './backButton'

/** Status bar colour: matches `--green-primary` / the PWA theme-color in index.html. */
export const STATUS_BAR_COLOR = '#004030'

export function isNative(): boolean {
  try {
    return Capacitor.isNativePlatform()
  } catch {
    return false
  }
}

function warn(what: string, e: unknown) {
  console.warn(`[native] ${what} failed`, e)
}

// ---------------------------------------------------------------------------
// Back button
// ---------------------------------------------------------------------------

/** Called when no registered handler took a back press. Set by the router (App.tsx). */
type UnhandledBack = (nativeCanGoBack: boolean) => void
let unhandledBack: UnhandledBack | null = null

export function setUnhandledBackHandler(fn: UnhandledBack | null) {
  unhandledBack = fn
}

/** Send the app to the background (Android). Never exits the app. No-op on the web. */
export async function minimizeApp(): Promise<void> {
  if (!isNative()) return
  try {
    const { App } = await import('@capacitor/app')
    await App.minimizeApp()
  } catch (e) {
    warn('minimizeApp', e)
  }
}

/** Exposed for tests / manual triggering: run the back-button logic once. */
export function handleBackPress(nativeCanGoBack: boolean) {
  if (backStack.dispatch()) return
  if (unhandledBack) unhandledBack(nativeCanGoBack)
  else void minimizeApp()
}

// ---------------------------------------------------------------------------
// Shell init (status bar, splash, back button)
// ---------------------------------------------------------------------------

let shellStarted = false

/** Call once at startup (main.tsx). Does nothing on the web. */
export function initNativeShell(): void {
  if (shellStarted || !isNative()) return
  shellStarted = true

  void (async () => {
    try {
      const { StatusBar, Style } = await import('@capacitor/status-bar')
      // Light icons on the dark green theme; content laid out below the bar.
      await StatusBar.setOverlaysWebView({ overlay: false }).catch(e => warn('StatusBar.setOverlaysWebView', e))
      await StatusBar.setStyle({ style: Style.Dark }).catch(e => warn('StatusBar.setStyle', e))
      await StatusBar.setBackgroundColor({ color: STATUS_BAR_COLOR }).catch(e => warn('StatusBar.setBackgroundColor', e))
    } catch (e) {
      warn('StatusBar', e)
    }
  })()

  void (async () => {
    try {
      const { App } = await import('@capacitor/app')
      await App.addListener('backButton', ({ canGoBack }) => handleBackPress(canGoBack))
    } catch (e) {
      warn('App.backButton', e)
    }
  })()

  // Hide the splash once the first frame of the React tree has painted.
  const hide = async () => {
    try {
      const { SplashScreen } = await import('@capacitor/splash-screen')
      await SplashScreen.hide()
    } catch (e) {
      warn('SplashScreen.hide', e)
    }
  }
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => { void hide() })
  else void hide()
}

// ---------------------------------------------------------------------------
// Haptics
// ---------------------------------------------------------------------------

/**
 * Vibrate with a pattern like `navigator.vibrate` ([on, off, on, ...] in ms, or a single
 * duration). Native uses @capacitor/haptics; the web uses the Vibration API if present.
 */
export function vibrate(pattern: number | number[]): void {
  const steps = Array.isArray(pattern) ? pattern : [pattern]
  if (!isNative()) {
    try {
      navigator.vibrate?.(steps)
    } catch { /* not supported */ }
    return
  }
  void (async () => {
    try {
      const { Haptics } = await import('@capacitor/haptics')
      let at = 0
      steps.forEach((ms, i) => {
        if (i % 2 === 0 && ms > 0) {
          setTimeout(() => { Haptics.vibrate({ duration: ms }).catch(e => warn('Haptics.vibrate', e)) }, at)
        }
        at += Math.max(0, ms)
      })
    } catch (e) {
      warn('Haptics', e)
    }
  })()
}

// ---------------------------------------------------------------------------
// Keep the screen awake
// ---------------------------------------------------------------------------

let awakeWanted = false
let wakeSentinel: WakeLockSentinel | null = null
let visibilityHooked = false

async function acquireWebWakeLock() {
  if (wakeSentinel || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return
  if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
  try {
    const sentinel = await navigator.wakeLock.request('screen')
    if (!awakeWanted) {
      void sentinel.release().catch(() => { /* ignore */ })
      return
    }
    wakeSentinel = sentinel
    sentinel.addEventListener('release', () => {
      if (wakeSentinel === sentinel) wakeSentinel = null
    })
  } catch {
    // Not allowed (hidden tab, permissions policy, battery saver...): just skip.
  }
}

function onVisibilityForWakeLock() {
  // The browser drops the lock whenever the page is hidden; take it again on return.
  if (awakeWanted && document.visibilityState === 'visible') void acquireWebWakeLock()
}

/** Keep the screen on (true) or let it sleep again (false). Safe to call repeatedly. */
export function keepAwake(on: boolean): void {
  if (awakeWanted === on) return
  awakeWanted = on

  if (isNative()) {
    void (async () => {
      try {
        const { KeepAwake } = await import('@capacitor-community/keep-awake')
        if (awakeWanted) await KeepAwake.keepAwake()
        else await KeepAwake.allowSleep()
      } catch (e) {
        warn('KeepAwake', e)
      }
    })()
    return
  }

  if (typeof document === 'undefined') return
  if (on) {
    if (!visibilityHooked) {
      document.addEventListener('visibilitychange', onVisibilityForWakeLock)
      visibilityHooked = true
    }
    void acquireWebWakeLock()
  } else {
    if (visibilityHooked) {
      document.removeEventListener('visibilitychange', onVisibilityForWakeLock)
      visibilityHooked = false
    }
    const sentinel = wakeSentinel
    wakeSentinel = null
    if (sentinel) void sentinel.release().catch(() => { /* ignore */ })
  }
}

// ---------------------------------------------------------------------------
// App lifecycle
// ---------------------------------------------------------------------------

/**
 * Run `cb` when the app comes back to the foreground: @capacitor/app 'resume' on native,
 * `visibilitychange` → visible on the web. Returns an unsubscribe function.
 */
export function onAppResume(cb: () => void): () => void {
  let removed = false

  if (isNative()) {
    let handle: { remove: () => Promise<void> } | null = null
    void (async () => {
      try {
        const { App } = await import('@capacitor/app')
        const h = await App.addListener('resume', () => { if (!removed) cb() })
        if (removed) void h.remove()
        else handle = h
      } catch (e) {
        warn('App.resume', e)
      }
    })()
    return () => {
      removed = true
      if (handle) void handle.remove().catch(() => { /* ignore */ })
    }
  }

  if (typeof document === 'undefined') return () => { /* nothing */ }
  const onVisible = () => {
    if (!removed && document.visibilityState === 'visible') cb()
  }
  document.addEventListener('visibilitychange', onVisible)
  return () => {
    removed = true
    document.removeEventListener('visibilitychange', onVisible)
  }
}
