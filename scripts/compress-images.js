import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const avatarsDir = path.resolve('./public/avatars')

async function compressImages() {
  const files = fs.readdirSync(avatarsDir)
  const pngFiles = files.filter(f => f.endsWith('.png'))
  
  console.log(`Found ${pngFiles.length} PNG files. Compressing to WebP...`)
  
  for (const file of pngFiles) {
    const inputPath = path.join(avatarsDir, file)
    const outputPath = path.join(avatarsDir, file.replace('.png', '.webp'))
    
    // Check if webp already exists
    if (!fs.existsSync(outputPath)) {
      try {
        await sharp(inputPath)
          .webp({ quality: 80 })
          .toFile(outputPath)
        console.log(`Compressed: ${file} -> ${file.replace('.png', '.webp')}`)
      } catch (err) {
        console.error(`Failed to compress ${file}:`, err)
      }
    }
  }
  console.log('Compression complete!')
}

compressImages().catch(console.error)
