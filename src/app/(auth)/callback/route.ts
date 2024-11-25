import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)

    // Get the user from the newly created session
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select()
        .eq('id', session.user.id)
        .single()

      // If no profile exists, create one
      if (!profile) {
        const { error: profileError } = await supabase
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

        if (profileError) {
          console.error('Error creating profile:', profileError)
          // Redirect to error page if profile creation fails
          return NextResponse.redirect(`${requestUrl.origin}/auth/error`)
        }
      }
    }
  }

  // Redirect to the dashboard or home page
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}
