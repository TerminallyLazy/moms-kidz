const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

async function convertSvgToPng() {
  const assetsDir = path.join(process.cwd(), 'src', 'assets')
  
  try {
    // Convert icon.svg to icon.png
    await sharp(path.join(assetsDir, 'icon.svg'))
      .resize(512, 512)
      .png()
      .toFile(path.join(assetsDir, 'icon.png'))
    
    console.log('Converted icon.svg to icon.png')

    // Convert splash.svg to splash.png
    await sharp(path.join(assetsDir, 'splash.svg'))
      .resize(2732, 2732)
      .png()
      .toFile(path.join(assetsDir, 'splash.png'))
    
    console.log('Converted splash.svg to splash.png')

  } catch (error) {
    console.error('Error converting SVG to PNG:', error)
    process.exit(1)
  }
}

// Run the conversion
convertSvgToPng()
  .then(() => console.log('SVG to PNG conversion completed successfully!'))
  .catch(console.error)