"use client"

import { 
  InitializationEvent, 
  InitializationLogger, 
  InitializationMetrics,
  InitializationStage,
  InitializationStats
} from "@/types/initialization"

class InitializationLoggerImpl implements InitializationLogger {
  private events: InitializationEvent[] = []
  private maxEvents: number = 1000 // Prevent memory leaks

  log(event: InitializationEvent): void {
    this.events.push({
      ...event,
      timestamp: new Date()
    })

    // Keep only the last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Initialization]', event.type, {
        stage: event.stage,
        ...event.data
      })
    }
  }

  getEvents(): InitializationEvent[] {
    return [...this.events]
  }

  clear(): void {
    this.events = []
  }

  getMetrics(): InitializationMetrics {
    const stageEvents = new Map<InitializationStage, InitializationEvent[]>()
    let totalTime = 0
    let retryCount = 0
    let criticalFailures = 0

    // Group events by stage
    this.events.forEach(event => {
      if (event.stage) {
        const stageEvents_ = stageEvents.get(event.stage) || []
        stageEvents_.push(event)
        stageEvents.set(event.stage, stageEvents_)
      }

      if (event.type === 'retry') {
        retryCount++
      }

      if (event.type === 'stage-failed' && event.data?.error?.details?.critical) {
        criticalFailures++
      }
    })

    // Calculate stage metrics
    const stageMetrics: Record<InitializationStage, {
      time: number
      attempts: number
      success: boolean
    }> = {} as any

    stageEvents.forEach((events, stage) => {
      const startEvent = events.find(e => e.type === 'start')
      const completeEvent = events.find(e => e.type === 'stage-complete')
      const failEvent = events.find(e => e.type === 'stage-failed')
      const retryEvents = events.filter(e => e.type === 'retry')

      const time = startEvent && (completeEvent || failEvent) 
        ? (completeEvent || failEvent)!.timestamp.getTime() - startEvent.timestamp.getTime()
        : 0

      totalTime += time

      stageMetrics[stage] = {
        time,
        attempts: retryEvents.length + 1,
        success: !!completeEvent
      }
    })

    // Calculate overall metrics
    const totalStages = Object.keys(stageMetrics).length
    const successfulStages = Object.values(stageMetrics).filter(m => m.success).length
    const averageStageTime = totalTime / totalStages

    return {
      totalTime,
      averageStageTime,
      retryCount,
      failureRate: (totalStages - successfulStages) / totalStages,
      successRate: successfulStages / totalStages,
      criticalFailures,
      stageMetrics
    }
  }

  getStats(): InitializationStats {
    const startEvent = this.events.find(e => e.type === 'start')
    const completeEvent = this.events.find(e => e.type === 'complete')
    const stageStats: InitializationStats['stageStats'] = {} as any

    // Initialize stage stats
    this.events
      .filter(e => e.stage)
      .forEach(event => {
        if (!event.stage) return

        if (!stageStats[event.stage]) {
          stageStats[event.stage] = {
            attempts: 0,
            duration: 0,
            status: 'pending'
          }
        }

        const stats = stageStats[event.stage]

        switch (event.type) {
          case 'start':
            stats.attempts++
            break
          case 'stage-complete':
            stats.status = 'success'
            break
          case 'stage-failed':
            stats.status = 'failed'
            stats.error = event.data?.error
            break
        }
      })

    return {
      startTime: startEvent?.timestamp || new Date(),
      endTime: completeEvent?.timestamp,
      totalDuration: completeEvent 
        ? completeEvent.timestamp.getTime() - startEvent!.timestamp.getTime()
        : undefined,
      stageStats
    }
  }

  // Get a summary of the initialization process
  getSummary(): string {
    const stats = this.getStats()
    const metrics = this.getMetrics()

    return `
Initialization Summary:
----------------------
Total Time: ${metrics.totalTime}ms
Success Rate: ${(metrics.successRate * 100).toFixed(1)}%
Retry Count: ${metrics.retryCount}
Critical Failures: ${metrics.criticalFailures}

Stage Details:
${Object.entries(stats.stageStats)
  .map(([stage, stats]) => `
  ${stage}:
    Status: ${stats.status}
    Attempts: ${stats.attempts}
    ${stats.error ? `Error: ${stats.error.message}` : ''}
  `)
  .join('\n')}

Performance:
  Average Stage Time: ${metrics.averageStageTime.toFixed(1)}ms
  Total Duration: ${stats.totalDuration || 'N/A'}ms
    `.trim()
  }
}

export const initLogger = new InitializationLoggerImpl()