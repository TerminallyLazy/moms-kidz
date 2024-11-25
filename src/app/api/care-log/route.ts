import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { startOfDay, endOfDay } from 'date-fns'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    const type = searchParams.get('type')
    const date = dateParam ? new Date(dateParam) : new Date()

    // Build query
    const query: any = {
      where: {
        userId: session.user.id,
        timestamp: {
          gte: startOfDay(date),
          lte: endOfDay(date)
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    }

    // Add type filter if specified
    if (type && type !== 'all') {
      query.where.type = type
    }

    const entries = await prisma.careLogEntry.findMany(query)

    // Log analytics
    logger.info('Care log entries fetched', {
      userId: session.user.id,
      date: date.toISOString(),
      type,
      count: entries.length
    })

    return NextResponse.json(entries)
  } catch (error) {
    logger.error('Error fetching care log entries:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await request.json()
    const { type, title, description, timestamp, duration, metadata } = data

    // Validate required fields
    if (!type || !title) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Create entry
    const entry = await prisma.careLogEntry.create({
      data: {
        userId: session.user.id,
        type,
        title,
        description,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        duration,
        metadata
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    // Update analytics
    await prisma.userAnalytics.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        totalCareLogEntries: 1,
        lastCareLogEntry: new Date()
      },
      update: {
        totalCareLogEntries: { increment: 1 },
        lastCareLogEntry: new Date()
      }
    })

    // Log analytics
    logger.info('Care log entry created', {
      userId: session.user.id,
      entryId: entry.id,
      type
    })

    return NextResponse.json(entry)
  } catch (error) {
    logger.error('Error creating care log entry:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await request.json()
    const { id, ...updates } = data

    // Validate entry exists and belongs to user
    const existingEntry = await prisma.careLogEntry.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingEntry) {
      return new NextResponse('Entry not found', { status: 404 })
    }

    // Update entry
    const updatedEntry = await prisma.careLogEntry.update({
      where: { id },
      data: updates,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    // Log analytics
    logger.info('Care log entry updated', {
      userId: session.user.id,
      entryId: id,
      updates: Object.keys(updates)
    })

    return NextResponse.json(updatedEntry)
  } catch (error) {
    logger.error('Error updating care log entry:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return new NextResponse('Missing entry ID', { status: 400 })
    }

    // Validate entry exists and belongs to user
    const existingEntry = await prisma.careLogEntry.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingEntry) {
      return new NextResponse('Entry not found', { status: 404 })
    }

    // Delete entry
    await prisma.careLogEntry.delete({
      where: { id }
    })

    // Update analytics
    await prisma.userAnalytics.update({
      where: { userId: session.user.id },
      data: {
        totalCareLogEntries: { decrement: 1 }
      }
    })

    // Log analytics
    logger.info('Care log entry deleted', {
      userId: session.user.id,
      entryId: id
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    logger.error('Error deleting care log entry:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}