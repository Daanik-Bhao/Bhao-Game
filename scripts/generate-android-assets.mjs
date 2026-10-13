// Generates the Android launcher icons (adaptive + legacy) and splash images from the
// vector ₹ coin in scripts/generate-icons.js.
// Usage: node scripts/generate-android-assets.mjs
// Writes high-res sources to resources/ (the layout @capacitor/assets expects) and the
// Android resources to android/app/src/main/res/. Re-run after changing the art.
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { coinSvg } from './generate-icons.js'

const THEME = '#004030' // --green-primary: adaptive-icon background (same as the PWA maskable icon)
const DARK = '#001010' // --green-black: splash background, matches capacitor.config.ts
const RES = path.resolve('android/app/src/main/res')
const SOURCES = path.resolve('resources')

// Adaptive icons are 108dp with a 66dp circular safe zone; the coin uses 60% (64.8dp).
const FOREGROUND_SCALE = 0.6
const DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 }
const SPLASH_PORT = { mdpi: [320, 480], hdpi: [480, 800], xhdpi: [720, 1280], xxhdpi: [960, 1600], xxxhdpi: [1280, 1920] }

/** Single-colour coin for Android 13+ themed icons: only the alpha channel is used. */
function monochromeSvg(size, scale) {
  const r = (size * scale) / 2
  const c = size / 2
  const k = (r * 2) / 100
  const ox = c - 50 * k
  const oy = c - 50 * k
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs><mask id="m">
    <rect width="${size}" height="${size}" fill="black"/>
    <circle cx="${c}" cy="${c}" r="${r}" fill="white"/>
    <circle cx="${c}" cy="${c}" r="${r * 0.78}" fill="none" stroke="black" stroke-width="${r * 0.05}"/>
    <g transform="translate(${ox} ${oy}) scale(${k})" fill="none" stroke="black" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M32 27 H69"/><path d="M32 40 H69"/><path d="M32 27 H45 C60 27 60 54 45 54 H34 L64 78"/>
    </g>
  </mask></defs>
  <rect width="${size}" height="${size}" fill="white" mask="url(#m)"/>
</svg>`
}

function solidSvg(w, h, color, radius = 0) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${radius}" fill="${color}"/></svg>`
}

async function write(input, file) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  await input.png({ compressionLevel: 9 }).toFile(file)
  console.log('wrote', path.relative(process.cwd(), file))
}

const fromSvg = svg => sharp(Buffer.from(svg))

/** Coin centred on a solid canvas; coin diameter = `fraction` of the shorter side. */
async function coinOn(w, h, color, fraction, radius = 0) {
  const d = Math.round(Math.min(w, h) * fraction)
  const coin = await fromSvg(coinSvg(d, { scale: 1 })).png().toBuffer()
  return fromSvg(solidSvg(w, h, color, radius)).composite([{ input: coin, left: Math.round((w - d) / 2), top: Math.round((h - d) / 2) }])
}

/** Legacy (pre-Android 8) icon: rounded square or circle in THEME with the coin. */
async function legacyIcon(size, round) {
  const bg = round
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${THEME}"/></svg>`
    : solidSvg(size, size, THEME, size * 0.18)
  const d = Math.round(size * (round ? 0.7 : 0.74))
  const coin = await fromSvg(coinSvg(d, { scale: 1 })).png().toBuffer()
  const off = Math.round((size - d) / 2)
  return fromSvg(bg).composite([{ input: coin, left: off, top: off }])
}

async function main() {
  // High-res sources (also usable with `npx @capacitor/assets generate --android`).
  await write(fromSvg(coinSvg(1024, { scale: FOREGROUND_SCALE })), path.join(SOURCES, 'icon-foreground.png'))
  await write(fromSvg(solidSvg(1024, 1024, THEME)), path.join(SOURCES, 'icon-background.png'))
  await write(fromSvg(coinSvg(1024, { scale: FOREGROUND_SCALE, background: THEME })), path.join(SOURCES, 'icon-only.png'))
  await write(await coinOn(2732, 2732, DARK, 0.22), path.join(SOURCES, 'splash.png'))
  await write(await coinOn(2732, 2732, DARK, 0.22), path.join(SOURCES, 'splash-dark.png'))

  for (const [name, f] of Object.entries(DENSITIES)) {
    const dir = path.join(RES, `mipmap-${name}`)
    await write(fromSvg(coinSvg(Math.round(108 * f), { scale: FOREGROUND_SCALE })), path.join(dir, 'ic_launcher_foreground.png'))
    await write(fromSvg(monochromeSvg(Math.round(108 * f), FOREGROUND_SCALE)), path.join(dir, 'ic_launcher_monochrome.png'))
    await write(await legacyIcon(Math.round(48 * f), false), path.join(dir, 'ic_launcher.png'))
    await write(await legacyIcon(Math.round(48 * f), true), path.join(dir, 'ic_launcher_round.png'))
  }

  for (const [name, [w, h]] of Object.entries(SPLASH_PORT)) {
    await write(await coinOn(w, h, DARK, 0.3), path.join(RES, `drawable-port-${name}`, 'splash.png'))
    await write(await coinOn(h, w, DARK, 0.3), path.join(RES, `drawable-land-${name}`, 'splash.png'))
  }
  await write(await coinOn(480, 320, DARK, 0.3), path.join(RES, 'drawable', 'splash.png'))

  const adaptive = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
    <monochrome android:drawable="@mipmap/ic_launcher_monochrome"/>
</adaptive-icon>
`
  for (const file of ['ic_launcher.xml', 'ic_launcher_round.xml']) {
    fs.writeFileSync(path.join(RES, 'mipmap-anydpi-v26', file), adaptive)
  }
  fs.writeFileSync(
    path.join(RES, 'values', 'ic_launcher_background.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${THEME}</color>
</resources>
`,
  )
  // Template leftovers (Capacitor logo vectors) that the adaptive icon no longer uses.
  for (const f of ['drawable/ic_launcher_background.xml', 'drawable-v24/ic_launcher_foreground.xml']) {
    fs.rmSync(path.join(RES, f), { force: true })
  }
  console.log('done')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
