import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { register, Counter, Histogram, Gauge } from 'prom-client'

// Initialize metrics
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status']
})

const httpRequestDurationSeconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path']
})

const activeUsers = new Gauge({
  name: 'active_users',
  help: 'Number of currently active users'
})

const careLogEntriesTotal = new Counter({
  name: 'care_log_entries_total',
  help: 'Total number of care log entries',
  labelNames: ['type']
})

const careLogStreak = new Gauge({
  name: 'care_log_streak_days',
  help: 'Current streak length in days',
  labelNames: ['user_id', 'user_tier']
})

const authFailuresTotal = new Counter({
  name: 'auth_failures_total',
  help: 'Total number of authentication failures'
})

export async function GET() {
  try {
    // Update metrics with current data
    const [
      userCount,
      careLogStats,
      streakStats
    ] = await Promise.all([
      // Get active user count
      db.user.count({
        where: {
          lastActive: {
            gte: new Date(Date.now() - 15 * 60 * 1000) // Active in last 15 minutes
          }
        }
      }),
      // Get care log stats
      db.careLog.groupBy({
        by: ['type'],
        _count: true
      }),
      // Get streak stats
      db.user.findMany({
        select: {
          id: true,
          tier: true,
          streakDays: true
        }
      })
    ])

    // Update metrics
    activeUsers.set(userCount)

    careLogStats.forEach(stat => {
      careLogEntriesTotal.labels(stat.type).inc(stat._count)
    })

    streakStats.forEach(user => {
      careLogStreak.labels(user.id, user.tier).set(user.streakDays)
    })

    // Get metrics
    const metrics = await register.metrics()

    return new NextResponse(metrics, {
      headers: {
        'Content-Type': register.contentType
      }
    })
  } catch (error) {
    console.error('Metrics collection failed:', error)
    return new NextResponse('Metrics collection failed', { status: 500 })
  }
}

// Enable edge runtime for faster response
export const runtime = 'edge'

// Configure response caching
export const revalidate = 15 // Cache for 15 seconds
