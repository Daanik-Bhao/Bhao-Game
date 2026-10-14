/**
 * Dev-only UX gallery at /__ux (spec §A.2 q12). Registered in App.tsx only when
 * import.meta.env.DEV, and lazily imported there, so none of this ships in production.
 *
 * Screens that need a signed-in user or Supabase (Dashboard, Lobby, multiplayer board,
 * chat, daily reward…) are rendered here with mock props so they can be screenshotted.
 * Each area owns one registry file in src/dev/gallery/.
 */
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { PageLoader, Wordmark } from '../components/ui'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { GALLERY_SCREENS } from './gallery'
import './ux-gallery.css'

export function UxGallery() {
  const location = useLocation()
  const isIndex = location.pathname.replace(/\/+$/, '') === '/__ux'
  return (
    <Suspense fallback={<PageLoader delay={0} />}>
      <Routes>
        <Route index element={<GalleryIndex />} />
        {GALLERY_SCREENS.map(s => (
          <Route key={s.path} path={s.path} element={s.render()} />
        ))}
      </Routes>
      {!isIndex && <Link className="uxg-home" to="/__ux">__ux</Link>}
    </Suspense>
  )
}

function GalleryIndex() {
  const { i18n } = useTranslation()
  const groups = Array.from(new Set(GALLERY_SCREENS.map(s => s.group)))
  return (
    <div className="page">
      <header className="uxg-bar">
        <Wordmark />
        <span className="uxg-bar__title">UX gallery (dev only)</span>
        <LanguageSwitcher />
      </header>
      <main className="page__main page__main--read">
        <p className="lede">Mock-data renders of every screen for screenshots and QA. Language: {i18n.language}. Add <code>?lang=hi</code> to any link.</p>
        {groups.map(g => (
          <section key={g} className="uxg-group">
            <h2 className="section-title">{g}</h2>
            <ul className="uxg-list">
              {GALLERY_SCREENS.filter(s => s.group === g).map(s => (
                <li key={s.path}>
                  <Link to={`/__ux/${s.path}`}>{s.title}</Link>
                  {s.note && <span className="muted"> — {s.note}</span>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  )
}
