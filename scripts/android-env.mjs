/* eslint-env node */
// Shared Android toolchain lookup for the scripts/android-*.mjs helpers.
// Toolchain defaults to C:\Users\Administrator\AndroidDev (see docs/android-build.md);
// JAVA_HOME / ANDROID_HOME (or ANDROID_SDK_ROOT) already set in the environment win,
// and BHAO_ANDROID_TOOLCHAIN moves the default folder.
import fs from 'fs'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const ANDROID_DIR = path.join(REPO_ROOT, 'android')
export const TOOLCHAIN = process.env.BHAO_ANDROID_TOOLCHAIN || 'C:\\Users\\Administrator\\AndroidDev'
export const KEYSTORE_PROPERTIES = path.join(ANDROID_DIR, 'keystore.properties')
export const DEFAULT_UPLOAD_KEYSTORE = path.join(TOOLCHAIN, 'keys', 'bhao-upload.jks')
export const DEBUG_KEYSTORE = path.join(os.homedir(), '.android', 'debug.keystore')
const isWin = os.platform() === 'win32'

/** Process env with JAVA_HOME / ANDROID_HOME / ANDROID_SDK_ROOT filled in and the JDK first on PATH. */
export function androidEnv() {
  const env = { ...process.env }
  env.JAVA_HOME ||= path.join(TOOLCHAIN, 'jdk21')
  env.ANDROID_HOME ||= env.ANDROID_SDK_ROOT || path.join(TOOLCHAIN, 'sdk')
  env.ANDROID_SDK_ROOT ||= env.ANDROID_HOME
  const pathKey = Object.keys(env).find(k => k.toUpperCase() === 'PATH') || 'PATH'
  env[pathKey] = path.join(env.JAVA_HOME, 'bin') + path.delimiter + (env[pathKey] || '')
  return env
}

/** Path of a JDK tool (java, keytool) or null if the JDK is missing. */
export function jdkTool(env, name) {
  const p = path.join(env.JAVA_HOME, 'bin', isWin ? `${name}.exe` : name)
  return fs.existsSync(p) ? p : null
}

/** Newest installed build-tools tool (zipalign, apksigner, aapt2), or null. */
export function buildTool(env, name) {
  const dir = path.join(env.ANDROID_HOME, 'build-tools')
  if (!fs.existsSync(dir)) return null
  const versions = fs.readdirSync(dir).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).reverse()
  for (const v of versions) {
    for (const file of isWin ? [`${name}.exe`, `${name}.bat`] : [name]) {
      const p = path.join(dir, v, file)
      if (fs.existsSync(p)) return p
    }
  }
  return null
}

/**
 * Minimal java.util.Properties reader (key=value / key:value, # and ! comments,
 * backslash escapes). Enough for android/keystore.properties.
 */
export function readProperties(file) {
  const out = {}
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].replace(/^\s+/, '')
    if (!line || line.startsWith('#') || line.startsWith('!')) continue
    while (/(^|[^\\])(\\\\)*\\$/.test(line) && i + 1 < lines.length) {
      line = line.slice(0, -1) + lines[++i].replace(/^\s+/, '')
    }
    const m = /^((?:\\.|[^=:\s\\])+)\s*[=:\s]\s*(.*)$/.exec(line)
    if (!m) continue
    const unescape = s => s.replace(/\\(.)/g, (_, c) => ({ t: '\t', n: '\n', r: '\r', f: '\f' })[c] ?? c)
    out[unescape(m[1])] = unescape(m[2])
  }
  return out
}

/** Escapes a value for a .properties file (backslashes, leading spaces, newlines). */
export function escapePropertyValue(value) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/^\s/, m => '\\' + m)
}

/** Resolves keystore.properties' storeFile the way build.gradle does (relative to android/). */
export function resolveStoreFile(storeFile) {
  return path.isAbsolute(storeFile) ? storeFile : path.resolve(ANDROID_DIR, storeFile)
}
