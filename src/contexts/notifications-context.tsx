"use client"

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Target, Flame, Award } from 'lucide-react'

interface GamificationNotification {
  id: string
  type: 'achievement' | 'challenge' | 'level' | 'streak' | 'points'
  title: string
  description: string
  icon?: React.ReactNode
  points?: number
  timestamp: Date
}

interface NotificationsState {
  notifications: GamificationNotification[]
  unread: number
}

interface NotificationsContextType extends NotificationsState {
  addNotification: (notification: Omit<GamificationNotification, 'id' | 'timestamp'>) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

type NotificationsAction =
  | { type: 'ADD_NOTIFICATION'; payload: GamificationNotification }
  | { type: 'MARK_ALL_READ' }
  | { type: 'CLEAR_NOTIFICATIONS' }

const notificationsReducer = (state: NotificationsState, action: NotificationsAction): NotificationsState => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unread: state.unread + 1
      }
    case 'MARK_ALL_READ':
      return {
        ...state,
        unread: 0
      }
    case 'CLEAR_NOTIFICATIONS':
      return {
        notifications: [],
        unread: 0
      }
    default:
      return state
  }
}

const NOTIFICATION_ICONS = {
  achievement: <Trophy className="h-5 w-5 text-yellow-500" />,
  challenge: <Target className="h-5 w-5 text-blue-500" />,
  level: <Star className="h-5 w-5 text-purple-500" />,
  streak: <Flame className="h-5 w-5 text-orange-500" />,
  points: <Award className="h-5 w-5 text-green-500" />
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(notificationsReducer, {
    notifications: [],
    unread: 0
  })

  const addNotification = (notification: Omit<GamificationNotification, 'id' | 'timestamp'>) => {
    const newNotification: GamificationNotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      icon: NOTIFICATION_ICONS[notification.type]
    }

    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification })

    // Show toast notification
    toast(
      <div className="flex items-start space-x-3">
        <div className="mt-1">{newNotification.icon}</div>
        <div>
          <p className="font-medium">{newNotification.title}</p>
          <p className="text-sm text-muted-foreground">{newNotification.description}</p>
          {notification.points && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium text-primary"
            >
              +{notification.points} points
            </motion.p>
          )}
        </div>
      </div>,
      {
        duration: 5000,
        className: "bg-background border",
      }
    )
  }

  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_READ' })
  }

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' })
  }

  // Example notification triggers
  useEffect(() => {
    // Listen for gamification events and trigger notifications
    const handleAchievement = (achievement: any) => {
      addNotification({
        type: 'achievement',
        title: 'Achievement Unlocked!',
        description: achievement.title,
        points: achievement.points
      })
    }

    const handleLevelUp = (level: number) => {
      addNotification({
        type: 'level',
        title: 'Level Up!',
        description: `You've reached level ${level}`,
        points: level * 100
      })
    }

    const handleStreak = (days: number) => {
      addNotification({
        type: 'streak',
        title: 'Streak Milestone!',
        description: `${days} day streak achieved`,
        points: days * 10
      })
    }

    // Clean up event listeners
    return () => {
      // Remove event listeners
    }
  }, [])

  return (
    <NotificationsContext.Provider
      value={{
        ...state,
        addNotification,
        markAllAsRead,
        clearNotifications
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
}