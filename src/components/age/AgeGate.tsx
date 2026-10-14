import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { PageLoader } from '../ui'
import { getDeviceAge, getUnderAgeBlock, recordDeviceAge } from '../../lib/ageGate'
import { applyChildSafeTelemetry } from '../../lib/telemetry'
import { AgeQuestion, UnderAgeBlock } from './AgeQuestion'

/**
 * Wraps every screen that lets someone play or use an account (docs/age-policy.md, Option B).
 * Legal pages, the parent pages, Landing and Auth are NOT wrapped, so they always stay reachable.
 *
 * - Signed in, account without an age record (first Google sign-in, or older accounts):
 *   ask once, before any profile is written. Under 13 closes the account.
 * - Guest on this device and the device has not answered yet: ask once before playing.
 * - An under-13 answer on this device: friendly block until the cooldown ends.
 *
 * Answered devices and accounts go straight through (Android returning players land on
 * Home as before; Continue-match, guest-merge and tutorial prompts are unaffected).
 */
export function AgeGate({ children }: { children: ReactNode }) {
  const { authUser, loading, needsAgeAnswer, submitAccountAge, isGuest, pendingConsent, exitGuest, logout } = useAuth()
  // Re-render after a device answer (the answer itself lives in localStorage).
  const [, setAnswered] = useState(0)
  const [blocked, setBlocked] = useState(false)

  if (loading) return <PageLoader />

  if (authUser) {
    if (needsAgeAnswer) {
      // A recent under-13 answer on this device: sign out (nothing is deleted without an answer).
      if (getUnderAgeBlock() !== null) return <CloseAccount close={logout} />
      return (
        <AgeQuestion
          kind="account"
          onAnswer={async band => {
            const outcome = await submitAccountAge(band)
            if (outcome === 'blocked') setBlocked(true)
          }}
        />
      )
    }
    return <>{children}</>
  }

  if (blocked || getUnderAgeBlock() !== null) return <UnderAgeBlock />

  // A waiting-for-consent account plays as a guest, but answered at sign-up already.
  if (isGuest && !pendingConsent && !getDeviceAge()) {
    return (
      <AgeQuestion
        kind="device"
        onAnswer={band => {
          if (recordDeviceAge(band) === 'blocked') {
            exitGuest()
            setBlocked(true)
          } else {
            applyChildSafeTelemetry()
          }
          setAnswered(n => n + 1)
        }}
      />
    )
  }

  return <>{children}</>
}

/** Shows the block and signs the not-yet-answered account out once (under-13 cooldown on this device). */
function CloseAccount({ close }: { close: () => Promise<unknown> }) {
  const done = useRef(false)
  useEffect(() => {
    if (done.current) return
    done.current = true
    void close()
  }, [close])
  return <UnderAgeBlock />
}
