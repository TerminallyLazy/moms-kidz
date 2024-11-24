import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const accessToken = requestUrl.hash?.split('access_token=')?.[1]?.split('&')?.[0]
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')

  console.log('Auth Callback - Starting with:', code ? 'code' : accessToken ? 'token' : 'missing')

  // Handle OAuth errors
  if (error) {
    console.error('Auth Callback - OAuth error:', error, error_description)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error_description || error)}`, requestUrl.origin)
    )
  }

  const supabase = createRouteHandlerClient({ cookies })

  try {
    let session

    if (code) {
      console.log('Auth Callback - Exchanging code for session')
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      if (exchangeError) throw exchangeError
      session = data.session
    } else if (accessToken) {
      console.log('Auth Callback - Setting session from token')
      const { data: { session: tokenSession }, error: setSessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: requestUrl.hash?.split('refresh_token=')?.[1]?.split('&')?.[0] || ''
      })
      if (setSessionError) throw setSessionError
      session = tokenSession
    } else {
      throw new Error('No authentication code or token provided')
    }

    console.log('Auth Callback - Session established:', !!session)

    // Get the callback URL if it exists
    const callbackUrl = requestUrl.searchParams.get('callbackUrl')
    const redirectUrl = callbackUrl || '/member'

    console.log('Auth Callback - Redirecting to:', redirectUrl)

    // Set cookie with session
    const response = NextResponse.redirect(new URL(redirectUrl, requestUrl.origin))
    
    if (session?.access_token) {
      response.cookies.set('supabase-auth-token', session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      })
    }

    return response
  } catch (error) {
    console.error('Auth Callback - Unexpected error:', error)
    return NextResponse.redirect(
      new URL('/login?error=Authentication failed', requestUrl.origin)
    )
  }
}
