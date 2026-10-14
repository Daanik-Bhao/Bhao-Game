import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, Modal, useToast } from './ui'
import './GuestMergePrompt.css'
import { syncCampaignProgress } from '../lib/campaignProgress'
import {
  acceptGuestMerge, declineGuestMerge, getGuestMergeOffer, hasImportedGuestProgress,
  setGuestMergeDecision, type GuestMergeOffer,
} from '../lib/guestMerge'

/** Screens where a dialog would interrupt play: the offer waits until the player leaves them. */
const PLAY_ROUTES = /^\/(game|multiplayer|tutorial)(\/|$)/

/**
 * Offers (once per account and device) to bring guest campaign progress and Gyaan
 * Library unlocks into the signed-in account. Renders nothing when there is nothing
 * to add, the player already decided, or Supabase is not configured.
 */
export function GuestMergePrompt({ userId }: { userId: string }) {
  const { t } = useTranslation()
  const toast = useToast()
  const { pathname } = useLocation()
  const [offer, setOffer] = useState<GuestMergeOffer | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    setOffer(null)
    // Cheap local check first: most sign-ins have no guest progress and never touch the network.
    if (!getGuestMergeOffer(userId)) return
    ;(async () => {
      // Compare against the account's real (server) progress, not just this device's copy.
      await syncCampaignProgress(userId)
      if (await hasImportedGuestProgress(userId)) {
        setGuestMergeDecision(userId, 'merged')
        return
      }
      if (!cancelled) setOffer(getGuestMergeOffer(userId))
    })()
    return () => { cancelled = true }
  }, [userId])

  if (!offer) return null

  const decline = () => {
    if (busy) return
    declineGuestMerge(userId)
    setOffer(null)
  }

  const accept = async () => {
    setBusy(true)
    const res = await acceptGuestMerge(userId)
    setBusy(false)
    if (res.status === 'failed') {
      toast.show(t('guestMerge.failed'), { tone: 'info' })
      setOffer(null) // asked again next time the app opens
      return
    }
    setOffer(null)
    toast.show(t(res.status === 'already' ? 'guestMerge.already' : 'guestMerge.done'), { tone: 'success' })
  }

  return (
    <Modal
      open={!PLAY_ROUTES.test(pathname)}
      onClose={busy ? undefined : decline}
      gullu="happy"
      gulluSize={80}
      title={t('guestMerge.title')}
      body={t('guestMerge.body')}
      actions={(
        <>
          <Button size="l" block loading={busy} onClick={accept}>{t('guestMerge.accept')}</Button>
          <Button variant="outline" block disabled={busy} onClick={decline}>{t('guestMerge.decline')}</Button>
        </>
      )}
    >
      <ul className="guest-merge__list">
        {offer.levels.length > 0 && (
          <li>{t('guestMerge.levels', { count: offer.levels.length, stars: offer.stars })}</li>
        )}
        {offer.concepts > 0 && <li>{t('guestMerge.concepts', { count: offer.concepts })}</li>}
      </ul>
      <p className="guest-merge__note">{t('guestMerge.note')}</p>
    </Modal>
  )
}
