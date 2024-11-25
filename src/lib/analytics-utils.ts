type AnalyticsEvent = {
  name: string;
  timestamp: number;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

export class AnalyticsUtils {
  private static events: AnalyticsEvent[] = []
  private static readonly MAX_EVENTS = 1000
  private static sessionId = crypto.randomUUID()
  private static initialized = false

  /**
   * Initialize analytics
   */
  static init(): void {
    if (this.initialized || typeof window === 'undefined') return

    try {
      // Track session start
      this.track('session_start', {
        referrer: document.referrer,
        userAgent: navigator.userAgent,
      })

      // Set up session tracking
      window.addEventListener('beforeunload', () => {
        this.track('session_end')
      })

      this.initialized = true
    } catch (error) {
      console.error('Error initializing analytics:', error)
    }
  }

  /**
   * Track event
   */
  static track(
    name: string,
    properties?: Record<string, any>,
    userId?: string
  ): void {
    try {
      const event: AnalyticsEvent = {
        name,
        timestamp: Date.now(),
        properties: {
          ...properties,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          path: typeof window !== 'undefined' ? window.location.pathname : undefined,
        },
        userId,
        sessionId: this.sessionId,
      }

      this.events.push(event)

      // Prevent memory leaks
      if (this.events.length > this.MAX_EVENTS) {
        this.events = this.events.slice(-this.MAX_EVENTS)
      }

      // Send to analytics service
      this.sendToAnalyticsService(event)
    } catch (error) {
      console.error('Error tracking event:', error)
    }
  }

  /**
   * Track page view
   */
  static trackPageView(
    path: string,
    properties?: Record<string, any>
  ): void {
    if (typeof document === 'undefined') return

    this.track('page_view', {
      path,
      title: document.title,
      referrer: document.referrer,
      ...properties,
    })
  }

  /**
   * Get events for analysis
   */
  static getEvents(options: {
    name?: string;
    startTime?: number;
    endTime?: number;
    userId?: string;
    limit?: number;
  } = {}): AnalyticsEvent[] {
    try {
      const { name, startTime, endTime, userId, limit } = options
      let filteredEvents = [...this.events]

      if (name) {
        filteredEvents = filteredEvents.filter(e => e.name === name)
      }

      if (startTime) {
        filteredEvents = filteredEvents.filter(e => e.timestamp >= startTime)
      }

      if (endTime) {
        filteredEvents = filteredEvents.filter(e => e.timestamp <= endTime)
      }

      if (userId) {
        filteredEvents = filteredEvents.filter(e => e.userId === userId)
      }

      if (limit) {
        filteredEvents = filteredEvents.slice(-limit)
      }

      return filteredEvents
    } catch (error) {
      console.error('Error getting events:', error)
      return []
    }
  }

  /**
   * Clear recorded events
   */
  static clearEvents(): void {
    this.events = []
  }

  /**
   * Send event to analytics service
   */
  private static async sendToAnalyticsService(
    event: AnalyticsEvent
  ): Promise<void> {
    try {
      if (process.env.NEXT_PUBLIC_ANALYTICS_URL) {
        await fetch(process.env.NEXT_PUBLIC_ANALYTICS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.NEXT_PUBLIC_ANALYTICS_KEY || '',
          },
          body: JSON.stringify(event),
        })
      }
    } catch (error) {
      console.error('Error sending event to analytics service:', error)
    }
  }

  /**
   * Get session metrics
   */
  static getSessionMetrics(): Record<string, number> {
    try {
      const sessionEvents = this.getEvents({
        sessionId: this.sessionId,
      })

      const startTime = sessionEvents[0]?.timestamp || Date.now()
      const duration = Date.now() - startTime

      return {
        totalEvents: sessionEvents.length,
        pageViews: sessionEvents.filter(e => e.name === 'page_view').length,
        errors: sessionEvents.filter(e => e.name === 'error').length,
        actions: sessionEvents.filter(e => e.name === 'user_action').length,
        sessionDuration: duration,
        averageEventInterval: sessionEvents.length > 1 ? duration / (sessionEvents.length - 1) : 0,
      }
    } catch (error) {
      console.error('Error getting session metrics:', error)
      return {
        totalEvents: 0,
        pageViews: 0,
        errors: 0,
        actions: 0,
        sessionDuration: 0,
        averageEventInterval: 0,
      }
    }
  }
}

export default AnalyticsUtils
