"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/ui/icons'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, signInWithProvider } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const error = searchParams.get('error')

  useEffect(() => {
    // Handle any error parameters in the URL
    if (error) {
      logger.error('Login error from URL:', { error })
      switch (error) {
        case 'callback_failed':
          toast.error('Authentication failed. Please try again.')
          break
        case 'unauthorized':
          toast.error('Please log in to access that page.')
          break
        default:
          toast.error('An error occurred. Please try again.')
      }
    }
  }, [error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      logger.info('Attempting to sign in', { email })
      await signIn(email, password)
      logger.info('Sign in successful, redirecting', { redirect })
      toast.success('Successfully logged in!')
      router.push(redirect)
    } catch (error) {
      logger.error('Login error:', error as Error)
      console.error('Login error:', error)
      toast.error('Failed to login. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProviderSignIn = async (provider: 'google' | 'github') => {
    try {
      setIsLoading(true)
      logger.info('Attempting provider sign in', { provider })
      await signInWithProvider(provider)
      // Note: No need to redirect here as it's handled by Supabase OAuth
    } catch (error) {
      logger.error('Provider sign in error:', error as Error)
      console.error('Provider sign-in error:', error)
      toast.error(`Failed to sign in with ${provider}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to sign in to your account
          </p>
        </div>

        <div className="grid gap-6">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button disabled={isLoading}>
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sign In
              </Button>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid gap-2">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => handleProviderSignIn('google')}
            >
              {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.google className="mr-2 h-4 w-4" />
              )}
              Google
            </Button>
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => handleProviderSignIn('github')}
            >
              {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.gitHub className="mr-2 h-4 w-4" />
              )}
              GitHub
            </Button>
          </div>
        </div>

        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link 
            href="/signup" 
            className="hover:text-brand underline underline-offset-4"
          >
            Don&apos;t have an account? Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
