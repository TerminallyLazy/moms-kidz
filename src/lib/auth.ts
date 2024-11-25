import { supabase } from './supabase'
import type { Database } from '../types/supabase'

export type Profile = Database['public']['Tables']['profiles']['Row']

export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, username: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) throw authError

    if (authData.user) {
      // Create profile after successful signup
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          name: username,
          email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } satisfies Database['public']['Tables']['profiles']['Insert'])

      if (profileError) throw profileError
    }

    return authData
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  // Get current user
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Get user profile
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data as Profile
  },

  // Update user profile
  updateProfile: async (userId: string, updates: Partial<Profile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })      
      .eq('id', userId)
      .select()
    
    if (error) throw error
    return data as unknown as Profile
  },

  // Reset password
  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) throw error
  },

  // Update password
  updatePassword: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
  },

  // OAuth sign in
  signInWithProvider: async (provider: 'google' | 'github') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
    return data
  },

  // Check if user exists
  checkUser: async (email: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 is the error code for no rows returned
    return !!data
  },

  // Hook to subscribe to auth state changes
  onAuthStateChange: (callback: (session: any) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      callback(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }
}

export default auth
