"use client"

import { useState, useEffect } from 'react'
import { useGamification } from '@/contexts/gamification-context'
import { db } from '@/lib/db'
import type { Achievement } from '@/contexts/gamification-context'

export function useAchievements() {
  const { points, level, streak, unlockAchievement } = useGamification()
  const [loading, setLoading] = useState(true)
  const [availableAchievements, setAvailableAchievements] = useState<Achievement[]>([])

  // Achievement conditions
  const conditions = {
    FIRST_ACTIVITY: { points: 0, level: 1, streak: 0 },
    STREAK_MASTER: { points: 0, level: 1, streak: 7 },
    POINT_COLLECTOR: { points: 1000, level: 1, streak: 0 },
    LEVEL_UP: { points: 0, level: 5, streak: 0 },
    SUPER_USER: { points: 5000, level: 10, streak: 30 },
  }

  useEffect(() => {
    async function checkAchievements() {
      try {
        setLoading(true)

        // Get all available achievements
        const achievements = await db.achievement.findMany({
          where: {
            unlockedAt: null, // Only get locked achievements
          },
        })

        setAvailableAchievements(achievements)

        // Check each achievement condition
        for (const achievement of achievements) {
          const condition = conditions[achievement.id as keyof typeof conditions]
          if (condition) {
            const meetsCondition = 
              points >= condition.points &&
              level >= condition.level &&
              streak >= condition.streak

            if (meetsCondition) {
              await unlockAchievement(achievement.id)
            }
          }
        }
      } catch (error) {
        console.error('Failed to check achievements:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAchievements()
  }, [points, level, streak, unlockAchievement])

  const getProgress = (achievementId: string): number => {
    const condition = conditions[achievementId as keyof typeof conditions]
    if (!condition) return 0

    const pointsProgress = condition.points > 0 ? Math.min(points / condition.points, 1) : 1
    const levelProgress = condition.level > 1 ? Math.min(level / condition.level, 1) : 1
    const streakProgress = condition.streak > 0 ? Math.min(streak / condition.streak, 1) : 1

    return Math.min(pointsProgress, levelProgress, streakProgress) * 100
  }

  const getNextAchievement = (): Achievement | null => {
    if (!availableAchievements.length) return null

    return availableAchievements.reduce((closest, current) => {
      const closestProgress = getProgress(closest.id)
      const currentProgress = getProgress(current.id)
      return currentProgress > closestProgress ? current : closest
    })
  }

  return {
    loading,
    availableAchievements,
    getProgress,
    getNextAchievement,
  }
}
