import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import AnalyticsUtils from './analytics-utils'
import { Prisma } from '@prisma/client'

// Define types for our content models
interface BaseContent {
  id: string
  userId: string
  title: string
  createdAt: Date
  metadata: Record<string, any>
}

interface Podcast extends BaseContent {
  type: 'podcast'
  description: string
  audioUrl: string
  duration: number
}

interface Article extends BaseContent {
  type: 'article'
  content: string
  coverImage?: string
}

interface ContentAnalytics {
  contentId: string
  contentType: 'podcast' | 'article'
  views: number
  uniqueViews: number
  createdAt: Date
}

interface UserProfile {
  id: string
  name: string | null
  image: string | null
}

interface ContentWithAnalytics extends BaseContent {
  analytics: ContentAnalytics
  user: UserProfile
}

interface TrendingContentOptions {
  type?: 'podcast' | 'article'
  limit?: number
  timeframe?: 'day' | 'week' | 'month'
}

export class ContentUtils {
  /**
   * Create a new podcast
   */
  static async createPodcast(data: {
    userId: string
    title: string
    description: string
    audioUrl: string
    duration: number
    metadata?: Record<string, any>
  }): Promise<Podcast> {
    try {
      const podcast = await prisma.$queryRaw<Podcast>`
        INSERT INTO podcasts (
          user_id,
          title,
          description,
          audio_url,
          duration,
          metadata,
          created_at
        ) VALUES (
          ${data.userId},
          ${data.title},
          ${data.description},
          ${data.audioUrl},
          ${data.duration},
          ${JSON.stringify(data.metadata || {})},
          NOW()
        )
        RETURNING *
      `

      // Track user engagement
      await AnalyticsUtils.trackUserEngagement(data.userId, {
        type: 'podcast',
        contentId: podcast.id
      })

      logger.info('Podcast created successfully', {
        userId: data.userId,
        podcastId: podcast.id
      })

      return podcast
    } catch (error) {
      logger.error('Error creating podcast:', error as Error)
      throw error
    }
  }

  /**
   * Create a new article
   */
  static async createArticle(data: {
    userId: string
    title: string
    content: string
    coverImage?: string
    metadata?: Record<string, any>
  }): Promise<Article> {
    try {
      const article = await prisma.$queryRaw<Article>`
        INSERT INTO articles (
          user_id,
          title,
          content,
          cover_image,
          metadata,
          created_at
        ) VALUES (
          ${data.userId},
          ${data.title},
          ${data.content},
          ${data.coverImage || null},
          ${JSON.stringify(data.metadata || {})},
          NOW()
        )
        RETURNING *
      `

      // Track user engagement
      await AnalyticsUtils.trackUserEngagement(data.userId, {
        type: 'article',
        contentId: article.id
      })

      logger.info('Article created successfully', {
        userId: data.userId,
        articleId: article.id
      })

      return article
    } catch (error) {
      logger.error('Error creating article:', error as Error)
      throw error
    }
  }

  /**
   * Get user's content with analytics
   */
  static async getUserContent(userId: string) {
    try {
      const [podcasts, articles] = await Promise.all([
        prisma.$queryRaw<Podcast[]>`
          SELECT p.*, u.name as user_name, u.image as user_image
          FROM podcasts p
          JOIN users u ON p.user_id = u.id
          WHERE p.user_id = ${userId}
          ORDER BY p.created_at DESC
        `,
        prisma.$queryRaw<Article[]>`
          SELECT a.*, u.name as user_name, u.image as user_image
          FROM articles a
          JOIN users u ON a.user_id = u.id
          WHERE a.user_id = ${userId}
          ORDER BY a.created_at DESC
        `
      ])

      // Get analytics for each piece of content
      const podcastAnalytics = await Promise.all(
        podcasts.map((podcast: Podcast) => 
          AnalyticsUtils.getContentPerformance(podcast.id, 'podcast')
        )
      )

      const articleAnalytics = await Promise.all(
        articles.map((article: Article) => 
          AnalyticsUtils.getContentPerformance(article.id, 'article')
        )
      )

      return {
        podcasts: podcasts.map((podcast: Podcast, i: number) => ({
          ...podcast,
          analytics: podcastAnalytics[i]
        })),
        articles: articles.map((article: Article, i: number) => ({
          ...article,
          analytics: articleAnalytics[i]
        }))
      }
    } catch (error) {
      logger.error('Error fetching user content:', error as Error)
      throw error
    }
  }

  /**
   * Get trending content
   */
  static async getTrendingContent(options: TrendingContentOptions = {}) {
    try {
      const { type, limit = 10, timeframe = 'week' } = options
      
      // Use Prisma's built-in date handling for better security
      const timeframeDate = new Date()
      switch (timeframe) {
        case 'day':
          timeframeDate.setDate(timeframeDate.getDate() - 1)
          break
        case 'week':
          timeframeDate.setDate(timeframeDate.getDate() - 7)
          break
        case 'month':
          timeframeDate.setMonth(timeframeDate.getMonth() - 1)
          break
      }

      // Use Prisma's query builder instead of raw SQL for better type safety
      const baseQuery = {
        take: type ? limit : Math.floor(limit/2),
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          analytics: {
            where: {
              createdAt: {
                gte: timeframeDate
              }
            },
            select: {
              views: true,
              userId: true
            }
          }
        },
        orderBy: {
          analytics: {
            _sum: {
              views: 'desc'
            }
          }
        }
      }

      let content: ContentWithAnalytics[] = []
      if (!type || type === 'podcast') {
        const podcasts = await prisma.$queryRaw`
          SELECT p.*, 
            COALESCE(SUM(a.views), 0) as totalViews
          FROM "Podcast" p
          LEFT JOIN "Analytics" a ON a."podcastId" = p.id 
          WHERE a."createdAt" >= ${timeframeDate}
          GROUP BY p.id
          ORDER BY totalViews DESC
          LIMIT ${baseQuery.take}
        `
        content = [...content, ...(podcasts as ContentWithAnalytics[])]
      }
      
      if (!type || type === 'article') {
        const articles = await prisma.$queryRaw`
          SELECT a.*, 
            COALESCE(SUM(a.views), 0) as totalViews
          FROM "Article" a
          LEFT JOIN "Analytics" a ON a."articleId" = a.id 
          WHERE a."createdAt" >= ${timeframeDate}
          GROUP BY a.id
          ORDER BY totalViews DESC
          LIMIT ${baseQuery.take}
        `
        content = [...content, ...(articles as ContentWithAnalytics[])]
      }

      return content
        .sort((a, b) => (b.analytics?.views || 0) - (a.analytics?.views || 0))
        .slice(0, limit)

    } catch (error) {
      logger.error('Error fetching trending content:', error as Error)
      throw error
    }
  }
}

export default ContentUtils
