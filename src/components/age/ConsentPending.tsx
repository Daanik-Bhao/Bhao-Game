import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { buttonClass } from '../ui'
import { Gullu } from '../mascot/Gullu'
import { ParentConsentCard } from './ParentConsentCard'
import '../../pages/menus.css'
import './age.css'

/**
 * Shown instead of an online feature (ranked, multiplayer, leaderboard, chat, sync) while a
 * 13–17 account waits for a parent's consent. Offline play stays one tap away.
 */
export function ConsentPendingScreen() {
  const { t } = useTranslation()
  return (
    <div className="page signin consent-pending">
      <main className="page__main consent-pending__main">
        <div className="consent-pending__hero">
          <Gullu mood="think" size={80} />
          <h1 className="page-title">{t('consent.pending.title')}</h1>
          <p className="lede">{t('consent.pending.body')}</p>
        </div>
        <ParentConsentCard />
        <Link to="/dashboard" className={buttonClass('outline', 'l', { block: true })}>{t('consent.pending.playOffline')}</Link>
      </main>
    </div>
  )
}
