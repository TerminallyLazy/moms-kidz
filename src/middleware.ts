import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/auth/callback']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })

  // Refresh session if expired
  const {
    data: { session },
    error
  } = await supabase.auth.getSession()

  const requestedPath = req.nextUrl.pathname

  // Allow public routes
  if (PUBLIC_ROUTES.includes(requestedPath)) {
    return res
  }

  // Check auth state
  if (!session) {
    // Redirect to login if accessing protected route while not authenticated
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('callbackUrl', requestedPath)
    return NextResponse.redirect(redirectUrl)
  }

  // For authenticated users trying to access login/signup pages
  if (['/login', '/signup'].includes(requestedPath) && session) {
    return NextResponse.redirect(new URL('/member', req.url))
  }

  // Check if user has a profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // If no profile exists, create one
  if (!profile && session.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: session.user.id,
          email: session.user.email!,
          username: session.user.user_metadata.username || session.user.email!.split('@')[0],
          avatar_url: session.user.user_metadata.avatar_url
        }
      ])

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Consider how to handle this error - maybe redirect to an error page?
    }
  }

  return res
}

// Specify which routes should be processed by the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
