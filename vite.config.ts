import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(fileURLToPath(import.meta.url))

const THEME_COLOR = '#0E4D3F'
const BACKGROUND_COLOR = '#FFF8EC'

// Service-worker registration, emitted as /registerSW.js instead of vite-plugin-pwa's
// own (injectRegister: false below). Same behaviour on the web, but it never registers
// inside the Capacitor Android app: there the files ship in the APK, and a service
// worker would keep serving an old cached build after an app update. Capacitor's
// native bridge defines window.Capacitor before any page script runs; the app is
// served from https://localhost (no port), which no web deployment uses.
const REGISTER_SW_JS = `(function () {
  if (!('serviceWorker' in navigator)) return;
  var cap = window.Capacitor;
  var isNative = (cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform()) ||
    location.origin === 'https://localhost';
  if (isNative) {
    navigator.serviceWorker.getRegistrations().then(function (regs) {
      regs.forEach(function (r) { r.unregister(); });
    }).catch(function () {});
    return;
  }
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js', { scope: '/' });
  });
})();
`

function registerServiceWorker(): Plugin {
  return {
    name: 'bhao:register-sw',
    apply: 'build',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'registerSW.js', source: REGISTER_SW_JS })
    },
    transformIndexHtml() {
      return [{ tag: 'script', attrs: { id: 'bhao-register-sw', src: '/registerSW.js' }, injectTo: 'head' }]
    },
  }
}

export default defineConfig({
  server: {
    // Agent worktrees under .claude/ are full repo copies; don't watch them. Matched relative to
    // this project's root, so a dev server started inside a worktree still watches its own files.
    watch: { ignored: (file: string) => path.relative(ROOT, file).split(path.sep).join('/').startsWith('.claude/') },
  },
  plugins: [
    react(),
    registerServiceWorker(),
    VitePWA({
      registerType: 'autoUpdate',
      // Registration is done by registerServiceWorker() above (skipped in the native app).
      injectRegister: false,
      includeAssets: ['favicon.svg', 'robots.txt', 'icons/apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'BHAO',
        short_name: 'BHAO',
        description: 'BHAO — The Money Decision Game. A fast-paced Indian personal-finance card game.',
        lang: 'en',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        theme_color: THEME_COLOR,
        background_color: BACKGROUND_COLOR,
        categories: ['games', 'education', 'finance'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache the app shell (JS/CSS/HTML + small static assets). The large
        // /avatars artwork is cached lazily at runtime instead.
        globPatterns: ['**/*.{js,css,html,svg,woff2}', 'icons/*.png'],
        globIgnores: ['avatars/**'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/avatars/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'bhao-avatars',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  esbuild: {
    drop: ['console', 'debugger'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js']
        }
      }
    }
  }
})
