"use client"

import { useState } from 'react'
import { useAuthContext } from '@/contexts/auth-context'
import { useDb } from '@/lib/db/client'
import { supabase } from '@/lib/supabase-config'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export function useProfile() {
  const { user, profile, refreshUserData } = useAuthContext()
  const db = useDb()
  const [isLoading, setIsLoading] = useState(false)

  const updateProfile = async (updates: Partial<ProfileUpdate>) => {
    if (!user) {
      throw new Error('No user found')
    }

    try {
      setIsLoading(true)
      const { data, error } = await db.updateProfile(user.id, updates)
      
      if (error) throw error

      // Refresh user data to get updated profile
      await refreshUserData()

      return { success: true, data }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
  }

  const uploadAvatar = async (file: File) => {
    if (!user) {
      throw new Error('No user found')
    }

    try {
      setIsLoading(true)

      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/avatar.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600'
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile with new avatar URL
      const { data: profileData, error: profileError } = await db.updateProfile(user.id, {
        avatar_url: publicUrl
      })

      if (profileError) throw profileError

      // Refresh user data to get updated profile
      await refreshUserData()

      return { success: true, data: profileData }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAvatar = async () => {
    if (!user || !profile?.avatar_url) {
      throw new Error('No user or avatar found')
    }

    try {
      setIsLoading(true)

      // Extract file path from URL
      const urlParts = profile.avatar_url.split('avatars/')
      const filePath = urlParts[1]

      // Delete file from storage
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath])

      if (deleteError) throw deleteError

      // Update profile to remove avatar URL
      const { data, error: profileError } = await db.updateProfile(user.id, {
        avatar_url: null
      })

      if (profileError) throw profileError

      // Refresh user data to get updated profile
      await refreshUserData()

      return { success: true, data }
    } catch (error) {
      console.error('Error deleting avatar:', error)
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    profile,
    isLoading,
    updateProfile,
    uploadAvatar,
    deleteAvatar
  }
}
