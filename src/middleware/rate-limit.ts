import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

interface RateLimitConfig {
  maxRequests: number;  // Maximum requests per window
  windowMs: number;     // Time window in milliseconds
}

// In-memory store for rate limiting
// In production, use Redis or similar for distributed systems
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime <= now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

export function rateLimit(config: RateLimitConfig = {
  maxRequests: Number(process.env.RATE_LIMIT_REQUESTS) || 100,
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
}) {
  return async function rateLimitMiddleware(
    request: NextRequest
  ) {
    // Skip rate limiting for non-API routes and health checks
    if (!request.nextUrl.pathname.startsWith('/api') || 
        request.nextUrl.pathname === '/api/health') {
      return NextResponse.next()
    }

    const ip = request.ip || 'anonymous'
    const key = `${ip}:${request.nextUrl.pathname}`
    const now = Date.now()

    // Get existing rate limit data
    const rateLimitData = rateLimitStore.get(key)

    if (!rateLimitData || rateLimitData.resetTime <= now) {
      // First request or expired window
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      })

      return addRateLimitHeaders(
        NextResponse.next(),
        1,
        config.maxRequests,
        config.windowMs
      )
    }

    // Increment request count
    rateLimitData.count++

    if (rateLimitData.count > config.maxRequests) {
      // Rate limit exceeded
      return addRateLimitHeaders(
        NextResponse.json(
          {
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: Math.ceil((rateLimitData.resetTime - now) / 1000),
          },
          { 
            status: 429,
            headers: {
              'Retry-After': Math.ceil((rateLimitData.resetTime - now) / 1000).toString(),
            }
          }
        ),
        rateLimitData.count,
        config.maxRequests,
        rateLimitData.resetTime - now
      )
    }

    // Update store
    rateLimitStore.set(key, rateLimitData)

    // Continue with updated headers
    return addRateLimitHeaders(
      NextResponse.next(),
      rateLimitData.count,
      config.maxRequests,
      rateLimitData.resetTime - now
    )
  }
}

function addRateLimitHeaders(
  response: NextResponse,
  currentCount: number,
  limit: number,
  remaining: number
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', Math.max(0, limit - currentCount).toString())
  response.headers.set('X-RateLimit-Reset', (Date.now() + remaining).toString())

  return response
}

// Helper function to get rate limit info for a specific IP and path
export function getRateLimitInfo(ip: string, path: string) {
  const key = `${ip}:${path}`
  return rateLimitStore.get(key)
}

// Helper function to reset rate limit for a specific IP and path
export function resetRateLimit(ip: string, path: string) {
  const key = `${ip}:${path}`
  rateLimitStore.delete(key)
}

// Helper function to check if an IP is rate limited
export function isRateLimited(ip: string, path: string): boolean {
  const data = getRateLimitInfo(ip, path)
  if (!data) return false

  const now = Date.now()
  if (data.resetTime <= now) {
    rateLimitStore.delete(`${ip}:${path}`)
    return false
  }

  return data.count > (Number(process.env.RATE_LIMIT_REQUESTS) || 100)
}

// Helper function to get remaining requests for an IP and path
export function getRemainingRequests(ip: string, path: string): number {
  const data = getRateLimitInfo(ip, path)
  if (!data) return Number(process.env.RATE_LIMIT_REQUESTS) || 100

  const now = Date.now()
  if (data.resetTime <= now) {
    rateLimitStore.delete(`${ip}:${path}`)
    return Number(process.env.RATE_LIMIT_REQUESTS) || 100
  }

  return Math.max(0, (Number(process.env.RATE_LIMIT_REQUESTS) || 100) - data.count)
}