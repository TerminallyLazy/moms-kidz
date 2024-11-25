import { logger } from './logger'

export class ColorUtils {
  /**
   * Convert hex to RGB
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    try {
      const sanitizedHex = hex.replace(/^#/, '')
      const bigint = parseInt(sanitizedHex, 16)
      
      return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
      }
    } catch (error) {
      logger.error('Error converting hex to RGB', error as Error, { hex })
      return null
    }
  }

  /**
   * Convert RGB to hex
   */
  static rgbToHex(r: number, g: number, b: number): string {
    try {
      return '#' + [r, g, b]
        .map(x => {
          const hex = x.toString(16)
          return hex.length === 1 ? '0' + hex : hex
        })
        .join('')
    } catch (error) {
      logger.error('Error converting RGB to hex', error as Error, { r, g, b })
      return '#000000'
    }
  }

  /**
   * Get contrast color (black or white) based on background
   */
  static getContrastColor(backgroundColor: string): string {
    try {
      const rgb = this.hexToRgb(backgroundColor)
      if (!rgb) return '#000000'

      // Calculate relative luminance
      const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
      return luminance > 0.5 ? '#000000' : '#FFFFFF'
    } catch (error) {
      logger.error('Error getting contrast color', error as Error, { backgroundColor })
      return '#000000'
    }
  }

  /**
   * Lighten or darken a color
   */
  static adjustColor(color: string, amount: number): string {
    try {
      const rgb = this.hexToRgb(color)
      if (!rgb) return color

      const { r, g, b } = rgb
      const newR = Math.max(0, Math.min(255, r + amount))
      const newG = Math.max(0, Math.min(255, g + amount))
      const newB = Math.max(0, Math.min(255, b + amount))

      return this.rgbToHex(Math.round(newR), Math.round(newG), Math.round(newB))
    } catch (error) {
      logger.error('Error adjusting color', error as Error, { color, amount })
      return color
    }
  }

  /**
   * Generate color palette from base color
   */
  static generatePalette(baseColor: string): {
    lighter: string[];
    darker: string[];
  } {
    try {
      const lighter = Array.from({ length: 5 }, (_, i) => 
        this.adjustColor(baseColor, (i + 1) * 20)
      )
      
      const darker = Array.from({ length: 5 }, (_, i) => 
        this.adjustColor(baseColor, -(i + 1) * 20)
      )

      return { lighter, darker }
    } catch (error) {
      logger.error('Error generating color palette', error as Error, { baseColor })
      return { lighter: [], darker: [] }
    }
  }

  /**
   * Check if color is light
   */
  static isLightColor(color: string): boolean {
    try {
      const rgb = this.hexToRgb(color)
      if (!rgb) return true

      const { r, g, b } = rgb
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
      return luminance > 0.5
    } catch (error) {
      logger.error('Error checking if color is light', error as Error, { color })
      return true
    }
  }

  /**
   * Get alpha version of color
   */
  static getAlphaColor(color: string, alpha: number): string {
    try {
      const rgb = this.hexToRgb(color)
      if (!rgb) return color

      const { r, g, b } = rgb
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    } catch (error) {
      logger.error('Error getting alpha color', error as Error, { color, alpha })
      return color
    }
  }

  /**
   * Mix two colors
   */
  static mixColors(color1: string, color2: string, weight = 0.5): string {
    try {
      const rgb1 = this.hexToRgb(color1)
      const rgb2 = this.hexToRgb(color2)
      if (!rgb1 || !rgb2) return color1

      const w = Math.max(0, Math.min(1, weight))
      const w2 = 1 - w

      const r = Math.round(rgb1.r * w + rgb2.r * w2)
      const g = Math.round(rgb1.g * w + rgb2.g * w2)
      const b = Math.round(rgb1.b * w + rgb2.b * w2)

      return this.rgbToHex(r, g, b)
    } catch (error) {
      logger.error('Error mixing colors', error as Error, { color1, color2, weight })
      return color1
    }
  }

  /**
   * Generate random color
   */
  static randomColor(): string {
    try {
      const r = Math.floor(Math.random() * 256)
      const g = Math.floor(Math.random() * 256)
      const b = Math.floor(Math.random() * 256)
      return this.rgbToHex(r, g, b)
    } catch (error) {
      logger.error('Error generating random color', error as Error)
      return '#000000'
    }
  }

  /**
   * Check if string is valid hex color
   */
  static isValidHexColor(color: string): boolean {
    try {
      return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
    } catch (error) {
      logger.error('Error validating hex color', error as Error, { color })
      return false
    }
  }
}

export default ColorUtils