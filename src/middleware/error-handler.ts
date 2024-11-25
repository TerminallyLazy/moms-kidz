import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
}

export async function errorHandler(
  error: ErrorWithStatus,
  request: NextRequest
) {
  // Log the error with request details
  console.error('Error occurred:', {
    error: {
      message: error.message,
      stack: error.stack,
      status: error.status || error.statusCode,
    },
    request: {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers),
      timestamp: new Date().toISOString(),
    },
  })

  // Determine status code
  const statusCode = error.status || error.statusCode || 500

  // Prepare error response based on status code
  const errorResponse = {
    error: {
      message: getErrorMessage(statusCode, error.message),
      code: statusCode,
      requestId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    },
  }

  // Return error response
  return NextResponse.json(errorResponse, {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Error-Code': statusCode.toString(),
      'X-Request-ID': errorResponse.error.requestId,
    },
  })
}

function getErrorMessage(status: number, defaultMessage?: string): string {
  const errorMessages: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    408: 'Request Timeout',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  }

  if (defaultMessage && process.env.NODE_ENV === 'development') {
    return defaultMessage
  }

  return errorMessages[status] || 'An unexpected error occurred'
}

// Helper function to determine if an error should be reported to the user
export function shouldReportError(error: Error): boolean {
  const nonReportableErrors = [
    'NotFoundError',
    'ValidationError',
    'UnauthorizedError',
  ]

  return !nonReportableErrors.includes(error.name)
}

// Helper function to sanitize error messages for production
export function sanitizeError(error: Error): string {
  if (process.env.NODE_ENV === 'production') {
    // In production, return generic error messages
    return 'An unexpected error occurred'
  }

  // In development, return the actual error message
  return error.message
}

// Helper function to format error for logging
export function formatErrorForLogging(error: Error, request: NextRequest) {
  return {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    request: {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers),
    },
    environment: process.env.NODE_ENV,
    version: process.env.NEXT_PUBLIC_APP_VERSION,
  }
}

// Custom error classes
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
    this.status = 422
  }
  status: number
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
    this.status = 404
  }
  status: number
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnauthorizedError'
    this.status = 401
  }
  status: number
}