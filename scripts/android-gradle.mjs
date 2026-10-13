// Runs the Android Gradle build with JAVA_HOME / ANDROID_HOME set, so `npm run android:apk`
// and `npm run android:bundle` work from a plain terminal on Windows (or anywhere).
// Usage: node scripts/android-gradle.mjs apk|bundle
// Toolchain defaults to C:\Users\Administrator\AndroidDev (see docs/android-build.md);
// JAVA_HOME / ANDROID_HOME (or ANDROID_SDK_ROOT) already set in the environment win.
import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawnSync } from 'child_process'

const TOOLCHAIN = process.env.BHAO_ANDROID_TOOLCHAIN || 'C:\\Users\\Administrator\\AndroidDev'
const ANDROID_DIR = path.resolve('android')

const TARGETS = {
  apk: {
    task: 'assembleDebug',
    output: 'app/build/outputs/apk/debug/app-debug.apk',
  },
  bundle: {
    task: 'bundleRelease',
    output: 'app/build/outputs/bundle/release/app-release.aab',
    needsKeystore: true,
  },
}

function fail(msg) {
  console.error(`\n[android] ${msg}\n`)
  process.exit(1)
}

const target = TARGETS[process.argv[2]]
if (!target) fail(`usage: node scripts/android-gradle.mjs ${Object.keys(TARGETS).join('|')}`)
if (!fs.existsSync(ANDROID_DIR)) fail('android/ not found. Run from the repo root.')

const env = { ...process.env }
env.JAVA_HOME ||= path.join(TOOLCHAIN, 'jdk21')
env.ANDROID_HOME ||= env.ANDROID_SDK_ROOT || path.join(TOOLCHAIN, 'sdk')
env.ANDROID_SDK_ROOT ||= env.ANDROID_HOME

if (!fs.existsSync(path.join(env.JAVA_HOME, 'bin', os.platform() === 'win32' ? 'java.exe' : 'java'))) {
  fail(`JDK not found at JAVA_HOME=${env.JAVA_HOME}. Install JDK 21 or set JAVA_HOME.`)
}
if (!fs.existsSync(path.join(env.ANDROID_HOME, 'platforms'))) {
  fail(`Android SDK not found at ANDROID_HOME=${env.ANDROID_HOME}. Install it or set ANDROID_HOME.`)
}
if (target.needsKeystore && !fs.existsSync(path.join(ANDROID_DIR, 'keystore.properties'))) {
  fail('android/keystore.properties is missing, so a release build would be unsigned.\n' +
    'Create the upload keystore and keystore.properties first (docs/android-build.md).')
}

// Put the JDK first on PATH too, for tools that ignore JAVA_HOME.
const pathKey = Object.keys(env).find(k => k.toUpperCase() === 'PATH') || 'PATH'
env[pathKey] = path.join(env.JAVA_HOME, 'bin') + path.delimiter + (env[pathKey] || '')

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
