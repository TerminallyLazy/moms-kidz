"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { usePWA } from '@/hooks/use-pwa'
import { Icons } from '@/components/ui/icons'

interface PWAPromptProps {
  className?: string
}

export function PWAPrompt({ className }: PWAPromptProps) {
  const { 
    isInstallable,
    isInstalled,
    isOnline,
    hasUpdate,
    install,
    update,
    requestNotifications,
  } = usePWA()

  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false)

  useEffect(() => {
    // Show notification prompt after successful installation
    if (isInstalled && Notification.permission === 'default') {
      setShowNotificationPrompt(true)
    }
  }, [isInstalled])

  if (!isOnline) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 p-4 text-white">
        <div className="container flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icons.offline className="h-5 w-5" />
            <span>You are currently offline</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (hasUpdate) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-blue-500 p-4 text-white">
        <div className="container flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icons.refresh className="h-5 w-5" />
            <span>A new version is available</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={update}
          >
            Update
          </Button>
        </div>
      </div>
    )
  }

  if (isInstallable) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-purple-600 p-4 text-white">
        <div className="container flex items-center justify-between">
          <div className="flex flex-col space-y-1">
            <span className="font-semibold">Install Mom's Kidz</span>
            <span className="text-sm opacity-90">
              Add to your home screen for the best experience
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => install()}
            >
              Install
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.localStorage.setItem('pwa-prompt-dismissed', 'true')}
            >
              Not now
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (showNotificationPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-green-500 p-4 text-white">
        <div className="container flex items-center justify-between">
          <div className="flex flex-col space-y-1">
            <span className="font-semibold">Enable Notifications</span>
            <span className="text-sm opacity-90">
              Stay updated with activity reminders and achievements
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                const enabled = await requestNotifications()
                if (enabled) {
                  setShowNotificationPrompt(false)
                }
              }}
            >
              Enable
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotificationPrompt(false)}
            >
              Later
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default PWAPrompt