import { NextResponse } from 'next/server'
import { logger } from './logger'

interface ApiResponseOptions {
  status?: number;
  headers?: Record<string, string>;
  message?: string;
}

interface ErrorResponseOptions extends ApiResponseOptions {
  error: Error | string;
  code?: string;
}

export class ApiResponse {
  static success<T>(data: T, options: ApiResponseOptions = {}) {
    const {
      status = 200,
      headers = {},
      message = 'Success',
    } = options

    logger.info('API Success Response', {
      status,
      message,
      data: process.env.NODE_ENV === 'development' ? data : undefined,
    })

    return NextResponse.json(
      {
        success: true,
        message,
        data,
      },
      {
        status,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      }
    )
  }

  static error(options: ErrorResponseOptions) {
    const {
      status = 500,
      headers = {},
      message = 'An error occurred',
      error,
      code = 'INTERNAL_SERVER_ERROR',
    } = options

    const errorMessage = error instanceof Error ? error.message : error

    logger.error('API Error Response', error instanceof Error ? error : new Error(errorMessage), {
      status,
      code,
      message,
    })

    const response = {
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? errorMessage : message,
      code,
    }

    if (process.env.NODE_ENV === 'development' && error instanceof Error) {
      response['stack'] = error.stack
    }

    return NextResponse.json(
      response,
      {
        status,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      }
    )
  }

  static unauthorized(message = 'Unauthorized') {
    return this.error({
      status: 401,
      message,
      error: 'Unauthorized access',
      code: 'UNAUTHORIZED',
    })
  }

  static forbidden(message = 'Forbidden') {
    return this.error({
      status: 403,
      message,
      error: 'Access forbidden',
      code: 'FORBIDDEN',
    })
  }

  static notFound(message = 'Not Found') {
    return this.error({
      status: 404,
      message,
      error: 'Resource not found',
      code: 'NOT_FOUND',
    })
  }

  static badRequest(message: string, error?: string) {
    return this.error({
      status: 400,
      message,
      error: error || message,
      code: 'BAD_REQUEST',
    })
  }

  static validationError(errors: Record<string, string[]>) {
    return this.error({
      status: 422,
      message: 'Validation failed',
      error: errors,
      code: 'VALIDATION_ERROR',
    })
  }

  static tooManyRequests(retryAfter: number) {
    return this.error({
      status: 429,
      message: 'Too many requests',
      error: 'Rate limit exceeded',
      code: 'TOO_MANY_REQUESTS',
      headers: {
        'Retry-After': retryAfter.toString(),
      },
    })
  }

  static serviceUnavailable(message = 'Service Unavailable') {
    return this.error({
      status: 503,
      message,
      error: 'Service temporarily unavailable',
      code: 'SERVICE_UNAVAILABLE',
    })
  }

  static created<T>(data: T, message = 'Resource created successfully') {
    return this.success(data, {
      status: 201,
      message,
    })
  }

  static noContent(message = 'No Content') {
    return this.success(null, {
      status: 204,
      message,
    })
  }

  static accepted<T>(data: T, message = 'Request accepted') {
    return this.success(data, {
      status: 202,
      message,
    })
  }
}