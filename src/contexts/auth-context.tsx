"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import type { User } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type UserStats = {
  totalPoints: number
  level: number
  xpToNextLevel: number
  achievements: any[]
  streaks: any[]
  activityCount: number
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  stats: UserStats | null
  loading: boolean
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; data?: Profile; error?: any }>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  const router = useRouter()

  // Subscribe to auth state changes
  useEffect(() => {
    if (!auth.loading) {
      // If not logged in and not on a public page, redirect to login
      if (!auth.user && !window.location.pathname.match(/^\/($|login|signup|auth\/callback)/)) {
        router.push('/login')
      }
      // If logged in and on a public page, redirect to member dashboard
      else if (auth.user && window.location.pathname.match(/^\/($|login|signup)/)) {
        router.push('/member')
      }
    }
  }, [auth.user, auth.loading, router])

  return (
    <AuthContext.Provider value={auth}>
      {auth.loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 dark:border-purple-400"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

// Custom hook for protected pages
export function useProtectedRoute() {
  const { user, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  return { user, loading }
}

// Custom hook for public pages (login, signup)
export function usePublicRoute() {
  const { user, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/member')
    }
  }, [user, loading, router])

  return { user, loading }
}

// Custom hook for admin routes
export function useAdminRoute() {
  const { user, profile, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (!profile?.metadata?.isAdmin) {
        router.push('/member')
      }
    }
  }, [user, profile, loading, router])

  return { user, profile, loading }
}