import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error('Middleware - Session error:', error)
  }

  // Define protected and public routes
  const isAuthRoute = ['/login', '/signup', '/auth/callback'].some(
    path => req.nextUrl.pathname.startsWith(path)
  )
  const isPublicRoute = ['/', '/about'].some(
    path => req.nextUrl.pathname === path
  )
  const isProtectedRoute = !isAuthRoute && !isPublicRoute

  // If user is authenticated and tries to access auth pages, redirect to member
  if (session && isAuthRoute && req.nextUrl.pathname !== '/auth/callback') {
    return NextResponse.redirect(new URL('/member', req.url))
  }

  // If user is not authenticated and tries to access protected pages, redirect to login
  if (!session && isProtectedRoute) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
