"use client"

import { useState, useEffect } from 'react'
import { useGamification } from '@/contexts/gamification-context'
import { db } from '@/lib/db'
import type { Challenge } from '@/contexts/gamification-context'

interface ChallengeCondition {
  type: 'points' | 'streak' | 'activities' | 'achievements'
  target: number
  timeframe?: number // in days
}

interface ChallengeDefinition {
  id: string
  title: string
  description: string
  points: number
  condition: ChallengeCondition
}

const CHALLENGE_DEFINITIONS: Record<string, ChallengeDefinition> = {
  DAILY_LOGGER: {
    id: 'DAILY_LOGGER',
    title: 'Daily Logger',
    description: 'Log activities for 5 consecutive days',
    points: 100,
    condition: {
      type: 'streak',
      target: 5,
      timeframe: 5
    }
  },
  POINT_HUNTER: {
    id: 'POINT_HUNTER',
    title: 'Point Hunter',
    description: 'Earn 500 points this week',
    points: 200,
    condition: {
      type: 'points',
      target: 500,
      timeframe: 7
    }
  },
  ACHIEVEMENT_COLLECTOR: {
    id: 'ACHIEVEMENT_COLLECTOR',
    title: 'Achievement Collector',
    description: 'Unlock 3 achievements',
    points: 300,
    condition: {
      type: 'achievements',
      target: 3
    }
  },
  SUPER_ACTIVE: {
    id: 'SUPER_ACTIVE',
    title: 'Super Active',
    description: 'Log 20 activities this week',
    points: 250,
    condition: {
      type: 'activities',
      target: 20,
      timeframe: 7
    }
  }
}

export function useChallenges() {
  const { points, streak, addPoints, completeChallenge } = useGamification()
  const [loading, setLoading] = useState(true)
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([])
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([])

  useEffect(() => {
    async function loadChallenges() {
      try {
        setLoading(true)

        // Get user's challenges
        const challenges = await db.challenge.findMany({
          where: {
            OR: [
              { completed: false },
              { completed: true, completedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
            ]
          },
          orderBy: { createdAt: 'desc' }
        })

        setActiveChallenges(challenges.filter(c => !c.completed))
        setCompletedChallenges(challenges.filter(c => c.completed))

        // Check for challenge completion
        await checkChallengeProgress(challenges.filter(c => !c.completed))
      } catch (error) {
        console.error('Failed to load challenges:', error)
      } finally {
        setLoading(false)
      }
    }

    loadChallenges()
  }, [points, streak])

  const checkChallengeProgress = async (challenges: Challenge[]) => {
    for (const challenge of challenges) {
      const definition = CHALLENGE_DEFINITIONS[challenge.id]
      if (!definition) continue

      const progress = await calculateProgress(challenge.id)
      
      if (progress >= 100 && !challenge.completed) {
        await handleChallengeCompletion(challenge.id)
      } else {
        // Update progress
        await db.challenge.update({
          where: { id: challenge.id },
          data: { progress }
        })
      }
    }
  }

  const calculateProgress = async (challengeId: string): Promise<number> => {
    const definition = CHALLENGE_DEFINITIONS[challengeId]
    if (!definition) return 0

    const { condition } = definition

    switch (condition.type) {
      case 'points':
        return (points / condition.target) * 100
      case 'streak':
        return (streak / condition.target) * 100
      case 'activities':
        const activityCount = await getActivityCount(condition.timeframe)
        return (activityCount / condition.target) * 100
      case 'achievements':
        const achievementCount = await getAchievementCount()
        return (achievementCount / condition.target) * 100
      default:
        return 0
    }
  }

  const handleChallengeCompletion = async (challengeId: string) => {
    const definition = CHALLENGE_DEFINITIONS[challengeId]
    if (!definition) return

    try {
      await completeChallenge(challengeId)
      await addPoints(definition.points, `Completed challenge: ${definition.title}`)
      
      // Update local state
      setActiveChallenges(prev => prev.filter(c => c.id !== challengeId))
      setCompletedChallenges(prev => [...prev, { ...definition, completed: true, progress: 100 }])
    } catch (error) {
      console.error('Failed to complete challenge:', error)
    }
  }

  const getActivityCount = async (timeframe?: number): Promise<number> => {
    if (!timeframe) return 0

    const activities = await db.activity.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000)
        }
      }
    })

    return activities
  }

  const getAchievementCount = async (): Promise<number> => {
    const achievements = await db.achievement.count({
      where: {
        unlockedAt: { not: null }
      }
    })

    return achievements
  }

  return {
    loading,
    activeChallenges,
    completedChallenges,
    calculateProgress,
    CHALLENGE_DEFINITIONS
  }
}