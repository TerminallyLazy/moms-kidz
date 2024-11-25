import { prisma } from '@/lib/db'
import { logger } from './logger'
import { supabase } from './supabase'

interface NotificationOptions {
  userId?: string
  type: 'streak' | 'reminder' | 'achievement' | 'alert' | 'system'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  message: string
  metadata?: Record<string, any>
  action?: {
    type: string
    url?: string
    data?: Record<string, any>
  }
}

export class NotificationUtils {
  /**
   * Send a notification to a user or broadcast to all users
   */
  static async sendNotification(options: NotificationOptions) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: options.userId,
          type: options.type,
          priority: options.priority,
          title: options.title,
          message: options.message,
          metadata: options.metadata || {},
          action: options.action,
          read: false,
          createdAt: new Date()
        }
      })

      // Log notification
      logger.info('Notification created', {
        notificationId: notification.id,
        userId: options.userId,
        type: options.type,
        priority: options.priority
      })

      // Send real-time notification via Supabase
      if (options.userId) {
        await this.sendRealtimeNotification(notification)
      }

      // Send push notification if enabled
      await this.sendPushNotification(notification)

      return notification
    } catch (error) {
      logger.error('Error sending notification:', error)
      throw error
    }
  }

  /**
   * Send care log streak notifications
   */
  static async sendStreakNotification(userId: string, streakCount: number) {
    const messages = {
      milestone: [
        { count: 7, message: "You've maintained a week-long streak!" },
        { count: 30, message: "Amazing! A full month of consistent logging!" },
        { count: 100, message: "Incredible! 100 days of care logging!" }
      ],
      reminder: [
        { hours: 18, message: "Don't forget to log today's care activities" },
        { hours: 22, message: "Last chance to maintain your streak today!" }
      ]
    }

    // Check for milestone notifications
    const milestone = messages.milestone.find(m => m.count === streakCount)
    if (milestone) {
      await this.sendNotification({
        userId,
        type: 'streak',
        priority: 'medium',
        title: 'Streak Milestone!',
        message: milestone.message,
        metadata: { streakCount },
        action: {
          type: 'VIEW_STREAK',
          url: '/dashboard/streaks'
        }
      })
    }
  }

  /**
   * Send care log reminder notifications
   */
  static async sendCareLogReminder(userId: string, hoursRemaining: number) {
    const reminder = {
      title: 'Care Log Reminder',
      message: hoursRemaining > 20 
        ? "Don't forget to log today's care activities"
        : "Last chance to maintain your streak today!",
      priority: hoursRemaining > 20 ? 'low' : 'medium' as 'low' | 'medium'
    }

    await this.sendNotification({
      userId,
      type: 'reminder',
      priority: reminder.priority,
      title: reminder.title,
      message: reminder.message,
      metadata: { hoursRemaining },
      action: {
        type: 'LOG_CARE',
        url: '/dashboard/care-log/new'
      }
    })
  }

  /**
   * Send achievement notifications
   */
  static async sendAchievementNotification(userId: string, achievement: any) {
    await this.sendNotification({
      userId,
      type: 'achievement',
      priority: 'medium',
      title: 'New Achievement Unlocked!',
      message: `You've earned the "${achievement.title}" achievement!`,
      metadata: { achievement },
      action: {
        type: 'VIEW_ACHIEVEMENT',
        url: `/dashboard/achievements/${achievement.id}`
      }
    })
  }

  /**
   * Send alert notifications
   */
  static async sendAlertNotification(alert: any) {
    const users = alert.userId 
      ? [alert.userId]
      : await this.getAdminUsers()

    for (const userId of users) {
      await this.sendNotification({
        userId,
        type: 'alert',
        priority: alert.severity as 'low' | 'medium' | 'high' | 'urgent',
        title: alert.summary,
        message: alert.description,
        metadata: {
          alertId: alert.id,
          category: alert.category,
          severity: alert.severity
        },
        action: {
          type: 'VIEW_ALERT',
          url: `/dashboard/alerts/${alert.id}`
        }
      })
    }
  }

  /**
   * Send real-time notification via Supabase
   */
  private static async sendRealtimeNotification(notification: any) {
    try {
      await supabase
        .from('realtime_notifications')
        .insert([notification])

      logger.info('Real-time notification sent', {
        notificationId: notification.id,
        userId: notification.userId
      })
    } catch (error) {
      logger.error('Error sending real-time notification:', error)
    }
  }

  /**
   * Send push notification
   */
  private static async sendPushNotification(notification: any) {
    try {
      const subscriptions = await prisma.pushSubscription.findMany({
        where: {
          userId: notification.userId,
          active: true
        }
      })

      for (const subscription of subscriptions) {
        // Implement push notification sending logic here
        // This could use web-push or a similar library
      }
    } catch (error) {
      logger.error('Error sending push notification:', error)
    }
  }

  /**
   * Get admin users
   */
  private static async getAdminUsers(): Promise<string[]> {
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true
      }
    })
    return admins.map(admin => admin.id)
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string) {
    try {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true }
      })

      logger.info('Notification marked as read', { notificationId })
    } catch (error) {
      logger.error('Error marking notification as read:', error)
      throw error
    }
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(userId: string, options: {
    unreadOnly?: boolean
    limit?: number
    offset?: number
  } = {}) {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId,
          ...(options.unreadOnly ? { read: false } : {})
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: options.limit,
        skip: options.offset
      })

      return notifications
    } catch (error) {
      logger.error('Error fetching user notifications:', error)
      throw error
    }
  }
}

export default NotificationUtils