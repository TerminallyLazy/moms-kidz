"use client"

import { useState, useEffect } from 'react'
import { useGamification } from '@/contexts/gamification-context'
import { db } from '@/lib/db'

interface PointsConfig {
  basePoints: number
  streakMultiplier: number
  levelMultiplier: number
  maxMultiplier: number
}

const DEFAULT_CONFIG: PointsConfig = {
  basePoints: 10,
  streakMultiplier: 0.1, // 10% bonus per streak day
  levelMultiplier: 0.05, // 5% bonus per level
  maxMultiplier: 3.0, // Maximum 3x multiplier
}

export function usePoints(config: PointsConfig = DEFAULT_CONFIG) {
  const { points, level, streak, addPoints } = useGamification()
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<Array<{
    points: number
    reason: string
    timestamp: Date
  }>>([])

  useEffect(() => {
    loadPointsHistory()
  }, [])

  const loadPointsHistory = async () => {
    try {
      setLoading(true)
      const history = await db.pointsHistory.findMany({
        orderBy: { timestamp: 'desc' },
        take: 50,
      })
      setHistory(history)
    } catch (error) {
      console.error('Failed to load points history:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateMultiplier = () => {
    const streakBonus = streak * config.streakMultiplier
    const levelBonus = (level - 1) * config.levelMultiplier
    const totalMultiplier = 1 + streakBonus + levelBonus
    return Math.min(totalMultiplier, config.maxMultiplier)
  }

  const calculatePoints = (basePoints: number) => {
    const multiplier = calculateMultiplier()
    return Math.round(basePoints * multiplier)
  }

  const awardPoints = async (basePoints: number, reason: string) => {
    const finalPoints = calculatePoints(basePoints)
    const multiplier = calculateMultiplier()

    try {
      await addPoints(finalPoints, reason)
      
      // Add to history
      const newHistoryEntry = {
        points: finalPoints,
        reason,
        timestamp: new Date(),
      }
      setHistory(prev => [newHistoryEntry, ...prev])

      return {
        awarded: finalPoints,
        multiplier,
        breakdown: {
          base: basePoints,
          streakBonus: Math.round(basePoints * (streak * config.streakMultiplier)),
          levelBonus: Math.round(basePoints * ((level - 1) * config.levelMultiplier)),
        },
      }
    } catch (error) {
      console.error('Failed to award points:', error)
      throw error
    }
  }

  const getPointsToNextLevel = () => {
    const nextLevel = level + 1
    const pointsRequired = Math.pow(nextLevel * 100, 2)
    return pointsRequired - points
  }

  const getProgressToNextLevel = () => {
    const currentLevelPoints = Math.pow(level * 100, 2)
    const nextLevelPoints = Math.pow((level + 1) * 100, 2)
    const levelProgress = points - currentLevelPoints
    const levelRange = nextLevelPoints - currentLevelPoints
    return (levelProgress / levelRange) * 100
  }

  const getRecentActivity = () => {
    return history.slice(0, 5).map(entry => ({
      ...entry,
      formattedPoints: entry.points >= 0 ? `+${entry.points}` : entry.points.toString(),
    }))
  }

  const getPointsStats = () => {
    const today = new Date()
    const todayPoints = history
      .filter(entry => entry.timestamp.toDateString() === today.toDateString())
      .reduce((sum, entry) => sum + entry.points, 0)

    const thisWeek = history
      .filter(entry => {
        const daysDiff = (today.getTime() - entry.timestamp.getTime()) / (1000 * 60 * 60 * 24)
        return daysDiff <= 7
      })
      .reduce((sum, entry) => sum + entry.points, 0)

    return {
      total: points,
      today: todayPoints,
      thisWeek,
      multiplier: calculateMultiplier(),
    }
  }

  return {
    loading,
    calculatePoints,
    awardPoints,
    getPointsToNextLevel,
    getProgressToNextLevel,
    getRecentActivity,
    getPointsStats,
    history,
  }
}