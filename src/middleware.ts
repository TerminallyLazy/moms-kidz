import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  // Create Supabase client
  const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() })

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession()

  // Protected routes
  const protectedPaths = [
    '/dashboard',
    '/activities',
    '/achievements',
    '/profile',
    '/care-log',
    '/tapestry',
    '/settings'
  ]

  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  // If accessing protected route without session, redirect to login
  if (isProtectedPath && !session) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Auth routes - redirect to dashboard if already logged in
  const authPaths = ['/login', '/signup']
  const isAuthPath = authPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isAuthPath && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Return response with refreshed auth cookie
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)',
  ],
}
