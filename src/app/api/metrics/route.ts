import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { startOfDay, endOfDay, subDays } from 'date-fns'

export async function GET() {
  try {
    // Collect various metrics
    const [
      userMetrics,
      careLogMetrics,
      communityMetrics,
      systemMetrics
    ] = await Promise.all([
      collectUserMetrics(),
      collectCareLogMetrics(),
      collectCommunityMetrics(),
      collectSystemMetrics()
    ])

    // Format metrics in Prometheus format
    const metrics = [
      ...formatUserMetrics(userMetrics),
      ...formatCareLogMetrics(careLogMetrics),
      ...formatCommunityMetrics(communityMetrics),
      ...formatSystemMetrics(systemMetrics)
    ].join('\n')

    return new NextResponse(metrics, {
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  } catch (error) {
    logger.error('Error collecting metrics:', error)
    return new NextResponse('Error collecting metrics', { status: 500 })
  }
}

async function collectUserMetrics() {
  const now = new Date()
  const today = startOfDay(now)
  const yesterday = subDays(today, 1)

  const [
    totalUsers,
    activeToday,
    activeYesterday,
    withStreaks
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        lastActive: {
          gte: today
        }
      }
    }),
    prisma.user.count({
      where: {
        lastActive: {
          gte: yesterday,
          lt: today
        }
      }
    }),
    prisma.streak.count({
      where: {
        count: {
          gt: 0
        }
      }
    })
  ])

  return {
    totalUsers,
    activeToday,
    activeYesterday,
    withStreaks
  }
}

async function collectCareLogMetrics() {
  const now = new Date()
  const today = startOfDay(now)

  const [
    totalEntries,
    entriesToday,
    entriesByType,
    activeStreaks
  ] = await Promise.all([
    prisma.careLogEntry.count(),
    prisma.careLogEntry.count({
      where: {
        timestamp: {
          gte: today
        }
      }
    }),
    prisma.careLogEntry.groupBy({
      by: ['type'],
      _count: true
    }),
    prisma.streak.count({
      where: {
        type: 'care_log',
        count: {
          gt: 0
        }
      }
    })
  ])

  return {
    totalEntries,
    entriesToday,
    entriesByType,
    activeStreaks
  }
}

async function collectCommunityMetrics() {
  const now = new Date()
  const today = startOfDay(now)

  const [
    totalPosts,
    postsToday,
    totalComments,
    commentsToday,
    totalLikes,
    likesToday
  ] = await Promise.all([
    prisma.communityPost.count(),
    prisma.communityPost.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    }),
    prisma.postComment.count(),
    prisma.postComment.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    }),
    prisma.postLike.count(),
    prisma.postLike.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    })
  ])

  return {
    totalPosts,
    postsToday,
    totalComments,
    commentsToday,
    totalLikes,
    likesToday
  }
}

async function collectSystemMetrics() {
  // Add system-specific metrics collection here
  return {
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage()
  }
}

function formatUserMetrics(metrics: any) {
  return [
    '# HELP mom_kidz_total_users Total number of registered users',
    '# TYPE mom_kidz_total_users gauge',
    `mom_kidz_total_users ${metrics.totalUsers}`,
    '# HELP mom_kidz_active_users_today Number of users active today',
    '# TYPE mom_kidz_active_users_today gauge',
    `mom_kidz_active_users_today ${metrics.activeToday}`,
    '# HELP mom_kidz_users_with_streaks Number of users with active streaks',
    '# TYPE mom_kidz_users_with_streaks gauge',
    `mom_kidz_users_with_streaks ${metrics.withStreaks}`
  ]
}

function formatCareLogMetrics(metrics: any) {
  const lines = [
    '# HELP mom_kidz_care_log_total_entries Total number of care log entries',
    '# TYPE mom_kidz_care_log_total_entries counter',
    `mom_kidz_care_log_total_entries ${metrics.totalEntries}`,
    '# HELP mom_kidz_care_log_entries_today Number of care log entries today',
    '# TYPE mom_kidz_care_log_entries_today gauge',
    `mom_kidz_care_log_entries_today ${metrics.entriesToday}`,
    '# HELP mom_kidz_care_log_entries_by_type Number of care log entries by type',
    '# TYPE mom_kidz_care_log_entries_by_type gauge'
  ]

  metrics.entriesByType.forEach((entry: any) => {
    lines.push(`mom_kidz_care_log_entries_by_type{type="${entry.type}"} ${entry._count}`)
  })

  return lines
}

function formatCommunityMetrics(metrics: any) {
  return [
    '# HELP mom_kidz_community_total_posts Total number of community posts',
    '# TYPE mom_kidz_community_total_posts counter',
    `mom_kidz_community_total_posts ${metrics.totalPosts}`,
    '# HELP mom_kidz_community_posts_today Number of posts today',
    '# TYPE mom_kidz_community_posts_today gauge',
    `mom_kidz_community_posts_today ${metrics.postsToday}`,
    '# HELP mom_kidz_community_total_comments Total number of comments',
    '# TYPE mom_kidz_community_total_comments counter',
    `mom_kidz_community_total_comments ${metrics.totalComments}`,
    '# HELP mom_kidz_community_comments_today Number of comments today',
    '# TYPE mom_kidz_community_comments_today gauge',
    `mom_kidz_community_comments_today ${metrics.commentsToday}`,
    '# HELP mom_kidz_community_total_likes Total number of likes',
    '# TYPE mom_kidz_community_total_likes counter',
    `mom_kidz_community_total_likes ${metrics.totalLikes}`,
    '# HELP mom_kidz_community_likes_today Number of likes today',
    '# TYPE mom_kidz_community_likes_today gauge',
    `mom_kidz_community_likes_today ${metrics.likesToday}`
  ]
}

function formatSystemMetrics(metrics: any) {
  return [
    '# HELP mom_kidz_system_uptime System uptime in seconds',
    '# TYPE mom_kidz_system_uptime counter',
    `mom_kidz_system_uptime ${Math.floor(metrics.uptime)}`,
    '# HELP mom_kidz_system_memory_usage Memory usage in bytes',
    '# TYPE mom_kidz_system_memory_usage gauge',
    `mom_kidz_system_memory_usage{type="heapTotal"} ${metrics.memoryUsage.heapTotal}`,
    `mom_kidz_system_memory_usage{type="heapUsed"} ${metrics.memoryUsage.heapUsed}`,
    `mom_kidz_system_memory_usage{type="rss"} ${metrics.memoryUsage.rss}`,
    '# HELP mom_kidz_system_cpu_usage CPU usage in microseconds',
    '# TYPE mom_kidz_system_cpu_usage counter',
    `mom_kidz_system_cpu_usage{type="user"} ${metrics.cpuUsage.user}`,
    `mom_kidz_system_cpu_usage{type="system"} ${metrics.cpuUsage.system}`
  ]
}
