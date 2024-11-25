const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const ICON_SIZES = [
  72,
  96,
  128,
  144,
  152,
  192,
  384,
  512,
]

const APPLE_ICON_SIZES = [
  180, // iPhone Retina
  167, // iPad Pro
  152, // iPad, iPad mini
  120, // iPhone
]

const FAVICON_SIZES = [
  16,
  32,
  48,
]

async function generateIcons() {
  // Ensure directories exist
  const iconsDir = path.join(process.cwd(), 'public', 'icons')
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true })
  }

  // Source image should be at least 512x512
  const sourceImage = path.join(process.cwd(), 'src', 'assets', 'icon.png')
  
  if (!fs.existsSync(sourceImage)) {
    console.error('Source image not found:', sourceImage)
    process.exit(1)
  }

  try {
    // Generate PWA icons
    for (const size of ICON_SIZES) {
      await sharp(sourceImage)
        .resize(size, size)
        .toFile(path.join(iconsDir, `icon-${size}x${size}.png`))
      
      console.log(`Generated ${size}x${size} PWA icon`)
    }

    // Generate Apple touch icons
    for (const size of APPLE_ICON_SIZES) {
      await sharp(sourceImage)
        .resize(size, size)
        .toFile(path.join(iconsDir, `apple-icon-${size}x${size}.png`))
      
      console.log(`Generated ${size}x${size} Apple touch icon`)
    }

    // Generate favicon
    for (const size of FAVICON_SIZES) {
      await sharp(sourceImage)
        .resize(size, size)
        .toFile(path.join(iconsDir, `favicon-${size}x${size}.png`))
      
      console.log(`Generated ${size}x${size} favicon`)
    }

    // Generate Apple touch icon (default)
    await sharp(sourceImage)
      .resize(180, 180)
      .toFile(path.join(iconsDir, 'apple-touch-icon.png'))
    
    console.log('Generated default Apple touch icon')

    // Generate Safari pinned tab icon (SVG)
    await sharp(sourceImage)
      .resize(512, 512)
      .toFile(path.join(iconsDir, 'safari-pinned-tab.svg'))
    
    console.log('Generated Safari pinned tab icon')

    // Generate maskable icon (with padding)
    await sharp(sourceImage)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .extend({
        top: 64,
        bottom: 64,
        left: 64,
        right: 64,
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toFile(path.join(iconsDir, 'maskable-icon.png'))
    
    console.log('Generated maskable icon')

    // Generate favicon.ico (multi-size)
    const faviconSizes = [16, 32, 48]
    const faviconBuffers = await Promise.all(
      faviconSizes.map(size =>
        sharp(sourceImage)
          .resize(size, size)
          .toFormat('ico')
          .toBuffer()
      )
    )

    fs.writeFileSync(
      path.join(process.cwd(), 'public', 'favicon.ico'),
      Buffer.concat(faviconBuffers)
    )
    
    console.log('Generated favicon.ico')

    console.log('\nAll icons generated successfully!')
  } catch (error) {
    console.error('Error generating icons:', error)
    process.exit(1)
  }
}

// Generate splash screens for iOS
async function generateSplashScreens() {
  const splashDir = path.join(process.cwd(), 'public', 'splash')
  if (!fs.existsSync(splashDir)) {
    fs.mkdirSync(splashDir, { recursive: true })
  }

  const splashImage = path.join(process.cwd(), 'src', 'assets', 'splash.png')
  
  if (!fs.existsSync(splashImage)) {
    console.error('Splash image not found:', splashImage)
    return
  }

  const screens = [
    { width: 2048, height: 2732, name: 'ipad-pro' },   // iPad Pro
    { width: 1668, height: 2224, name: 'ipad-air' },   // iPad Air
    { width: 1536, height: 2048, name: 'ipad' },       // iPad Mini/Regular
    { width: 1125, height: 2436, name: 'iphone-x' },   // iPhone X/XS
    { width: 828, height: 1792, name: 'iphone-xr' },   // iPhone XR
    { width: 1242, height: 2688, name: 'iphone-xs-max' }, // iPhone XS Max
  ]

  try {
    for (const screen of screens) {
      await sharp(splashImage)
        .resize(screen.width, screen.height, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .toFile(path.join(splashDir, `${screen.name}.png`))
      
      console.log(`Generated splash screen for ${screen.name}`)
    }

    console.log('\nAll splash screens generated successfully!')
  } catch (error) {
    console.error('Error generating splash screens:', error)
  }
}

// Run the generation
generateIcons()
  .then(() => generateSplashScreens())
  .catch(console.error)