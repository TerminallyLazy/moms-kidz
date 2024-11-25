import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  database: {
    status: 'connected' | 'error'
    latency?: number
  }
  supabase: {
    status: 'connected' | 'error'
    latency?: number
  }
  cache: {
    status: 'connected' | 'error'
    latency?: number
  }
  uptime: number
  memory: {
    heapUsed: number
    heapTotal: number
    rss: number
    external: number
  }
  timestamp: string
}

export async function GET() {
  const startTime = process.hrtime()
  const healthStatus: HealthStatus = {
    status: 'healthy',
    database: {
      status: 'connected'
    },
    supabase: {
      status: 'connected'
    },
    cache: {
      status: 'connected'
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  }

  try {
    // Check database connection
    const dbStartTime = process.hrtime()
    await prisma.$queryRaw`SELECT 1`
    const dbEndTime = process.hrtime(dbStartTime)
    healthStatus.database.latency = dbEndTime[0] * 1000 + dbEndTime[1] / 1000000 // Convert to milliseconds

    // Check Supabase connection
    const supabaseStartTime = process.hrtime()
    const { data, error } = await supabase.from('health_check').select('*').limit(1)
    const supabaseEndTime = process.hrtime(supabaseStartTime)
    healthStatus.supabase.latency = supabaseEndTime[0] * 1000 + supabaseEndTime[1] / 1000000

    if (error) {
      healthStatus.supabase.status = 'error'
      healthStatus.status = 'degraded'
    }

    // Check Redis cache if configured
    try {
      const cacheStartTime = process.hrtime()
      // Add Redis health check here if using Redis
      const cacheEndTime = process.hrtime(cacheStartTime)
      healthStatus.cache.latency = cacheEndTime[0] * 1000 + cacheEndTime[1] / 1000000
    } catch (error) {
      healthStatus.cache.status = 'error'
      healthStatus.status = 'degraded'
      logger.error('Cache health check failed:', error)
    }

    // Check overall system health
    if (
      healthStatus.database.status === 'error' ||
      (healthStatus.database.latency && healthStatus.database.latency > 1000) ||
      (healthStatus.supabase.latency && healthStatus.supabase.latency > 1000)
    ) {
      healthStatus.status = 'unhealthy'
    } else if (
      healthStatus.cache.status === 'error' ||
      (healthStatus.database.latency && healthStatus.database.latency > 500) ||
      (healthStatus.supabase.latency && healthStatus.supabase.latency > 500)
    ) {
      healthStatus.status = 'degraded'
    }

    // Log health check results
    logger.info('Health check completed', {
      status: healthStatus.status,
      dbLatency: healthStatus.database.latency,
      supabaseLatency: healthStatus.supabase.latency,
      cacheLatency: healthStatus.cache.latency
    })

    // Return health status with appropriate HTTP status code
    return NextResponse.json(healthStatus, {
      status: healthStatus.status === 'unhealthy' ? 503 : 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    logger.error('Health check failed:', error)
    healthStatus.status = 'unhealthy'
    healthStatus.database.status = 'error'

    return NextResponse.json(healthStatus, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json'
      }
    })
  }
}

// HEAD request for lightweight health checks
export async function HEAD() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}

// Options for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  })
}
