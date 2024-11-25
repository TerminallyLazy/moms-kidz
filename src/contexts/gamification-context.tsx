"use client"

import { createContext, useContext, useReducer, useEffect } from 'react'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/db'
import { PointsTransaction } from '@/types/gamification'

interface GamificationState {
  points: number
  level: number
  streaks: {
    [key: string]: number
  }
  achievements: Achievement[]
  challenges: Challenge[]
  rewards: Reward[]
}

interface Achievement {
  id: string
  title: string
  description: string
  points: number
  unlockedAt?: Date
  type: string
  progress: number
  metadata?: any
}

interface Challenge {
  id: string
  title: string
  description: string
  points: number
  type: string
  requirements: any
  progress: number
  expiresAt?: Date
  metadata?: any
}

interface Reward {
  id: string
  title: string
  description: string
  cost: number
  type: string
  claimed: boolean
  metadata?: any
}

type GamificationAction =
  | { type: 'ADD_POINTS'; payload: number }
  | { type: 'UPDATE_LEVEL'; payload: number }
  | { type: 'UPDATE_STREAK'; payload: { type: string; count: number } }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: Achievement }
  | { type: 'UPDATE_CHALLENGE'; payload: Challenge }
  | { type: 'CLAIM_REWARD'; payload: string }
  | { type: 'SET_STATE'; payload: Partial<GamificationState> }

interface GamificationContextType extends GamificationState {
  addPoints: (points: number, reason: string) => Promise<void>
  trackActivity: (type: string, metadata?: any) => Promise<void>
  checkAchievements: () => Promise<void>
  claimReward: (rewardId: string) => Promise<void>
  getProgress: (type: string) => number
}

const initialState: GamificationState = {
  points: 0,
  level: 1,
  streaks: {},
  achievements: [],
  challenges: [],
  rewards: []
}

// Action Types
type GamificationAction =
  | { type: 'ADD_POINTS'; payload: { points: number; transaction: PointsTransaction } }
  | { type: 'UPDATE_STREAK'; payload: Streak }
  | { type: 'COMPLETE_CHALLENGE'; payload: string }
  | { type: 'ADD_ACHIEVEMENT'; payload: Achievement }
  | { type: 'UPDATE_PROGRESS'; payload: { challengeId: string; progress: number } }
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

// Reducer
function gamificationReducer(state: UserStats, action: GamificationAction): UserStats {
  switch (action.type) {
    case 'ADD_POINTS': {
      const { points, transaction } = action.payload
      const newTotalPoints = state.totalPoints + points
      const newXP = state.xp + points
      const level = Math.floor(Math.sqrt(newTotalPoints / 100)) + 1
      const xpToNextLevel = Math.pow((level + 1) * 10, 2) - Math.pow(level * 10, 2)

      return {
        ...state,
        totalPoints: newTotalPoints,
        level,
        xp: newXP,
        xpToNextLevel
      }
    }

    case 'UPDATE_STREAK': {
      const existingStreakIndex = state.streaks.findIndex(
        s => s.activity === action.payload.activity
      )

      const newStreaks = existingStreakIndex >= 0
        ? state.streaks.map((s, i) => i === existingStreakIndex ? action.payload : s)
        : [...state.streaks, action.payload]

      return {
        ...state,
        streaks: newStreaks
      }
    }

    case 'COMPLETE_CHALLENGE': {
      const challenge = state.activeChallenges.find(c => c.id === action.payload)
      if (!challenge) return state

      return {
        ...state,
        activeChallenges: state.activeChallenges.filter(c => c.id !== action.payload),
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
      const updatedChallenges = state.activeChallenges.map(challenge =>
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
        activeChallenges: state.activeChallenges.filter(c => c.type !== 'daily')
      }
    }

    default:
      return state
  }
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined)

function gamificationReducer(state: GamificationState, action: GamificationAction): GamificationState {
  switch (action.type) {
    case 'ADD_POINTS':
      return {
        ...state,
        points: state.points + action.payload
      }
    case 'UPDATE_LEVEL':
      return {
        ...state,
        level: action.payload
      }
    case 'UPDATE_STREAK':
      return {
        ...state,
        streaks: {
          ...state.streaks,
          [action.payload.type]: action.payload.count
        }
      }
    case 'UNLOCK_ACHIEVEMENT':
      return {
        ...state,
        achievements: [...state.achievements, action.payload]
      }
    case 'UPDATE_CHALLENGE':
      return {
        ...state,
        challenges: state.challenges.map(challenge =>
          challenge.id === action.payload.id ? action.payload : challenge
        )
      }
    case 'CLAIM_REWARD':
      return {
        ...state,
        rewards: state.rewards.map(reward =>
          reward.id === action.payload ? { ...reward, claimed: true } : reward
        )
      }
    case 'SET_STATE':
      return {
        ...state,
        ...action.payload
      }
    default:
      return state
  }
}

export function GamificationProvider({
  children,
  userId
}: {
  children: React.ReactNode
  userId: string
}) {
  const [state, dispatch] = useReducer(gamificationReducer, initialState)

  const trackEvent = (event: GamificationEvent) => {
    let points = 0
    const transactions: PointsTransaction[] = []

    // Calculate base points
    switch (event.type) {
      case 'activity_log': {
        const activityPoints = DEFAULT_ACTIVITY_POINTS[event.action as keyof ActivityPoints] || 0
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
        lastUpdated: new Date()
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
        name: 'Rising Star',
        description: 'Reached Level 5',
        icon: '🌟',
        category: 'special',
        points: 500,
        unlocked: true,
        progress: 5,
        maxProgress: 5,
        dateUnlocked: new Date()
      }
      dispatch({ type: 'ADD_ACHIEVEMENT', payload: achievement })
    }

    // Check streak achievements
    state.streaks.forEach(streak => {
      if (streak.count >= 7) {
        const achievement: Achievement = {
          id: `streak_7_${streak.activity}`,
          name: 'Consistency Champion',
          description: `Maintained a 7-day streak in ${streak.activity}`,
          icon: '🔥',
          category: 'care',
          points: 250,
          unlocked: true,
          progress: 7,
          maxProgress: 7,
          dateUnlocked: new Date()
        }
        dispatch({ type: 'ADD_ACHIEVEMENT', payload: achievement })
      }
    })
  }

  // Check achievements whenever state changes
  useEffect(() => {
    checkAchievements()
  }, [state.level, state.streaks])

  // Reset daily challenges at midnight
  useEffect(() => {
    const now = new Date()
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const timeUntilMidnight = tomorrow.getTime() - now.getTime()

    const timer = setTimeout(() => {
      dispatch({ type: 'RESET_DAILY' })
    }, timeUntilMidnight)

    return () => clearTimeout(timer)
  }, [])

  return (
    <GamificationContext.Provider value={{ state, dispatch, trackEvent, checkAchievements }}>
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

export type { Challenge }
