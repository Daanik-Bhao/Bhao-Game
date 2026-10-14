#!/usr/bin/env node
/* eslint-env node */
/**
 * App version: package.json "version" is the ONE source of truth.
 *
 *   versionName = package.json version            (e.g. 1.4.2)
 *   versionCode = major * 1000000 + minor * 1000 + patch   (1.4.2 -> 1004002)
 *
 * android/app/build.gradle applies the same rule, so the APK/AAB always match.
 * minor and patch must stay below 1000 (bump minor/major before that).
 *
 *   node scripts/version.mjs                  # show current versionName / versionCode
 *   node scripts/version.mjs bump [patch|minor|major]   (npm run version:bump -- minor)
 *
 * Google Play rejects an upload whose versionCode was used before. The last AAB built
 * by `npm run android:bundle` is recorded in android/release-builds.json (git-tracked),
 * and the bundle step refuses to build a versionCode that is not higher.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PACKAGE_JSON = path.join(root, 'package.json')
const PACKAGE_LOCK = path.join(root, 'package-lock.json')
export const RELEASE_BUILDS = path.join(root, 'android', 'release-builds.json')

const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/

export function parseVersion(version) {
  const m = SEMVER.exec(String(version).trim())
  if (!m) throw new Error(`package.json version "${version}" must look like 1.2.3 (no pre-release suffix).`)
  const [major, minor, patch] = m.slice(1).map(Number)
  if (minor > 999 || patch > 999) throw new Error(`version ${version}: minor and patch must be 0-999.`)
  if (major > 2000) throw new Error(`version ${version}: major too large for an Android versionCode.`)
  return { major, minor, patch }
}

export function versionCodeFor(version) {
  const { major, minor, patch } = parseVersion(version)
  return major * 1000000 + minor * 1000 + patch
}

export function readAppVersion() {
  const versionName = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8')).version
  return { versionName, versionCode: versionCodeFor(versionName) }
}

/** { lastVersionCode, lastVersionName, builds: [...] } — empty record if the file is missing. */
export function readReleaseBuilds() {
  if (!fs.existsSync(RELEASE_BUILDS)) return { lastVersionCode: 0, lastVersionName: null, builds: [] }
  return JSON.parse(fs.readFileSync(RELEASE_BUILDS, 'utf8'))
}

export function recordReleaseBuild({ versionName, versionCode }) {
  const data = readReleaseBuilds()
  data.lastVersionCode = versionCode
  data.lastVersionName = versionName
  data.builds = [...(data.builds || []), { versionCode, versionName, builtAt: new Date().toISOString() }]
  fs.writeFileSync(RELEASE_BUILDS, JSON.stringify(data, null, 2) + '\n')
}

export function bumpVersion(version, kind) {
  const { major, minor, patch } = parseVersion(version)
  if (kind === 'major') return `${major + 1}.0.0`
  if (kind === 'minor') return `${major}.${minor + 1}.0`
  if (kind === 'patch') return `${major}.${minor}.${patch + 1}`
  throw new Error(`unknown bump "${kind}" (use patch, minor or major)`)
}

/** Rewrites only the "version" value(s), keeping the file's formatting and line endings. */
function setJsonVersion(file, newVersion, { lock = false } = {}) {
  if (!fs.existsSync(file)) return
  let text = fs.readFileSync(file, 'utf8')
  // Top-level "version" (2-space indent in both files).
  const top = /^( {2}"version":\s*)"[^"]*"/m
  if (!top.test(text)) throw new Error(`could not find the top-level "version" in ${path.basename(file)}`)
  text = text.replace(top, `$1"${newVersion}"`)
  if (lock) {
    // packages[""].version
    text = text.replace(/("packages":\s*\{\s*"":\s*\{[^{}]*?"version":\s*)"[^"]*"/, `$1"${newVersion}"`)
  }
  fs.writeFileSync(file, text)
  if (JSON.parse(text).version !== newVersion) throw new Error(`failed to update ${path.basename(file)}`)
}

function main() {
  const [cmd = 'show', kind = 'patch'] = process.argv.slice(2)
  const current = readAppVersion()
  const last = readReleaseBuilds()

  if (cmd === 'show') {
    console.log(`versionName ${current.versionName}  versionCode ${current.versionCode}`)
    console.log(last.lastVersionCode
      ? `last release AAB built: ${last.lastVersionName} (versionCode ${last.lastVersionCode})`
      : 'no release AAB built yet (android/release-builds.json)')
    return
  }
  if (cmd !== 'bump') {
    console.error('usage: node scripts/version.mjs [show | bump patch|minor|major]')
    process.exit(1)
  }

  const next = bumpVersion(current.versionName, kind)
  const nextCode = versionCodeFor(next)
  setJsonVersion(PACKAGE_JSON, next)
  setJsonVersion(PACKAGE_LOCK, next, { lock: true })
  console.log(`version ${current.versionName} (code ${current.versionCode}) -> ${next} (code ${nextCode})`)
  console.log('Updated package.json and package-lock.json. Commit them with the release.')
  if (nextCode <= (last.lastVersionCode || 0)) {
    console.warn(`WARNING: versionCode ${nextCode} is still not higher than the last built AAB ` +
      `(${last.lastVersionCode}). Bump again (minor/major).`)
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main()
  } catch (e) {
    console.error(`[version] ${e.message}`)
    process.exit(1)
  }
}
