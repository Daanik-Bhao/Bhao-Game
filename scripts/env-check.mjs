#!/usr/bin/env node
/* eslint-env node */
/**
 * Checks the build-time environment (the VITE_ values Vite bundles into the app)
 * before a production build, so a missing or dangerous key is caught early.
 *
 *   npm run env:check                       # Supabase keys required
 *   npm run env:check -- --allow-offline    # no Supabase keys = warning only (offline guest build)
 *
 * Files are loaded like `vite build` (mode production), later ones winning:
 *   .env, .env.local, .env.production, .env.production.local
 * and variables already set in the shell win over all files.
 *
 * Errors (exit 1): VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing or still the
 * .env.example placeholder, URL not https, key not a JWT / sb_publishable_ key, and
 * above all a service_role / sb_secret_ key (it would ship inside the app).
 * Warnings only: custom (non *.supabase.co) domain, Sentry DSN shape, TURN URL
 * without username/credential. Secret values are never printed in full.
 *
 * Also exports the small .env helpers used by scripts/supabase-deploy.mjs.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const PLACEHOLDER_URL = 'https://your-project-ref.supabase.co'
const PLACEHOLDER_KEY = 'your-anon-public-key'

/** Parse a .env file: KEY=VALUE lines, optional `export `, quotes, # comments. */
export function parseEnvFile(file) {
  const out = {}
  if (!existsSync(file)) return out
  for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = raw.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!m) continue
    let value = m[2].trim()
    const q = value[0]
    if ((q === '"' || q === "'" || q === '`') && value.indexOf(q, 1) > 0) {
      value = value.slice(1, value.indexOf(q, 1))
      if (q === '"') value = value.replace(/\\n/g, '\n')
    } else {
      value = value.replace(/\s+#.*$/, '').trim()
    }
    out[m[1]] = value
  }
  return out
}

/**
 * Merge env files (later wins), then process.env on top.
 * Returns { env, sources } where sources[KEY] is the file (or "shell") it came from.
 */
export function loadEnv(files) {
  const env = {}
  const sources = {}
  for (const name of files) {
    for (const [k, v] of Object.entries(parseEnvFile(join(root, name)))) {
      env[k] = v
      sources[k] = name
    }
  }
  for (const [k, v] of Object.entries(process.env)) {
    if (v !== undefined && (k in env || /^(VITE_|SUPABASE_)/.test(k))) {
      env[k] = v
      sources[k] = 'shell'
    }
  }
  return { env, sources }
}

/** Show just enough of a secret to recognise it: "eyJh…(208 chars)". */
export function mask(value) {
  if (!value) return '(empty)'
  if (value.length <= 8) return `****(${value.length} chars)`
  return `${value.slice(0, 4)}…(${value.length} chars)`
}

