"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { 
  Gamepad2, 
  Trophy, 
  Target, 
  Star,
  RefreshCw,
  Sparkles,
  Flame,
  Medal,
  Crown
} from 'lucide-react'
import { useNotifications } from '@/contexts/notifications-context'
import { motion } from 'framer-motion'

interface GamificationPreferences {
  showPoints: boolean
  showAchievements: boolean
  showChallenges: boolean
  autoClaimRewards: boolean
  showLevel: boolean
  showStreak: boolean
  showRank: boolean
  enableAnimations: boolean
}

const DEFAULT_PREFERENCES: GamificationPreferences = {
  showPoints: true,
  showAchievements: true,
  showChallenges: true,
  autoClaimRewards: true,
  showLevel: true,
  showStreak: true,
  showRank: true,
  enableAnimations: true,
}

const PREFERENCE_SETTINGS = [
  {
    key: 'showPoints' as const,
    title: 'Show Points',
    description: 'Display points and progress in the dashboard',
    icon: Medal,
    impact: 'high'
  },
  {
    key: 'showAchievements' as const,
    title: 'Show Achievements',
    description: 'Display achievements and progress',
    icon: Trophy,
    impact: 'high'
  },
  {
    key: 'showChallenges' as const,
    title: 'Show Challenges',
    description: 'Display active and completed challenges',
    icon: Target,
    impact: 'medium'
  },
  {
    key: 'autoClaimRewards' as const,
    title: 'Auto-claim Rewards',
    description: 'Automatically claim rewards when earned',
    icon: Sparkles,
    impact: 'medium'
  },
  {
    key: 'showLevel' as const,
    title: 'Show Level',
    description: 'Display current level and progress',
    icon: Star,
    impact: 'medium'
  },
  {
    key: 'showStreak' as const,
    title: 'Show Streak',
    description: 'Display activity streak information',
    icon: Flame,
    impact: 'low'
  },
  {
    key: 'showRank' as const,
    title: 'Show Rank',
    description: 'Display current rank and progress',
    icon: Crown,
    impact: 'low'
  },
  {
    key: 'enableAnimations' as const,
    title: 'Enable Animations',
    description: 'Show animations for achievements and rewards',
    icon: Sparkles,
    impact: 'low'
  }
]

export function GamificationSettings() {
  const { addNotification } = useNotifications()
  const [preferences, setPreferences] = useState<GamificationPreferences>(() => {
    // Load preferences from localStorage or use defaults
    const saved = localStorage.getItem('gamificationPreferences')
    return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES
  })

  const handlePreferenceChange = (key: keyof GamificationPreferences) => {
    setPreferences(prev => {
      const newPreferences = { ...prev, [key]: !prev[key] }
      // Save to localStorage
      localStorage.setItem('gamificationPreferences', JSON.stringify(newPreferences))
      
      // Show notification
      addNotification({
        type: 'points',
        title: 'Settings Updated',
        description: 'Your preferences have been saved'
      })

      return newPreferences
    })
  }

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES)
    localStorage.setItem('gamificationPreferences', JSON.stringify(DEFAULT_PREFERENCES))
    
    addNotification({
      type: 'points',
      title: 'Settings Reset',
      description: 'Your preferences have been reset to defaults'
    })
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-purple-500'
      case 'medium':
        return 'text-blue-500'
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
            <Gamepad2 className="h-5 w-5" />
            <span>Gamification Preferences</span>
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
        <div className="rounded-lg border p-4 bg-muted/50">
          <div className="flex items-start space-x-3">
            <Sparkles className="h-5 w-5 mt-1 text-primary" />
            <div className="space-y-1">
              <p className="font-medium">Customize Your Experience</p>
              <p className="text-sm text-muted-foreground">
                Control which gamification elements are visible and how they behave.
                These settings affect your personal dashboard view.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {PREFERENCE_SETTINGS.map(({ key, title, description, icon: Icon, impact }) => (
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
                checked={preferences[key]}
                onCheckedChange={() => handlePreferenceChange(key)}
              />
            </motion.div>
          ))}
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-start space-x-3">
            <Trophy className="h-5 w-5 mt-1 text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Active Features</p>
              <p className="text-sm text-muted-foreground">
                {Object.entries(preferences).filter(([_, value]) => value).length} of {
                  Object.keys(preferences).length
                } features enabled
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}