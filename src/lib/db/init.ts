import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseKey)

const initialChallenges = [
  {
    title: 'Daily Logger',
    description: 'Log at least 3 activities today',
    type: 'daily',
    points_reward: 50,
    requirements: {
      type: 'activity_count',
      target: 3,
      activity_types: ['all']
    },
    metadata: {
      icon: 'clipboard',
      category: 'engagement'
    }
  },
  {
    title: 'Photo Collector',
    description: 'Add 5 photos to your activities this week',
    type: 'weekly',
    points_reward: 100,
    requirements: {
      type: 'photo_count',
      target: 5,
      timeframe: 'week'
    },
    metadata: {
      icon: 'camera',
      category: 'content'
    }
  },
  {
    title: 'Milestone Master',
    description: 'Record 3 developmental milestones',
    type: 'special',
    points_reward: 200,
    requirements: {
      type: 'milestone_count',
      target: 3,
      milestone_types: ['development']
    },
    metadata: {
      icon: 'star',
      category: 'development'
    }
  }
]

const initialAchievements = [
  {
    user_id: 'system',
    type: 'engagement',
    name: 'First Steps',
    description: 'Log your first activity',
    points: 50,
    metadata: {
      icon: '👶',
      requirement: {
        type: 'activity_count',
        count: 1
      }
    }
  },
  {
    user_id: 'system',
    type: 'streak',
    name: 'Consistency Champion',
    description: 'Maintain a 7-day activity streak',
    points: 100,
    metadata: {
      icon: '🔥',
      requirement: {
        type: 'streak_days',
        count: 7
      }
    }
  },
  {
    user_id: 'system',
    type: 'contribution',
    name: 'Data Pioneer',
    description: 'Contribute to your first research study',
    points: 150,
    metadata: {
      icon: '🔬',
      requirement: {
        type: 'research_contribution',
        count: 1
      }
    }
  }
]

export async function initializeDatabase() {
  try {
    console.log('Starting database initialization...')

    // Insert initial challenges
    const { error: challengesError } = await supabase
      .from('challenges')
      .upsert(initialChallenges, { onConflict: 'title' })

    if (challengesError) {
      throw new Error(`Error inserting challenges: ${challengesError.message}`)
    }

    console.log('Successfully initialized challenges')

    // Create achievement types
    const { error: achievementsError } = await supabase
      .from('achievements')
      .upsert(initialAchievements, { onConflict: 'name' })

    if (achievementsError) {
      throw new Error(`Error inserting achievements: ${achievementsError.message}`)
    }

    console.log('Successfully initialized achievements')

    console.log('Database initialization completed successfully')
    return { success: true }
  } catch (error) {
    console.error('Error initializing database:', error)
    return { success: false, error }
  }
}

// Function to reset database (useful for development)
export async function resetDatabase() {
  try {
    console.log('Starting database reset...')

    // Delete all data from tables in correct order
    const tables = [
      'user_challenges',
      'challenges',
      'achievements',
      'points',
      'activities',
      'streaks',
      'profiles'
    ] as const

    for (const table of tables) {
      const { error } = await supabase
        .from(table as "profiles" | "activities" | "achievements" | "points" | "challenges" | "user_challenges" | "streaks")
        .delete()
      if (error) throw new Error(`Error deleting ${table}: ${error.message}`)
      console.log(`Cleared ${table} table`)
    }

    // Reinitialize with fresh data
    await initializeDatabase()

    console.log('Database reset completed successfully')
    return { success: true }
  } catch (error) {
    console.error('Error resetting database:', error)
    return { success: false, error }
  }
}

// Export the supabase client for use in other files
export { supabase }