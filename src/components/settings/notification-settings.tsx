"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { 
  Bell,
  Trophy,
  Star,
  Target,
  Flame,
  Medal,
  Crown,
  MessageSquare,
  RefreshCw
} from 'lucide-react'
import { useNotifications } from '@/contexts/notifications-context'
import { motion } from 'framer-motion'

interface NotificationPreferences {
  notifyPoints: boolean
  notifyAchievements: boolean
  notifyChallenges: boolean
  notifyLevelUp: boolean
  notifyStreak: boolean
  notifyRank: boolean
  notifyFriends: boolean
  enablePushNotifications: boolean
  enableSoundAlerts: boolean
  showNotificationPreview: boolean
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  notifyPoints: true,
  notifyAchievements: true,
  notifyChallenges: true,
  notifyLevelUp: true,
  notifyStreak: true,
  notifyRank: true,
  notifyFriends: true,
  enablePushNotifications: false,
  enableSoundAlerts: true,
  showNotificationPreview: true
}

const NOTIFICATION_SETTINGS = [
  {
    key: 'notifyPoints' as const,
    title: 'Point Notifications',
    description: 'Get notified when you earn points',
    icon: Medal,
    category: 'achievements'
  },
  {
    key: 'notifyAchievements' as const,
    title: 'Achievement Notifications',
    description: 'Get notified when you unlock achievements',
    icon: Trophy,
    category: 'achievements'
  },
  {
    key: 'notifyChallenges' as const,
    title: 'Challenge Notifications',
    description: 'Get notified about challenge progress and completion',
    icon: Target,
    category: 'achievements'
  },
  {
    key: 'notifyLevelUp' as const,
    title: 'Level Up Notifications',
    description: 'Get notified when you level up',
    icon: Star,
    category: 'progress'
  },
  {
    key: 'notifyStreak' as const,
    title: 'Streak Notifications',
    description: 'Get notified about your activity streak',
    icon: Flame,
    category: 'progress'
  },
  {
    key: 'notifyRank' as const,
    title: 'Rank Notifications',
    description: 'Get notified when your rank changes',
    icon: Crown,
    category: 'progress'
  },
  {
    key: 'notifyFriends' as const,
    title: 'Friend Notifications',
    description: 'Get notified about friend activities',
    icon: MessageSquare,
    category: 'social'
  }
]

const DELIVERY_SETTINGS = [
  {
    key: 'enablePushNotifications' as const,
    title: 'Push Notifications',
    description: 'Enable browser push notifications',
    icon: Bell
  },
  {
    key: 'enableSoundAlerts' as const,
    title: 'Sound Alerts',
    description: 'Play sound when notifications arrive',
    icon: Bell
  },
  {
    key: 'showNotificationPreview' as const,
    title: 'Notification Preview',
    description: 'Show notification content in previews',
    icon: Bell
  }
]

export function NotificationSettings() {
  const { addNotification } = useNotifications()
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    const saved = localStorage.getItem('notificationPreferences')
    return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES
  })

  const handlePreferenceChange = (key: keyof NotificationPreferences) => {
    setPreferences(prev => {
      const newPreferences = { ...prev, [key]: !prev[key] }
      localStorage.setItem('notificationPreferences', JSON.stringify(newPreferences))
      
      addNotification({
        type: 'points',
        title: 'Settings Updated',
        description: 'Your notification preferences have been saved'
      })

      return newPreferences
    })
  }

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES)
    localStorage.setItem('notificationPreferences', JSON.stringify(DEFAULT_PREFERENCES))
    
    addNotification({
      type: 'points',
      title: 'Settings Reset',
      description: 'Your notification preferences have been reset to defaults'
    })
  }

  const groupedSettings = NOTIFICATION_SETTINGS.reduce((acc, setting) => {
    const category = setting.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(setting)
    return acc
  }, {} as Record<string, typeof NOTIFICATION_SETTINGS>)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Preferences</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetPreferences}
            className="space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Delivery Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Delivery Settings</h3>
          {DELIVERY_SETTINGS.map(({ key, title, description, icon: Icon }) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-start space-x-3">
                <Icon className="h-5 w-5 mt-1 text-primary" />
                <div className="space-y-1">
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
              <Switch
                checked={preferences[key]}
                onCheckedChange={() => handlePreferenceChange(key)}
              />
            </motion.div>
          ))}
        </div>

        {/* Notification Categories */}
        {Object.entries(groupedSettings).map(([category, settings]) => (
          <div key={category} className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground capitalize">
              {category} Notifications
            </h3>
            {settings.map(({ key, title, description, icon: Icon }) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start space-x-3">
                  <Icon className="h-5 w-5 mt-1 text-primary" />
                  <div className="space-y-1">
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>
                <Switch
                  checked={preferences[key]}
                  onCheckedChange={() => handlePreferenceChange(key)}
                />
              </motion.div>
            ))}
          </div>
        ))}

        {/* Status Summary */}
        <div className="rounded-lg border p-4">
          <div className="flex items-start space-x-3">
            <Bell className="h-5 w-5 mt-1 text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Notification Status</p>
              <p className="text-sm text-muted-foreground">
                {Object.entries(preferences).filter(([_, value]) => value).length} of {
                  Object.keys(preferences).length
                } notification types enabled
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}