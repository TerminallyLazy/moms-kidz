import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { startOfDay, subDays, startOfWeek, startOfMonth, endOfDay } from 'date-fns'

export async function GET() {
  try {
    const [
      dailyMetrics,
      weeklyMetrics,
      monthlyMetrics,
      typeDistribution,
      userEngagement,
      streakMetrics
    ] = await Promise.all([
      collectDailyMetrics(),
      collectWeeklyMetrics(),
      collectMonthlyMetrics(),
      collectTypeDistribution(),
      collectUserEngagement(),
      collectStreakMetrics()
    ])

    // Format metrics in Prometheus format
    const metrics = [
      ...formatDailyMetrics(dailyMetrics),
      ...formatWeeklyMetrics(weeklyMetrics),
      ...formatMonthlyMetrics(monthlyMetrics),
      ...formatTypeDistribution(typeDistribution),
      ...formatUserEngagement(userEngagement),
      ...formatStreakMetrics(streakMetrics)
    ].join('\n')

    return new NextResponse(metrics, {
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  } catch (error) {
    logger.error('Error collecting care log metrics:', error)
    return new NextResponse('Error collecting metrics', { status: 500 })
  }
}

async function collectDailyMetrics() {
  const today = startOfDay(new Date())
  const yesterday = subDays(today, 1)

  return await prisma.$transaction([
    // Today's entries
    prisma.careLogEntry.count({
      where: {
        timestamp: {
          gte: today
        }
      }
    }),
    // Yesterday's entries
    prisma.careLogEntry.count({
      where: {
        timestamp: {
          gte: yesterday,
          lt: today
        }
      }
    }),
    // Average duration today
    prisma.careLogEntry.aggregate({
      where: {
        timestamp: {
          gte: today
        },
        duration: {
          not: null
        }
      },
      _avg: {
        duration: true
      }
    })
  ])
}

async function collectWeeklyMetrics() {
  const weekStart = startOfWeek(new Date())
  
  return await prisma.$transaction([
    // Entries this week
    prisma.careLogEntry.count({
      where: {
        timestamp: {
          gte: weekStart
        }
      }
    }),
    // Active users this week
    prisma.careLogEntry.groupBy({
      by: ['userId'],
      where: {
        timestamp: {
          gte: weekStart
        }
      },
      _count: true
    }),
    // Average entries per day this week
    prisma.careLogEntry.groupBy({
      by: ['timestamp'],
      where: {
        timestamp: {
          gte: weekStart
        }
      },
      _count: true
    })
  ])
}

async function collectMonthlyMetrics() {
  const monthStart = startOfMonth(new Date())

  return await prisma.$transaction([
    // Total entries this month
    prisma.careLogEntry.count({
      where: {
        timestamp: {
          gte: monthStart
        }
      }
    }),
    // Entries by user this month
    prisma.careLogEntry.groupBy({
      by: ['userId'],
      where: {
        timestamp: {
          gte: monthStart
        }
      },
      _count: true
    }),
    // Average duration this month
    prisma.careLogEntry.aggregate({
      where: {
        timestamp: {
          gte: monthStart
        },
        duration: {
          not: null
        }
      },
      _avg: {
        duration: true
      }
    })
  ])
}

async function collectTypeDistribution() {
  return await prisma.careLogEntry.groupBy({
    by: ['type'],
    _count: true,
    orderBy: {
      _count: {
        _all: 'desc'
      }
    }
  })
}

async function collectUserEngagement() {
  const today = startOfDay(new Date())

  return await prisma.$transaction([
    // Users with entries today
    prisma.careLogEntry.groupBy({
      by: ['userId'],
      where: {
        timestamp: {
          gte: today
        }
      },
      _count: true
    }),
    // Users with consistent daily entries
    prisma.streak.findMany({
      where: {
        type: 'care_log',
        count: {
          gt: 0
        }
      },
      select: {
        userId: true,
        count: true
      }
    })
  ])
}

async function collectStreakMetrics() {
  return await prisma.$transaction([
    // Current streaks distribution
    prisma.streak.groupBy({
      by: ['count'],
      where: {
        type: 'care_log'
      },
      _count: true
    }),
    // Longest streaks
    prisma.streak.findMany({
      where: {
        type: 'care_log'
      },
      orderBy: {
        count: 'desc'
      },
      take: 10,
      select: {
        userId: true,
        count: true
      }
    })
  ])
}

function formatDailyMetrics(metrics: any[]) {
  const [todayCount, yesterdayCount, avgDuration] = metrics
  return [
    '# HELP mom_kidz_care_log_entries_today Number of care log entries today',
    '# TYPE mom_kidz_care_log_entries_today gauge',
    `mom_kidz_care_log_entries_today ${todayCount}`,
    '# HELP mom_kidz_care_log_entries_yesterday Number of care log entries yesterday',
    '# TYPE mom_kidz_care_log_entries_yesterday gauge',
    `mom_kidz_care_log_entries_yesterday ${yesterdayCount}`,
    '# HELP mom_kidz_care_log_avg_duration_today Average duration of care log entries today',
    '# TYPE mom_kidz_care_log_avg_duration_today gauge',
    `mom_kidz_care_log_avg_duration_today ${avgDuration._avg.duration || 0}`
  ]
}

function formatWeeklyMetrics(metrics: any[]) {
  const [weeklyCount, activeUsers, dailyEntries] = metrics
  return [
    '# HELP mom_kidz_care_log_entries_week Number of care log entries this week',
    '# TYPE mom_kidz_care_log_entries_week gauge',
    `mom_kidz_care_log_entries_week ${weeklyCount}`,
    '# HELP mom_kidz_care_log_active_users_week Number of active users this week',
    '# TYPE mom_kidz_care_log_active_users_week gauge',
    `mom_kidz_care_log_active_users_week ${activeUsers.length}`,
    '# HELP mom_kidz_care_log_avg_entries_per_day Average entries per day this week',
    '# TYPE mom_kidz_care_log_avg_entries_per_day gauge',
    `mom_kidz_care_log_avg_entries_per_day ${dailyEntries.length > 0 ? weeklyCount / dailyEntries.length : 0}`
  ]
}

function formatMonthlyMetrics(metrics: any[]) {
  const [monthlyCount, userEntries, avgDuration] = metrics
  return [
    '# HELP mom_kidz_care_log_entries_month Number of care log entries this month',
    '# TYPE mom_kidz_care_log_entries_month gauge',
    `mom_kidz_care_log_entries_month ${monthlyCount}`,
    '# HELP mom_kidz_care_log_active_users_month Number of active users this month',
    '# TYPE mom_kidz_care_log_active_users_month gauge',
    `mom_kidz_care_log_active_users_month ${userEntries.length}`,
    '# HELP mom_kidz_care_log_avg_duration_month Average duration of care log entries this month',
    '# TYPE mom_kidz_care_log_avg_duration_month gauge',
    `mom_kidz_care_log_avg_duration_month ${avgDuration._avg.duration || 0}`
  ]
}

function formatTypeDistribution(distribution: any[]) {
  const lines = [
    '# HELP mom_kidz_care_log_entries_by_type Number of care log entries by type',
    '# TYPE mom_kidz_care_log_entries_by_type gauge'
  ]

  distribution.forEach(({ type, _count }) => {
    lines.push(`mom_kidz_care_log_entries_by_type{type="${type}"} ${_count}`)
  })

  return lines
}

function formatUserEngagement(metrics: any[]) {
  const [activeToday, streaks] = metrics
  return [
    '# HELP mom_kidz_care_log_active_users_today Number of users with entries today',
    '# TYPE mom_kidz_care_log_active_users_today gauge',
    `mom_kidz_care_log_active_users_today ${activeToday.length}`,
    '# HELP mom_kidz_care_log_users_with_streaks Number of users with active streaks',
    '# TYPE mom_kidz_care_log_users_with_streaks gauge',
    `mom_kidz_care_log_users_with_streaks ${streaks.length}`
  ]
}

function formatStreakMetrics(metrics: any[]) {
  const [distribution, topStreaks] = metrics
  const lines = [
    '# HELP mom_kidz_care_log_streak_distribution Distribution of streak lengths',
    '# TYPE mom_kidz_care_log_streak_distribution gauge'
  ]

  distribution.forEach(({ count, _count }) => {
    lines.push(`mom_kidz_care_log_streak_distribution{length="${count}"} ${_count}`)
  })

  lines.push(
    '# HELP mom_kidz_care_log_longest_streak Longest active streak',
    '# TYPE mom_kidz_care_log_longest_streak gauge',
    `mom_kidz_care_log_longest_streak ${topStreaks[0]?.count || 0}`
  )

  return lines
}