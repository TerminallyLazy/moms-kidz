import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateMetrics } from '@/app/api/metrics/route'

export async function metricsMiddleware(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()
  const path = request.nextUrl.pathname

  // Skip metrics collection for metrics endpoint itself to avoid recursion
  if (path === '/api/metrics') {
    return NextResponse.next()
  } 
  try {
    // Process the request
    const response = NextResponse.next()

    // Calculate request duration
    const duration = (Date.now() - startTime) / 1000 // Convert to seconds
    
    // Update metrics
    updateMetrics(
      path,
      response.status,
      duration
    )

    // Add timing header for debugging
    response.headers.set('Server-Timing', `total;dur=${duration}`)

    return response
  } catch (error) {
    // Update metrics with error status
    const duration = (Date.now() - startTime) / 1000
    updateMetrics(path, 500, duration)

    // Re-throw the error to be handled by error boundary
    throw error
  }
}

// Configuration for which paths to run the middleware on
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Exclude metrics and health check endpoints
    '/((?!api/metrics|api/health).*)',
  ],
}