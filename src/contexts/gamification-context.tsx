"use client"

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { ACTIVITY_POINTS as DEFAULT_ACTIVITY_POINTS } from '@/constants/activity-points'
import { Card } from '@/components/ui/card'
import { PointsTransaction, Streak } from '@/types/gamification'

// Types
export interface Achievement {
  id: string
  title: string
  description: string
  points: number
  icon: string
  type: string
  unlocked: boolean
  progress: number
  maxProgress: number
  dateUnlocked?: Date
  unlockedAt?: Date
}

export interface Challenge {
  id: string
  title: string
  description: string
  points: number
  deadline?: Date
  progress: number
  completed: boolean
}

interface GamificationState {
  activeChallenges: any
  points: number
  level: number
  streak: Streak[]
  achievements: Achievement[]
  challenges: Challenge[]
  completedChallenges: Challenge[]
  lastActivity: Date | null
  loading: boolean
}

interface GamificationContextType {
  state: GamificationState
  dispatch: React.Dispatch<GamificationAction>
  trackEvent: (event: GamificationEvent) => void
  checkAchievements: () => void
}

interface GamificationEvent {
  type: 'activity_log' | 'milestone' | 'social' | 'challenge'
  action: string
  metadata?: {
    withPhoto?: boolean
    quality?: 'high' | 'low'
    weather?: string
    time?: Date
  }
}

// Initial state
const initialState: GamificationState = {
  points: 0,
  level: 1,
  streak: [],
  achievements: [],
  challenges: [],
  completedChallenges: [],
  lastActivity: null,
  loading: false,
  activeChallenges: undefined
}

// Action types
type GamificationAction =
  | { type: 'SET_INITIAL_STATE'; payload: Partial<GamificationState> }
  | { type: 'ADD_POINTS'; payload: { points: number; transaction: PointsTransaction } }
  | { type: 'UPDATE_LEVEL'; payload: number }
  | { type: 'UPDATE_STREAK'; payload: Streak }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: Achievement }
  | { type: 'COMPLETE_CHALLENGE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_PROGRESS'; payload: { challengeId: string; progress: number } }
  | { type: 'ADD_ACHIEVEMENT'; payload: Achievement }
  | { type: 'RESET_DAILY' }

// Helper Functions
const calculateTimeBonus = (time: Date): number => {
  const hour = time.getHours()
  if (hour >= 5 && hour < 8) return DEFAULT_ACTIVITY_POINTS.earlyBirdBonus
  if (hour >= 21 && hour < 24) return DEFAULT_ACTIVITY_POINTS.nightOwlBonus
  return 0
}

const calculateWeatherBonus = (weather: string): number => {
  switch (weather) {
    case 'rainy': return DEFAULT_ACTIVITY_POINTS.rainyDayBonus
    case 'sunny': return DEFAULT_ACTIVITY_POINTS.sunnyDayBonus
    case 'snowy': return DEFAULT_ACTIVITY_POINTS.snowDayBonus
    case 'severe': return DEFAULT_ACTIVITY_POINTS.severeWeatherBonus
    default: return 0
  }
}

// Remove duplicate function declaration and merge with existing reducer
export const gamificationReducer = (state: GamificationState, action: GamificationAction): GamificationState => {
  switch (action.type) {
    case 'ADD_POINTS': {
      const newTotalPoints = state.points + action.payload.points
      const level = Math.floor(Math.sqrt(newTotalPoints / 100)) + 1

      return {
        ...state,
        points: newTotalPoints,
        level,
      }
    }

    case 'UPDATE_STREAK': {
      const existingStreakIndex = state.streak.findIndex(
          (s: Streak) => s.activity === action.payload.activity
      )
      const newStreaks = existingStreakIndex >= 0
        ? state.streak.map((s: Streak) =>
            s.activity === action.payload.activity ? action.payload : s
          )
        : [...state.streak, action.payload]

      return {
        ...state,
        streak: newStreaks as Streak[]
      }
    }

    case 'COMPLETE_CHALLENGE': {
      const challenge = state.challenges.find(c => c.id === action.payload)
      if (!challenge) return state

      return {
        ...state,
        challenges: state.challenges.filter(c => c.id !== action.payload),
        completedChallenges: [...state.completedChallenges, { ...challenge, completed: true }]
      }
    }

    case 'ADD_ACHIEVEMENT': {
      if (state.achievements.some(a => a.id === action.payload.id)) return state

      return {
        ...state,
        achievements: [...state.achievements, action.payload]
      }
    }

    case 'UPDATE_PROGRESS': {
      const { challengeId, progress } = action.payload
      const updatedChallenges = state.activeChallenges.map((challenge: { id: any; maxProgress: number }) =>
        challenge.id === challengeId
          ? { ...challenge, progress: Math.min(challenge.maxProgress, progress) }
          : challenge
      )

      return {
        ...state,
        activeChallenges: updatedChallenges
      }
    }

    case 'RESET_DAILY': {
      return {
        ...state,
        activeChallenges: state.activeChallenges.filter((c: { type: string }) => c.type !== 'daily')
      }
    }

    default:
      return state
  }
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined)

// Calculate level based on points
function calculateLevel(points: number): number {
  return Math.floor(Math.sqrt(points / 100)) + 1
}

// Provider
interface GamificationProviderProps {
  children: React.ReactNode
  userId: string
}

