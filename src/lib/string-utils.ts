import { logger } from './logger'

export class StringUtils {
  /**
   * Convert a string to title case
   */
  static toTitleCase(str: string): string {
    try {
      return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    } catch (error) {
      logger.error('Error converting to title case', error as Error, { str })
      return str
    }
  }

  /**
   * Create a URL-friendly slug from a string
   */
  static slugify(str: string): string {
    try {
      return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
    } catch (error) {
      logger.error('Error creating slug', error as Error, { str })
      return str
    }
  }

  /**
   * Truncate a string to a specified length with ellipsis
   */
  static truncate(str: string, length: number, ellipsis = '...'): string {
    try {
      if (str.length <= length) return str
      return str.slice(0, length - ellipsis.length) + ellipsis
    } catch (error) {
      logger.error('Error truncating string', error as Error, { str, length })
      return str
    }
  }

  /**
   * Generate initials from a name
   */
  static getInitials(name: string, maxLength = 2): string {
    try {
      return name
        .split(/\s+/)
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, maxLength)
    } catch (error) {
      logger.error('Error generating initials', error as Error, { name })
      return name.slice(0, maxLength).toUpperCase()
    }
  }

  /**
   * Format a number as a file size
   */
  static formatFileSize(bytes: number): string {
    try {
      const units = ['B', 'KB', 'MB', 'GB', 'TB']
      let size = bytes
      let unitIndex = 0

      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
      }

      return `${Math.round(size * 100) / 100} ${units[unitIndex]}`
    } catch (error) {
      logger.error('Error formatting file size', error as Error, { bytes })
      return `${bytes} B`
    }
  }

  /**
   * Format a number with commas as thousands separators
   */
  static formatNumber(num: number): string {
    try {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    } catch (error) {
      logger.error('Error formatting number', error as Error, { num })
      return num.toString()
    }
  }

  /**
   * Mask sensitive information (e.g., email, phone)
   */
  static maskSensitiveInfo(str: string, type: 'email' | 'phone' | 'custom' = 'custom', maskChar = '*'): string {
    try {
      switch (type) {
        case 'email': {
          const [username, domain] = str.split('@')
          const maskedUsername = username.charAt(0) + maskChar.repeat(username.length - 2) + username.charAt(username.length - 1)
          return `${maskedUsername}@${domain}`
        }
        case 'phone': {
          const digits = str.replace(/\D/g, '')
          return maskChar.repeat(digits.length - 4) + digits.slice(-4)
        }
        default:
          return str.charAt(0) + maskChar.repeat(str.length - 2) + str.charAt(str.length - 1)
      }
    } catch (error) {
      logger.error('Error masking sensitive info', error as Error, { type })
      return str
    }
  }

  /**
   * Generate a random string
   */
  static generateRandomString(length: number, type: 'alphanumeric' | 'numeric' | 'alphabetic' = 'alphanumeric'): string {
    try {
      let chars: string
      switch (type) {
        case 'numeric':
          chars = '0123456789'
          break
        case 'alphabetic':
          chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
          break
        default:
          chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      }

      return Array.from(crypto.getRandomValues(new Uint8Array(length)))
        .map(x => chars[x % chars.length])
        .join('')
    } catch (error) {
      logger.error('Error generating random string', error as Error, { length, type })
      return Math.random().toString(36).substring(2, 2 + length)
    }
  }

  /**
   * Extract hashtags from text
   */
  static extractHashtags(text: string): string[] {
    try {
      const hashtagRegex = /#[\w\u0590-\u05ff]+/g
      return text.match(hashtagRegex)?.map(tag => tag.slice(1)) || []
    } catch (error) {
      logger.error('Error extracting hashtags', error as Error, { text })
      return []
    }
  }

  /**
   * Extract mentions from text
   */
  static extractMentions(text: string): string[] {
    try {
      const mentionRegex = /@[\w\u0590-\u05ff]+/g
      return text.match(mentionRegex)?.map(mention => mention.slice(1)) || []
    } catch (error) {
      logger.error('Error extracting mentions', error as Error, { text })
      return []
    }
  }
}

export default StringUtils