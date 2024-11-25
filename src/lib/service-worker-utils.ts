import { logger } from './logger'

export class ServiceWorkerUtils {
  /**
   * Register service worker
   */
  static async register(): Promise<void> {
    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service workers are not supported')
      }

      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.showUpdateNotification()
          }
        })
      })

      logger.info('Service Worker registered successfully')
    } catch (error) {
      logger.error('Service Worker registration failed', error as Error)
    }
  }

  /**
   * Check if app is installed
   */
  static isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true
  }

  /**
   * Show PWA installation prompt
   */
  static async showInstallPrompt(): Promise<boolean> {
    try {
      const promptEvent = (window as any).deferredPrompt
      if (!promptEvent) return false

      // Show prompt
      promptEvent.prompt()

      // Wait for user response
      const { outcome } = await promptEvent.userChoice

      // Clear the prompt
      ;(window as any).deferredPrompt = null

      return outcome === 'accepted'
    } catch (error) {
      logger.error('Error showing install prompt', error as Error)
      return false
    }
  }

  /**
   * Request notification permission
   */
  static async requestNotificationPermission(): Promise<boolean> {
    try {
      if (!('Notification' in window)) return false

      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (error) {
      logger.error('Error requesting notification permission', error as Error)
      return false
    }
  }

  /**
   * Subscribe to push notifications
   */
  static async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    try {
      const registration = await navigator.serviceWorker.ready
      
      // Get public VAPID key from environment
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_KEY
      if (!publicVapidKey) throw new Error('VAPID key not found')

      // Subscribe
      return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(publicVapidKey),
      })
    } catch (error) {
      logger.error('Error subscribing to push notifications', error as Error)
      return null
    }
  }

  /**
   * Show update notification
   */
  private static showUpdateNotification(): void {
    // You can customize this to show a UI component instead
    if (confirm('New version available! Click OK to update.')) {
      window.location.reload()
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }

    return outputArray
  }

  /**
   * Check if updates are available
   */
  static async checkForUpdates(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.update()
    } catch (error) {
      logger.error('Error checking for updates', error as Error)
    }
  }

  /**
   * Handle offline functionality
   */
  static setupOfflineHandling(): void {
    window.addEventListener('online', () => {
      logger.info('App is online')
      // Trigger sync when back online
      this.triggerSync()
    })

    window.addEventListener('offline', () => {
      logger.info('App is offline')
    })
  }

  /**
   * Trigger background sync
   */
  static async triggerSync(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register('sync-activities')
    } catch (error) {
      logger.error('Error triggering sync', error as Error)
    }
  }

  /**
   * Clear service worker cache
   */
  static async clearCache(): Promise<void> {
    try {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      logger.info('Cache cleared successfully')
    } catch (error) {
      logger.error('Error clearing cache', error as Error)
    }
  }

  /**
   * Unregister service worker
   */
  static async unregister(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.unregister()
      logger.info('Service Worker unregistered successfully')
    } catch (error) {
      logger.error('Error unregistering Service Worker', error as Error)
    }
  }
}

export default ServiceWorkerUtils