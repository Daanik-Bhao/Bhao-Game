#!/usr/bin/env node
/* eslint-env node */
/**
 * Creates the Google Play UPLOAD keystore (once, by the app owner) and writes the
 * git-ignored android/keystore.properties that release builds read.
 *
 *   npm run android:keystore
 *
 * Interactive: asks for the keystore path (default
 * C:\Users\Administrator\AndroidDev\keys\bhao-upload.jks, i.e. OUTSIDE the repo), the alias,
 * your name/organisation and a password (typed twice, not shown). Runs the JDK's keytool;
 * the password is passed through an environment variable, never on the command line.
 *
 * Non-interactive (tests / CI), password from BHAO_KEYSTORE_PASSWORD:
 *   node scripts/android-keystore.mjs --yes --keystore <path> [--alias bhao-upload]
 *        [--dname "CN=..., O=..., C=IN"] [--properties <path>] [--force]
 *
 * It refuses to overwrite an existing keystore, and an existing keystore.properties
 * unless --force is given.
 */
import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { spawnSync } from 'child_process'
import {
  REPO_ROOT, KEYSTORE_PROPERTIES, DEFAULT_UPLOAD_KEYSTORE,
  androidEnv, jdkTool, escapePropertyValue,
} from './android-env.mjs'

const DEFAULT_ALIAS = 'bhao-upload'

function parseArgs(argv) {
  const args = { yes: false, force: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--yes' || a === '-y') args.yes = true
    else if (a === '--force') args.force = true
    else if (a === '--keystore') args.keystore = argv[++i]
    else if (a === '--alias') args.alias = argv[++i]
    else if (a === '--dname') args.dname = argv[++i]
    else if (a === '--properties') args.properties = argv[++i]
    else if (a === '--help' || a === '-h') args.help = true
    else throw new Error(`unknown option ${a}`)
  }
  return args
}

function fail(msg) {
  console.error(`\n[keystore] ${msg}\n`)
  process.exit(1)
}

// One readline interface for the whole session; `muted` hides typed characters.
let rl = null
let muted = false
function getRl() {
  if (!rl) {
    rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    const write = rl._writeToOutput?.bind(rl)
    if (write) {
      rl._writeToOutput = s => {
        if (!muted) write(s)
        else if (s.includes('\n') || s.includes('\r')) write('\n')
      }
    }
  }
  return rl
}

function askHidden(question) {
  return new Promise(resolve => {
    const r = getRl()
    process.stdout.write(`${question}: `)
    muted = true
    r.question('', answer => {
      muted = false
      resolve(answer)
    })
  })
}

function insideRepo(p) {
  const rel = path.relative(REPO_ROOT, path.resolve(p))
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))
}

