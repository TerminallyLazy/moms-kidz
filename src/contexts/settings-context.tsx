"use client"

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useNotifications } from './notifications-context'

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

interface PrivacyPreferences {
  showProfile: boolean
  showAchievements: boolean
  showPoints: boolean
  showChallenges: boolean
  allowFriendRequests: boolean
  publicProfile: boolean
  shareProgress: boolean
  shareStats: boolean
}

interface SoundPreferences {
  enabled: boolean
  volume: number
  enableAchievementSounds: boolean
  enableLevelUpSounds: boolean
  enablePointSounds: boolean
  enableNotificationSounds: boolean
}

interface SettingsState {
  gamification: GamificationPreferences
  notifications: NotificationPreferences
  privacy: PrivacyPreferences
  sound: SoundPreferences
}

type SettingsAction =
  | { type: 'SET_GAMIFICATION_PREFERENCE'; key: keyof GamificationPreferences; value: boolean }
  | { type: 'SET_NOTIFICATION_PREFERENCE'; key: keyof NotificationPreferences; value: boolean }
  | { type: 'SET_PRIVACY_PREFERENCE'; key: keyof PrivacyPreferences; value: boolean }
  | { type: 'SET_SOUND_PREFERENCE'; key: keyof SoundPreferences; value: boolean | number }
  | { type: 'RESET_GAMIFICATION' }
  | { type: 'RESET_NOTIFICATIONS' }
  | { type: 'RESET_PRIVACY' }
  | { type: 'RESET_SOUND' }
  | { type: 'RESET_ALL' }

const DEFAULT_SETTINGS: SettingsState = {
  gamification: {
    showPoints: true,
    showAchievements: true,
    showChallenges: true,
    autoClaimRewards: true,
    showLevel: true,
    showStreak: true,
    showRank: true,
    enableAnimations: true,
  },
  notifications: {
    notifyPoints: true,
    notifyAchievements: true,
    notifyChallenges: true,
    notifyLevelUp: true,
    notifyStreak: true,
    notifyRank: true,
    notifyFriends: true,
    enablePushNotifications: false,
    enableSoundAlerts: true,
    showNotificationPreview: true,
  },
  privacy: {
    showProfile: true,
    showAchievements: true,
    showPoints: false,
    showChallenges: true,
    allowFriendRequests: true,
    publicProfile: false,
    shareProgress: true,
    shareStats: false,
  },
  sound: {
    enabled: true,
    volume: 0.5,
    enableAchievementSounds: true,
    enableLevelUpSounds: true,
    enablePointSounds: true,
    enableNotificationSounds: true,
  },
}

const SettingsContext = createContext<{
  state: SettingsState
  dispatch: React.Dispatch<SettingsAction>
} | undefined>(undefined)

function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'SET_GAMIFICATION_PREFERENCE':
      return {
        ...state,
        gamification: {
          ...state.gamification,
          [action.key]: action.value,
        },
      }
    case 'SET_NOTIFICATION_PREFERENCE':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          [action.key]: action.value,
        },
      }
    case 'SET_PRIVACY_PREFERENCE':
      return {
        ...state,
        privacy: {
          ...state.privacy,
          [action.key]: action.value,
        },
      }
    case 'SET_SOUND_PREFERENCE':
      return {
        ...state,
        sound: {
          ...state.sound,
          [action.key]: action.value,
        },
      }
    case 'RESET_GAMIFICATION':
      return {
        ...state,
        gamification: DEFAULT_SETTINGS.gamification,
      }
    case 'RESET_NOTIFICATIONS':
      return {
        ...state,
        notifications: DEFAULT_SETTINGS.notifications,
      }
    case 'RESET_PRIVACY':
      return {
        ...state,
        privacy: DEFAULT_SETTINGS.privacy,
      }
    case 'RESET_SOUND':
      return {
        ...state,
        sound: DEFAULT_SETTINGS.sound,
      }
    case 'RESET_ALL':
      return DEFAULT_SETTINGS
    default:
      return state
  }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { addNotification } = useNotifications()
  const [state, dispatch] = useReducer(settingsReducer, DEFAULT_SETTINGS)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('settings')
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings)
      Object.entries(parsedSettings).forEach(([category, preferences]) => {
        Object.entries(preferences as Record<string, boolean | number>).forEach(([key, value]) => {
          dispatch({
            type: `SET_${category.toUpperCase()}_PREFERENCE` as any,
            key,
            value,
          })
        })
      })
    }
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(state))
  }, [state])

  // Show notification when settings are updated
  useEffect(() => {
    addNotification({
      type: 'points',
      title: 'Settings Updated',
      description: 'Your preferences have been saved'
    })
  }, [state, addNotification])

  return (
    <SettingsContext.Provider value={{ state, dispatch }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}