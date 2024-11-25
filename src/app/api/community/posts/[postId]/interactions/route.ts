import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params
    const { type, userId, content } = await request.json()

    switch (type) {
      case 'like':
        // Toggle like
        const existingLike = await prisma.postLike.findUnique({
          where: {
            userId_postId: {
              userId,
              postId
            }
          }
        })

        if (existingLike) {
          // Unlike
          await prisma.postLike.delete({
            where: {
              userId_postId: {
                userId,
                postId
              }
            }
          })
        } else {
          // Like
          await prisma.postLike.create({
            data: {
              userId,
              postId
            }
          })
        }

        // Get updated like count
        const likeCount = await prisma.postLike.count({
          where: { postId }
        })

        return NextResponse.json({ likes: likeCount })

      case 'comment':
        // Validate comment content
        if (!content?.trim()) {
          return NextResponse.json(
            { error: 'Comment content is required' },
            { status: 400 }
          )
        }

        // Create comment
        const comment = await prisma.postComment.create({
          data: {
            content,
            userId,
            postId
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

        // Get updated comment count
        const commentCount = await prisma.postComment.count({
          where: { postId }
        })

        return NextResponse.json({
          comment,
          totalComments: commentCount
        })

      case 'share':
        // Create share record
        await prisma.postShare.create({
          data: {
            userId,
            postId
          }
        })

        // Get updated share count
        const shareCount = await prisma.postShare.count({
          where: { postId }
        })

        return NextResponse.json({ shares: shareCount })

      case 'bookmark':
        // Toggle bookmark
        const existingBookmark = await prisma.postBookmark.findUnique({
          where: {
            userId_postId: {
              userId,
              postId
            }
          }
        })

        if (existingBookmark) {
          // Remove bookmark
          await prisma.postBookmark.delete({
            where: {
              userId_postId: {
                userId,
                postId
              }
            }
          })
        } else {
          // Add bookmark
          await prisma.postBookmark.create({
            data: {
              userId,
              postId
            }
          })
        }

        return NextResponse.json({
          bookmarked: !existingBookmark
        })

      default:
        return NextResponse.json(
          { error: 'Invalid interaction type' },
          { status: 400 }
        )
    }

  } catch (error) {
    logger.error('Error handling post interaction:', error)
    return NextResponse.json(
      { error: 'Failed to process interaction' },
      { status: 500 }
    )
  }
}

// Get post interactions
export async function GET(
  request: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') || 'all'

    const interactions = {
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isBookmarked: false,
      recentComments: []
    }

    // Get counts
    const [likeCount, commentCount, shareCount] = await Promise.all([
      prisma.postLike.count({ where: { postId } }),
      prisma.postComment.count({ where: { postId } }),
      prisma.postShare.count({ where: { postId } })
    ])

    interactions.likes = likeCount
    interactions.comments = commentCount
    interactions.shares = shareCount

    // Get user-specific interactions if userId provided
    if (userId) {
      const [userLike, userBookmark] = await Promise.all([
        prisma.postLike.findUnique({
          where: {
            userId_postId: {
              userId,
              postId
            }
          }
        }),
        prisma.postBookmark.findUnique({
          where: {
            userId_postId: {
              userId,
              postId
            }
          }
        })
      ])

      interactions.isLiked = !!userLike
      interactions.isBookmarked = !!userBookmark
    }

    // Get recent comments if requested
    if (type === 'all' || type === 'comments') {
      const recentComments = await prisma.postComment.findMany({
        where: { postId },
        take: 5,
        orderBy: { createdAt: 'desc' },
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

      interactions.recentComments = recentComments
    }

    return NextResponse.json(interactions)

  } catch (error) {
    logger.error('Error fetching post interactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interactions' },
      { status: 500 }
    )
  }
}