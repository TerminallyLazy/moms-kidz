import { logger } from './logger'

export class ImageUtils {
  /**
   * Load image and return promise
   */
  static loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = (error) => {
        logger.error('Error loading image', error as Error, { src })
        reject(error)
      }
      img.src = src
    })
  }

  /**
   * Get image dimensions
   */
  static async getImageDimensions(src: string): Promise<{ width: number; height: number }> {
    try {
      const img = await this.loadImage(src)
      return {
        width: img.naturalWidth,
        height: img.naturalHeight
      }
    } catch (error) {
      logger.error('Error getting image dimensions', error as Error, { src })
      return { width: 0, height: 0 }
    }
  }

  /**
   * Calculate aspect ratio
   */
  static getAspectRatio(width: number, height: number): number {
    try {
      return width / height
    } catch (error) {
      logger.error('Error calculating aspect ratio', error as Error, { width, height })
      return 1
    }
  }

  /**
   * Calculate dimensions maintaining aspect ratio
   */
  static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth?: number,
    maxHeight?: number
  ): { width: number; height: number } {
    try {
      let width = originalWidth
      let height = originalHeight

      if (maxWidth && width > maxWidth) {
        height = (maxWidth / width) * height
        width = maxWidth
      }

      if (maxHeight && height > maxHeight) {
        width = (maxHeight / height) * width
        height = maxHeight
      }

      return {
        width: Math.round(width),
        height: Math.round(height)
      }
    } catch (error) {
      logger.error('Error calculating dimensions', error as Error, {
        originalWidth,
        originalHeight,
        maxWidth,
        maxHeight
      })
      return { width: originalWidth, height: originalHeight }
    }
  }

  /**
   * Convert base64 to blob
   */
  static base64ToBlob(base64: string, mimeType: string): Blob {
    try {
      const byteString = atob(base64.split(',')[1])
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      
      return new Blob([ab], { type: mimeType })
    } catch (error) {
      logger.error('Error converting base64 to blob', error as Error)
      return new Blob([''], { type: mimeType })
    }
  }

  /**
   * Convert blob to base64
   */
  static blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => {
        logger.error('Error converting blob to base64', error)
        reject(error)
      }
      reader.readAsDataURL(blob)
    })
  }

  /**
   * Compress image
   */
  static async compressImage(
    file: File,
    options: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      mimeType?: string;
    } = {}
  ): Promise<Blob> {
    try {
      const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 0.8,
        mimeType = 'image/jpeg'
      } = options

      // Create canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')

      // Load image
      const img = await this.loadImage(URL.createObjectURL(file))

      // Calculate dimensions
      const dimensions = this.calculateDimensions(
        img.naturalWidth,
        img.naturalHeight,
        maxWidth,
        maxHeight
      )

      // Set canvas dimensions
      canvas.width = dimensions.width
      canvas.height = dimensions.height

      // Draw image
      ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height)

      // Convert to blob
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Could not create blob'))
          },
          mimeType,
          quality
        )
      })
    } catch (error) {
      logger.error('Error compressing image', error as Error)
      return file
    }
  }

  /**
   * Get file extension from mime type
   */
  static getExtensionFromMimeType(mimeType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg'
    }
    return extensions[mimeType] || 'jpg'
  }

  /**
   * Check if file is image
   */
  static isImage(file: File): boolean {
    return file.type.startsWith('image/')
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${Math.round(size * 100) / 100} ${units[unitIndex]}`
  }

  /**
   * Generate thumbnail
   */
  static async generateThumbnail(
    file: File,
    options: {
      width?: number;
      height?: number;
      quality?: number;
    } = {}
  ): Promise<Blob> {
    const {
      width = 200,
      height = 200,
      quality = 0.7
    } = options

    return this.compressImage(file, {
      maxWidth: width,
      maxHeight: height,
      quality,
      mimeType: 'image/jpeg'
    })
  }
}

export default ImageUtils