#!/usr/bin/env node
/**
 * Prints the SHA-1 / SHA-256 certificate fingerprints of the Android signing keys and
 * where each one is used.
 *
 *   npm run android:sha1
 *   node scripts/android-sha1.mjs [--properties <keystore.properties>]
 *
 * Keys:
 *   - debug keystore   (%USERPROFILE%\.android\debug.keystore, signs `npm run android:apk`)
 *   - upload keystore  (from android/keystore.properties, signs `npm run android:bundle`)
 *   - Play App Signing key: Google holds it, so it cannot be read locally. Copy it from
 *     Play Console -> Test and release -> App integrity -> App signing.
 * Passwords are passed to keytool through an environment variable, never printed.
 */
import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'
import {
  KEYSTORE_PROPERTIES, DEBUG_KEYSTORE,
  androidEnv, jdkTool, readProperties, resolveStoreFile,
} from './android-env.mjs'

function fail(msg) {
  console.error(`\n[sha1] ${msg}\n`)
  process.exit(1)
}

/** Runs keytool -list -v and returns { sha1, sha256, owner, validUntil } or { error }. */
function fingerprints(keytool, env, keystore, alias, password) {
  const args = ['-list', '-v', '-keystore', keystore, '-storepass:env', 'BHAO_KS_PASS']
  if (alias) args.push('-alias', alias)
  const r = spawnSync(keytool, args, { env: { ...env, BHAO_KS_PASS: password }, encoding: 'utf8' })
  const out = `${r.stdout || ''}${r.stderr || ''}`
  if (r.error) return { error: r.error.message }
  if (r.status !== 0) return { error: out.trim().split(/\r?\n/).pop() || `keytool exited ${r.status}` }
  const field = re => (re.exec(out) || [])[1]?.trim()
  return {
    sha1: field(/SHA1:\s*([0-9A-F:]+)/i),
    sha256: field(/SHA256:\s*([0-9A-F:]+)/i),
    owner: field(/Owner:\s*(.+)/),
    validUntil: field(/until:\s*(.+)/),
  }
}

function printKey(title, file, fp) {
  console.log(`\n== ${title} ==`)
  console.log(`   file    : ${file}`)
  if (fp.error) {
    console.log(`   ERROR   : ${fp.error}`)
    return
  }
  if (fp.owner) console.log(`   owner   : ${fp.owner}`)
  if (fp.validUntil) console.log(`   valid to: ${fp.validUntil}`)
  console.log(`   SHA-1   : ${fp.sha1 ?? '?'}`)
  console.log(`   SHA-256 : ${fp.sha256 ?? '?'}`)
}

function main() {
  const argv = process.argv.slice(2)
  const i = argv.indexOf('--properties')
  const propsFile = path.resolve(i >= 0 ? argv[i + 1] : KEYSTORE_PROPERTIES)

  const env = androidEnv()
  const keytool = jdkTool(env, 'keytool')
  if (!keytool) fail(`keytool not found under JAVA_HOME=${env.JAVA_HOME}. Install JDK 21 (docs/android-build.md).`)

  // 1. Debug keystore (Android Gradle creates it on the first debug build).
  if (fs.existsSync(DEBUG_KEYSTORE)) {
    printKey('Debug key (npm run android:apk builds)', DEBUG_KEYSTORE,
      fingerprints(keytool, env, DEBUG_KEYSTORE, 'androiddebugkey', 'android'))
  } else {
    console.log(`\n== Debug key ==\n   not found at ${DEBUG_KEYSTORE} (run npm run android:apk once to create it)`)
  }

  // 2. Upload keystore.
  if (fs.existsSync(propsFile)) {
    const p = readProperties(propsFile)
    if (!p.storeFile || !p.storePassword) {
      console.log(`\n== Upload key ==\n   ${propsFile} has no storeFile/storePassword`)
    } else {
      const store = resolveStoreFile(p.storeFile)
      printKey(`Upload key (npm run android:bundle, alias ${p.keyAlias || '?'})`, store,
        fs.existsSync(store)
          ? fingerprints(keytool, env, store, p.keyAlias, p.storePassword)
          : { error: 'keystore file not found (restore it from your backup)' })
    }
  } else {
    console.log('\n== Upload key ==\n   not created yet: run  npm run android:keystore')
  }

  console.log(`
== Play App Signing key (the key users' phones actually see) ==
   Google keeps this key; it is NOT on this computer. After the first AAB upload, copy its
   SHA-1 / SHA-256 from: Play Console -> (app) -> Test and release -> App integrity
   -> "App signing" tab -> "App signing key certificate".

== Where to paste them ==
   Google login in the app opens Google in a Custom Tab and returns via the deep link
   com.daanik.bhao://login-callback. That flow uses the WEB OAuth client, so it does NOT
   need any SHA-1 to work. Paste these only where noted:

   * Supabase Dashboard -> Authentication -> URL Configuration -> Redirect URLs:
       add  com.daanik.bhao://login-callback          (no SHA needed)
   * Supabase Dashboard -> Authentication -> Sign In / Providers -> Google:
       Client ID + Client Secret of the WEB application OAuth client
       (Google Cloud Console -> APIs & Services -> Credentials). No SHA here.
   * Google Cloud Console -> APIs & Services -> Credentials -> Create credentials
     -> OAuth client ID -> type "Android" (package com.daanik.bhao):
       optional today; needed only if the app later switches to native Google Sign-In
       (Credential Manager). One Android client per SHA-1: create one with the
       Play App Signing SHA-1 (store installs), one with the upload SHA-1 and one with
       the debug SHA-1 (local test builds).
   * Android App Links / assetlinks.json (only if you add https deep links later):
       use the SHA-256 values (Play App Signing + upload + debug).
`)
}

main()
