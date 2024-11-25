import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export class CareLogUtils {
  /**
   * Generate insights from care log entries
   */
  static async generateInsights(userId: string, period: 'day' | 'week' | 'month' = 'week') {
    try {
      // Get date range
      const now = new Date()
      let startDate: Date, endDate: Date
      switch (period) {
        case 'day':
          startDate = startOfDay(now)
          endDate = endOfDay(now)
          break
        case 'week':
          startDate = startOfWeek(now)
          endDate = endOfWeek(now)
          break
        case 'month':
          startDate = startOfMonth(now)
          endDate = endOfMonth(now)
          break
      }

      // Get entries for the period
      const entries = await prisma.careLogEntry.findMany({
        where: {
          userId,
          timestamp: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          timestamp: 'asc'
        }
      })

      // Calculate basic metrics
      const totalEntries = entries.length
      const typeBreakdown = this.calculateTypeBreakdown(entries)
      const avgDuration = this.calculateAverageDuration(entries)
      const trends = this.identifyTrends(entries)
      const insights = this.generateInsightMessages(typeBreakdown, trends)

      // Save analytics
      await prisma.careLogAnalytics.upsert({
        where: {
          userId_period_startDate: {
            userId,
            period,
            startDate
          }
        },
        update: {
          endDate,
          totalEntries,
          typeBreakdown,
          avgDuration,
          trends,
          insights
        },
        create: {
          userId,
          period,
          startDate,
          endDate,
          totalEntries,
          typeBreakdown,
          avgDuration,
          trends,
          insights
        }
      })

      return {
        period,
        startDate,
        endDate,
        totalEntries,
        typeBreakdown,
        avgDuration,
        trends,
        insights
      }
    } catch (error) {
      logger.error('Error generating care log insights:', error)
      throw error
    }
  }

  /**
   * Calculate type breakdown
   */
  private static calculateTypeBreakdown(entries: any[]) {
    return entries.reduce((acc, entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + 1
      return acc
    }, {})
  }

  /**
   * Calculate average duration
   */
  private static calculateAverageDuration(entries: any[]) {
    const durationsSum = entries.reduce((sum, entry) => sum + (entry.duration || 0), 0)
    return entries.length > 0 ? durationsSum / entries.length : 0
  }

  /**
   * Identify trends in entries
   */
  private static identifyTrends(entries: any[]) {
    const trends = {
      mostCommonType: '',
      mostCommonTime: '',
      longestDuration: '',
      patterns: [] as string[]
    }

    if (entries.length === 0) return trends

    // Most common type
    const typeCount = this.calculateTypeBreakdown(entries)
    trends.mostCommonType = Object.entries(typeCount)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0][0]

    // Most common time
    const hourCount = entries.reduce((acc: Record<number, number>, entry) => {
      const hour = new Date(entry.timestamp).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {})
    const mostCommonHour = Object.entries(hourCount)
      .sort(([,a], [,b]) => b - a)[0][0]
    trends.mostCommonTime = `${mostCommonHour}:00`

    // Longest duration
    if (entries.some(e => e.duration)) {
      const longestEntry = entries
        .filter(e => e.duration)
        .sort((a, b) => (b.duration || 0) - (a.duration || 0))[0]
      trends.longestDuration = `${longestEntry.type} (${longestEntry.duration} minutes)`
    }

    // Identify patterns
    const consecutiveDays = this.findConsecutiveDays(entries)
    if (consecutiveDays > 1) {
      trends.patterns.push(`Consistent logging for ${consecutiveDays} consecutive days`)
    }

    return trends
  }

  /**
   * Generate insight messages
   */
  private static generateInsightMessages(typeBreakdown: any, trends: any) {
    const insights: string[] = []

    // Activity distribution insights
    const totalActivities = Object.values(typeBreakdown).reduce((a: any, b: any) => a + b, 0)
    Object.entries(typeBreakdown).forEach(([type, count]) => {
      const percentage = ((count as number) / totalActivities) * 100
      if (percentage > 30) {
        insights.push(`${type} activities make up ${Math.round(percentage)}% of your logs`)
      }
    })

    // Time-based insights
    if (trends.mostCommonTime) {
      insights.push(`Most activities are logged around ${trends.mostCommonTime}`)
    }

    // Pattern-based insights
    trends.patterns.forEach((pattern: string) => {
      insights.push(pattern)
    })

    return insights
  }

  /**
   * Find consecutive days
   */
  private static findConsecutiveDays(entries: any[]) {
    if (entries.length === 0) return 0

    const days = new Set(
      entries.map(entry => 
        new Date(entry.timestamp).toISOString().split('T')[0]
      )
    )

    const sortedDays = Array.from(days).sort()
    let maxConsecutive = 1
    let currentConsecutive = 1

    for (let i = 1; i < sortedDays.length; i++) {
      const prevDay = new Date(sortedDays[i - 1])
      const currentDay = new Date(sortedDays[i])
      const diffDays = (currentDay.getTime() - prevDay.getTime()) / (1000 * 60 * 60 * 24)

      if (diffDays === 1) {
        currentConsecutive++
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive)
      } else {
        currentConsecutive = 1
      }
    }

    return maxConsecutive
  }

  /**
   * Get care log summary
   */
  static async getCareLogSummary(userId: string) {
    try {
      const [dayInsights, weekInsights, monthInsights] = await Promise.all([
        this.generateInsights(userId, 'day'),
        this.generateInsights(userId, 'week'),
        this.generateInsights(userId, 'month')
      ])

      return {
        day: dayInsights,
        week: weekInsights,
        month: monthInsights
      }
    } catch (error) {
      logger.error('Error getting care log summary:', error)
      throw error
    }
  }
}

export default CareLogUtils