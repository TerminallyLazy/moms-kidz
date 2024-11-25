import { logger } from './logger'

export class UrlUtils {
  /**
   * Parse query string into object
   */
  static parseQueryString(queryString: string): Record<string, string> {
    try {
      const params = new URLSearchParams(queryString.replace(/^\?/, ''))
      const result: Record<string, string> = {}
      
      params.forEach((value, key) => {
        result[key] = value
      })
      
      return result
    } catch (error) {
      logger.error('Error parsing query string', error as Error, { queryString })
      return {}
    }
  }

  /**
   * Convert object to query string
   */
  static buildQueryString(params: Record<string, any>): string {
    try {
      const searchParams = new URLSearchParams()
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      
      const queryString = searchParams.toString()
      return queryString ? `?${queryString}` : ''
    } catch (error) {
      logger.error('Error building query string', error as Error, { params })
      return ''
    }
  }

  /**
   * Join URL parts
   */
  static joinPaths(...parts: string[]): string {
    try {
      return parts
        .map(part => part.replace(/^\/+|\/+$/g, ''))
        .filter(Boolean)
        .join('/')
    } catch (error) {
      logger.error('Error joining paths', error as Error, { parts })
      return parts.join('/')
    }
  }

  /**
   * Get base URL
   */
  static getBaseUrl(): string {
    try {
      if (typeof window === 'undefined') {
        return process.env.NEXT_PUBLIC_APP_URL || ''
      }
      
      return `${window.location.protocol}//${window.location.host}`
    } catch (error) {
      logger.error('Error getting base URL', error as Error)
      return ''
    }
  }

  /**
   * Get current URL
   */
  static getCurrentUrl(): string {
    try {
      if (typeof window === 'undefined') return ''
      return window.location.href
    } catch (error) {
      logger.error('Error getting current URL', error as Error)
      return ''
    }
  }

  /**
   * Update URL query parameters
   */
  static updateQueryParams(params: Record<string, any>, options: { 
    replace?: boolean;
    removeEmpty?: boolean;
  } = {}): string {
    try {
      const { replace = false, removeEmpty = true } = options
      const currentParams = this.parseQueryString(window.location.search)
      const newParams = replace ? params : { ...currentParams, ...params }
      
      const filteredParams = removeEmpty
        ? Object.fromEntries(
            Object.entries(newParams).filter(([_, value]) => 
              value !== undefined && value !== null && value !== ''
            )
          )
        : newParams

      return this.buildQueryString(filteredParams)
    } catch (error) {
      logger.error('Error updating query params', error as Error, { params, options })
      return window.location.search
    }
  }

  /**
   * Check if URL is absolute
   */
  static isAbsoluteUrl(url: string): boolean {
    try {
      return /^(?:[a-z]+:)?\/\//i.test(url)
    } catch (error) {
      logger.error('Error checking absolute URL', error as Error, { url })
      return false
    }
  }

  /**
   * Get URL without query string
   */
  static getPathFromUrl(url: string): string {
    try {
      return url.split(/[?#]/)[0]
    } catch (error) {
      logger.error('Error getting path from URL', error as Error, { url })
      return url
    }
  }

  /**
   * Get domain from URL
   */
  static getDomainFromUrl(url: string): string {
    try {
      const { hostname } = new URL(url)
      return hostname
    } catch (error) {
      logger.error('Error getting domain from URL', error as Error, { url })
      return url
    }
  }

  /**
   * Check if URL is valid
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Sanitize URL
   */
  static sanitizeUrl(url: string): string {
    try {
      const sanitized = url.trim().replace(/javascript:/gi, '')
      return this.isValidUrl(sanitized) ? sanitized : ''
    } catch (error) {
      logger.error('Error sanitizing URL', error as Error, { url })
      return ''
    }
  }

  /**
   * Get relative URL from absolute URL
   */
  static getRelativeUrl(url: string, base = this.getBaseUrl()): string {
    try {
      if (!this.isAbsoluteUrl(url)) return url
      return url.replace(base, '')
    } catch (error) {
      logger.error('Error getting relative URL', error as Error, { url, base })
      return url
    }
  }
}

export default UrlUtils