/**
 * Android hardware back button: a small stack of handlers (pure, no Capacitor here).
 *
 * Components register a handler while some UI is open (a modal, a sheet, a running game).
 * On a back press the most recently registered handler runs first; returning `false`
 * passes the press on to the next one. If nobody handles it, the app falls back to
 * router navigation (see `decideBackFallback`). `src/lib/native.ts` feeds the native
 * `backButton` event in here; on the web nothing dispatches, so this is inert.
 */

/** Return `false` to let the next handler (or the router fallback) take the press. */
export type BackHandler = () => boolean | void

export interface BackStack {
  /** Push a handler on top. Returns an unregister function (safe to call twice). */
  register(handler: BackHandler): () => void
  /** Run handlers top-down until one handles the press. True if one did. */
  dispatch(): boolean
  size(): number
}

export function createBackStack(): BackStack {
  let entries: { id: number; handler: BackHandler }[] = []
  let nextId = 1
  return {
    register(handler) {
      const id = nextId++
      entries.push({ id, handler })
      return () => { entries = entries.filter(e => e.id !== id) }
    },
    dispatch() {
      // Copy: a handler may register/unregister others while running.
      const snapshot = [...entries].reverse()
      for (const { handler } of snapshot) {
        let result: boolean | void
        try {
          result = handler()
        } catch (e) {
          console.error('[back] handler failed', e)
          continue
        }
        if (result !== false) return true
      }
      return false
    },
    size() {
      return entries.length
    },
  }
}

/** App-wide stack used by `useBackButton`. */
export const backStack = createBackStack()

/**
 * Top-level screens: back here leaves the app (minimised, never killed).
 * '/dashboard' is also the guest home (see HomeRoute in App.tsx).
 */
export const ROOT_ROUTES: readonly string[] = ['/', '/dashboard']

export type BackFallback = 'minimize' | 'back' | 'home'

/**
 * What an unhandled back press does.
 * @param pathname current router path
 * @param canGoBack there is an in-app history entry to return to
 */
export function decideBackFallback(pathname: string, canGoBack: boolean): BackFallback {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  if (ROOT_ROUTES.includes(path)) return 'minimize'
  return canGoBack ? 'back' : 'home'
}
