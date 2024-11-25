"use client"

import { useState, useEffect } from 'react'
import { ServiceWorkerUtils } from '@/lib/service-worker-utils'
import { logger } from '@/lib/logger'

interface PWAState {
  isInstallable: boolean
  isInstalled: boolean
  isOnline: boolean
  hasUpdate: boolean
}

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: true,
    hasUpdate: false,
  })

  useEffect(() => {
    // Initialize service worker
    ServiceWorkerUtils.register()

    // Check initial installation status
    setState(prev => ({
      ...prev,
      isInstalled: ServiceWorkerUtils.isInstalled(),
      isOnline: navigator.onLine,
    }))

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      ;(window as any).deferredPrompt = e
      setState(prev => ({ ...prev, isInstallable: true }))
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setState(prev => ({ 
        ...prev, 
        isInstallable: false,
        isInstalled: true,
      }))
      logger.info('PWA installed successfully')
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }))
    }

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }))
    }

    // Listen for service worker updates
    const handleUpdate = () => {
      setState(prev => ({ ...prev, hasUpdate: true }))
    }

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('controllerchange', handleUpdate)
    }

    // Check for updates periodically
    const updateCheckInterval = setInterval(() => {
      ServiceWorkerUtils.checkForUpdates()
    }, 1000 * 60 * 60) // Check every hour

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)

      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleUpdate)
      }

      clearInterval(updateCheckInterval)
    }
  }, [])

  // Install PWA
  const install = async () => {
    try {
      const installed = await ServiceWorkerUtils.showInstallPrompt()
      if (installed) {
        setState(prev => ({ 
          ...prev, 
          isInstallable: false,
          isInstalled: true,
        }))
      }
      return installed
    } catch (error) {
      logger.error('Error installing PWA', error as Error)
      return false
    }
  }

  // Update PWA
  const update = () => {
    window.location.reload()
  }

  // Request notification permission
  const requestNotifications = async () => {
    try {
      const granted = await ServiceWorkerUtils.requestNotificationPermission()
      if (granted) {
        const subscription = await ServiceWorkerUtils.subscribeToPushNotifications()
        return !!subscription
      }
      return false
    } catch (error) {
      logger.error('Error requesting notifications', error as Error)
      return false
    }
  }

  // Clear cache and force update
  const clearCache = async () => {
    try {
      await ServiceWorkerUtils.clearCache()
      window.location.reload()
    } catch (error) {
      logger.error('Error clearing cache', error as Error)
    }
  }

  // Uninstall PWA
  const uninstall = async () => {
    try {
      await ServiceWorkerUtils.unregister()
      setState(prev => ({ 
        ...prev, 
        isInstalled: false,
        hasUpdate: false,
      }))
      window.location.reload()
    } catch (error) {
      logger.error('Error uninstalling PWA', error as Error)
    }
  }

  return {
    ...state,
    install,
    update,
    requestNotifications,
    clearCache,
    uninstall,
  }
}

export default usePWA