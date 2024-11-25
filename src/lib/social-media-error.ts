import type { SocialMediaError } from '@/types/social-media'
import { logger } from './logger'

export class SocialMediaErrorHandler {
  // Error codes mapping
  private static readonly ERROR_CODES = {
    // TikTok error codes
    TIKTOK: {
      RATE_LIMIT: 'TIKTOK_RATE_LIMIT_EXCEEDED',
      AUTH_ERROR: 'TIKTOK_AUTH_ERROR',
      INVALID_PARAMS: 'TIKTOK_INVALID_PARAMS',
      API_ERROR: 'TIKTOK_API_ERROR',
    },
    // Facebook error codes
    FACEBOOK: {
      RATE_LIMIT: 'FACEBOOK_RATE_LIMIT_EXCEEDED',
      AUTH_ERROR: 'FACEBOOK_AUTH_ERROR',
      INVALID_PARAMS: 'FACEBOOK_INVALID_PARAMS',
      API_ERROR: 'FACEBOOK_API_ERROR',
    },
    // Instagram error codes
    INSTAGRAM: {
      RATE_LIMIT: 'INSTAGRAM_RATE_LIMIT_EXCEEDED',
      AUTH_ERROR: 'INSTAGRAM_AUTH_ERROR',
      INVALID_PARAMS: 'INSTAGRAM_INVALID_PARAMS',
      API_ERROR: 'INSTAGRAM_API_ERROR',
    },
    // Generic error codes
    GENERIC: {
      NETWORK_ERROR: 'NETWORK_ERROR',
      TIMEOUT: 'TIMEOUT_ERROR',
      UNKNOWN: 'UNKNOWN_ERROR',
    }
  }

  /**
   * Create a standardized error object
   */
  static createError(
    message: string,
    platform: 'tiktok' | 'facebook' | 'instagram',
    code: string,
    details?: Record<string, any>
  ): SocialMediaError {
    const error = new Error(message) as SocialMediaError
    error.code = code
    error.platform = platform
    error.details = details

    // Log the error
    logger.error(`Social Media Error: ${platform}`, {
      code,
      message,
      details,
    })

    return error
  }

  /**
   * Handle TikTok API errors
   */
  static handleTikTokError(error: any): SocialMediaError {
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 429:
          return this.createError(
            'TikTok API rate limit exceeded',
            'tiktok',
            this.ERROR_CODES.TIKTOK.RATE_LIMIT,
            { reset: error.response.headers['x-ratelimit-reset'] }
          )
        case 401:
          return this.createError(
            'TikTok authentication failed',
            'tiktok',
            this.ERROR_CODES.TIKTOK.AUTH_ERROR,
            { details: data }
          )
        case 400:
          return this.createError(
            'Invalid TikTok API parameters',
            'tiktok',
            this.ERROR_CODES.TIKTOK.INVALID_PARAMS,
            { details: data }
          )
        default:
          return this.createError(
            'TikTok API error',
            'tiktok',
            this.ERROR_CODES.TIKTOK.API_ERROR,
            { status, details: data }
          )
      }
    }

    return this.createError(
      'Unknown TikTok error',
      'tiktok',
      this.ERROR_CODES.GENERIC.UNKNOWN,
      { originalError: error }
    )
  }

  /**
   * Handle Facebook API errors
   */
  static handleFacebookError(error: any): SocialMediaError {
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 4:
        case 17:
        case 32:
          return this.createError(
            'Facebook API rate limit exceeded',
            'facebook',
            this.ERROR_CODES.FACEBOOK.RATE_LIMIT,
            { details: data }
          )
        case 190:
          return this.createError(
            'Facebook authentication failed',
            'facebook',
            this.ERROR_CODES.FACEBOOK.AUTH_ERROR,
            { details: data }
          )
        case 100:
          return this.createError(
            'Invalid Facebook API parameters',
            'facebook',
            this.ERROR_CODES.FACEBOOK.INVALID_PARAMS,
            { details: data }
          )
        default:
          return this.createError(
            'Facebook API error',
            'facebook',
            this.ERROR_CODES.FACEBOOK.API_ERROR,
            { status, details: data }
          )
      }
    }

    return this.createError(
      'Unknown Facebook error',
      'facebook',
      this.ERROR_CODES.GENERIC.UNKNOWN,
      { originalError: error }
    )
  }

  /**
   * Handle Instagram API errors
   */
  static handleInstagramError(error: any): SocialMediaError {
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 429:
          return this.createError(
            'Instagram API rate limit exceeded',
            'instagram',
            this.ERROR_CODES.INSTAGRAM.RATE_LIMIT,
            { details: data }
          )
        case 401:
          return this.createError(
            'Instagram authentication failed',
            'instagram',
            this.ERROR_CODES.INSTAGRAM.AUTH_ERROR,
            { details: data }
          )
        case 400:
          return this.createError(
            'Invalid Instagram API parameters',
            'instagram',
            this.ERROR_CODES.INSTAGRAM.INVALID_PARAMS,
            { details: data }
          )
        default:
          return this.createError(
            'Instagram API error',
            'instagram',
            this.ERROR_CODES.INSTAGRAM.API_ERROR,
            { status, details: data }
          )
      }
    }

    return this.createError(
      'Unknown Instagram error',
      'instagram',
      this.ERROR_CODES.GENERIC.UNKNOWN,
      { originalError: error }
    )
  }

  /**
   * Handle network errors
   */
  static handleNetworkError(error: any): SocialMediaError {
    if (error.code === 'ECONNABORTED') {
      return this.createError(
        'Request timeout',
        'tiktok', // Default platform, will be overridden if needed
        this.ERROR_CODES.GENERIC.TIMEOUT,
        { originalError: error }
      )
    }

    return this.createError(
      'Network error',
      'tiktok', // Default platform, will be overridden if needed
      this.ERROR_CODES.GENERIC.NETWORK_ERROR,
      { originalError: error }
    )
  }

  /**
   * Check if error is a rate limit error
   */
  static isRateLimitError(error: SocialMediaError): boolean {
    return [
      this.ERROR_CODES.TIKTOK.RATE_LIMIT,
      this.ERROR_CODES.FACEBOOK.RATE_LIMIT,
      this.ERROR_CODES.INSTAGRAM.RATE_LIMIT,
    ].includes(error.code)
  }

  /**
   * Check if error is an auth error
   */
  static isAuthError(error: SocialMediaError): boolean {
    return [
      this.ERROR_CODES.TIKTOK.AUTH_ERROR,
      this.ERROR_CODES.FACEBOOK.AUTH_ERROR,
      this.ERROR_CODES.INSTAGRAM.AUTH_ERROR,
    ].includes(error.code)
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: SocialMediaError): string {
    if (this.isRateLimitError(error)) {
      return `Too many requests to ${error.platform}. Please try again later.`
    }
    if (this.isAuthError(error)) {
      return `Authentication failed for ${error.platform}. Please try logging in again.`
    }
    return error.message
  }
}

export default SocialMediaErrorHandler