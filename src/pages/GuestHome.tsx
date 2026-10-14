import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { progressOwnerKey } from '../lib/campaignProgress'
import { HomeView } from './menus/HomeView'
import { GuestProfileView } from './menus/ProfileView'
import { useHomeHero, useLibraryCount } from './menus/homeData'
import { ContinueMatchPrompt } from '../components/ContinueMatchPrompt'
import { ParentConsentCard } from '../components/age/ParentConsentCard'
import { DeleteAccountButton } from '../components/DeleteAccountButton'
import { matchOwnerKey } from '../lib/matchSave'

/**
 * Home for guests (`/dashboard`, spec §E.4): offline modes only, a nudge to sign in, and the
 * guest Profile at `/dashboard?tab=profile` (settings + "Exit guest mode"). Guests never see coins.
 *
 * A 13–17 account waiting for its parent's consent lands here too: it plays locally as this
 * device's guest (nothing is written to the server), sees the consent card instead of the
 * sign-in nudge, and its Profile offers Sign out / Delete account.
 */
export function GuestHome() {
  const { guestProfile, exitGuest, isOnlineAvailable, pendingConsent, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const ownerKey = progressOwnerKey(null)
  const hero = useHomeHero(ownerKey)
  const library = useLibraryCount(ownerKey)
  const name = guestProfile?.username ?? t('guest.guest')

  if (params.get('tab') === 'profile') {
    return (
      <GuestProfileView
        name={name}
        onlineAvailable={isOnlineAvailable}
        onExitGuest={() => { exitGuest(); navigate('/') }}
        pendingAccount={pendingConsent ? {
          onSignOut: () => { void logout().then(() => navigate('/')) },
          dangerZone: <DeleteAccountButton />,
        } : undefined}
      />
    )
  }

  return (
    <>
      <HomeView
        name={name}
        signedIn={false}
        hero={hero}
        library={library}
        onlineAvailable={isOnlineAvailable}
        consentPending={pendingConsent}
        notice={pendingConsent ? <ParentConsentCard /> : undefined}
      />
      <ContinueMatchPrompt owner={matchOwnerKey(null, guestProfile?.id)} />
    </>
  )
}
