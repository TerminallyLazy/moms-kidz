import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json()
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    logger.info('Creating new user', { email, username })

    // Sign up the user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
        // Disable email verification in development
        emailRedirectTo: process.env.NODE_ENV === 'production' 
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
          : undefined
      }
    })

    if (signUpError) {
      logger.error('Sign up error:', signUpError)
      return NextResponse.json(
        { error: 'Failed to sign up', details: signUpError },
        { status: 400 }
      )
    }

    if (!authData.user) {
      logger.error('No user data received after sign up')
      return NextResponse.json(
        { error: 'No user data received' },
        { status: 400 }
      )
    }

    logger.info('User created, creating profile', { userId: authData.user.id })

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          username,
          email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single()

    if (profileError) {
      logger.error('Profile creation error:', { 
        error: profileError,
        code: profileError.code,
        message: profileError.message,
        details: profileError.details 
      })
      return NextResponse.json(
        { 
          error: 'Failed to create profile',
          details: {
            code: profileError.code,
            message: profileError.message,
            details: profileError.details
          }
        },
        { status: 400 }
      )
    }

    logger.info('User created successfully', { userId: authData.user.id })

    return NextResponse.json({
      user: authData.user,
      message: 'User created successfully'
    })
  } catch (error) {
    logger.error('Unexpected error during sign up:', error as Error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
