#!/usr/bin/env node
/* eslint-env node */
/**
 * Deploys the backend (database migrations, edge functions, function secrets) to a
 * hosted Supabase project with the pinned Supabase CLI (fetched by npx, no install).
 *
 *   npm run supabase:deploy                              # DRY RUN: print the plan, change nothing
 *   npm run supabase:deploy -- --apply                   # really deploy
 *   npm run supabase:deploy -- --apply --project-ref <ref>
 *   npm run supabase:deploy -- --apply --include-all     # also push migrations older than the newest remote one
 *   npm run supabase:deploy -- --apply --yes             # don't ask before pushing migrations
 *
 * Inputs (shell variables win, then .env.local, then .env; in --apply mode anything
 * still missing is asked for when run in a terminal):
 *   SUPABASE_ACCESS_TOKEN  personal token (supabase.com/dashboard/account/tokens)
 *   SUPABASE_PROJECT_REF   or --project-ref, or derived from VITE_SUPABASE_URL
 *   SUPABASE_DB_PASSWORD   database password (needed by link / db push)
 * Secrets go to the CLI through environment variables or a temp file, never on the
 * command line, and are only ever printed masked.
 *
 * Steps (--apply), stopping at the first failure:
 *   1. supabase link --project-ref <ref>
 *   2. supabase migration list --linked             (shows what is pending)
 *   3. supabase db push --linked                    (CLI asks to confirm unless --yes)
 *   4. supabase functions deploy <name> --use-api   (every supabase/functions/<name>/index.ts,
 *                                                    skipping _shared etc.; --use-api = no Docker)
 *   5. supabase secrets set --env-file <tmp>        (keys declared in the "Edge function secrets"
 *                                                    section of .env.example; skipped if none)
 * No supabase/config.toml is needed: the CLI falls back to defaults (verify_jwt stays on).
 */
import { existsSync, readdirSync, readFileSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
import { createInterface } from 'node:readline'
import { root, loadEnv, mask, refFromUrl } from './env-check.mjs'

// Pinned so a CLI release can't change behaviour under us. Bump deliberately.
const CLI_VERSION = '2.119.0'
const CLI = `supabase@${CLI_VERSION}`
const isWin = process.platform === 'win32'

const USAGE = `usage: node scripts/supabase-deploy.mjs [--apply] [--project-ref <ref>] [--include-all] [--yes]

  (default)        dry run: print every command it would run, change nothing
  --apply          really link, push migrations, deploy functions, set secrets
  --project-ref    20-letter project ref (else SUPABASE_PROJECT_REF or VITE_SUPABASE_URL)
  --include-all    pass --include-all to "db push" (migrations older than the remote's newest)
  --yes            don't ask before "db push"
  --help           this text`

function fail(msg) {
  console.error(`\n[deploy] ${msg}\n`)
  process.exit(1)
}

// ---------------------------------------------------------------- arguments
const argv = process.argv.slice(2)
const opts = { apply: false, includeAll: false, yes: false, ref: '' }
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '--help' || a === '-h') { console.log(USAGE); process.exit(0) }
  else if (a === '--apply') opts.apply = true
  else if (a === '--include-all') opts.includeAll = true
  else if (a === '--yes' || a === '-y') opts.yes = true
  else if (a === '--project-ref') opts.ref = argv[++i] || ''
  else if (a.startsWith('--project-ref=')) opts.ref = a.slice('--project-ref='.length)
  else fail(`unknown argument "${a}"\n\n${USAGE}`)
}

// ---------------------------------------------------------------- inputs
const { env, sources } = loadEnv(['.env', '.env.local'])
const sourceOf = k => sources[k] || 'not set'

let ref = opts.ref || env.SUPABASE_PROJECT_REF || refFromUrl(env.VITE_SUPABASE_URL) || ''
const refSource = opts.ref ? '--project-ref'
  : env.SUPABASE_PROJECT_REF ? sourceOf('SUPABASE_PROJECT_REF')
  : ref ? `derived from VITE_SUPABASE_URL (${sourceOf('VITE_SUPABASE_URL')})` : 'not set'
let token = env.SUPABASE_ACCESS_TOKEN || ''
let dbPassword = env.SUPABASE_DB_PASSWORD || ''

for (const k of ['SUPABASE_ACCESS_TOKEN', 'SUPABASE_DB_PASSWORD']) {
  if (sources[k] && sources[k] !== 'shell') {
    console.log(`[deploy] note: ${k} is read from ${sources[k]}; consider setting it in the shell instead.`)
  }
}

