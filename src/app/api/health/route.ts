import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const runtime = 'edge'

export async function GET() {
  try {
    // Check database connection
    const supabase = createRouteHandlerClient({ cookies })
    const { data, error } = await supabase
      .from('health_check')
      .select('*')
      .limit(1)

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Database connection error',
        timestamp: new Date().toISOString(),
      }, { 
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        }
      })
    }

    // Return healthy status
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Service unavailable',
      timestamp: new Date().toISOString(),
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      }
    })
  }
}

export async function HEAD() {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    }
  })
}
