import { logger } from './logger'

interface ErrorDetails {
  code?: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
}

export class ErrorUtils {
  /**
   * Create standardized error object
   */
  static createError(
    message: string,
    options: {
      code?: string;
      cause?: Error;
      context?: Record<string, any>;
    } = {}
  ): Error {
    const { code, cause, context } = options
    const error = new Error(message, { cause })

    if (code) {
      Object.defineProperty(error, 'code', {
        value: code,
        enumerable: true,
      })
    }

    if (context) {
      Object.defineProperty(error, 'context', {
        value: context,
        enumerable: true,
      })
    }

    return error
  }

  /**
   * Format error for logging or display
   */
  static formatError(error: unknown): ErrorDetails {
    try {
      if (error instanceof Error) {
        return {
          code: (error as any).code,
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          context: (error as any).context,
        }
      }

      if (typeof error === 'string') {
        return {
          message: error,
        }
      }

      return {
        message: 'An unknown error occurred',
        context: { originalError: error },
      }
    } catch (formatError) {
      logger.error('Error formatting error', formatError as Error)
      return {
        message: 'Error formatting failed',
      }
    }
  }

  /**
   * Handle async errors
   */
  static async handleAsync<T>(
    promise: Promise<T>,
    options: {
      errorMessage?: string;
      context?: Record<string, any>;
    } = {}
  ): Promise<[T | null, Error | null]> {
    try {
      const result = await promise
      return [result, null]
    } catch (error) {
      const formattedError = this.createError(
        options.errorMessage || (error as Error).message,
        {
          cause: error as Error,
          context: options.context,
        }
      )
      return [null, formattedError]
    }
  }

  /**
   * Check if error is of specific type
   */
  static isErrorType<T extends Error>(
    error: unknown,
    errorType: new (...args: any[]) => T
  ): error is T {
    return error instanceof errorType
  }

  /**
   * Get error code
   */
  static getErrorCode(error: unknown): string | undefined {
    if (error instanceof Error) {
      return (error as any).code
    }
    return undefined
  }

  /**
   * Get error message for display
   */
  static getDisplayMessage(
    error: unknown,
    defaultMessage = 'An unexpected error occurred'
  ): string {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return defaultMessage
  }

  /**
   * Report error to logging service
   */
  static reportError(
    error: unknown,
    options: {
      context?: Record<string, any>;
      level?: 'error' | 'warning' | 'info';
    } = {}
  ): void {
    const { context, level = 'error' } = options
    const formattedError = this.formatError(error)

    logger[level](formattedError.message, error instanceof Error ? error : undefined, {
      ...formattedError,
      ...context,
    })

    // Add additional error reporting services here
    // e.g., Sentry, LogRocket, etc.
  }
}

/**
 * Custom error classes
 */
export class ValidationError extends Error {
  constructor(message: string, public details?: Record<string, string[]>) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Permission denied') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends Error {
  constructor(message = 'Resource conflict') {
    super(message)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends Error {
  constructor(message = 'Rate limit exceeded') {
    super(message)
    this.name = 'RateLimitError'
  }
}

export default ErrorUtils