/** Decode a JWT payload, or null if it is not a decodable JWT. */
export function jwtPayload(token) {
  const parts = token.split('.')
  if (parts.length !== 3 || parts.some(p => !/^[A-Za-z0-9_-]+$/.test(p))) return null
  try {
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

/** "https://<ref>.supabase.co" -> ref, else null. */
export function refFromUrl(url) {
  const m = /^https:\/\/([a-z0-9]{20})\.supabase\.co\/?$/.exec(url || '')
  return m ? m[1] : null
}

function main() {
  const args = process.argv.slice(2)
  if (args.includes('--help') || args.includes('-h')) {
    console.log('usage: node scripts/env-check.mjs [--allow-offline]')
    process.exit(0)
  }
  const allowOffline = args.includes('--allow-offline')
  const files = ['.env', '.env.local', '.env.production', '.env.production.local']
  const { env, sources } = loadEnv(files)

  const errors = []
  const warnings = []
  const ok = []
  const from = k => (sources[k] ? ` (from ${sources[k]})` : '')

  const url = (env.VITE_SUPABASE_URL || '').trim()
  const key = (env.VITE_SUPABASE_ANON_KEY || '').trim()

  if (!url && !key && allowOffline) {
    warnings.push('No Supabase keys set: this is an OFFLINE guest build (no login, online play, leaderboard or market).')
  } else {
    // --- VITE_SUPABASE_URL
    if (!url) {
      errors.push('VITE_SUPABASE_URL is missing. Copy .env.example to .env and paste your project URL ' +
        '(Supabase dashboard > Project Settings > API). Use --allow-offline for an offline-only build.')
    } else if (url === PLACEHOLDER_URL) {
      errors.push(`VITE_SUPABASE_URL is still the placeholder from .env.example${from('VITE_SUPABASE_URL')}.`)
    } else {
      let parsed = null
      try { parsed = new URL(url) } catch { /* handled below */ }
      if (!parsed || parsed.protocol !== 'https:') {
        errors.push(`VITE_SUPABASE_URL must be an https:// URL, got "${url}"${from('VITE_SUPABASE_URL')}.`)
      } else if (refFromUrl(url)) {
        ok.push(`VITE_SUPABASE_URL = ${url}`)
      } else {
        warnings.push(`VITE_SUPABASE_URL "${url}" is not the usual https://<20-letter-ref>.supabase.co. ` +
          'Fine if it is your custom domain, otherwise check for a typo or a trailing path.')
      }
    }

    // --- VITE_SUPABASE_ANON_KEY
    if (!key) {
      errors.push('VITE_SUPABASE_ANON_KEY is missing. Paste the anon / publishable key ' +
        '(Supabase dashboard > Project Settings > API).')
    } else if (key === PLACEHOLDER_KEY) {
      errors.push(`VITE_SUPABASE_ANON_KEY is still the placeholder from .env.example${from('VITE_SUPABASE_ANON_KEY')}.`)
    } else if (key.startsWith('sb_secret_')) {
      errors.push('!!! VITE_SUPABASE_ANON_KEY is a SECRET key (sb_secret_...) !!!\n' +
        '      It would be bundled into the app and give anyone full admin access to your database.\n' +
        '      Use the publishable key (sb_publishable_...) instead, and rotate this secret key if it was ever shipped.')
    } else if (key.startsWith('sb_publishable_')) {
      ok.push(`VITE_SUPABASE_ANON_KEY = ${mask(key)} (publishable key)`)
    } else {
      const payload = jwtPayload(key)
      if (!payload) {
        errors.push(`VITE_SUPABASE_ANON_KEY ${mask(key)} does not look like a Supabase key ` +
          '(expected a JWT "xxx.yyy.zzz" or "sb_publishable_..."). Check for a copy/paste error.')
      } else if (payload.role === 'service_role') {
        errors.push('!!! VITE_SUPABASE_ANON_KEY is the SERVICE_ROLE key !!!\n' +
          '      It would be bundled into the app and give anyone full admin access to your database,\n' +
          '      bypassing every security rule. Use the "anon public" key instead, and if this build\n' +
          '      was ever shipped, rotate the JWT secret in the Supabase dashboard.')
      } else {
        if (payload.role !== 'anon') {
          warnings.push(`VITE_SUPABASE_ANON_KEY has role "${payload.role}", expected "anon".`)
        }
        const urlRef = refFromUrl(url)
        if (payload.ref && urlRef && payload.ref !== urlRef) {
          errors.push(`VITE_SUPABASE_ANON_KEY belongs to project "${payload.ref}" but VITE_SUPABASE_URL is project "${urlRef}".`)
        }
        if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) {
          errors.push('VITE_SUPABASE_ANON_KEY has expired. Copy a fresh one from the dashboard.')
        }
        if (payload.role === 'anon') ok.push(`VITE_SUPABASE_ANON_KEY = ${mask(key)} (anon JWT)`)
      }
    }
  }

  // --- Optional values (warnings only)
  const dsn = (env.VITE_SENTRY_DSN || '').trim()
  if (!dsn) {
    warnings.push('VITE_SENTRY_DSN not set: crash reporting is off (optional).')
  } else if (!/^https:\/\/[^@\s]+@[^/\s]+\/\d+$/.test(dsn)) {
    warnings.push(`VITE_SENTRY_DSN ${mask(dsn)} does not look like https://<key>@<host>/<project-id>.`)
  } else {
    ok.push(`VITE_SENTRY_DSN = ${mask(dsn)}`)
  }

  const turn = (env.VITE_TURN_URL || '').trim()
  const turnUser = (env.VITE_TURN_USERNAME || '').trim()
  const turnCred = (env.VITE_TURN_CREDENTIAL || '').trim()
  if (!turn) {
    warnings.push('VITE_TURN_URL not set: voice chat uses STUN only and may fail on strict NATs (optional).')
    if (turnUser || turnCred) warnings.push('VITE_TURN_USERNAME / VITE_TURN_CREDENTIAL are set but VITE_TURN_URL is not, so they are ignored.')
  } else {
    const bad = turn.split(',').map(s => s.trim()).filter(s => !/^turns?:/.test(s))
    if (bad.length) warnings.push(`VITE_TURN_URL entries should start with turn: or turns:, check: ${bad.join(', ')}`)
    if (!turnUser || !turnCred) {
      warnings.push('VITE_TURN_URL is set but VITE_TURN_USERNAME and/or VITE_TURN_CREDENTIAL are missing; most TURN servers will reject voice relay.')
    } else {
      ok.push(`VITE_TURN_URL = ${turn} (user ${turnUser}, credential ${mask(turnCred)})`)
    }
  }

  const loaded = files.filter(f => existsSync(join(root, f)))
  console.log(`[env] loaded: ${loaded.length ? loaded.join(', ') : 'no .env files'} (+ shell variables)`)
  for (const line of ok) console.log(`  ok    ${line}`)
  for (const line of warnings) console.log(`  warn  ${line}`)
  for (const line of errors) console.log(`  ERROR ${line}`)

  if (errors.length) {
    console.log(`\n[env] FAILED: ${errors.length} error(s), ${warnings.length} warning(s). Fix the errors above before building.`)
    process.exit(1)
  }
  console.log(`\n[env] OK: ${warnings.length} warning(s), no errors.`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()
