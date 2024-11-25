import { logger } from './logger'

export class BrowserUtils {
  /**
   * Check if code is running in browser
   */
  static isBrowser(): boolean {
    return typeof window !== 'undefined'
  }

  /**
   * Get browser locale
   */
  static getLocale(): string {
    try {
      return this.isBrowser()
        ? navigator.language || 'en-US'
        : 'en-US'
    } catch (error) {
      logger.error('Error getting locale', error as Error)
      return 'en-US'
    }
  }

  /**
   * Get device type
   */
  static getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    try {
      if (!this.isBrowser()) return 'desktop'

      const ua = navigator.userAgent
      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'tablet'
      }
      if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return 'mobile'
      }
      return 'desktop'
    } catch (error) {
      logger.error('Error getting device type', error as Error)
      return 'desktop'
    }
  }

  /**
   * Check if device is touch-enabled
   */
  static isTouchDevice(): boolean {
    try {
      return this.isBrowser() && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
    } catch (error) {
      logger.error('Error checking touch device', error as Error)
      return false
    }
  }

  /**
   * Get viewport dimensions
   */
  static getViewport(): { width: number; height: number } {
    try {
      if (!this.isBrowser()) {
        return { width: 0, height: 0 }
      }

      return {
        width: window.innerWidth || document.documentElement.clientWidth,
        height: window.innerHeight || document.documentElement.clientHeight,
      }
    } catch (error) {
      logger.error('Error getting viewport dimensions', error as Error)
      return { width: 0, height: 0 }
    }
  }

  /**
   * Scroll to element
   */
  static scrollToElement(element: HTMLElement, options: ScrollIntoViewOptions = {}): void {
    try {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        ...options,
      })
    } catch (error) {
      logger.error('Error scrolling to element', error as Error)
    }
  }

  /**
   * Copy text to clipboard
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        return true
      }

      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      textArea.remove()
      return true
    } catch (error) {
      logger.error('Error copying to clipboard', error as Error)
      return false
    }
  }

  /**
   * Get browser storage item with expiry
   */
  static getStorageItem<T>(key: string): T | null {
    try {
      if (!this.isBrowser()) return null

      const item = localStorage.getItem(key)
      if (!item) return null

      const { value, expiry } = JSON.parse(item)
      if (expiry && Date.now() > expiry) {
        localStorage.removeItem(key)
        return null
      }

      return value as T
    } catch (error) {
      logger.error('Error getting storage item', error as Error, { key })
      return null
    }
  }

  /**
   * Set browser storage item with optional expiry
   */
  static setStorageItem(key: string, value: any, expiryHours?: number): void {
    try {
      if (!this.isBrowser()) return

      const item = {
        value,
        expiry: expiryHours ? Date.now() + (expiryHours * 60 * 60 * 1000) : null,
      }

      localStorage.setItem(key, JSON.stringify(item))
    } catch (error) {
      logger.error('Error setting storage item', error as Error, { key })
    }
  }

  /**
   * Check if browser supports a CSS feature
   */
  static supportsCSS(property: string, value: string): boolean {
    try {
      if (!this.isBrowser()) return false

      const element = document.createElement('div')
      element.style[property as any] = value
      return element.style[property as any] === value
    } catch (error) {
      logger.error('Error checking CSS support', error as Error, { property, value })
      return false
    }
  }

  /**
   * Get browser preferred color scheme
   */
  static getPreferredColorScheme(): 'dark' | 'light' {
    try {
      if (!this.isBrowser()) return 'light'

      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    } catch (error) {
      logger.error('Error getting preferred color scheme', error as Error)
      return 'light'
    }
  }

  /**
   * Check if browser is online
   */
  static isOnline(): boolean {
    try {
      return this.isBrowser() ? navigator.onLine : true
    } catch (error) {
      logger.error('Error checking online status', error as Error)
      return true
    }
  }
}

export default BrowserUtils