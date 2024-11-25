"use client"
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import auth, { type Profile } from '@/lib/auth'
import { type Session, type User } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithProvider: (provider: 'google' | 'github') => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        logger.info('Initializing auth state')
        setIsLoading(true)
        const session = await auth.getSession()
        logger.info('Got session', { hasSession: !!session })
        setSession(session)
        
        if (session?.user) {
          logger.info('Session has user, fetching profile', { userId: session.user.id })
          setUser(session.user)
          const profile = await auth.getProfile(session.user.id)
          logger.info('Got profile', { hasProfile: !!profile })
          setProfile(profile)
        } else {
          logger.info('No user in session')
        }
      } catch (error) {
        logger.error('Error initializing auth:', error as Error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Subscribe to auth changes
    const unsubscribe = auth.onAuthStateChange(async (session: Session | null) => {
      logger.info('Auth state changed', { hasSession: !!session })
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        try {
          logger.info('Fetching profile after auth change', { userId: session.user.id })
          const profile = await auth.getProfile(session.user.id)
          logger.info('Got profile after auth change', { hasProfile: !!profile })
          setProfile(profile)
        } catch (error) {
          logger.error('Error fetching profile:', error as Error)
        }
      } else {
        setProfile(null)
      }
    })

    return () => {
      logger.info('Cleaning up auth subscriptions')
      unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      logger.info('Attempting sign in', { email })
      const { session } = await auth.signIn(email, password)
      if (session?.user) {
        logger.info('Sign in successful, fetching profile', { userId: session.user.id })
        const profile = await auth.getProfile(session.user.id)
        setProfile(profile)
        router.push('/dashboard')
      }
    } catch (error) {
      logger.error('Sign in error:', error as Error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setIsLoading(true)
      logger.info('Attempting sign up', { email, username })
      await auth.signUp(email, password, username)
      // After signup, sign in automatically
      await signIn(email, password)
    } catch (error) {
      logger.error('Sign up error:', error as Error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(true)
      logger.info('Attempting sign out')
      await auth.signOut()
      setUser(null)
      setProfile(null)
      setSession(null)
      router.push('/')
    } catch (error) {
      logger.error('Sign out error:', error as Error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithProvider = async (provider: 'google' | 'github') => {
    try {
      setIsLoading(true)
      logger.info('Attempting provider sign in', { provider })
      await auth.signInWithProvider(provider)
    } catch (error) {
      logger.error('Provider sign in error:', error as Error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      logger.error('Update profile attempted without user')
      throw new Error('No user logged in')
    }
    try {
      setIsLoading(true)
      logger.info('Attempting profile update', { userId: user.id, updates })
      const updatedProfile = await auth.updateProfile(user.id, updates)
      setProfile(updatedProfile)
    } catch (error) {
      logger.error('Profile update error:', error as Error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    profile,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInWithProvider,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook for protected routes
export function useRequireAuth() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  return { user, isLoading }
}
