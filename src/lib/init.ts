import { logger } from './logger'
import JobScheduler from './jobs/scheduler'
import { prisma } from './db'

export async function initializeApp() {
  try {
    logger.info('Initializing application...')

    // Check database connection
    await prisma.$connect()
    logger.info('Database connection established')

    // Initialize and start background jobs
    JobScheduler.startAll()
    logger.info('Background jobs initialized')

    // Set up error handlers
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection:', {
        reason,
        promise
      })
    })

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error)
      // Give logger time to flush
      setTimeout(() => process.exit(1), 1000)
    })

    // Graceful shutdown handler
    const shutdown = async () => {
      logger.info('Shutting down application...')

      // Stop all background jobs
      JobScheduler.stopAll()
      logger.info('Background jobs stopped')

      // Close database connection
      await prisma.$disconnect()
      logger.info('Database connection closed')

      // Exit process
      process.exit(0)
    }

    // Handle shutdown signals
    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)

    logger.info('Application initialized successfully')
  } catch (error) {
    logger.error('Error initializing application:', error)
    throw error
  }
}

// Export singleton instance
export default {
  initialize: initializeApp
}