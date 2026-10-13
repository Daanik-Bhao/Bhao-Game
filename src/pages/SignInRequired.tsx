import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MessageCircle, Trophy, Users } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Button, buttonClass } from '../components/ui'
import { Gullu } from '../components/mascot/Gullu'
import './menus.css'

interface SignInRequiredProps {
  /** 'online' = feature needs an account; 'play' = offline mode, guest is enough. */
  reason?: 'online' | 'play'
}

/** Friendly gate shown instead of a hard redirect when a page needs login (spec §E.9) or a guest session. */
export function SignInRequired({ reason = 'online' }: SignInRequiredProps) {
  const { isGuest, playAsGuest, isOnlineAvailable } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const homeTo = isGuest ? '/dashboard' : '/'
  const homeLabel = isGuest ? t('signin.backHome') : t('signin.goHome')

  if (reason === 'play') {
    return (
      <div className="page signin">
        <main className="page__main signin__main">
          <div className="panel signin__card">
            <Gullu mood="happy" size={88} />
            <h1 className="page-title signin__title">{t('signin.playTitle')}</h1>
            <p className="signin__body">{t('signin.playBody')}</p>
            <div className="signin__actions">
              {!isGuest && <Button size="l" block onClick={() => playAsGuest()}>{t('signin.playAsGuest')}</Button>}
              {isOnlineAvailable && <Link to="/auth" className={buttonClass('outline', 'l', { block: true })}>{t('signin.signInOrCreate')}</Link>}
              <Button variant="ghost" onClick={() => navigate(homeTo)}>{homeLabel}</Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="page signin">
      <main className="page__main signin__main">
        <div className="panel signin__card">
          <Gullu mood="wow" size={88} />
          <h1 className="page-title signin__title">{t('signin.title')}</h1>
          <p className="signin__body">{t('signin.onlineBody')}</p>
          <ul className="signin__benefits">
            <li><span className="icon-box icon-box--invest"><Users size={22} strokeWidth={2.25} aria-hidden="true" /></span>{t('signin.benefit1')}</li>
            <li><span className="icon-box icon-box--risk"><Trophy size={22} strokeWidth={2.25} aria-hidden="true" /></span>{t('signin.benefit2')}</li>
            <li><span className="icon-box icon-box--save"><MessageCircle size={22} strokeWidth={2.25} aria-hidden="true" /></span>{t('signin.benefit3')}</li>
          </ul>
          {!isOnlineAvailable && <p className="notice notice--risk" role="status">{t('signin.unavailable')}</p>}
          <div className="signin__actions">
            {isOnlineAvailable && <Link to="/auth" className={buttonClass('primary', 'l', { block: true })}>{t('signin.signIn')}</Link>}
            <Link to={homeTo} className={buttonClass('outline', 'l', { block: true })}>{homeLabel}</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
