import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { progressOwnerKey } from '../lib/campaignProgress'
import { HomeView } from './menus/HomeView'
import { GuestProfileView } from './menus/ProfileView'
import { useHomeHero, useLibraryCount } from './menus/homeData'
import { ContinueMatchPrompt } from '../components/ContinueMatchPrompt'
import { matchOwnerKey } from '../lib/matchSave'

/**
 * Home for guests (`/dashboard`, spec §E.4): offline modes only, a nudge to sign in, and the
 * guest Profile at `/dashboard?tab=profile` (settings + "Exit guest mode"). Guests never see coins.
 */
export function GuestHome() {
  const { guestProfile, exitGuest, isOnlineAvailable } = useAuth()
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
      />
    )
  }

  return (
    <>
      <HomeView name={name} signedIn={false} hero={hero} library={library} onlineAvailable={isOnlineAvailable} />
      <ContinueMatchPrompt owner={matchOwnerKey(null, guestProfile?.id)} />
    </>
  )
}