export function GamificationProvider({ children, userId }: GamificationProviderProps) {
  const [state, dispatch] = useReducer(gamificationReducer, initialState)
  const { user } = useAuth()

  const trackEvent = (event: GamificationEvent) => {
    let points = 0
    const transactions: PointsTransaction[] = []

    // Calculate base points
    switch (event.type) {
      case 'activity_log': {
        const activityPoints = DEFAULT_ACTIVITY_POINTS[event.action as keyof typeof DEFAULT_ACTIVITY_POINTS] || 0
        points += activityPoints
        transactions.push({
          id: crypto.randomUUID(),
          activityType: event.action,
          points: activityPoints,
          description: `${event.action} activity logged`,
          timestamp: new Date()
        })

        // Photo bonuses
        if (event.metadata?.withPhoto) {
          const photoPoints = DEFAULT_ACTIVITY_POINTS.photoAttachment
          points += photoPoints
          if (event.metadata?.quality === 'high') {
            points += DEFAULT_ACTIVITY_POINTS.highQualityPhoto
          }
          transactions.push({
            id: crypto.randomUUID(),
            activityType: 'photo_bonus',
            points: photoPoints,
            description: 'Photo attachment bonus',
            timestamp: new Date()
          })
        }

        // Weather bonus
        if (event.metadata?.weather) {
          const weatherBonus = calculateWeatherBonus(event.metadata.weather)
          if (weatherBonus > 0) {
            points += weatherBonus
            transactions.push({
              id: crypto.randomUUID(),
              activityType: 'weather_bonus',
              points: weatherBonus,
              description: `${event.metadata.weather} weather bonus`,
              timestamp: new Date()
            })
          }
        }

        // Time bonus
        if (event.metadata?.time) {
          const timeBonus = calculateTimeBonus(event.metadata.time)
          if (timeBonus > 0) {
            points += timeBonus
            transactions.push({
              id: crypto.randomUUID(),
              activityType: 'time_bonus',
              points: timeBonus,
              description: timeBonus === DEFAULT_ACTIVITY_POINTS.earlyBirdBonus 
                ? 'Early bird bonus' 
                : 'Night owl bonus',
              timestamp: new Date()
            })
          }
        }
        break
      }
      case 'milestone':
        points = 50
        transactions.push({
          id: crypto.randomUUID(),
          activityType: 'milestone',
          points,
          description: 'Milestone achieved',
          timestamp: new Date()
        })
        break
      case 'social':
        points = event.action === 'post' ? 15 : 5
        transactions.push({
          id: crypto.randomUUID(),
          activityType: 'social',
          points,
          description: `Social ${event.action}`,
          timestamp: new Date()
        })
        break
      case 'challenge':
        points = 100
        transactions.push({
          id: crypto.randomUUID(),
          activityType: 'challenge',
          points,
          description: 'Challenge completed',
          timestamp: new Date()
        })
        break
    }

    // Update points with all transactions
    dispatch({ 
      type: 'ADD_POINTS', 
      payload: { 
        points,
        transaction: transactions[0] // Main transaction
      }
    })

    // Update streaks if applicable
    if (event.type === 'activity_log') {
      const streak: Streak = {
        activity: event.action,
        count: 1,
        lastUpdated: new Date(),
        id: undefined,
        streakId: undefined
      }
      dispatch({ type: 'UPDATE_STREAK', payload: streak })
    }

    // Show toast notification for points earned
    toast(
      <Card className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <div>
            <h3 className="font-semibold">Points Earned!</h3>
            <p className="text-sm text-muted-foreground">
              +{points} points
              {transactions.length > 1 && (
                <span className="text-xs text-muted-foreground">
                  {' '}(including {transactions.length - 1} bonuses)
                </span>
              )}
            </p>
          </div>
        </div>
      </Card>
    )
  }

  const checkAchievements = () => {
    // Check level achievements
    if (state.level >= 5) {
      const achievement: Achievement = {
        id: 'level_5',
        title: 'Rising Star',
        description: 'Reached Level 5',
        icon: '🌟',
        type: 'special',
        points: 500,
        unlocked: true,
        progress: 5,
        maxProgress: 5,
        dateUnlocked: new Date()
      }
      dispatch({ type: 'ADD_ACHIEVEMENT', payload: achievement })
    }

    // Check streak achievements
    Object.values(state.streak).forEach((streak: Streak) => {
      if (streak.count >= 7) {
        const achievement: Achievement = {
          id: `streak_7_${streak.activity}`,
          title: 'Consistency Champion',
          description: `Maintained a 7-day streak in ${streak.activity}`,
          icon: '🔥',
          type: 'care',
          points: 250,
          unlocked: true,
          progress: 7,
          maxProgress: 7,
          dateUnlocked: new Date()
        }
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievement })
      }
    })
  } 
  // Check achievements whenever state changes
  useEffect(() => {
    checkAchievements()
  }, [state.level, state.streak])

  // Reset daily challenges at midnight
  useEffect(() => {
    const now = new Date()
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const timeUntilMidnight = tomorrow.getTime() - now.getTime()

    const timer = setTimeout(() => {
      dispatch({ type: 'SET_INITIAL_STATE', payload: { challenges: [] } })
    }, timeUntilMidnight)

    return () => clearTimeout(timer)
  }, [])

  return (
    <GamificationContext.Provider value={{ 
      state,
      dispatch, 
      trackEvent, 
      checkAchievements 
    }}>
      {children}
    </GamificationContext.Provider>
  )
}

// Custom Hook
export function useGamification() {
  const context = useContext(GamificationContext)
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider')
  }
  return context
}

export type { GamificationState }
