import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import NotificationUtils from '@/lib/notification-utils'
import { startOfDay, endOfDay, differenceInHours } from 'date-fns'

export class CareLogNotificationJob {
  /**
   * Run the notification job
   */
  static async run() {
    try {
      logger.info('Starting care log notification job')

      await Promise.all([
        this.checkStreaks(),
        this.sendReminders(),
        this.checkMilestones(),
        this.checkInactiveUsers()
      ])

      logger.info('Care log notification job completed')
    } catch (error) {
      logger.error('Error running care log notification job:', error)
      throw error
    }
  }

  /**
   * Check user streaks
   */
  private static async checkStreaks() {
    try {
      const streaks = await prisma.streak.findMany({
        where: {
          type: 'care_log',
          count: {
            gt: 0
          }
        },
        include: {
          user: true
        }
      })

      for (const streak of streaks) {
        // Check if streak is at risk
        const lastEntry = await prisma.careLogEntry.findFirst({
          where: {
            userId: streak.userId
          },
          orderBy: {
            timestamp: 'desc'
          }
        })

        if (lastEntry) {
          const hoursSinceLastEntry = differenceInHours(new Date(), lastEntry.timestamp)
          
          if (hoursSinceLastEntry >= 18 && hoursSinceLastEntry < 24) {
            // Send streak at risk notification
            await NotificationUtils.sendCareLogReminder(
              streak.userId,
              24 - hoursSinceLastEntry
            )
          }
        }

        // Check for streak milestones
        if ([7, 30, 100].includes(streak.count)) {
          await NotificationUtils.sendStreakNotification(
            streak.userId,
            streak.count
          )
        }
      }
    } catch (error) {
      logger.error('Error checking streaks:', error)
    }
  }

  /**
   * Send daily reminders
   */
  private static async sendReminders() {
    try {
      const today = new Date()
      const users = await prisma.user.findMany({
        where: {
          careLogEntries: {
            none: {
              timestamp: {
                gte: startOfDay(today),
                lte: endOfDay(today)
              }
            }
          }
        }
      })

      const currentHour = today.getHours()
      
      for (const user of users) {
        // Morning reminder
        if (currentHour === 10) {
          await NotificationUtils.sendCareLogReminder(user.id, 14)
        }
        // Evening reminder
        else if (currentHour === 20) {
          await NotificationUtils.sendCareLogReminder(user.id, 4)
        }
      }
    } catch (error) {
      logger.error('Error sending reminders:', error)
    }
  }

  /**
   * Check for milestones
   */
  private static async checkMilestones() {
    try {
      const users = await prisma.user.findMany({
        include: {
          _count: {
            select: {
              careLogEntries: true
            }
          }
        }
      })

      const milestones = [100, 500, 1000, 5000]

      for (const user of users) {
        const entryCount = user._count.careLogEntries
        const nextMilestone = milestones.find(m => m === entryCount)

        if (nextMilestone) {
          await NotificationUtils.sendAchievementNotification(user.id, {
            title: `${nextMilestone} Care Logs`,
            description: `You've logged ${nextMilestone} care activities!`,
            type: 'milestone'
          })
        }
      }
    } catch (error) {
      logger.error('Error checking milestones:', error)
    }
  }

  /**
   * Check for inactive users
   */
  private static async checkInactiveUsers() {
    try {
      const inactiveThresholds = {
        warning: 3, // days
        alert: 7    // days
      }

      const users = await prisma.user.findMany({
        include: {
          careLogEntries: {
            orderBy: {
              timestamp: 'desc'
            },
            take: 1
          }
        }
      })

      for (const user of users) {
        if (user.careLogEntries.length === 0) continue

        const lastEntry = user.careLogEntries[0]
        const daysSinceLastEntry = differenceInHours(new Date(), lastEntry.timestamp) / 24

        if (daysSinceLastEntry >= inactiveThresholds.alert) {
          await NotificationUtils.sendAlertNotification({
            userId: user.id,
            severity: 'high',
            category: 'inactivity',
            summary: 'Extended Inactivity Detected',
            description: `No care log entries for ${Math.floor(daysSinceLastEntry)} days`
          })
        } else if (daysSinceLastEntry >= inactiveThresholds.warning) {
          await NotificationUtils.sendNotification({
            userId: user.id,
            type: 'alert',
            priority: 'medium',
            title: 'Activity Reminder',
            message: "We've noticed you haven't logged any care activities recently. Need help getting back on track?",
            action: {
              type: 'LOG_CARE',
              url: '/dashboard/care-log/new'
            }
          })
        }
      }
    } catch (error) {
      logger.error('Error checking inactive users:', error)
    }
  }

  /**
   * Schedule the job
   */
  static schedule() {
    // Run every hour
    const INTERVAL = 60 * 60 * 1000 // 1 hour

    setInterval(() => {
      this.run().catch(error => {
        logger.error('Error in scheduled care log notification job:', error)
      })
    }, INTERVAL)

    logger.info('Care log notification job scheduled')
  }
}

export default CareLogNotificationJob