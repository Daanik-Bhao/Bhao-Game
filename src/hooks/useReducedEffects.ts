import { useSyncExternalStore } from 'react'
import { isSoundEnabled, toggleSound } from '../lib/audio'

/* ---------------------------------------------------------------------------
   "Reduce effects" (spec §B.7): in-app toggle (pause menu + Profile), stored in
   localStorage `bhao.reduceMotion`. While on, <html data-reduce-motion="true">
   is set (CSS turns animations off) and App wraps everything in
   <MotionConfig reducedMotion="always">. The OS setting
   `prefers-reduced-motion: reduce` has the same effect.
   --------------------------------------------------------------------------- */

export const REDUCE_MOTION_KEY = 'bhao.reduceMotion'

function readPref(): boolean {
  try { return localStorage.getItem(REDUCE_MOTION_KEY) === 'true' } catch { return false }
}

let reduceSetting = typeof window !== 'undefined' ? readPref() : false
const listeners = new Set<() => void>()

function apply() {
  if (typeof document !== 'undefined') {
    if (reduceSetting) document.documentElement.setAttribute('data-reduce-motion', 'true')
    else document.documentElement.removeAttribute('data-reduce-motion')
  }
}
apply()

function subscribe(l: () => void) {
  listeners.add(l)
  const mql = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
  mql?.addEventListener?.('change', l)
  return () => { listeners.delete(l); mql?.removeEventListener?.('change', l) }
}

function osPrefersReduced(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function setReduceEffects(on: boolean) {
  reduceSetting = on
  try { localStorage.setItem(REDUCE_MOTION_KEY, String(on)) } catch { /* storage unavailable */ }
  apply()
  listeners.forEach(l => l())
}

/** True when effects must be reduced (in-app toggle OR OS setting). Use to skip confetti, particles, roll-ups. */
export function reducedEffectsNow(): boolean {
  return reduceSetting || osPrefersReduced()
}

/** `{ reduced, setting, setReduceEffects }`: `reduced` combines the OS setting and the in-app toggle. */
export function useReducedEffects() {
  const setting = useSyncExternalStore(subscribe, () => reduceSetting, () => false)
  const os = useSyncExternalStore(subscribe, osPrefersReduced, () => false)
  return { reduced: setting || os, setting, setReduceEffects }
}

/* ---------------------------------------------------------------------------
   Sound on/off shared by the pause menu and Profile (wraps lib/audio).
   --------------------------------------------------------------------------- */
const soundListeners = new Set<() => void>()
let soundOn = isSoundEnabled

export function setSoundOn(on: boolean) {
  if (on !== isSoundEnabled) soundOn = toggleSound()
  else soundOn = on
  soundListeners.forEach(l => l())
}

export function useSoundSetting() {
  const on = useSyncExternalStore(
    l => { soundListeners.add(l); return () => { soundListeners.delete(l) } },
    () => soundOn,
    () => true,
  )
  return { soundOn: on, setSoundOn }
}
