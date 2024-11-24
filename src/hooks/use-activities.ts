import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'
import { toast } from 'sonner'

type Activity = Database['public']['Tables']['activities']['Row']
type ActivityInsert = Database['public']['Tables']['activities']['Insert']
type ActivityUpdate = Database['public']['Tables']['activities']['Update']

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error

      setActivities(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'))
      toast.error('Failed to fetch activities')
    } finally {
      setLoading(false)
    }
  }, [])

  const addActivity = async (newActivity: ActivityInsert) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert(newActivity)
        .select()
        .single()

      if (error) throw error

      setActivities(prev => [data, ...prev])
      toast.success('Activity added successfully')
      return data
    } catch (err) {
      toast.error('Failed to add activity')
      throw err
    }
  }

  const updateActivity = async (id: string, updates: ActivityUpdate) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setActivities(prev =>
        prev.map(activity => (activity.id === id ? data : activity))
      )
      toast.success('Activity updated successfully')
      return data
    } catch (err) {
      toast.error('Failed to update activity')
      throw err
    }
  }

  const deleteActivity = async (id: string) => {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id)

      if (error) throw error

      setActivities(prev => prev.filter(activity => activity.id !== id))
      toast.success('Activity deleted successfully')
    } catch (err) {
      toast.error('Failed to delete activity')
      throw err
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  return {
    activities,
    loading,
    error,
    addActivity,
    updateActivity,
    deleteActivity,
    refreshActivities: fetchActivities,
  }
}
