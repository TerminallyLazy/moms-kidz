import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Initialize the Supabase client
export const supabaseClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    db: {
      schema: 'public'
    }
  }
)

// Types for auth responses
export type AuthResponse = Awaited<ReturnType<typeof supabaseClient.auth.signUp>>
export type SignInResponse = Awaited<ReturnType<typeof supabaseClient.auth.signInWithPassword>>
export type AuthError = AuthResponse['error']

// Helper functions for auth
export const authHelpers = {
  async signUpWithEmail(email: string, password: string, metadata?: object) {
    return await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
  },

  async signInWithEmail(email: string, password: string) {
    return await supabaseClient.auth.signInWithPassword({
      email,
      password
    })
  },

  async signInWithGoogle() {
    return await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
  },

  async signOut() {
    return await supabaseClient.auth.signOut()
  },

  async resetPassword(email: string) {
    return await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`
    })
  },

  async updatePassword(newPassword: string) {
    return await supabaseClient.auth.updateUser({
      password: newPassword
    })
  }
}

// Helper functions for storage
export const storageHelpers = {
  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      })
    return { data, error }
  },

  async deleteFile(bucket: string, path: string) {
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .remove([path])
    return { data, error }
  },

  getPublicUrl(bucket: string, path: string) {
    const { data } = supabaseClient.storage
      .from(bucket)
      .getPublicUrl(path)
    return data.publicUrl
  }
}

// Export everything
export const supabase = {
  client: supabaseClient,
  auth: authHelpers,
  storage: storageHelpers
}

export default supabase