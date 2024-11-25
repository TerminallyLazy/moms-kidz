import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

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

  /**
   * Track user engagement and update analytics
   */
  static async trackUserEngagement(userId: string, action: {
    type: 'post' | 'comment' | 'like' | 'share' | 'podcast' | 'article',
    contentId: string
  }) {
    try {
      // Get or create user analytics
      const analytics = await prisma.userAnalytics.upsert({
        where: { userId },
        create: { userId },
        update: {}
      })

      // Update relevant metrics
      const updates: any = {
        lastActive: new Date()
      }

      switch (action.type) {
        case 'post':
          updates.totalPosts = analytics.totalPosts + 1
          break
        case 'comment':
          updates.totalComments = analytics.totalComments + 1
          break
        case 'like':
          updates.totalLikes = analytics.totalLikes + 1
          break
        case 'share':
          updates.totalShares = analytics.totalShares + 1
          break
      }

      // Calculate engagement score
      // Formula: (posts * 5 + comments * 3 + likes + shares * 2) / days_active
      const daysActive = Math.max(1, Math.floor(
        (new Date().getTime() - analytics.lastActive.getTime()) / (1000 * 60 * 60 * 24)
      ))

      updates.engagementScore = (
        (updates.totalPosts || analytics.totalPosts) * 5 +
        (updates.totalComments || analytics.totalComments) * 3 +
        (updates.totalLikes || analytics.totalLikes) +
        (updates.totalShares || analytics.totalShares) * 2
      ) / daysActive

      // Update analytics
      await prisma.userAnalytics.update({
        where: { userId },
        data: updates
      })

      logger.info('User engagement tracked', {
        userId,
        action,
        updates
      })
    } catch (error) {
      logger.error('Error tracking user engagement:', error)
    }
  }

  /**
   * Track content views and engagement
   */
  static async trackContentView(
    contentId: string,
    contentType: string,
    userId: string,
    duration?: number
  ) {
    try {
      const analytics = await prisma.contentAnalytics.upsert({
        where: {
          contentId_contentType: {
            contentId,
            contentType
          }
        },
        create: {
          contentId,
          contentType,
          views: 1,
          uniqueViews: 1,
          avgTimeSpent: duration || 0,
          metadata: { viewers: [userId] }
        },
        update: {
          views: { increment: 1 },
          avgTimeSpent: duration 
            ? { increment: duration }
            : undefined,
          metadata: {
            update: (current: any) => ({
              viewers: [...new Set([...(current?.viewers || []), userId])]
            })
          }
        }
      })

      // Update unique views if this is a new viewer
      if (!analytics.metadata?.viewers?.includes(userId)) {
        await prisma.contentAnalytics.update({
          where: {
            contentId_contentType: {
              contentId,
              contentType
            }
          },
          data: {
            uniqueViews: { increment: 1 }
          }
        })
      }

      logger.info('Content view tracked', {
        contentId,
        contentType,
        userId,
        duration
      })
    } catch (error) {
      logger.error('Error tracking content view:', error)
    }
  }

  /**
   * Track user streaks
   */
  static async trackStreak(userId: string, type: string) {
    try {
      const now = new Date()
      const streak = await prisma.streak.findUnique({
        where: {
          userId_type: {
            userId,
            type
          }
        }
      })

      if (!streak) {
        // Create new streak
        await prisma.streak.create({
          data: {
            userId,
            type,
            count: 1
          }
        })
        return 1
      }

      // Check if streak is still active (within 24 hours)
      const hoursSinceLastUpdate = Math.abs(
        now.getTime() - streak.lastUpdated.getTime()
      ) / 36e5

      if (hoursSinceLastUpdate <= 24) {
        // Update existing streak
        const updatedStreak = await prisma.streak.update({
          where: {
            userId_type: {
              userId,
              type
            }
          },
          data: {
            count: { increment: 1 },
            lastUpdated: now
          }
        })
        return updatedStreak.count
      } else {
        // Reset streak
        const updatedStreak = await prisma.streak.update({
          where: {
            userId_type: {
              userId,
              type
            }
          },
          data: {
            count: 1,
            lastUpdated: now,
            startedAt: now
          }
        })
        return updatedStreak.count
      }
    } catch (error) {
      logger.error('Error tracking streak:', error)
      return 0
    }
  }

  /**
   * Get user engagement summary
   */
  static async getUserEngagementSummary(userId: string) {
    try {
      const [analytics, streaks] = await Promise.all([
        prisma.userAnalytics.findUnique({
          where: { userId }
        }),
        prisma.streak.findMany({
          where: { userId }
        })
      ])

      return {
        analytics,
        streaks,
        summary: {
          isActive: analytics?.lastActive 
            ? (new Date().getTime() - analytics.lastActive.getTime()) < (24 * 60 * 60 * 1000)
            : false,
          totalEngagements: (analytics?.totalPosts || 0) +
            (analytics?.totalComments || 0) +
            (analytics?.totalLikes || 0) +
            (analytics?.totalShares || 0),
          currentStreaks: streaks.reduce((acc, streak) => ({
            ...acc,
            [streak.type]: streak.count
          }), {})
        }
      }
    } catch (error) {
      logger.error('Error getting user engagement summary:', error)
      return null
    }
  }

  /**
   * Get content performance metrics
   */
  static async getContentPerformance(contentId: string, contentType: string) {
    try {
      const analytics = await prisma.contentAnalytics.findUnique({
        where: {
          contentId_contentType: {
            contentId,
            contentType
          }
        }
      })

      if (!analytics) return null

      return {
        ...analytics,
        engagementRate: analytics.uniqueViews > 0
          ? (analytics.views / analytics.uniqueViews)
          : 0,
        averageTimeSpent: analytics.views > 0
          ? (analytics.avgTimeSpent / analytics.views)
          : 0
      }
    } catch (error) {
      logger.error('Error getting content performance:', error)
      return null
    }
  }
}

export default AnalyticsUtils
