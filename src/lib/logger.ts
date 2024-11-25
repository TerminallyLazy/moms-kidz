type LogLevel = 'debug' | 'info' | 'warn' | 'error'

type LogContext = Record<string, any>

export class Logger {
  private static instance: Logger
  private environment: string

  private constructor() {
    this.environment = process.env.NODE_ENV || 'development'
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private formatMessage(level: LogLevel, message: string, error?: Error, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const baseInfo = {
      timestamp,
      level,
      message,
    }

    if (error) {
      return JSON.stringify({
        ...baseInfo,
        error: {
          name: error.name,
          message: error.message,
          stack: this.environment === 'development' ? error.stack : undefined,
        },
        ...context,
      })
    }

    return JSON.stringify({ ...baseInfo, ...context })
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.environment === 'test') return false
    if (this.environment === 'production' && level === 'debug') return false
    return true
  }

  public debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, undefined, context))
    }
  }

  public info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, undefined, context))
    }
  }

  public warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, undefined, context))
    }
  }

  public error(message: string, error?: Error, context?: LogContext): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, error, context))
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance()

// Export convenience methods
export const debug = (message: string, context?: LogContext) => logger.debug(message, context)
export const info = (message: string, context?: LogContext) => logger.info(message, context)
export const warn = (message: string, context?: LogContext) => logger.warn(message, context)
export const error = (message: string, error?: Error, context?: LogContext) => logger.error(message, error, context)

export default logger
