import { supabase } from './supabase'
import { logger } from './logger'
import { BrowserUtils } from './browser-utils'

interface CacheOptions {
  ttl?: number;          // Time to live in seconds
  storage?: 'local' | 'session' | 'supabase';
  prefix?: string;
}

interface CacheItem<T> {
  value: T;
  expires: number;
}

export class CacheUtils {
  private static readonly DEFAULT_PREFIX = 'mk_cache_'
  private static readonly DEFAULT_TTL = 3600 // 1 hour
  private static readonly STORAGE_KEY = 'cache_meta'

  /**
   * Set cache item
   */
  static async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      const {
        ttl = this.DEFAULT_TTL,
        storage = 'local',
        prefix = this.DEFAULT_PREFIX
      } = options

      const cacheKey = `${prefix}${key}`
      const cacheItem: CacheItem<T> = {
        value,
        expires: Date.now() + (ttl * 1000)
      }

      if (storage === 'supabase') {
        await this.setSupabaseCache(cacheKey, cacheItem)
      } else {
        this.setBrowserCache(cacheKey, cacheItem, storage)
      }
    } catch (error) {
      logger.error('Error setting cache item', error as Error, { key })
    }
  }

  /**
   * Get cache item
   */
  static async get<T>(
    key: string,
    options: CacheOptions = {}
  ): Promise<T | null> {
    try {
      const {
        storage = 'local',
        prefix = this.DEFAULT_PREFIX
      } = options

      const cacheKey = `${prefix}${key}`

      if (storage === 'supabase') {
        return await this.getSupabaseCache<T>(cacheKey)
      } else {
        return this.getBrowserCache<T>(cacheKey, storage)
      }
    } catch (error) {
      logger.error('Error getting cache item', error as Error, { key })
      return null
    }
  }

  /**
   * Remove cache item
   */
  static async remove(
    key: string,
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      const {
        storage = 'local',
        prefix = this.DEFAULT_PREFIX
      } = options

      const cacheKey = `${prefix}${key}`

      if (storage === 'supabase') {
        await this.removeSupabaseCache(cacheKey)
      } else {
        this.removeBrowserCache(cacheKey, storage)
      }
    } catch (error) {
      logger.error('Error removing cache item', error as Error, { key })
    }
  }

  /**
   * Clear all cache items
   */
  static async clear(options: CacheOptions = {}): Promise<void> {
    try {
      const {
        storage = 'local',
        prefix = this.DEFAULT_PREFIX
      } = options

      if (storage === 'supabase') {
        await this.clearSupabaseCache(prefix)
      } else {
        this.clearBrowserCache(prefix, storage)
      }
    } catch (error) {
      logger.error('Error clearing cache', error as Error)
    }
  }

  /**
   * Set browser cache item
   */
  private static setBrowserCache<T>(
    key: string,
    item: CacheItem<T>,
    storage: 'local' | 'session'
  ): void {
    const storageObj = storage === 'local' ? localStorage : sessionStorage
    storageObj.setItem(key, JSON.stringify(item))
  }

  /**
   * Get browser cache item
   */
  private static getBrowserCache<T>(
    key: string,
    storage: 'local' | 'session'
  ): T | null {
    const storageObj = storage === 'local' ? localStorage : sessionStorage
    const item = storageObj.getItem(key)

    if (!item) return null

    try {
      const cacheItem: CacheItem<T> = JSON.parse(item)
      if (Date.now() > cacheItem.expires) {
        storageObj.removeItem(key)
        return null
      }
      return cacheItem.value
    } catch {
      return null
    }
  }

  /**
   * Remove browser cache item
   */
  private static removeBrowserCache(
    key: string,
    storage: 'local' | 'session'
  ): void {
    const storageObj = storage === 'local' ? localStorage : sessionStorage
    storageObj.removeItem(key)
  }

  /**
   * Clear browser cache
   */
  private static clearBrowserCache(
    prefix: string,
    storage: 'local' | 'session'
  ): void {
    const storageObj = storage === 'local' ? localStorage : sessionStorage
    
    Object.keys(storageObj).forEach(key => {
      if (key.startsWith(prefix)) {
        storageObj.removeItem(key)
      }
    })
  }

  /**
   * Set Supabase cache item
   */
  private static async setSupabaseCache<T>(
    key: string,
    item: CacheItem<T>
  ): Promise<void> {
    const { error } = await supabase
      .from('cache')
      .upsert({
        key,
        value: item.value,
        expires: new Date(item.expires).toISOString()
      })

    if (error) throw error
  }

  /**
   * Get Supabase cache item
   */
  private static async getSupabaseCache<T>(key: string): Promise<T | null> {
    const { data, error } = await supabase
      .from('cache')
      .select('value, expires')
      .eq('key', key)
      .single()

    if (error) return null

    if (data && new Date(data.expires) > new Date()) {
      return data.value as T
    }

    // Remove expired item
    await this.removeSupabaseCache(key)
    return null
  }

  /**
   * Remove Supabase cache item
   */
  private static async removeSupabaseCache(key: string): Promise<void> {
    const { error } = await supabase
      .from('cache')
      .delete()
      .eq('key', key)

    if (error) throw error
  }

  /**
   * Clear Supabase cache
   */
  private static async clearSupabaseCache(prefix: string): Promise<void> {
    const { error } = await supabase
      .from('cache')
      .delete()
      .like('key', `${prefix}%`)

    if (error) throw error
  }

  /**
   * Clean expired cache items
   */
  static async cleanExpired(options: CacheOptions = {}): Promise<void> {
    try {
      const {
        storage = 'local',
        prefix = this.DEFAULT_PREFIX
      } = options

      if (storage === 'supabase') {
        const { error } = await supabase
          .from('cache')
          .delete()
          .lt('expires', new Date().toISOString())

        if (error) throw error
      } else {
        const storageObj = storage === 'local' ? localStorage : sessionStorage
        
        Object.keys(storageObj).forEach(key => {
          if (key.startsWith(prefix)) {
            try {
              const item = JSON.parse(storageObj.getItem(key) || '')
              if (Date.now() > item.expires) {
                storageObj.removeItem(key)
              }
            } catch {
              // Remove invalid items
              storageObj.removeItem(key)
            }
          }
        })
      }
    } catch (error) {
      logger.error('Error cleaning expired cache', error as Error)
    }
  }
}

export default CacheUtils