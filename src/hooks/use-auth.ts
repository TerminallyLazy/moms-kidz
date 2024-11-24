import { useEffect, useState, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import { getUserStats } from '@/lib/points'

type Profile = Database['public']['Tables']['profiles']['Row']
type UserStats = Awaited<ReturnType<typeof getUserStats>>['stats']

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  const fetchUserData = useCallback(async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      if (!user) {
        setUser(null)
        setProfile(null)
        setStats(null)
        return
      }

      setUser(user)

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      if (profile) {
        setProfile(profile)

        // Get user stats
        const { success, stats } = await getUserStats(user.id)
        if (success && stats) {
          setStats(stats)
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      setProfile(null)
      setStats(null)
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error('No user')

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      return { success: true, data }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { success: false, error }
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchUserData()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        setStats(null)
      }
    })

    // Initial fetch
    fetchUserData()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchUserData])

  // Refresh stats periodically
  useEffect(() => {
    if (!user) return

    const interval = setInterval(async () => {
      const { success, stats } = await getUserStats(user.id)
      if (success && stats) {
        setStats(stats)
      }
    }, 60000) // Refresh every minute

    return () => clearInterval(interval)
  }, [user])

  return {
    user,
    profile,
    stats,
    loading,
    signOut,
    updateProfile,
    refreshUserData: fetchUserData,
  }
}