// ---------------------------------------------------------------- what to deploy
const migrationsDir = join(root, 'supabase', 'migrations')
const functionsDir = join(root, 'supabase', 'functions')
const migrations = existsSync(migrationsDir)
  ? readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()
  : []
const functions = existsSync(functionsDir)
  ? readdirSync(functionsDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('_') && !d.name.startsWith('.'))
    .filter(d => existsSync(join(functionsDir, d.name, 'index.ts')))
    .map(d => d.name)
    .sort()
  : []

/** Keys declared (uncommented) in the "Edge function secrets" section of .env.example. */
function declaredFunctionSecrets() {
  const file = join(root, '.env.example')
  if (!existsSync(file)) return []
  const keys = []
  let inSection = false
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (/^#\s*====/.test(line)) { inSection = /edge function secrets/i.test(line) && !/end/i.test(line); continue }
    if (!inSection) continue
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/)
    if (m) keys.push(m[1])
  }
  return keys
}

const secretKeys = declaredFunctionSecrets()
const secretProblems = []
const secrets = {}
for (const k of secretKeys) {
  if (k.startsWith('VITE_')) secretProblems.push(`${k}: VITE_ keys are bundled into the app, rename it`)
  else if (k.startsWith('SUPABASE_')) secretProblems.push(`${k}: SUPABASE_* names are reserved (Supabase sets them itself)`)
  else if (!(process.env[k] ?? env[k])) secretProblems.push(`${k}: declared in .env.example but no value in shell / .env / .env.local`)
  else secrets[k] = process.env[k] ?? env[k]
}

// ---------------------------------------------------------------- plan
const tmpEnvFile = '<temp file with function secrets>'
const steps = [
  { title: 'Link the project', args: ['link', '--project-ref', ref || '<ref>'], needsPassword: true },
  { title: 'Show local vs remote migrations', args: ['migration', 'list', '--linked'], needsPassword: true },
  {
    title: 'Push pending migrations',
    args: ['db', 'push', '--linked', ...(opts.includeAll ? ['--include-all'] : []), ...(opts.yes ? ['--yes'] : [])],
    needsPassword: true,
  },
  ...functions.map(name => ({
    title: `Deploy edge function "${name}"`,
    args: ['functions', 'deploy', name, '--project-ref', ref || '<ref>', '--use-api'],
  })),
  ...(Object.keys(secrets).length
    ? [{ title: `Set ${Object.keys(secrets).length} function secret(s)`, args: ['secrets', 'set', '--env-file', tmpEnvFile, '--project-ref', ref || '<ref>'], secretsFile: true }]
    : []),
]

const missing = []
if (!token) missing.push('SUPABASE_ACCESS_TOKEN')
if (!ref) missing.push('SUPABASE_PROJECT_REF (or --project-ref, or VITE_SUPABASE_URL)')
if (!dbPassword) missing.push('SUPABASE_DB_PASSWORD')
const badRef = ref && !/^[a-z]{20}$/.test(ref)

function printPlan() {
  console.log(`\n[deploy] ${opts.apply ? 'APPLY' : 'DRY RUN (nothing will change; add --apply to deploy)'}`)
  console.log(`  CLI                    npx ${CLI}`)
  console.log(`  project ref            ${ref || '(missing)'}  [${refSource}]`)
  console.log(`  SUPABASE_ACCESS_TOKEN  ${token ? mask(token) : '(missing)'}  [${sourceOf('SUPABASE_ACCESS_TOKEN')}]`)
  console.log(`  SUPABASE_DB_PASSWORD   ${dbPassword ? `****(${dbPassword.length} chars)` : '(missing)'}  [${sourceOf('SUPABASE_DB_PASSWORD')}]`)
  if (badRef) console.log(`  !! "${ref}" does not look like a project ref (20 lowercase letters)`)

  console.log(`\n  Local migrations (${migrations.length}; only ones not yet on the remote are pushed):`)
  for (const m of migrations) console.log(`    - ${m}`)
  console.log(`\n  Edge functions to deploy (${functions.length}):`)
  for (const f of functions) console.log(`    - ${f}`)
  if (!functions.length) console.log('    (none)')
  console.log('\n  Function secrets (from the "Edge function secrets" section of .env.example):')
  if (!secretKeys.length) console.log('    no function secrets to set')
  for (const [k, v] of Object.entries(secrets)) console.log(`    - ${k} = ${mask(v)}`)
  for (const p of secretProblems) console.log(`    !! ${p}`)

  console.log('\n  Commands (SUPABASE_ACCESS_TOKEN and SUPABASE_DB_PASSWORD passed as env vars, not arguments):')
  steps.forEach((s, i) => console.log(`    ${i + 1}. npx ${CLI} ${s.args.join(' ')}`))
  if (missing.length) console.log(`\n  missing: ${missing.join(', ')}`)
}

