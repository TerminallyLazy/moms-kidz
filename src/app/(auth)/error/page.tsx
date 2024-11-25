"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

export default function AuthErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')

  useEffect(() => {
    // Automatically redirect back to login after 5 seconds
    const timeout = setTimeout(() => {
      router.push('/login')
    }, 5000)

    return () => clearTimeout(timeout)
  }, [router])

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 p-3">
              <Icons.close className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-red-600">
            Authentication Error
          </h1>
          <p className="text-sm text-muted-foreground">
            {message || error || "An error occurred during authentication"}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            You will be redirected to the login page in 5 seconds.
          </p>
        </div>

        <div className="grid gap-2">
          <Button asChild variant="outline">
            <Link href="/login">
              Return to Login
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">
              Go to Homepage
            </Link>
          </Button>
        </div>

        <p className="px-8 text-center text-sm text-muted-foreground">
          Need help?{' '}
          <Link 
            href="/contact" 
            className="hover:text-brand underline underline-offset-4"
          >
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  )
}