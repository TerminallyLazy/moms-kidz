import { ApiResponse } from './api-response'
import { CacheUtils } from './cache-utils'
import { logger } from './logger'

interface RequestOptions extends RequestInit {
  cache?: boolean;
  cacheTTL?: number;
  retry?: number;
  retryDelay?: number;
  timeout?: number;
}

export class ApiUtils {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
  private static defaultOptions: RequestOptions = {
    cache: true,
    cacheTTL: 300, // 5 minutes
    retry: 3,
    retryDelay: 1000,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  /**
   * Make API request with retries and caching
   */
  static async request<T>(
    url: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const finalOptions = { ...this.defaultOptions, ...options }
    const fullUrl = this.getFullUrl(url)
    const cacheKey = `api_${finalOptions.method || 'GET'}_${fullUrl}`

    try {
      // Check cache
      if (finalOptions.cache && finalOptions.method === 'GET') {
        const cachedData = await CacheUtils.get<T>(cacheKey)
        if (cachedData) return cachedData
      }

      // Make request with retries
      const response = await this.fetchWithRetry(fullUrl, finalOptions)
      const data = await this.parseResponse<T>(response)

      // Cache successful GET requests
      if (finalOptions.cache && finalOptions.method === 'GET') {
        await CacheUtils.set(cacheKey, data, {
          ttl: finalOptions.cacheTTL,
        })
      }

      return data
    } catch (error) {
      logger.error('API request failed', error as Error, {
        url: fullUrl,
        method: finalOptions.method,
      })
      throw error
    }
  }

  /**
   * GET request
   */
  static async get<T>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'GET',
    })
  }

  /**
   * POST request
   */
  static async post<T>(
    url: string,
    data: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * PUT request
   */
  static async put<T>(
    url: string,
    data: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * PATCH request
   */
  static async patch<T>(
    url: string,
    data: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  /**
   * DELETE request
   */
  static async delete<T>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'DELETE',
    })
  }

  /**
   * Upload file
   */
  static async uploadFile<T>(
    url: string,
    file: File,
    options: RequestOptions = {}
  ): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: formData,
      headers: {},
    })
  }

  /**
   * Fetch with retry logic
   */
  private static async fetchWithRetry(
    url: string,
    options: RequestOptions
  ): Promise<Response> {
    let lastError: Error | null = null
    const { retry = 3, retryDelay = 1000 } = options

    for (let attempt = 0; attempt <= retry; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, options)
        
        // Retry on 5xx errors
        if (response.status >= 500 && attempt < retry) {
          lastError = new Error(`Server error: ${response.status}`)
          await this.delay(retryDelay * Math.pow(2, attempt))
          continue
        }

        return response
      } catch (error) {
        lastError = error as Error
        
        if (attempt === retry) break
        
        await this.delay(retryDelay * Math.pow(2, attempt))
      }
    }

    throw lastError || new Error('Request failed')
  }

  /**
   * Fetch with timeout
   */
  private static fetchWithTimeout(
    url: string,
    options: RequestOptions
  ): Promise<Response> {
    const { timeout = 30000 } = options

    return Promise.race([
      fetch(url, options),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      ),
    ])
  }

  /**
   * Parse response
   */
  private static async parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      return response.json()
    }
    
    return response.text() as unknown as T
  }

  /**
   * Get full URL
   */
  private static getFullUrl(url: string): string {
    if (url.startsWith('http')) return url
    return `${this.baseUrl}${url}`
  }

  /**
   * Delay helper
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Clear API cache
   */
  static async clearCache(): Promise<void> {
    await CacheUtils.clear({
      prefix: 'api_',
    })
  }

  /**
   * Set default options
   */
  static setDefaultOptions(options: Partial<RequestOptions>): void {
    this.defaultOptions = {
      ...this.defaultOptions,
      ...options,
    }
  }

  /**
   * Set base URL
   */
  static setBaseUrl(url: string): void {
    this.baseUrl = url
  }
}

export default ApiUtils