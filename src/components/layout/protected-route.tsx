"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/contexts/auth-context"
import { LoadingPage } from "@/components/ui/loading"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated, redirect to login
        router.push(`/login?callbackUrl=${window.location.pathname}`)
      } else if (requireAdmin && !profile?.metadata?.isAdmin) {
        // Not an admin, redirect to member dashboard
        router.push('/member')
      }
    }
  }, [user, profile, loading, router, requireAdmin])

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingPage />
  }

  // Show nothing while redirecting
  if (!user || (requireAdmin && !profile?.metadata?.isAdmin)) {
    return null
  }

  // Render children if authenticated and authorized
  return <>{children}</>
}

// Higher-order component version
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  requireAdmin = false
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute requireAdmin={requireAdmin}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

// Admin route wrapper
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requireAdmin>{children}</ProtectedRoute>
}

// Example usage:
// 1. Wrap a component directly:
// export default function MemberPage() {
//   return (
//     <ProtectedRoute>
//       <YourComponent />
//     </ProtectedRoute>
//   )
// }

// 2. Use HOC:
// const ProtectedMemberPage = withProtectedRoute(MemberPage)
// export default ProtectedMemberPage

// 3. Admin route:
// export default function AdminPage() {
//   return (
//     <AdminRoute>
//       <YourAdminComponent />
//     </AdminRoute>
//   )
// }
