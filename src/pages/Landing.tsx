import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/Button'
import { FloatingBackground } from '../components/FloatingBackground'
import { useAuth } from '../hooks/useAuth'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

const FEATURE_CARDS = [
  { icon: '🎴', key: 'decisions' },
  { icon: '⚔️', key: 'attack' },
  { icon: '👑', key: 'rank' },
  { icon: '⚡', key: 'contracts' },
  // 'economy' (card trading, guilds, stock market) and 'seasons' are not built yet,
  // so they are not advertised. Their copy stays in the locale files for later.
]

const PREVIEW_CARDS = [
  { key: 'diwali', type: 'decision', color: '#209060', icon: '🟢', tier: 'common', effect: '+₹50,000' },
  { key: 'crash', type: 'action', color: '#E05020', icon: '🔴', tier: 'rare', effect: '-20%' },
  { key: 'emergency', type: 'defense', color: '#1070C0', icon: '🔵', tier: 'common', effect: 'block' },
  { key: 'blackSwan', type: 'action', color: '#FFD050', icon: '⚡', tier: 'legendary', effect: 'crisis' },
]

export function Landing() {
  const navigate = useNavigate()
  const { user, playAsGuest } = useAuth()
  const { t } = useTranslation()

  const handlePlayAsGuest = () => {
    if (!user) playAsGuest()
    navigate('/dashboard')
  }

  return (
    <main style={{ minHeight: '100vh', overflowX: 'hidden', position: 'relative', zIndex: 1 }}>
      <FloatingBackground />
      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 50,
        padding: '0 24px',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(238, 239, 224, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--green-primary)',
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--green-primary)', letterSpacing: '-0.02em' }}>
          BHAO
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <LanguageSwitcher variant="cycle" short />
          <Link to="/auth" style={{ color: 'var(--text-dark)', textDecoration: 'none', fontSize: 18, fontWeight: 500, whiteSpace: 'nowrap' }}>{t('landing.signIn')}</Link>
          <Link to="/auth?mode=register" className="landing-nav-play">
            <Button size="sm">{t('landing.playNow')}</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background is now handled globally in index.css */}

        <div style={{ animation: 'fadeIn 0.6s ease forwards', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, border: '1px solid rgba(224,80,32,0.3)', background: 'rgba(224,80,32,0.08)', marginBottom: 24 }}>
            <span style={{ fontSize: 15, color: 'var(--orange-dark)', fontWeight: 600, letterSpacing: '0.05em' }}>{t('landing.badge')}</span>
          </div>

          <h1 style={{ fontSize: 'clamp(48px, 8vw, 88px)', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 24 }}>
            <span style={{ color: 'var(--text-dark)' }}>{t('landing.hero1')}</span>{' '}
            <span style={{ color: 'var(--orange-dark)' }}>{t('landing.hero2')}</span>{' '}
            <span style={{ color: 'var(--green-primary)' }}>{t('landing.hero3')}</span>
          </h1>

          <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.6 }}>
            {t('landing.heroSub')}
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/auth?mode=register">
              <Button size="lg" variant="gold">{t('landing.startFree')}</Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="secondary">{t('landing.signIn')}</Button>
            </Link>
          </div>
          <div style={{ marginTop: 16 }}>
            <button
              onClick={handlePlayAsGuest}
              style={{ background: 'none', border: 'none', color: 'var(--green-primary)', fontSize: 17, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', padding: 8 }}
            >
              {user ? t('landing.toDashboard') : t('landing.playGuest')} →
            </button>
          </div>
        </div>

        {/* Floating Cards Preview */}
        <div style={{ marginTop: 64, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
          {PREVIEW_CARDS.map((card, i) => (
            <div key={card.key} style={{
              width: 120, height: 168,
              background: 'var(--card-paper)',
              border: `2px solid ${card.color}`,
              borderRadius: 12,
              padding: 12,
              display: 'flex', flexDirection: 'column', gap: 8,
              animation: `floatCard ${2 + i * 0.3}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: card.color, fontWeight: 800 }}>{card.icon} {t(`landing.cardType.${card.type}`)}</span>
                <span style={{ fontSize: 10, fontWeight: 800, padding: '1px 4px', borderRadius: 3, background: card.color, color: card.color === '#FFD050' ? '#000' : '#fff' }}>{t(`landing.tier.${card.tier}`)}</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-soft-black)', fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>
                {t(`landing.preview.${card.key}.name`)}
              </div>
              <div style={{ flex: 1, borderRadius: 6, background: 'rgba(255,255,255,0.5)', border: `1px solid ${card.color}33`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: card.color === '#FFD050' ? '#d97706' : card.color }}>{card.effect.startsWith('+') || card.effect.startsWith('-') ? card.effect : t(`landing.effect.${card.effect}`)}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.2 }}>{t(`landing.preview.${card.key}.desc`)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Bar */}
      <section className="glass-panel" style={{ padding: '32px 24px', borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: '1px solid var(--green-primary)', borderBottom: '1px solid var(--green-primary)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 24, textAlign: 'center' }}>
          {[
            { label: t('landing.stats.cards'), value: '108' },
            { label: t('landing.stats.goal'), value: '₹50L' },
            { label: t('landing.stats.tiers'), value: '8' },
            { label: t('landing.stats.time'), value: t('landing.stats.timeValue') },
          ].map(stat => (
            <div key={stat.label}>
              <div style={{ fontSize: 35, fontWeight: 800, color: 'var(--orange-dark)', fontFamily: 'var(--font-display)' }}>{stat.value}</div>
              <div style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 45, fontFamily: 'var(--font-display)', color: 'var(--green-primary)', marginBottom: 8 }}>{t('landing.why')}</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 56, fontSize: 18 }}>{t('landing.whySub')}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {FEATURE_CARDS.map(f => (
            <div key={f.key} className="glass-panel" style={{
              padding: '28px', borderRadius: '24px',
              transition: 'all 0.3s ease',
              border: '1px solid var(--green-primary)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--blue-primary)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--green-primary)'; (e.currentTarget as HTMLDivElement).style.transform = 'none' }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>{t(`landing.feature.${f.key}.title`)}</h3>
              <p style={{ fontSize: 18, color: 'var(--text-muted)', lineHeight: 1.6 }}>{t(`landing.feature.${f.key}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ / SEO Section for Generative AI */}
      <article style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto', color: 'var(--text-dark)' }}>
        <h2 style={{ fontSize: 36, fontFamily: 'var(--font-display)', color: 'var(--green-primary)', marginBottom: 32, textAlign: 'center' }}>
          {t('landing.faq.title')}
        </h2>
        
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{t('landing.faq.q1')}</h3>
          <p style={{ fontSize: 18, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {t('landing.faq.a1')}
          </p>
        </div>

        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{t('landing.faq.q2')}</h3>
          <p style={{ fontSize: 18, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {t('landing.faq.a2')}
          </p>
        </div>

        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{t('landing.faq.q3')}</h3>
          <p style={{ fontSize: 18, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {t('landing.faq.a3')}
          </p>
        </div>
      </article>

      {/* CTA */}
      <section className="glass-panel" style={{ padding: '80px 24px', textAlign: 'center', borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: '1px solid var(--green-primary)', borderBottom: '1px solid var(--green-primary)' }}>
        <h2 style={{ fontSize: 50, fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--green-primary)', marginBottom: 16 }}>{t('dashboard.readyToBuild')}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 23, marginBottom: 40 }}>{t('landing.ctaSub')}</p>
        <Link to="/auth?mode=register">
          <Button size="lg" variant="gold">{t('landing.ctaBtn')}</Button>
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 24px', borderTop: '1px solid var(--green-primary)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 18 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--orange-dark)', marginBottom: 8 }}>BHAO</div>
        <div>{t('landing.footer')}</div>
        <nav style={{ marginTop: 12, display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', fontSize: 16 }}>
          <Link to="/privacy" style={{ color: 'var(--text-muted)' }}>{t('legal.privacy')}</Link>
          <Link to="/terms" style={{ color: 'var(--text-muted)' }}>{t('legal.terms')}</Link>
          <a href="mailto:support@daanik.com" style={{ color: 'var(--text-muted)' }}>support@daanik.com</a>
        </nav>
      </footer>
    </main>
  )
}
