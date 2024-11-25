import { logger } from './logger'
import EnvironmentUtils from './env-utils'

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  platform: 'tiktok' | 'facebook' | 'instagram'
}

interface RateLimitState {
  requests: number
  resetAt: number
}

class RateLimitUtils {
  private static instance: RateLimitUtils
  private rateLimits: Map<string, RateLimitState>
  private configs: Map<string, RateLimitConfig>

  private constructor() {
    this.rateLimits = new Map()
    this.configs = new Map()

    // Initialize configs from environment variables
    this.configs.set('tiktok', {
      maxRequests: parseInt(EnvironmentUtils.getOptional('TIKTOK_RATE_LIMIT', '1000')),
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
      platform: 'tiktok'
    })

    this.configs.set('facebook', {
      maxRequests: parseInt(EnvironmentUtils.getOptional('FACEBOOK_RATE_LIMIT', '200')),
      windowMs: 60 * 60 * 1000, // 1 hour
      platform: 'facebook'
    })

    this.configs.set('instagram', {
      maxRequests: parseInt(EnvironmentUtils.getOptional('INSTAGRAM_RATE_LIMIT', '200')),
      windowMs: 60 * 60 * 1000, // 1 hour
      platform: 'instagram'
    })
  }

  public static getInstance(): RateLimitUtils {
    if (!RateLimitUtils.instance) {
      RateLimitUtils.instance = new RateLimitUtils()
    }
    return RateLimitUtils.instance
  }

  /**
   * Check if a request can be made
   */
  public canMakeRequest(platform: string): boolean {
    const config = this.configs.get(platform)
    if (!config) {
      logger.error(`No rate limit config found for platform: ${platform}`)
      return false
    }

    const now = Date.now()
    let state = this.rateLimits.get(platform)

    // Initialize or reset state if window has expired
    if (!state || now >= state.resetAt) {
      state = {
        requests: 0,
        resetAt: now + config.windowMs
      }
      this.rateLimits.set(platform, state)
    }

    return state.requests < config.maxRequests
  }

  /**
   * Increment request count
   */
  public incrementRequestCount(platform: string): void {
    const state = this.rateLimits.get(platform)
    if (state) {
      state.requests++
      this.rateLimits.set(platform, state)

      // Log when approaching limit
      const config = this.configs.get(platform)
      if (config && state.requests >= config.maxRequests * 0.8) {
        logger.warn(`Approaching rate limit for ${platform}`, {
          current: state.requests,
          max: config.maxRequests,
          resetAt: new Date(state.resetAt).toISOString()
        })
      }
    }
  }

  /**
   * Get remaining requests
   */
  public getRemainingRequests(platform: string): number {
    const config = this.configs.get(platform)
    const state = this.rateLimits.get(platform)

    if (!config || !state) return 0

    return Math.max(0, config.maxRequests - state.requests)
  }

  /**
   * Get time until reset
   */
  public getTimeUntilReset(platform: string): number {
    const state = this.rateLimits.get(platform)
    if (!state) return 0

    return Math.max(0, state.resetAt - Date.now())
  }

  /**
   * Check if rate limited
   */
  public isRateLimited(platform: string): boolean {
    return !this.canMakeRequest(platform)
  }

  /**
   * Reset rate limit counter
   */
  public resetCounter(platform: string): void {
    const config = this.configs.get(platform)
    if (config) {
      this.rateLimits.set(platform, {
        requests: 0,
        resetAt: Date.now() + config.windowMs
      })
      logger.info(`Rate limit counter reset for ${platform}`)
    }
  }

  /**
   * Get rate limit status
   */
  public getRateLimitStatus(platform: string) {
    const config = this.configs.get(platform)
    const state = this.rateLimits.get(platform)

    if (!config || !state) {
      return {
        enabled: false,
        remaining: 0,
        resetIn: 0,
        isLimited: true
      }
    }

    return {
      enabled: true,
      remaining: this.getRemainingRequests(platform),
      resetIn: this.getTimeUntilReset(platform),
      isLimited: this.isRateLimited(platform)
    }
  }

  /**
   * Update rate limit config
   */
  public updateConfig(platform: string, config: Partial<RateLimitConfig>): void {
    const currentConfig = this.configs.get(platform)
    if (currentConfig) {
      this.configs.set(platform, {
        ...currentConfig,
        ...config,
        platform: currentConfig.platform
      })
      this.resetCounter(platform)
      logger.info(`Rate limit config updated for ${platform}`, { config })
    }
  }

  /**
   * Execute rate-limited function
   */
  public async executeWithRateLimit<T>(
    platform: string,
    fn: () => Promise<T>,
    retryCount = 3,
    retryDelay = 1000
  ): Promise<T> {
    if (this.isRateLimited(platform)) {
      const resetIn = this.getTimeUntilReset(platform)
      throw new Error(`Rate limit exceeded for ${platform}. Reset in ${resetIn}ms`)
    }

    try {
      this.incrementRequestCount(platform)
      return await fn()
    } catch (error) {
      if (retryCount > 0 && error instanceof Error && error.message.includes('rate limit')) {
        logger.warn(`Retrying rate-limited request for ${platform}`, {
          retriesLeft: retryCount - 1,
          delay: retryDelay
        })
        
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        return this.executeWithRateLimit(platform, fn, retryCount - 1, retryDelay * 2)
      }
      throw error
    }
  }
}

export default RateLimitUtils.getInstance()