function banner(lines) {
  const width = Math.max(...lines.map(l => l.length)) + 4
  const bar = '#'.repeat(width)
  console.log(`\n${bar}`)
  for (const l of lines) console.log(`# ${l.padEnd(width - 4)} #`)
  console.log(`${bar}\n`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    console.log('usage: npm run android:keystore\n' +
      '   or: node scripts/android-keystore.mjs --yes --keystore <path> [--alias <a>] [--dname <dn>]\n' +
      '       [--properties <file>] [--force]   (password from BHAO_KEYSTORE_PASSWORD)')
    return
  }
  const interactive = !args.yes
  if (interactive && !process.stdin.isTTY) {
    fail('Run this in a terminal (it asks for a password). For scripts use --yes with BHAO_KEYSTORE_PASSWORD.')
  }

  const env = androidEnv()
  const keytool = jdkTool(env, 'keytool')
  if (!keytool) fail(`keytool not found under JAVA_HOME=${env.JAVA_HOME}. Install JDK 21 (docs/android-build.md).`)

  const propsFile = path.resolve(args.properties || KEYSTORE_PROPERTIES)
  if (fs.existsSync(propsFile) && !args.force) {
    fail(`${propsFile} already exists, so an upload keystore is probably set up already.\n` +
      'Do NOT create a second upload key unless you lost the first one.\n' +
      'If you really want to replace keystore.properties, run again with --force.')
  }

  if (interactive) {
    banner([
      'BHAO upload keystore',
      'This creates the key that signs every app update you upload to Google Play.',
      'You (the owner) choose the password. Nobody else should know it.',
    ])
  }

  // Path, alias and certificate name use safe defaults (override with --keystore / --alias /
  // --dname): owners kept typing their password into the first prompt. Only the password is asked.
  let keystore = args.keystore || DEFAULT_UPLOAD_KEYSTORE
  keystore = path.resolve(keystore)
  if (insideRepo(keystore)) fail(`${keystore} is inside the git repo. Keep the keystore OUTSIDE the repo.`)
  if (fs.existsSync(keystore)) {
    fail(`${keystore} already exists. Refusing to overwrite a keystore (that would lose the key).\n` +
      'Choose another path, or point android/keystore.properties at the existing file.')
  }

  const alias = args.alias || DEFAULT_ALIAS
  if (!/^[A-Za-z0-9._-]+$/.test(alias)) fail('Alias may only contain letters, digits, dot, dash and underscore.')

  let dname = args.dname
  if (!dname) {
    dname = 'CN=BHAO, O=Daanik, C=IN'
  }

  let password = process.env.BHAO_KEYSTORE_PASSWORD || ''
  if (interactive) {
    password = await askHidden('Choose a keystore password (min 8 characters, not shown)')
    const again = await askHidden('Type the same password again')
    if (password !== again) fail('The two passwords are different. Nothing was created; run again.')
  }
  if (password.length < 8) fail('Password must be at least 8 characters. Nothing was created.')
  if (rl) rl.close()

  fs.mkdirSync(path.dirname(keystore), { recursive: true })
  console.log(`\n[keystore] creating ${keystore} (RSA 4096, valid ~27 years) ...`)
  // PKCS12 keystores use one password for the store and the key.
  const result = spawnSync(keytool, [
    '-genkeypair', '-noprompt',
    '-keystore', keystore, '-storetype', 'PKCS12',
    '-alias', alias, '-keyalg', 'RSA', '-keysize', '4096', '-validity', '10000',
    '-dname', dname,
    '-storepass:env', 'BHAO_KS_PASS', '-keypass:env', 'BHAO_KS_PASS',
  ], { env: { ...env, BHAO_KS_PASS: password }, stdio: ['ignore', 'inherit', 'inherit'] })
  if (result.error) fail(result.error.message)
  if (result.status !== 0 || !fs.existsSync(keystore)) fail('keytool failed; nothing was written to keystore.properties.')

  const props = [
    '# BHAO release signing - written by `npm run android:keystore`.',
    '# NEVER commit this file (it is git-ignored). Back up the keystore + password.',
    `storeFile=${escapePropertyValue(keystore.replace(/\\/g, '/'))}`,
    `storePassword=${escapePropertyValue(password)}`,
    `keyAlias=${escapePropertyValue(alias)}`,
    `keyPassword=${escapePropertyValue(password)}`,
    '',
  ].join('\n')
  fs.writeFileSync(propsFile, props, { mode: 0o600 })
  console.log(`[keystore] wrote ${propsFile}`)

  banner([
    'BACK UP YOUR UPLOAD KEY NOW  -  READ THIS',
    '',
    `Keystore file : ${keystore}`,
    `Key alias     : ${alias}`,
    'Password      : the one you just typed (not stored anywhere except',
    `                ${propsFile})`,
    '',
    '1. Copy the .jks file to TWO safe places, e.g. a password manager',
    '   attachment + an offline USB drive / encrypted cloud folder.',
    '2. Save the password + alias in your password manager.',
    '3. Never commit the .jks or keystore.properties to git, never email them.',
    '',
    'If you lose this key you cannot upload updates until Google resets it',
    '(Play Console -> Test and release -> App integrity -> request upload key reset).',
    '',
    'Next: npm run android:sha1   (shows the fingerprints for Google / Supabase)',
  ])
}

main().catch(e => fail(e.message))
