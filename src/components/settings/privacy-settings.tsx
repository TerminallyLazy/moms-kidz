"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { 
  Eye, 
  Users, 
  Trophy,
  Medal,
  Globe,
  Lock,
  UserCircle,
  Shield,
  Target,
  BarChart2,
  ChartLineUp,
  Settings,
  Bell,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useNotifications } from '@/contexts/notifications-context'
import { motion } from 'framer-motion'

interface PrivacySettings {
  showProfile: boolean
  showAchievements: boolean
  showPoints: boolean
  showChallenges: boolean
  allowFriendRequests: boolean
  publicProfile: boolean
  shareProgress: boolean
  shareStats: boolean
}

export function PrivacySettings() {
  const { addNotification } = useNotifications()
  const [settings, setSettings] = useState<PrivacySettings>(() => {
    // Load settings from localStorage or use defaults
    const savedSettings = localStorage.getItem('privacySettings')
    return savedSettings ? JSON.parse(savedSettings) : {
      showProfile: true,
      showAchievements: true,
      showPoints: false,
      showChallenges: true,
      allowFriendRequests: true,
      publicProfile: false,
      shareProgress: true,
      shareStats: false
    }
  })

  const handleSettingChange = (key: keyof PrivacySettings) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: !prev[key] }
      // Save to localStorage
      localStorage.setItem('privacySettings', JSON.stringify(newSettings))
      
      // Show notification
      addNotification({
        type: 'points',
        title: 'Privacy Settings Updated',
        description: 'Your privacy preferences have been saved'
      })

      return newSettings
    })
  }

  const PRIVACY_SETTINGS = [
    {
      key: 'showProfile' as const,
      title: 'Profile Visibility',
      description: 'Allow others to view your profile',
      icon: UserCircle,
      impact: 'high'
    },
    {
      key: 'showAchievements' as const,
      title: 'Achievement Visibility',
      description: 'Show your achievements to others',
      icon: Trophy,
      impact: 'medium'
    },
    {
      key: 'showPoints' as const,
      title: 'Points Visibility',
      description: 'Display your points to other users',
      icon: Medal,
      impact: 'low'
    },
    {
      key: 'showChallenges' as const,
      title: 'Challenge Visibility',
      description: 'Show your active and completed challenges',
      icon: Target,
      impact: 'medium'
    },
    {
      key: 'allowFriendRequests' as const,
      title: 'Friend Requests',
      description: 'Allow other users to send you friend requests',
      icon: Users,
      impact: 'high'
    },
    {
      key: 'publicProfile' as const,
      title: 'Public Profile',
      description: 'Make your profile visible to everyone',
      icon: Globe,
      impact: 'high'
    },
    {
      key: 'shareProgress' as const,
      title: 'Progress Sharing',
      description: 'Share your progress with friends',
      icon: ChartLineUp,
      impact: 'medium'
    },
    {
      key: 'shareStats' as const,
      title: 'Statistics Sharing',
      description: 'Share your activity statistics',
      icon: BarChart2,
      impact: 'low'
    }
  ]

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-500'
      case 'medium':
        return 'text-yellow-500'
      case 'low':
        return 'text-green-500'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Privacy Settings</span>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2 text-sm"
          >
            {settings.publicProfile ? (
              <div className="flex items-center space-x-1 text-yellow-500">
                <Globe className="h-4 w-4" />
                <span>Public Profile</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-green-500">
                <Lock className="h-4 w-4" />
                <span>Private Profile</span>
              </div>
            )}
          </motion.div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Privacy Overview */}
        <div className="rounded-lg border p-4 bg-muted/50">
          <div className="flex items-start space-x-3">
            <Lock className="h-5 w-5 mt-1 text-primary" />
            <div className="space-y-1">
              <p className="font-medium">Privacy Overview</p>
              <p className="text-sm text-muted-foreground">
                Control how your information is shared with other users. Your privacy is important to us,
                and you can adjust these settings at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Controls */}
        <div className="space-y-4">
          {PRIVACY_SETTINGS.map(({ key, title, description, icon: Icon, impact }) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-start space-x-3">
                <Icon className={`h-5 w-5 mt-1 ${getImpactColor(impact)}`} />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">{title}</p>
                    <span className={`text-xs ${getImpactColor(impact)}`}>
                      {impact} impact
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
              <Switch
                checked={settings[key]}
                onCheckedChange={() => handleSettingChange(key)}
              />
            </motion.div>
          ))}
        </div>

        {/* Privacy Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg border p-4"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Privacy Status</p>
                {settings.publicProfile ? (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {settings.publicProfile
                  ? 'Your profile is publicly visible'
                  : 'Your profile has limited visibility'}
              </p>
            </div>
            <div
              className={`h-2 w-2 rounded-full ${
                settings.publicProfile ? 'bg-yellow-500' : 'bg-green-500'
              }`}
            />
          </div>
        </motion.div>

        {/* Data Usage Notice */}
        <div className="rounded-lg border p-4 bg-muted/50">
          <p className="text-sm text-muted-foreground">
            We respect your privacy and will never share your personal information with third parties.
            Your data is used only to provide and improve your experience with Mom's Kidz.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
