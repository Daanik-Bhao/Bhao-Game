// Generates PWA / app icons and the Open Graph image from a vector ₹ coin.
// Usage: node scripts/generate-icons.js   (outputs to public/icons and public/og-image.png)
// The ₹ is drawn with paths rather than text so the output doesn't depend on installed fonts.
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const OUT_DIR = path.resolve('./public/icons')
const THEME = '#004030' // --green-primary
const BACKGROUND = '#EEEFE0'

/** Coin centred in a `size` box; `scale` is the coin diameter as a fraction of the box. */
function coinSvg(size, { scale = 0.94, background = null } = {}) {
  const r = (size * scale) / 2
  const c = size / 2
  const k = (r * 2) / 100 // glyph is designed in a 100x100 box
  const ox = c - 50 * k
  const oy = c - 50 * k
  const bg = background ? `<rect width="${size}" height="${size}" fill="${background}"/>` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${bg}
  <circle cx="${c}" cy="${c}" r="${r * 0.96}" fill="#f5b301" stroke="#b7791f" stroke-width="${r * 0.08}"/>
  <circle cx="${c}" cy="${c}" r="${r * 0.78}" fill="none" stroke="#d99a00" stroke-width="${r * 0.03}"/>
  <g transform="translate(${ox} ${oy}) scale(${k})" fill="none" stroke="#7a4a00" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M32 27 H69"/>
    <path d="M32 40 H69"/>
    <path d="M32 27 H45 C60 27 60 54 45 54 H34 L64 78"/>
  </g>
</svg>`
}

function ogSvg() {
  const w = 1200
  const h = 630
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#EEEFE0"/>
      <stop offset="1" stop-color="#9FC7AA"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect x="0" y="${h - 18}" width="${w}" height="18" fill="${THEME}"/>
</svg>`
}

async function png(svg, file) {
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(file)
  console.log('wrote', path.relative(process.cwd(), file))
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  // Standard ("any") icons: transparent background, coin fills the canvas.
  await png(coinSvg(192), path.join(OUT_DIR, 'icon-192.png'))
  await png(coinSvg(512), path.join(OUT_DIR, 'icon-512.png'))

  // Maskable: opaque full-bleed background, coin inside the 80% safe zone.
  await png(coinSvg(512, { scale: 0.62, background: THEME }), path.join(OUT_DIR, 'maskable-512.png'))
  await png(coinSvg(192, { scale: 0.62, background: THEME }), path.join(OUT_DIR, 'maskable-192.png'))

  // iOS home screen icon must be opaque (iOS adds its own rounded mask).
  await png(coinSvg(180, { scale: 0.8, background: BACKGROUND }), path.join(OUT_DIR, 'apple-touch-icon.png'))

  // Open Graph / social preview image (1200x630): gradient + coin + wordmark.
  const coin = await sharp(Buffer.from(coinSvg(360))).png().toBuffer()
  const wordmark = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="620" height="300">
    <text x="0" y="170" font-family="Arial, Helvetica, sans-serif" font-size="190" font-weight="800" fill="${THEME}">BHAO</text>
    <text x="6" y="240" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="600" fill="#1f2937">The Money Decision Game</text>
  </svg>`)
  await sharp(Buffer.from(ogSvg()))
    .composite([
      { input: coin, left: 110, top: 135 },
      { input: wordmark, left: 530, top: 150 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(path.resolve('./public/og-image.png'))
  console.log('wrote public/og-image.png')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
