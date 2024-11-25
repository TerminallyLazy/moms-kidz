type PerformanceMetric = {
  name: string;
  startTime: number;
  duration: number;
  metadata?: Record<string, any>;
}

export class PerformanceUtils {
  private static metrics: PerformanceMetric[] = []
  private static timers: Map<string, number> = new Map()
  private static readonly MAX_METRICS = 1000

  /**
   * Start timing an operation
   */
  static startTimer(name: string): void {
    try {
      if (typeof performance === 'undefined') return
      this.timers.set(name, performance.now())
    } catch (error) {
      console.error('Error starting timer:', error)
    }
  }

  /**
   * End timing an operation and record metric
   */
  static endTimer(name: string, metadata?: Record<string, any>): number {
    try {
      if (typeof performance === 'undefined') return 0
      const startTime = this.timers.get(name)
      if (!startTime) {
        throw new Error(`No timer found for: ${name}`)
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      this.recordMetric({
        name,
        startTime,
        duration,
        metadata,
      })

      this.timers.delete(name)
      return duration
    } catch (error) {
      console.error('Error ending timer:', error)
      return 0
    }
  }

  /**
   * Record a performance metric
   */
  static recordMetric(metric: PerformanceMetric): void {
    try {
      this.metrics.push(metric)
      
      // Prevent memory leaks by limiting metrics array
      if (this.metrics.length > this.MAX_METRICS) {
        this.metrics = this.metrics.slice(-this.MAX_METRICS)
      }

      // Log slow operations
      if (metric.duration > 1000) {
        console.warn('Slow operation detected:', {
          ...metric,
          threshold: '1000ms',
        })
      }
    } catch (error) {
      console.error('Error recording metric:', error)
    }
  }

  /**
   * Get metrics for analysis
   */
  static getMetrics(options: {
    name?: string;
    minDuration?: number;
    maxDuration?: number;
    limit?: number;
  } = {}): PerformanceMetric[] {
    try {
      const { name, minDuration, maxDuration, limit } = options
      let filteredMetrics = [...this.metrics]

      if (name) {
        filteredMetrics = filteredMetrics.filter(m => m.name === name)
      }

      if (minDuration !== undefined) {
        filteredMetrics = filteredMetrics.filter(m => m.duration >= minDuration)
      }

      if (maxDuration !== undefined) {
        filteredMetrics = filteredMetrics.filter(m => m.duration <= maxDuration)
      }

      if (limit) {
        filteredMetrics = filteredMetrics.slice(-limit)
      }

      return filteredMetrics
    } catch (error) {
      console.error('Error getting metrics:', error)
      return []
    }
  }

  /**
   * Clear recorded metrics
   */
  static clearMetrics(): void {
    this.metrics = []
  }

  /**
   * Format duration for display
   */
  static formatDuration(duration: number): string {
    try {
      if (duration < 1) return `${(duration * 1000).toFixed(2)}μs`
      if (duration < 1000) return `${duration.toFixed(2)}ms`
      return `${(duration / 1000).toFixed(2)}s`
    } catch (error) {
      console.error('Error formatting duration:', error)
      return `${duration}ms`
    }
  }

  /**
   * Get web vitals metrics if available
   */
  static getWebVitals(): Record<string, number> {
    if (typeof window === 'undefined' || typeof performance === 'undefined') {
      return {}
    }

    try {
      const entries = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      return {
        fcp: this.getFCP(),
        lcp: this.getLCP(),
        cls: this.getCLS(),
        fid: this.getFID(),
        ttfb: entries?.responseStart - entries?.requestStart || 0,
        domLoad: entries?.domContentLoadedEventEnd - entries?.navigationStart || 0,
        windowLoad: entries?.loadEventEnd - entries?.navigationStart || 0,
      }
    } catch (error) {
      console.error('Error getting web vitals:', error)
      return {}
    }
  }

  private static getFCP(): number {
    if (typeof performance === 'undefined') return 0
    const entry = performance.getEntriesByName('first-contentful-paint')[0]
    return entry ? entry.startTime : 0
  }

  private static getLCP(): number {
    if (typeof performance === 'undefined') return 0
    const entries = performance.getEntriesByType('largest-contentful-paint')
    const lastEntry = entries[entries.length - 1]
    return lastEntry ? lastEntry.startTime : 0
  }

  private static getCLS(): number {
    if (typeof window === 'undefined') return 0
    let cls = 0
    if (typeof PerformanceObserver !== 'undefined') {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            cls += (entry as any).value
          }
        }
      }).observe({ type: 'layout-shift', buffered: true })
    }
    return cls
  }

  private static getFID(): number {
    if (typeof window === 'undefined') return 0
    let fid = 0
    if (typeof PerformanceObserver !== 'undefined') {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          fid = entry.processingStart - entry.startTime
        }
      }).observe({ type: 'first-input', buffered: true })
    }
    return fid
  }
}

export default PerformanceUtils
