import sharp from 'sharp'
import { logger } from './logger'

export class ImageUtils {
  private static readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
  private static readonly THUMBNAIL_SIZE = 200
  private static readonly QUALITY = 80

  /**
   * Optimize image for web
   */
  static async optimizeImage(
    file: File,
    options: {
      maxWidth?: number
      maxHeight?: number
      quality?: number
      format?: 'jpeg' | 'webp' | 'png'
    } = {}
  ): Promise<Buffer> {
    try {
      const buffer = await file.arrayBuffer()
      const image = sharp(Buffer.from(buffer))
      const metadata = await image.metadata()

      const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = this.QUALITY,
        format = 'webp'
      } = options

      // Resize if needed
      if (metadata.width && metadata.width > maxWidth ||
          metadata.height && metadata.height > maxHeight) {
        image.resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
      }

      // Convert and optimize
      let processed: sharp.Sharp
      switch (format) {
        case 'jpeg':
          processed = image.jpeg({ quality })
          break
        case 'webp':
          processed = image.webp({ quality })
          break
        case 'png':
          processed = image.png({ quality })
          break
        default:
          processed = image.webp({ quality })
      }

      const optimized = await processed.toBuffer()

      logger.info('Image optimized successfully', {
        originalSize: buffer.byteLength,
        optimizedSize: optimized.length,
        format,
        quality
      })

      return optimized
    } catch (error) {
      logger.error('Error optimizing image:', error)
      throw error
    }
  }

  /**
   * Generate thumbnail
   */
  static async generateThumbnail(
    file: File,
    size: number = this.THUMBNAIL_SIZE
  ): Promise<Buffer> {
    try {
      const buffer = await file.arrayBuffer()
      const thumbnail = await sharp(Buffer.from(buffer))
        .resize(size, size, {
          fit: 'cover',
          position: 'centre'
        })
        .webp({ quality: this.QUALITY })
        .toBuffer()

      logger.info('Thumbnail generated successfully', {
        originalSize: buffer.byteLength,
        thumbnailSize: thumbnail.length,
        dimensions: size
      })

      return thumbnail
    } catch (error) {
      logger.error('Error generating thumbnail:', error)
      throw error
    }
  }

  /**
   * Extract image metadata
   */
  static async getMetadata(file: File) {
    try {
      const buffer = await file.arrayBuffer()
      const metadata = await sharp(Buffer.from(buffer)).metadata()

      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        space: metadata.space,
        channels: metadata.channels,
        depth: metadata.depth,
        density: metadata.density,
        hasAlpha: metadata.hasAlpha,
        orientation: metadata.orientation
      }
    } catch (error) {
      logger.error('Error extracting image metadata:', error)
      throw error
    }
  }

  /**
   * Convert image format
   */
  static async convertFormat(
    file: File,
    format: 'jpeg' | 'webp' | 'png',
    quality: number = this.QUALITY
  ): Promise<Buffer> {
    try {
      const buffer = await file.arrayBuffer()
      const image = sharp(Buffer.from(buffer))

      let converted: sharp.Sharp
      switch (format) {
        case 'jpeg':
          converted = image.jpeg({ quality })
          break
        case 'webp':
          converted = image.webp({ quality })
          break
        case 'png':
          converted = image.png({ quality })
          break
        default:
          throw new Error(`Unsupported format: ${format}`)
      }

      const result = await converted.toBuffer()

      logger.info('Image converted successfully', {
        originalFormat: (await image.metadata()).format,
        newFormat: format,
        quality
      })

      return result
    } catch (error) {
      logger.error('Error converting image:', error)
      throw error
    }
  }

  /**
   * Validate image
   */
  static async validateImage(file: File): Promise<boolean> {
    try {
      if (file.size > this.MAX_IMAGE_SIZE) {
        throw new Error(`File size exceeds maximum limit of ${this.MAX_IMAGE_SIZE / (1024 * 1024)}MB`)
      }

      const buffer = await file.arrayBuffer()
      const metadata = await sharp(Buffer.from(buffer)).metadata()

      if (!metadata.format || !['jpeg', 'png', 'webp'].includes(metadata.format)) {
        throw new Error('Invalid image format. Supported formats: JPEG, PNG, WebP')
      }

      return true
    } catch (error) {
      logger.error('Image validation failed:', error)
      return false
    }
  }

  /**
   * Apply watermark
   */
  static async applyWatermark(
    file: File,
    watermarkText: string,
    options: {
      fontSize?: number
      opacity?: number
      position?: 'centre' | 'southeast' | 'southwest' | 'northeast' | 'northwest'
    } = {}
  ): Promise<Buffer> {
    try {
      const {
        fontSize = 24,
        opacity = 0.5,
        position = 'southeast'
      } = options

      const buffer = await file.arrayBuffer()
      const image = sharp(Buffer.from(buffer))
      const metadata = await image.metadata()

      if (!metadata.width || !metadata.height) {
        throw new Error('Unable to get image dimensions')
      }

      // Create watermark SVG
      const svg = `
        <svg width="${metadata.width}" height="${metadata.height}">
          <style>
            .watermark { 
              fill: white; 
              fill-opacity: ${opacity}; 
              font-size: ${fontSize}px; 
              font-family: Arial;
            }
          </style>
          <text 
            x="${position.includes('east') ? metadata.width - 20 : 20}"
            y="${position.includes('south') ? metadata.height - 20 : 20}"
            text-anchor="${position.includes('east') ? 'end' : 'start'}"
            class="watermark"
          >
            ${watermarkText}
          </text>
        </svg>
      `

      const result = await image
        .composite([{
          input: Buffer.from(svg),
          top: 0,
          left: 0
        }])
        .toBuffer()

      logger.info('Watermark applied successfully')

      return result
    } catch (error) {
      logger.error('Error applying watermark:', error)
      throw error
    }
  }
}

export default ImageUtils
