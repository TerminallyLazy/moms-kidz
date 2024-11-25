import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '../types/supabase'

// Create a single instance of the Supabase client with session persistence
export const supabase = createClientComponentClient<Database>({
  cookieOptions: {
    name: "sb-session",
    secure: true,
    sameSite: "lax",
    path: "/",
  }
})

// Helper function to handle errors
export const handleSupabaseError = (error: any) => {
  const errorMessage = error?.message || 'An unexpected error occurred'
  const errorCode = error?.code || 'UNKNOWN_ERROR'
  
  return {
    error: {
      message: errorMessage,
      code: errorCode
    }
  }
}

// Type-safe database helpers
export const db = {
  // Points related queries
  points: {
    getTotal: async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', userId)
        
        if (error) throw error
        return data.reduce((total, activity) => 
          total + ((activity.details as any)?.points || 0), 0)
      } catch (error) {
        return handleSupabaseError(error)
      }
    }
  },

  // User related queries
  users: {
    get: async (id: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) throw error
        return { data, error: null }
      } catch (error) {
        return handleSupabaseError(error)
      }
    },
  },

  // Activity related queries
  activities: {
    create: async (activity: any) => {
      try {
        const { data, error } = await supabase
          .from('activities')
          .insert(activity)
          .select()
          .single()
        
        if (error) throw error
        return { data, error: null }
      } catch (error) {
        return handleSupabaseError(error)
      }
    },

    list: async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false })
        
        if (error) throw error
        return { data: data || [], error: null }
      } catch (error) {
        return handleSupabaseError(error)
      }
    }
  },

  // Achievement related queries
  achievements: {
    list: async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .eq('user_id', userId)
        
        if (error) throw error
        return { data: data || [], error: null }
      } catch (error) {
        return handleSupabaseError(error)
      }
    }
  }
}

export default supabase
