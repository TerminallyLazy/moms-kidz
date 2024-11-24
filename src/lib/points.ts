import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

const supabase = createClientComponentClient<Database>()

export type PointsTransaction = {
  amount: number
  type: string
  description?: string
  metadata?: any
}

export async function awardPoints(userId: string, transaction: PointsTransaction) {
  try {
    // Insert points transaction
    const { error: pointsError } = await supabase
      .from('points')
      .insert({
        user_id: userId,
        amount: transaction.amount,
        type: transaction.type,
        description: transaction.description,
        metadata: transaction.metadata
      })

    if (pointsError) throw pointsError

    // Update activity if this is activity-related
    if (transaction.metadata?.activityId) {
      const { error: activityError } = await supabase
        .from('activities')
        .update({ points_earned: transaction.amount })
        .eq('id', transaction.metadata.activityId)

      if (activityError) throw activityError
    }

    return { success: true, points: transaction.amount }
  } catch (error) {
    console.error('Error awarding points:', error)
    return { success: false, error }
  }
}

export async function checkAchievements(userId: string) {
  try {
    // Get user's current stats
    const { data: points, error: pointsError } = await supabase
      .from('points')
      .select('amount')
      .eq('user_id', userId)

    if (pointsError) throw pointsError

    const totalPoints = points.reduce((sum, p) => sum + p.amount, 0)

    // Get user's streaks
    const { data: streaks, error: streaksError } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)

    if (streaksError) throw streaksError

    // Get already unlocked achievements
    const { data: unlockedAchievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('name')
      .eq('user_id', userId)

    if (achievementsError) throw achievementsError
    const unlockedNames = unlockedAchievements.map(a => a.name)

    // Check for new achievements
    const newAchievements = []

    // Points-based achievements
    if (totalPoints >= 1000 && !unlockedNames.includes('Points Master')) {
      newAchievements.push({
        user_id: userId,
        type: 'points',
        name: 'Points Master',
        description: 'Earn 1000 total points',
        points: 200,
        metadata: { icon: '🏆', requirement: { type: 'points', amount: 1000 } }
      })
    }

    // Streak-based achievements
    streaks.forEach(streak => {
      if (streak.current_count >= 7 && !unlockedNames.includes(`${streak.activity_type} Streak Master`)) {
        newAchievements.push({
          user_id: userId,
          type: 'streak',
          name: `${streak.activity_type} Streak Master`,
          description: `Maintain a 7-day streak in ${streak.activity_type}`,
          points: 150,
          metadata: { icon: '🔥', requirement: { type: 'streak', days: 7 } }
        })
      }
    })

    // Insert new achievements
    if (newAchievements.length > 0) {
      const { error: insertError } = await supabase
        .from('achievements')
        .insert(newAchievements)

      if (insertError) throw insertError

      // Award points for new achievements
      for (const achievement of newAchievements) {
        await awardPoints(userId, {
          amount: achievement.points,
          type: 'achievement',
          description: `Unlocked: ${achievement.name}`,
          metadata: { achievementId: achievement.name }
        })
      }
    }

    return { success: true, newAchievements }
  } catch (error) {
    console.error('Error checking achievements:', error)
    return { success: false, error }
  }
}

export async function getUserStats(userId: string) {
  try {
    const [
      { data: points },
      { data: achievements },
      { data: streaks },
      { data: activities }
    ] = await Promise.all([
      supabase.from('points').select('amount').eq('user_id', userId),
      supabase.from('achievements').select('*').eq('user_id', userId),
      supabase.from('streaks').select('*').eq('user_id', userId),
      supabase.from('activities').select('*').eq('user_id', userId)
    ])

    const totalPoints = points?.reduce((sum, p) => sum + p.amount, 0) || 0
    const level = Math.floor(Math.sqrt(totalPoints / 100)) + 1
    const xpToNextLevel = Math.pow((level + 1) * 10, 2) - totalPoints

    return {
      success: true,
      stats: {
        totalPoints,
        level,
        xpToNextLevel,
        achievements: achievements || [],
        streaks: streaks || [],
        activityCount: activities?.length || 0
      }
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return { success: false, error }
  }
}