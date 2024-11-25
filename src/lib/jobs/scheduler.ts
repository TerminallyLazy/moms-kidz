import { logger } from '@/lib/logger'
import CareLogNotificationJob from './care-log-notifications'

interface JobConfig {
  name: string
  enabled: boolean
  interval: number // in milliseconds
  handler: () => Promise<void>
  lastRun?: Date
  nextRun?: Date
  status: 'idle' | 'running' | 'failed'
  error?: Error
}

export class JobScheduler {
  private static instance: JobScheduler
  private jobs: Map<string, JobConfig>
  private intervals: Map<string, NodeJS.Timeout>

  private constructor() {
    this.jobs = new Map()
    this.intervals = new Map()

    // Register jobs
    this.registerJobs()
  }

  public static getInstance(): JobScheduler {
    if (!JobScheduler.instance) {
      JobScheduler.instance = new JobScheduler()
    }
    return JobScheduler.instance
  }

  /**
   * Register all background jobs
   */
  private registerJobs() {
    // Care Log Notifications
    this.registerJob({
      name: 'care-log-notifications',
      enabled: true,
      interval: 60 * 60 * 1000, // 1 hour
      handler: async () => {
        await CareLogNotificationJob.run()
      }
    })

    // Add more jobs here as needed
  }

  /**
   * Register a new job
   */
  private registerJob(config: Omit<JobConfig, 'status' | 'lastRun' | 'nextRun'>) {
    this.jobs.set(config.name, {
      ...config,
      status: 'idle',
      lastRun: undefined,
      nextRun: new Date(Date.now() + config.interval)
    })

    logger.info(`Job registered: ${config.name}`, {
      interval: config.interval,
      enabled: config.enabled
    })
  }

  /**
   * Start all registered jobs
   */
  public startAll() {
    logger.info('Starting all jobs')

    for (const [name, config] of this.jobs.entries()) {
      if (config.enabled) {
        this.startJob(name)
      }
    }
  }

  /**
   * Stop all running jobs
   */
  public stopAll() {
    logger.info('Stopping all jobs')

    for (const [name] of this.jobs.entries()) {
      this.stopJob(name)
    }
  }

  /**
   * Start a specific job
   */
  public startJob(name: string) {
    const job = this.jobs.get(name)
    if (!job) {
      logger.error(`Job not found: ${name}`)
      return
    }

    if (this.intervals.has(name)) {
      logger.warn(`Job already running: ${name}`)
      return
    }

    const interval = setInterval(async () => {
      try {
        job.status = 'running'
        job.lastRun = new Date()
        job.nextRun = new Date(Date.now() + job.interval)

        logger.info(`Running job: ${name}`)
        await job.handler()

        job.status = 'idle'
        logger.info(`Job completed: ${name}`)
      } catch (error) {
        job.status = 'failed'
        job.error = error as Error
        logger.error(`Job failed: ${name}`, error)
      }
    }, job.interval)

    this.intervals.set(name, interval)
    logger.info(`Job started: ${name}`)

    // Run immediately on start
    job.handler().catch(error => {
      logger.error(`Initial job run failed: ${name}`, error)
    })
  }

  /**
   * Stop a specific job
   */
  public stopJob(name: string) {
    const interval = this.intervals.get(name)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(name)
      
      const job = this.jobs.get(name)
      if (job) {
        job.status = 'idle'
        job.nextRun = undefined
      }

      logger.info(`Job stopped: ${name}`)
    }
  }

  /**
   * Get job status
   */
  public getJobStatus(name: string) {
    const job = this.jobs.get(name)
    if (!job) return null

    return {
      name,
      enabled: job.enabled,
      status: job.status,
      lastRun: job.lastRun,
      nextRun: job.nextRun,
      error: job.error?.message
    }
  }

  /**
   * Get status of all jobs
   */
  public getAllJobStatus() {
    const status: Record<string, any> = {}
    for (const [name] of this.jobs.entries()) {
      status[name] = this.getJobStatus(name)
    }
    return status
  }

  /**
   * Run a job manually
   */
  public async runJob(name: string) {
    const job = this.jobs.get(name)
    if (!job) {
      throw new Error(`Job not found: ${name}`)
    }

    try {
      job.status = 'running'
      job.lastRun = new Date()
      
      logger.info(`Manually running job: ${name}`)
      await job.handler()
      
      job.status = 'idle'
      logger.info(`Manual job completed: ${name}`)
    } catch (error) {
      job.status = 'failed'
      job.error = error as Error
      logger.error(`Manual job failed: ${name}`, error)
      throw error
    }
  }

  /**
   * Enable a job
   */
  public enableJob(name: string) {
    const job = this.jobs.get(name)
    if (job) {
      job.enabled = true
      this.startJob(name)
      logger.info(`Job enabled: ${name}`)
    }
  }

  /**
   * Disable a job
   */
  public disableJob(name: string) {
    const job = this.jobs.get(name)
    if (job) {
      job.enabled = false
      this.stopJob(name)
      logger.info(`Job disabled: ${name}`)
    }
  }

  /**
   * Update job interval
   */
  public updateJobInterval(name: string, interval: number) {
    const job = this.jobs.get(name)
    if (job) {
      job.interval = interval
      if (this.intervals.has(name)) {
        this.stopJob(name)
        this.startJob(name)
      }
      logger.info(`Job interval updated: ${name}`, { interval })
    }
  }
}

// Export singleton instance
export default JobScheduler.getInstance()