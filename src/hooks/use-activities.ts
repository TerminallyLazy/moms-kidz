"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useDb } from '@/lib/db/client'
import type { Database } from '@/types/supabase'

type Activity = Database['public']['Tables']['activities']['Row']
type ActivityInsert = Database['public']['Tables']['activities']['Insert']

export function useActivities() {
  const { user } = useAuth()
  const db = useDb()
  const [isLoading, setIsLoading] = useState(false)
  const [activities, setActivities] = useState<Activity[]>([])

  const logActivity = async (activity: Omit<ActivityInsert, 'user_id'>) => {
    if (!user) {
      throw new Error('No user found')
    }

    try {
      setIsLoading(true)
      const { data, error } = await db.logActivity(user.id, activity)

      if (error) throw error

      // Update local activities state
      setActivities(prev => [data, ...prev])

      return { success: true, data }
    } catch (error) {
      console.error('Error logging activity:', error)
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
  }

  const fetchActivities = async (options?: { limit?: number; offset?: number }) => {
    if (!user) {
      throw new Error('No user found')
    }

    try {
      setIsLoading(true)
      const { data, error } = await db.getActivities(user.id, options)

      if (error) throw error

      setActivities(data)
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching activities:', error)
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
  }

  const getActivityStats = () => {
    const stats = {
      total: activities.length,
      byType: {} as Record<string, number>,
      byMonth: {} as Record<string, number>,
      streaks: {} as Record<string, { current: number; longest: number }>,
    }

    activities.forEach(activity => {
      // Count by type
      stats.byType[activity.type] = (stats.byType[activity.type] || 0) + 1

      // Count by month
      const month = new Date(activity.date).toLocaleString('default', { month: 'long' })
      stats.byMonth[month] = (stats.byMonth[month] || 0) + 1

      // Calculate streaks
      const type = activity.type
      if (!stats.streaks[type]) {
        stats.streaks[type] = { current: 0, longest: 0 }
      }

      // Simple streak calculation (can be made more sophisticated)
      const today = new Date().setHours(0, 0, 0, 0)
      const activityDate = new Date(activity.date).setHours(0, 0, 0, 0)
      const isToday = today === activityDate

      if (isToday) {
        stats.streaks[type].current += 1
        stats.streaks[type].longest = Math.max(
          stats.streaks[type].longest,
          stats.streaks[type].current
        )
      }
    })

    return stats
  }

  const getRecentActivities = (limit = 5) => {
    return activities.slice(0, limit)
  }

  const searchActivities = (query: string) => {
    const searchTerm = query.toLowerCase()
    return activities.filter(activity => 
      activity.title?.toLowerCase().includes(searchTerm) ||
      activity.description?.toLowerCase().includes(searchTerm) ||
      activity.type.toLowerCase().includes(searchTerm)
    )
  }

  const filterActivitiesByType = (type: string) => {
    return activities.filter(activity => activity.type === type)
  }

  const filterActivitiesByDateRange = (startDate: Date, endDate: Date) => {
    return activities.filter(activity => {
      const activityDate = new Date(activity.date)
      return activityDate >= startDate && activityDate <= endDate
    })
  }

  return {
    activities,
    isLoading,
    logActivity,
    fetchActivities,
    getActivityStats,
    getRecentActivities,
    searchActivities,
    filterActivitiesByType,
    filterActivitiesByDateRange
  }
}
