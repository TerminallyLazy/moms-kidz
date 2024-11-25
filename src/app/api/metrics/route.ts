import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const runtime = 'edge'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get basic metrics
    const [
      usersResult,
      activitiesResult,
      achievementsResult
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('activities').select('id', { count: 'exact' }),
      supabase.from('achievements').select('id', { count: 'exact' })
    ])

    // Get active users in last 24 hours
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .gt('last_seen', twentyFourHoursAgo.toISOString())

    const metrics = {
      total_users: usersResult.count || 0,
      total_activities: activitiesResult.count || 0,
      total_achievements: achievementsResult.count || 0,
      active_users_24h: activeUsers || 0,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(metrics, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch metrics',
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    })
  }
}

export async function HEAD() {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  })
}

export async function updateMetrics(path: string, status: number, duration: number) {
  // Your metrics update logic here
}
