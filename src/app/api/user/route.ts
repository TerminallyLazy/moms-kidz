import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        activities: {
          orderBy: { date: 'desc' },
          take: 5,
        },
        achievements: {
          orderBy: { date: 'desc' },
          take: 5,
        },
      },
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    // Calculate stats
    const stats = {
      activeDays: await prisma.activity.count({
        where: {
          userId: user.id,
          date: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
          },
        },
        distinct: ['date'],
      }),
      totalActivities: await prisma.activity.count({
        where: { userId: user.id },
      }),
      totalAchievements: await prisma.achievement.count({
        where: { userId: user.id },
      }),
    }

    return NextResponse.json({ user, stats })
  } catch (error) {
    console.error('Error fetching user data:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
