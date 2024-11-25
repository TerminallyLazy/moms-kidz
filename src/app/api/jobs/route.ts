import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logger } from '@/lib/logger'
import JobScheduler from '@/lib/jobs/scheduler'

// Get job status
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if user is admin
    const isAdmin = await checkUserIsAdmin(session.user.email)
    if (!isAdmin) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Get job name from query params
    const { searchParams } = new URL(request.url)
    const jobName = searchParams.get('job')

    // Return status for specific job or all jobs
    const status = jobName 
      ? JobScheduler.getJobStatus(jobName)
      : JobScheduler.getAllJobStatus()

    return NextResponse.json(status)
  } catch (error) {
    logger.error('Error getting job status:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// Control jobs (start, stop, run)
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if user is admin
    const isAdmin = await checkUserIsAdmin(session.user.email)
    if (!isAdmin) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const data = await request.json()
    const { action, job, interval } = data

    switch (action) {
      case 'start':
        if (job === 'all') {
          JobScheduler.startAll()
        } else {
          JobScheduler.startJob(job)
        }
        break

      case 'stop':
        if (job === 'all') {
          JobScheduler.stopAll()
        } else {
          JobScheduler.stopJob(job)
        }
        break

      case 'run':
        await JobScheduler.runJob(job)
        break

      case 'enable':
        JobScheduler.enableJob(job)
        break

      case 'disable':
        JobScheduler.disableJob(job)
        break

      case 'update-interval':
        if (!interval) {
          return new NextResponse('Interval is required', { status: 400 })
        }
        JobScheduler.updateJobInterval(job, interval)
        break

      default:
        return new NextResponse('Invalid action', { status: 400 })
    }

    // Return updated status
    const status = job === 'all' 
      ? JobScheduler.getAllJobStatus()
      : JobScheduler.getJobStatus(job)

    return NextResponse.json(status)
  } catch (error) {
    logger.error('Error controlling job:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// Helper function to check if user is admin
async function checkUserIsAdmin(email: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true }
    })
    return user?.role === 'ADMIN'
  } catch (error) {
    logger.error('Error checking user role:', error)
    return false
  }
}

// Options for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  })
}