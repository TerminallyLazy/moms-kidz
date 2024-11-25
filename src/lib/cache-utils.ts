import { logger } from './logger'
import EnvironmentUtils from './env-utils'
import type { TikTokPost, FacebookPost, InstagramPost, SocialMediaStats, SocialMediaAnalytics } from '@/types/social-media'

interface CacheConfig {
  ttl: number // Time to live in seconds
  key: string
}

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

class CacheUtils {
  private static instance: CacheUtils
  private cache: Map<string, CacheEntry<any>>
  private readonly configs: {
    feed: CacheConfig
    stats: CacheConfig
    analytics: CacheConfig
  }

  private constructor() {
    this.cache = new Map()
    
    // Initialize cache configurations from environment variables
    this.configs = {
      feed: {
        ttl: parseInt(EnvironmentUtils.getOptional('SOCIAL_FEED_CACHE_TTL', '300')), // 5 minutes
        key: 'social_feed'
      },
      stats: {
        ttl: parseInt(EnvironmentUtils.getOptional('SOCIAL_STATS_CACHE_TTL', '3600')), // 1 hour
        key: 'social_stats'
      },
      analytics: {
        ttl: parseInt(EnvironmentUtils.getOptional('SOCIAL_ANALYTICS_CACHE_TTL', '86400')), // 24 hours
        key: 'social_analytics'
      }
    }
  }

  public static getInstance(): CacheUtils {
    if (!CacheUtils.instance) {
      CacheUtils.instance = new CacheUtils()
    }
    return CacheUtils.instance
  }

  /**
   * Set cache entry
   */
  private setCacheEntry<T>(key: string, data: T, ttl: number): void {
    const expiresAt = Date.now() + (ttl * 1000)
    this.cache.set(key, { data, expiresAt })
    logger.debug(`Cache set for key: ${key}`, { expiresAt: new Date(expiresAt).toISOString() })
  }

  /**
   * Get cache entry
   */
  private getCacheEntry<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      logger.debug(`Cache expired for key: ${key}`)
      return null
    }

    logger.debug(`Cache hit for key: ${key}`)
    return entry.data
  }

  /**
   * Cache social media feed
   */
  public cacheSocialFeed(
    platform: 'tiktok' | 'facebook' | 'instagram',
    data: TikTokPost[] | FacebookPost[] | InstagramPost[]
  ): void {
    const key = `${this.configs.feed.key}_${platform}`
    this.setCacheEntry(key, data, this.configs.feed.ttl)
  }

  /**
   * Get cached social media feed
   */
  public getCachedSocialFeed<T>(platform: 'tiktok' | 'facebook' | 'instagram'): T[] | null {
    const key = `${this.configs.feed.key}_${platform}`
    return this.getCacheEntry<T[]>(key)
  }

  /**
   * Cache social media stats
   */
  public cacheSocialStats(
    platform: 'tiktok' | 'facebook' | 'instagram',
    stats: SocialMediaStats
  ): void {
    const key = `${this.configs.stats.key}_${platform}`
    this.setCacheEntry(key, stats, this.configs.stats.ttl)
  }

  /**
   * Get cached social media stats
   */
  public getCachedSocialStats(
    platform: 'tiktok' | 'facebook' | 'instagram'
  ): SocialMediaStats | null {
    const key = `${this.configs.stats.key}_${platform}`
    return this.getCacheEntry<SocialMediaStats>(key)
  }

  /**
   * Cache social media analytics
   */
  public cacheSocialAnalytics(
    platform: 'tiktok' | 'facebook' | 'instagram',
    analytics: SocialMediaAnalytics
  ): void {
    const key = `${this.configs.analytics.key}_${platform}`
    this.setCacheEntry(key, analytics, this.configs.analytics.ttl)
  }

  /**
   * Get cached social media analytics
   */
  public getCachedSocialAnalytics(
    platform: 'tiktok' | 'facebook' | 'instagram'
  ): SocialMediaAnalytics | null {
    const key = `${this.configs.analytics.key}_${platform}`
    return this.getCacheEntry<SocialMediaAnalytics>(key)
  }

  /**
   * Clear cache for a specific platform
   */
  public clearPlatformCache(platform: 'tiktok' | 'facebook' | 'instagram'): void {
    const keys = [
      `${this.configs.feed.key}_${platform}`,
      `${this.configs.stats.key}_${platform}`,
      `${this.configs.analytics.key}_${platform}`
    ]

    keys.forEach(key => {
      this.cache.delete(key)
      logger.info(`Cache cleared for key: ${key}`)
    })
  }

  /**
   * Clear all cache
   */
  public clearAllCache(): void {
    this.cache.clear()
    logger.info('All cache cleared')
  }

  /**
   * Get cache status
   */
  public getCacheStatus(): Record<string, { size: number; entries: string[] }> {
    const status: Record<string, { size: number; entries: string[] }> = {
      feed: { size: 0, entries: [] },
      stats: { size: 0, entries: [] },
      analytics: { size: 0, entries: [] }
    }

    this.cache.forEach((_, key) => {
      if (key.startsWith(this.configs.feed.key)) {
        status.feed.size++
        status.feed.entries.push(key)
      } else if (key.startsWith(this.configs.stats.key)) {
        status.stats.size++
        status.stats.entries.push(key)
      } else if (key.startsWith(this.configs.analytics.key)) {
        status.analytics.size++
        status.analytics.entries.push(key)
      }
    })

    return status
  }

  /**
   * Execute with cache
   */
  public async executeWithCache<T>(
    key: string,
    ttl: number,
    fn: () => Promise<T>
  ): Promise<T> {
    const cached = this.getCacheEntry<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await fn()
    this.setCacheEntry(key, data, ttl)
    return data
  }

  /**
   * Update cache configuration
   */
  public updateCacheConfig(
    type: 'feed' | 'stats' | 'analytics',
    config: Partial<CacheConfig>
  ): void {
    this.configs[type] = {
      ...this.configs[type],
      ...config
    }
    logger.info(`Cache config updated for ${type}`, { config: this.configs[type] })
  }
}

export default CacheUtils.getInstance()
