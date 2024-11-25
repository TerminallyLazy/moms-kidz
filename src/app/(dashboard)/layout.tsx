"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { MainNav } from '@/components/layout/main-nav'
import { UserNav } from '@/components/layout/user-nav'
import { MobileNav } from '@/components/layout/mobile-nav'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Icons } from '@/components/ui/icons'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          {/* Logo - Always visible */}
          <div className="mr-4 hidden md:flex">
            <Link href="/dashboard" className="mr-6 flex items-center">
              <img src="/mklogo.png" alt="Mom's Kidz Logo" className="h-8" />
            </Link>
          </div>

          {/* Mobile Logo */}
          <div className="mr-4 flex md:hidden">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <img src="/logo.png" className="h-6 w-6" />
            </Link>
          </div>

          {/* Main Navigation */}
          <MainNav />

          {/* Right Side Navigation */}
          <div className="ml-auto flex items-center space-x-4">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-6">
        {children}
      </main>

      {/* Mobile Navigation */}
      <MobileNav className="md:hidden" />
    </div>
  )
}
