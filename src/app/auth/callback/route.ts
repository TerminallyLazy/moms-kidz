import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    
    logger.info('Auth callback received', { hasCode: !!code })

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
      
      // Exchange the code for a session
      logger.info('Exchanging code for session')
      await supabase.auth.exchangeCodeForSession(code)

      // Get the user from the newly created session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        logger.error('Error getting session:', sessionError)
        throw sessionError
      }

      if (session?.user) {
        logger.info('Got user from session, checking profile', { userId: session.user.id })
        
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select()
          .eq('id', session.user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          logger.error('Error checking profile:', profileError)
          throw profileError
        }

        // If no profile exists, create one
        if (!profile) {
          logger.info('Creating new profile for user', { userId: session.user.id })
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: session.user.id,
                email: session.user.email,
                username: session.user.email?.split('@')[0], // Create a default username
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ])

          if (insertError) {
            logger.error('Error creating profile:', insertError)
            throw insertError
          }
        }

        logger.info('Auth callback successful, redirecting to dashboard')
        return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
      }
    }

    logger.error('No code or session found in callback')
    return NextResponse.redirect(new URL('/login?error=callback_failed', requestUrl.origin))
  } catch (error) {
    logger.error('Auth callback error:', error as Error)
    const errorUrl = new URL('/login', request.url)
    errorUrl.searchParams.set('error', 'callback_failed')
    return NextResponse.redirect(errorUrl)
  }
}