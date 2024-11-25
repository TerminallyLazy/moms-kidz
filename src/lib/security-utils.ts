import { logger } from './logger'
import { createHash, randomBytes, scrypt, timingSafeEqual } from 'crypto'

export class SecurityUtils {
  private static readonly SALT_LENGTH = 32
  private static readonly KEY_LENGTH = 64
  private static readonly PEPPER = process.env.HASH_PEPPER || ''

  /**
   * Hash password with salt and pepper
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      const salt = randomBytes(this.SALT_LENGTH).toString('hex')
      const hash = await this.generateHash(password, salt)
      return `${salt}:${hash}`
    } catch (error) {
      logger.error('Error hashing password', error as Error)
      throw new Error('Error securing password')
    }
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const [salt, storedHash] = hashedPassword.split(':')
      const hash = await this.generateHash(password, salt)
      return timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash))
    } catch (error) {
      logger.error('Error verifying password', error as Error)
      return false
    }
  }

  /**
   * Generate secure random token
   */
  static generateToken(length = 32): string {
    try {
      return randomBytes(length).toString('hex')
    } catch (error) {
      logger.error('Error generating token', error as Error)
      throw new Error('Error generating secure token')
    }
  }

  /**
   * Hash data with SHA-256
   */
  static hashData(data: string): string {
    try {
      return createHash('sha256').update(data).digest('hex')
    } catch (error) {
      logger.error('Error hashing data', error as Error)
      throw new Error('Error hashing data')
    }
  }

  /**
   * Generate CSRF token
   */
  static generateCsrfToken(): string {
    return this.generateToken(32)
  }

  /**
   * Sanitize user input
   */
  static sanitizeInput(input: string): string {
    try {
      return input
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim()
    } catch (error) {
      logger.error('Error sanitizing input', error as Error)
      return ''
    }
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Generate hash with salt and pepper
   */
  private static generateHash(password: string, salt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const pepperedPassword = `${password}${this.PEPPER}`
      scrypt(pepperedPassword, salt, this.KEY_LENGTH, (err, derivedKey) => {
        if (err) reject(err)
        else resolve(derivedKey.toString('hex'))
      })
    })
  }

  /**
   * Mask sensitive data
   */
  static maskSensitiveData(data: string, visibleChars = 4): string {
    try {
      if (data.length <= visibleChars) return '*'.repeat(data.length)
      const visiblePart = data.slice(-visibleChars)
      return '*'.repeat(data.length - visibleChars) + visiblePart
    } catch (error) {
      logger.error('Error masking sensitive data', error as Error)
      return '*'.repeat(data.length)
    }
  }

  /**
   * Generate secure random number
   */
  static generateSecureRandomNumber(min: number, max: number): number {
    try {
      const range = max - min
      const randomBuffer = randomBytes(4)
      const randomNumber = randomBuffer.readUInt32BE(0)
      return min + (randomNumber % (range + 1))
    } catch (error) {
      logger.error('Error generating secure random number', error as Error)
      throw new Error('Error generating secure random number')
    }
  }

  /**
   * Validate and sanitize URL
   */
  static sanitizeUrl(url: string): string {
    try {
      const sanitized = url.trim()
      if (!sanitized) return ''

      // Check if URL is valid
      new URL(sanitized)

      // Remove dangerous protocols
      const dangerousProtocols = ['javascript:', 'data:', 'vbscript:']
      if (dangerousProtocols.some(protocol => sanitized.toLowerCase().startsWith(protocol))) {
        return ''
      }

      return sanitized
    } catch (error) {
      return ''
    }
  }

  /**
   * Generate API key
   */
  static generateApiKey(prefix = 'mk'): string {
    try {
      const timestamp = Date.now().toString(36)
      const random = this.generateToken(16)
      return `${prefix}_${timestamp}_${random}`
    } catch (error) {
      logger.error('Error generating API key', error as Error)
      throw new Error('Error generating API key')
    }
  }
}

export default SecurityUtils