// Runs the Android Gradle build with JAVA_HOME / ANDROID_HOME set, so `npm run android:apk`
// and `npm run android:bundle` work from a plain terminal on Windows (or anywhere).
// Usage: node scripts/android-gradle.mjs apk|bundle|bundle-check
//   bundle-check  only runs the release pre-checks (keystore + versionCode), no build;
//                 `npm run android:bundle` runs it first so it fails before the slow web build.
// Toolchain lookup: scripts/android-env.mjs (default C:\Users\Administrator\AndroidDev).
//
// Release AABs: Google Play rejects a versionCode it has seen before. Every successful
// bundle is recorded in android/release-builds.json (commit it), and the next bundle
// refuses to build unless package.json's version was bumped (`npm run version:bump`).
// To rebuild the same version (the last AAB was never uploaded), set BHAO_ALLOW_SAME_VERSION=1.
import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawnSync } from 'child_process'
import { ANDROID_DIR, KEYSTORE_PROPERTIES, androidEnv, jdkTool } from './android-env.mjs'
import { readAppVersion, readReleaseBuilds, recordReleaseBuild, RELEASE_BUILDS } from './version.mjs'

const TARGETS = {
  apk: {
    task: 'assembleDebug',
    output: 'app/build/outputs/apk/debug/app-debug.apk',
  },
  bundle: {
    task: 'bundleRelease',
    output: 'app/build/outputs/bundle/release/app-release.aab',
    release: true,
  },
  'bundle-check': {
    release: true,
    checkOnly: true,
  },
}

function fail(msg) {
  console.error(`\n[android] ${msg}\n`)
  process.exit(1)
}

/** Refuses a versionCode that is not higher than the last recorded release AAB. */
function checkVersion() {
  const { versionName, versionCode } = readAppVersion()
  const last = readReleaseBuilds()
  const allowSame = process.env.BHAO_ALLOW_SAME_VERSION === '1'
  const lastCode = last.lastVersionCode || 0
  if (versionCode < lastCode || (versionCode === lastCode && !allowSame)) {
    fail(`STOP: version ${versionName} (versionCode ${versionCode}) was already built ` +
      `(last release AAB: ${last.lastVersionName}, versionCode ${lastCode}).\n` +
      'Google Play rejects an upload whose versionCode it has seen before.\n' +
      'Run:  npm run version:bump        (or: npm run version:bump -- minor)\n' +
      'then build again. Only if the last AAB was NEVER uploaded to Play may you rebuild\n' +
      'the same version with BHAO_ALLOW_SAME_VERSION=1.')
  }
  console.log(`[android] release version ${versionName} (versionCode ${versionCode}); ` +
    `last built: ${last.lastVersionName ?? 'none'} (${lastCode})`)
  return { versionName, versionCode }
}

const target = TARGETS[process.argv[2]]
if (!target) fail(`usage: node scripts/android-gradle.mjs ${Object.keys(TARGETS).join('|')}`)
if (!fs.existsSync(ANDROID_DIR)) fail('android/ not found. Run from the repo root.')

const env = androidEnv()
if (!jdkTool(env, 'java')) {
  fail(`JDK not found at JAVA_HOME=${env.JAVA_HOME}. Install JDK 21 or set JAVA_HOME.`)
}
if (!fs.existsSync(path.join(env.ANDROID_HOME, 'platforms'))) {
  fail(`Android SDK not found at ANDROID_HOME=${env.ANDROID_HOME}. Install it or set ANDROID_HOME.`)
}

let version = null
if (target.release) {
  if (!fs.existsSync(KEYSTORE_PROPERTIES)) {
    fail('android/keystore.properties is missing, so a release build would be unsigned.\n' +
      'Create the upload keystore and keystore.properties first (docs/android-build.md).')
  }
  version = checkVersion()
  if (target.checkOnly) {
    console.log('[android] release pre-checks passed')
    process.exit(0)
  }
}

const isWin = os.platform() === 'win32'
// Absolute path: cmd.exe may be configured not to search the current directory
// (NoDefaultCurrentDirectoryInExePath).
const gradlew = path.join(ANDROID_DIR, isWin ? 'gradlew.bat' : 'gradlew')
console.log(`[android] JAVA_HOME=${env.JAVA_HOME}`)
console.log(`[android] ANDROID_HOME=${env.ANDROID_HOME}`)
console.log(`[android] ${gradlew} ${target.task}`)

// .bat files can only be spawned through a shell on Windows (quoted for paths with spaces).
const result = isWin
  ? spawnSync(`"${gradlew}" ${target.task} --console=plain`, { cwd: ANDROID_DIR, env, stdio: 'inherit', shell: true })
  : spawnSync(gradlew, [target.task, '--console=plain'], { cwd: ANDROID_DIR, env, stdio: 'inherit' })
if (result.error) fail(result.error.message)
if (result.status !== 0) process.exit(result.status ?? 1)

const out = path.join(ANDROID_DIR, target.output)
if (fs.existsSync(out)) {
  const mb = (fs.statSync(out).size / 1024 / 1024).toFixed(1)
  console.log(`\n[android] built ${path.relative(process.cwd(), out)} (${mb} MB)`)
}
if (version) {
  recordReleaseBuild(version)
  console.log(`[android] recorded versionCode ${version.versionCode} in ${path.relative(process.cwd(), RELEASE_BUILDS)}.`)
  console.log('[android] Commit package.json + android/release-builds.json so the next build cannot reuse it.')
}
