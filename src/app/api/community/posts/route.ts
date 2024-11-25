import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'trending'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    let posts

    switch (type) {
      case 'trending':
        posts = await prisma.communityPost.findMany({
          take: limit,
          skip,
          orderBy: [
            { likes: 'desc' },
            { comments: 'desc' },
            { createdAt: 'desc' }
          ],
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            tags: true,
            _count: {
              select: {
                likes: true,
                comments: true,
                shares: true
              }
            }
          }
        })
        break

      case 'podcasts':
        posts = await prisma.communityPost.findMany({
          where: { type: 'podcast' },
          take: limit,
          skip,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            tags: true,
            _count: {
              select: {
                likes: true,
                comments: true,
                shares: true
              }
            }
          }
        })
        break

      case 'articles':
        posts = await prisma.communityPost.findMany({
          where: { type: 'article' },
          take: limit,
          skip,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            tags: true,
            _count: {
              select: {
                likes: true,
                comments: true,
                shares: true
              }
            }
          }
        })
        break

      case 'milestones':
        posts = await prisma.communityPost.findMany({
          where: { type: 'milestone' },
          take: limit,
          skip,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            tags: true,
            _count: {
              select: {
                likes: true,
                comments: true,
                shares: true
              }
            }
          }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid post type' },
          { status: 400 }
        )
    }

    // Transform posts for client
    const transformedPosts = posts.map(post => ({
      id: post.id,
      type: post.type,
      userId: post.userId,
      userName: post.user.name,
      userAvatar: post.user.image,
      content: post.content,
      title: post.title,
      mediaUrl: post.mediaUrl,
      likes: post._count.likes,
      comments: post._count.comments,
      shares: post._count.shares,
      timestamp: post.createdAt,
      tags: post.tags.map(tag => tag.name)
    }))

    return NextResponse.json(transformedPosts)

  } catch (error) {
    logger.error('Error fetching community posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const {
      userId,
      type,
      content,
      title,
      mediaUrl,
      tags
    } = data

    // Validate required fields
    if (!userId || !type || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create post with tags
    const post = await prisma.communityPost.create({
      data: {
        userId,
        type,
        content,
        title,
        mediaUrl,
        tags: {
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag }
          }))
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        tags: true
      }
    })

    // Log activity
    logger.info('New community post created', {
      userId,
      postId: post.id,
      type,
      hasTags: tags.length > 0,
      hasMedia: !!mediaUrl
    })

    return NextResponse.json(post)

  } catch (error) {
    logger.error('Error creating community post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}