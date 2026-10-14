#!/usr/bin/env node
/* eslint-env node */
/**
 * Bundle the pure TypeScript shared with the Deno edge functions:
 *   - src/lib/multiplayerAuthority.ts (+ the engine it uses) -> supabase/functions/_shared/engine.js
 *   - src/lib/consentServer.ts (parental consent logic)      -> supabase/functions/_shared/consent.js
 *
 *   node scripts/build-functions.mjs           # write the bundles
 *   node scripts/build-functions.mjs --check   # exit 1 if a committed bundle is stale (CI)
 *
 * The output is committed so `supabase functions deploy` needs no build step.
 */
import { build } from 'esbuild'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export const BUNDLES = [
  { entry: resolve(root, 'src/lib/multiplayerAuthority.ts'), outfile: resolve(root, 'supabase/functions/_shared/engine.js') },
  { entry: resolve(root, 'src/lib/consentServer.ts'), outfile: resolve(root, 'supabase/functions/_shared/consent.js') },
]
// Kept for existing callers.
export const ENTRY = BUNDLES[0].entry
export const OUTFILE = BUNDLES[0].outfile

const rel = p => relative(root, p).replace(/\\/g, '/')

/** Build one bundle in memory and return its text (LF line endings). */
export async function bundle({ entry }) {
  const banner = [
    `// GENERATED FILE - do not edit. Source: ${rel(entry)}`,
    '// Rebuild with: node scripts/build-functions.mjs (npm run build:functions)',
  ].join('\n')
  const result = await build({
    entryPoints: [entry],
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    target: 'es2020',
    write: false,
    charset: 'utf8',
    legalComments: 'none',
    banner: { js: banner },
    logLevel: 'silent',
  })
  const text = result.outputFiles[0].text.replace(/\r\n/g, '\n')
  // Guard: the edge runtime must not need Node built-ins.
  if (/\bfrom\s+["'](node:|fs|path|os|crypto)["']|\brequire\(/.test(text)) {
    throw new Error(`${rel(entry)} bundle unexpectedly imports Node built-ins`)
  }
  return text
}

/** The multiplayer engine bundle (kept for existing callers). */
export function bundleEngine() {
  return bundle(BUNDLES[0])
}

async function isUpToDate(b) {
  const fresh = await bundle(b)
  try {
    return (await readFile(b.outfile, 'utf8')).replace(/\r\n/g, '\n') === fresh
  } catch {
    return false
  }
}

/** True when every committed bundle matches a fresh build. */
export async function isBundleUpToDate() {
  for (const b of BUNDLES) {
    if (!(await isUpToDate(b))) return false
  }
  return true
}

async function main() {
  if (process.argv.includes('--check')) {
    const stale = []
    for (const b of BUNDLES) {
      if (!(await isUpToDate(b))) stale.push(rel(b.outfile))
    }
    if (!stale.length) {
      console.log('function bundles are up to date')
      return
    }
    console.error(`${stale.join(', ')} stale: run \`node scripts/build-functions.mjs\` and commit the result`)
    process.exit(1)
  }
  for (const b of BUNDLES) {
    const text = await bundle(b)
    await mkdir(dirname(b.outfile), { recursive: true })
    await writeFile(b.outfile, text, 'utf8')
    console.log(`wrote ${rel(b.outfile)} (${(text.length / 1024).toFixed(0)} KB)`)
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error(err)
    process.exit(1)
  })
}
