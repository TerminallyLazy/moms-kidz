import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'
import { toast } from 'sonner'

type Achievement = Database['public']['Tables']['achievements']['Row']
type AchievementInsert = Database['public']['Tables']['achievements']['Insert']
type AchievementUpdate = Database['public']['Tables']['achievements']['Update']

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAchievements = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error

      setAchievements(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'))
      toast.error('Failed to fetch achievements')
    } finally {
      setLoading(false)
    }
  }, [])

  const addAchievement = async (newAchievement: AchievementInsert) => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .insert(newAchievement)
        .select()
        .single()

      if (error) throw error

      setAchievements(prev => [data, ...prev])
      toast.success('Achievement added successfully')
      return data
    } catch (err) {
      toast.error('Failed to add achievement')
      throw err
    }
  }

  const updateAchievement = async (id: string, updates: AchievementUpdate) => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setAchievements(prev =>
        prev.map(achievement => (achievement.id === id ? data : achievement))
      )
      toast.success('Achievement updated successfully')
      return data
    } catch (err) {
      toast.error('Failed to update achievement')
      throw err
    }
  }

  const deleteAchievement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id)

      if (error) throw error

      setAchievements(prev => prev.filter(achievement => achievement.id !== id))
      toast.success('Achievement deleted successfully')
    } catch (err) {
      toast.error('Failed to delete achievement')
      throw err
    }
  }

  useEffect(() => {
    fetchAchievements()
  }, [fetchAchievements])

  return {
    achievements,
    loading,
    error,
    addAchievement,
    updateAchievement,
    deleteAchievement,
    refreshAchievements: fetchAchievements,
  }
}
