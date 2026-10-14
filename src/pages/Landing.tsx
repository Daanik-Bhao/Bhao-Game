import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Globe, GraduationCap, Play, Sparkles, Sprout, Trophy, Users } from 'lucide-react'
import { Button, buttonClass } from '../components/ui'
import { Gullu } from '../components/mascot/Gullu'
import { GameCard } from '../components/GameCard'
import { AppBar } from '../components/nav/AppBar'
import { useAuth } from '../hooks/useAuth'
import type { GameCard as GameCardType } from '../types/game'
import './menus.css'
import './landing.css'
import { MIN_AGE } from '../config/age'

const SUPPORT_EMAIL = 'support@daanik.com'

/** Landing `/` (spec §E.1): "fun card game that makes you smarter with money — play free now". */
export function Landing() {
  const navigate = useNavigate()
  const { user, isGuest, playAsGuest } = useAuth()
  const { t, i18n } = useTranslation()

  // "Play free, no sign-up": guest login → home (or straight home when already signed in / guest).
  const playFree = () => {
    if (!user && !isGuest) playAsGuest()
    navigate('/dashboard')
  }

  // Three real DOM cards for the showcase (text from the locale files, so they follow the language).
  const card = (id: string, base: Omit<GameCardType, 'id' | 'name' | 'nameHi' | 'flavor' | 'flavorHi'>): GameCardType => {
    const name = t(`landing.show.${id}.name`)
    const flavor = t(`landing.show.${id}.flavor`)
    return { id: `landing-${id}-${i18n.language}`, name, nameHi: name, flavor, flavorHi: flavor, ...base }
  }
  const showcase: GameCardType[] = [
    card('crash', { type: 'action', tier: 'epic', category: 'market', effect: { type: 'attack_all_pct', value: 20, target: 'others' } }),
    card('diwali', { type: 'decision', tier: 'rare', effect: { type: 'wealth_change', value: 50000, target: 'self' } }),
    card('health', { type: 'defense', tier: 'rare', blocksCategories: ['medical'], effect: { type: 'block_card', target: 'self' } }),
  ]

  return (
    <div className="page landing">
      <AppBar
        nav={false}
        account={user ? 'auto' : 'none'}
        actions={!user && (
          <Link to="/auth" className={buttonClass('ghost', 's', { className: 'appbar__link' })}>{t('landing.signIn')}</Link>
        )}
      />
      <main className="landing__wrap">
        <section className="landing-hero" aria-labelledby="landing-h1">
          <div className="landing-hero__copy">
            <span className="landing-eyebrow"><Sparkles size={16} strokeWidth={2.25} aria-hidden="true" />{t('landing.badge')}</span>
            <h1 id="landing-h1" className="landing-h1">
              {t('landing.heroA')} <em>{t('landing.heroB')}</em> {t('landing.heroC')}
            </h1>
            <p className="landing-lede">{t('landing.heroSub')}</p>
            <div className="landing-ctas">
              <Button size="l" icon={<Play size={22} strokeWidth={2.25} aria-hidden="true" />} onClick={playFree}>
                {user ? t('landing.toHome') : t('landing.startFree')}
              </Button>
              {!user && <Link to="/auth" className={buttonClass('outline', 'l')}>{t('landing.haveAccount')}</Link>}
            </div>
            <div className="landing-trust">
              <span><GraduationCap size={18} strokeWidth={2.25} aria-hidden="true" />{t('landing.trust1')}</span>
              <span><Globe size={18} strokeWidth={2.25} aria-hidden="true" /><span lang="mul">{t('landing.trust2')}</span></span>
            </div>
          </div>

          <div className="landing-show">
            <div className="landing-show__guide">
              <Gullu mood="happy" size={72} />
              <p className="landing-bubble"><b>{t('landing.gulluTitle')}</b><span>{t('landing.gulluHi')}</span></p>
            </div>
            <div className="landing-fan">
              {showcase.map(c => <GameCard key={c.id} card={c} size="full" />)}
            </div>
          </div>
        </section>

        <section className="landing-benefits" aria-label={t('landing.benefitsLabel')}>
          <article className="panel landing-benefit">
            <span className="icon-box icon-box--save"><Sprout size={22} strokeWidth={2.25} aria-hidden="true" /></span>
            <div><h2>{t('landing.benefit1.title')}</h2><p>{t('landing.benefit1.body')}</p></div>
          </article>
          <article className="panel landing-benefit">
            <span className="icon-box icon-box--invest"><Users size={22} strokeWidth={2.25} aria-hidden="true" /></span>
            <div><h2>{t('landing.benefit2.title')}</h2><p>{t('landing.benefit2.body')}</p></div>
          </article>
          <article className="panel landing-benefit">
            <span className="icon-box icon-box--risk"><Trophy size={22} strokeWidth={2.25} aria-hidden="true" /></span>
            <div><h2>{t('landing.benefit3.title')}</h2><p>{t('landing.benefit3.body')}</p></div>
          </article>
        </section>

        <footer className="landing-footer">
          <span className="landing-footer__brand">BHAO</span>
          <Link to="/privacy">{t('legal.privacyShort')}</Link>
          <Link to="/terms">{t('legal.termsShort')}</Link>
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          <span className="landing-footer__age">{t('landing.footerAge', { age: MIN_AGE })}</span>
        </footer>
      </main>
    </div>
  )
}
