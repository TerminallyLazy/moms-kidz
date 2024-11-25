import { envValidation, type EnvVar } from '@/types/env'
import { logger } from './logger'

class EnvironmentUtils {
  /**
   * Validate all environment variables
   */
  static validateEnv(): void {
    const missingRequired: string[] = []
    const invalidValues: string[] = []

    // Check required variables
    envValidation.required.forEach((key) => {
      if (!process.env[key]) {
        missingRequired.push(key)
      }
    })

    // Validate rules
    Object.entries(envValidation.rules).forEach(([key, validator]) => {
      const value = process.env[key]
      if (value && !validator(value)) {
        invalidValues.push(key)
      }
    })

    // Log validation results
    if (missingRequired.length > 0) {
      logger.error('Missing required environment variables:', {
        variables: missingRequired
      })
      throw new Error(`Missing required environment variables: ${missingRequired.join(', ')}`)
    }

    if (invalidValues.length > 0) {
      logger.error('Invalid environment variable values:', {
        variables: invalidValues
      })
      throw new Error(`Invalid environment variable values: ${invalidValues.join(', ')}`)
    }

    logger.info('Environment variables validated successfully')
  }

  /**
   * Get a required environment variable
   */
  static getRequired(key: EnvVar): string {
    const value = process.env[key]
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`)
    }
    return value
  }

  /**
   * Get an optional environment variable
   */
  static getOptional(key: EnvVar, defaultValue: string = ''): string {
    return process.env[key] || defaultValue
  }

  /**
   * Get social media configuration
   */
  static getSocialConfig() {
    return {
      tiktok: {
        apiKey: this.getRequired('NEXT_PUBLIC_TIKTOK_API_KEY'),
        apiSecret: this.getRequired('NEXT_PUBLIC_TIKTOK_API_SECRET'),
        userId: this.getRequired('NEXT_PUBLIC_TIKTOK_USER_ID'),
      },
      facebook: {
        appId: this.getRequired('NEXT_PUBLIC_FACEBOOK_APP_ID'),
        pageId: this.getRequired('NEXT_PUBLIC_FACEBOOK_PAGE_ID'),
        accessToken: this.getRequired('NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN'),
      },
      instagram: {
        apiKey: this.getRequired('NEXT_PUBLIC_INSTAGRAM_API_KEY'),
        username: this.getRequired('NEXT_PUBLIC_INSTAGRAM_USERNAME'),
      }
    }
  }

  /**
   * Get feature flags configuration
   */
  static getFeatureFlags() {
    return {
      socialFeatures: process.env.NEXT_PUBLIC_ENABLE_SOCIAL_FEATURES === 'true',
      researchFeatures: process.env.NEXT_PUBLIC_ENABLE_RESEARCH_FEATURES === 'true',
    }
  }

  /**
   * Get analytics configuration
   */
  static getAnalyticsConfig() {
    return {
      analyticsId: this.getOptional('NEXT_PUBLIC_ANALYTICS_ID'),
      sentryDsn: this.getOptional('SENTRY_DSN'),
    }
  }

  /**
   * Get API rate limiting configuration
   */
  static getRateLimitConfig() {
    return {
      requests: parseInt(this.getOptional('RATE_LIMIT_REQUESTS', '100')),
      windowMs: parseInt(this.getOptional('RATE_LIMIT_WINDOW_MS', '900000')), // 15 minutes
    }
  }

  /**
   * Get cache configuration
   */
  static getCacheConfig() {
    return {
      redisUrl: this.getOptional('REDIS_URL'),
    }
  }

  /**
   * Get email configuration
   */
  static getEmailConfig() {
    return {
      host: this.getOptional('SMTP_HOST'),
      port: parseInt(this.getOptional('SMTP_PORT', '587')),
      user: this.getOptional('SMTP_USER'),
      password: this.getOptional('SMTP_PASSWORD'),
      from: this.getOptional('EMAIL_FROM'),
    }
  }

  /**
   * Get push notification configuration
   */
  static getPushConfig() {
    return {
      vapidKey: this.getOptional('NEXT_PUBLIC_VAPID_KEY'),
    }
  }

  /**
   * Check if running in development mode
   */
  static isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development'
  }

  /**
   * Check if running in production mode
   */
  static isProduction(): boolean {
    return process.env.NODE_ENV === 'production'
  }

  /**
   * Check if running in test mode
   */
  static isTest(): boolean {
    return process.env.NODE_ENV === 'test'
  }
}

export default EnvironmentUtils