printPlan()

if (!opts.apply) {
  console.log('\n[deploy] Dry run finished. Re-run with --apply to deploy.')
  process.exit(0)
}

// ---------------------------------------------------------------- apply
async function ask(question, hidden) {
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true })
  if (hidden) {
    const write = rl._writeToOutput?.bind(rl)
    let prompted = false
    rl._writeToOutput = s => {
      if (!prompted) {
        prompted = true
        if (write) write(s)
        else process.stdout.write(s)
      } else if (s.includes('\n')) {
        process.stdout.write('\n')
      }
    }
  }
  const answer = await new Promise(resolve => rl.question(question, resolve))
  rl.close()
  return answer.trim()
}

if (secretProblems.length) fail('Fix the function secret problems listed above first.')
if (missing.length) {
  if (!process.stdin.isTTY) fail(`Missing: ${missing.join(', ')}. Set them in the shell (see .env.example "Deploy-only").`)
  console.log('')
  if (!ref) ref = await ask('Project ref (20 letters, from your project URL): ', false)
  if (!token) token = await ask('Supabase access token (hidden): ', true)
  if (!dbPassword) dbPassword = await ask('Database password (hidden): ', true)
  if (!ref || !token || !dbPassword) fail('Project ref, access token and database password are all required.')
  for (const s of steps) s.args = s.args.map(a => (a === '<ref>' ? ref : a))
}
if (!/^[a-z]{20}$/.test(ref)) fail(`"${ref}" is not a valid project ref (20 lowercase letters, e.g. from https://<ref>.supabase.co).`)

const childEnv = { ...process.env, SUPABASE_ACCESS_TOKEN: token, SUPABASE_DB_PASSWORD: dbPassword }

/** Quote one argument for cmd.exe / sh when going through a shell. */
function quote(a) {
  if (/^[A-Za-z0-9_./:=@-]+$/.test(a)) return a
  return isWin ? `"${a.replace(/"/g, '""')}"` : `'${a.replace(/'/g, `'\\''`)}'`
}

function runCli(args) {
  const full = ['-y', CLI, ...args]
  // npx is npx.cmd on Windows, which can only be spawned through a shell.
  const r = isWin
    ? spawnSync(`npx ${full.map(quote).join(' ')}`, { cwd: root, env: childEnv, stdio: 'inherit', shell: true })
    : spawnSync('npx', full, { cwd: root, env: childEnv, stdio: 'inherit' })
  if (r.error) return { ok: false, why: r.error.message }
  return { ok: r.status === 0, why: `exit code ${r.status}` }
}

const HINTS = {
  link: 'Check SUPABASE_ACCESS_TOKEN (is it valid / not expired?), the project ref, and the database password.',
  migration: 'Could not read the remote migration history. Usually a wrong database password or a paused project.',
  db: 'A migration failed or was refused. Read the SQL error above; if it says migrations are older than the remote, re-run with --include-all.',
  functions: 'Function deploy failed. Read the bundling error above (a bad import or syntax error in the function).',
  secrets: 'Setting function secrets failed. Check the names (letters, digits, _; not starting with SUPABASE_).',
}

let tmpDir = null
try {
  for (const [i, step] of steps.entries()) {
    let args = step.args
    if (step.secretsFile) {
      tmpDir = mkdtempSync(join(tmpdir(), 'bhao-secrets-'))
      const file = join(tmpDir, 'functions.env')
      const body = Object.entries(secrets).map(([k, v]) => `${k}="${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`).join('\n')
      writeFileSync(file, body + '\n', { mode: 0o600 })
      args = args.map(a => (a === tmpEnvFile ? file : a))
    }
    console.log(`\n[deploy] step ${i + 1}/${steps.length}: ${step.title}`)
    const r = runCli(args)
    if (tmpDir) { rmSync(tmpDir, { recursive: true, force: true }); tmpDir = null }
    if (!r.ok) {
      fail(`Step ${i + 1} (${step.title}) failed (${r.why}). Nothing after it was run.\n` +
        `[deploy] ${HINTS[args[0]] || ''}`)
    }
  }
} finally {
  if (tmpDir) rmSync(tmpDir, { recursive: true, force: true })
}

console.log(`\n[deploy] Done: project ${ref} is up to date (${functions.length} function(s) deployed).`)
console.log('[deploy] Next: put VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env, run `npm run env:check`, then build.')
