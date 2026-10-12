#!/usr/bin/env node
/**
 * Bundle the pure multiplayer rules (src/lib/multiplayerAuthority.ts + the engine it uses)
 * into supabase/functions/_shared/engine.js for the Deno edge functions.
 *
 *   node scripts/build-functions.mjs           # write the bundle
 *   node scripts/build-functions.mjs --check   # exit 1 if the committed bundle is stale (CI)
 *
 * The output is committed so `supabase functions deploy` needs no build step.
 */
import { build } from 'esbuild'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const ENTRY = resolve(root, 'src/lib/multiplayerAuthority.ts')
export const OUTFILE = resolve(root, 'supabase/functions/_shared/engine.js')

const BANNER = [
  '// GENERATED FILE - do not edit. Source: src/lib/multiplayerAuthority.ts',
  '// Rebuild with: node scripts/build-functions.mjs (npm run build:functions)',
].join('\n')

/** Build the bundle in memory and return its text (LF line endings). */
export async function bundleEngine() {
  const result = await build({
    entryPoints: [ENTRY],
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    target: 'es2020',
    write: false,
    charset: 'utf8',
    legalComments: 'none',
    banner: { js: BANNER },
    logLevel: 'silent',
  })
  const text = result.outputFiles[0].text.replace(/\r\n/g, '\n')
  // Guard: the edge runtime must not need Node built-ins.
  if (/\bfrom\s+["'](node:|fs|path|os|crypto)["']|\brequire\(/.test(text)) {
    throw new Error('engine bundle unexpectedly imports Node built-ins')
  }
  return text
}

export async function isBundleUpToDate() {
  const fresh = await bundleEngine()
  let committed = ''
  try {
    committed = (await readFile(OUTFILE, 'utf8')).replace(/\r\n/g, '\n')
  } catch {
    return false
  }
  return committed === fresh
}

async function main() {
  if (process.argv.includes('--check')) {
    if (await isBundleUpToDate()) {
      console.log('engine bundle is up to date')
      return
    }
    console.error('supabase/functions/_shared/engine.js is stale: run `node scripts/build-functions.mjs` and commit it')
    process.exit(1)
  }
  const text = await bundleEngine()
  await mkdir(dirname(OUTFILE), { recursive: true })
  await writeFile(OUTFILE, text, 'utf8')
  console.log(`wrote ${OUTFILE} (${(text.length / 1024).toFixed(0)} KB)`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error(err)
    process.exit(1)
  })
}
