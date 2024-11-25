import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  maxAge: number;
  credentials: boolean;
}

const DEFAULT_CONFIG: CorsConfig = {
  allowedOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-CSRF-Token',
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Request-ID',
  ],
  maxAge: 86400, // 24 hours
  credentials: true,
}

export function cors(config: Partial<CorsConfig> = {}) {
  const corsConfig = { ...DEFAULT_CONFIG, ...config }

  return async function corsMiddleware(
    request: NextRequest
  ) {
    // Get the origin from the request headers
    const origin = request.headers.get('origin')

    // Check if the origin is allowed
    const isAllowedOrigin = !origin || corsConfig.allowedOrigins.includes(origin) || 
      corsConfig.allowedOrigins.includes('*')

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 204 })
      
      if (origin && isAllowedOrigin) {
        response.headers.set('Access-Control-Allow-Origin', origin)
      }

      if (corsConfig.credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true')
      }

      response.headers.set(
        'Access-Control-Allow-Methods',
        corsConfig.allowedMethods.join(', ')
      )

      response.headers.set(
        'Access-Control-Allow-Headers',
        corsConfig.allowedHeaders.join(', ')
      )

      response.headers.set(
        'Access-Control-Expose-Headers',
        corsConfig.exposedHeaders.join(', ')
      )

      response.headers.set(
        'Access-Control-Max-Age',
        corsConfig.maxAge.toString()
      )

      return response
    }

    // Handle actual request
    const response = NextResponse.next()

    if (origin && isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }

    if (corsConfig.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }

    response.headers.set(
      'Access-Control-Expose-Headers',
      corsConfig.exposedHeaders.join(', ')
    )

    // Add Vary header to help with caching
    response.headers.append('Vary', 'Origin')

    return response
  }
}

// Helper function to check if origin is allowed
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false
  
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || 
    ['http://localhost:3000']
  
  return allowedOrigins.includes('*') || allowedOrigins.includes(origin)
}

// Helper function to validate request headers
export function validateCorsHeaders(request: NextRequest): boolean {
  const requestHeaders = request.headers.get('access-control-request-headers')
  if (!requestHeaders) return true

  const allowedHeaders = DEFAULT_CONFIG.allowedHeaders.map(h => h.toLowerCase())
  const requestedHeaders = requestHeaders.split(',').map(h => h.trim().toLowerCase())

  return requestedHeaders.every(header => allowedHeaders.includes(header))
}