"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Icons } from "@/components/ui/icons"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const router = useRouter()
  const { user, profile, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      const currentPath = window.location.pathname
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return <>{children}</>
}

// Higher-order component version
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}
