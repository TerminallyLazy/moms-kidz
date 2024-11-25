"use client"

import { useState, useEffect, useCallback } from 'react'
import { logger } from '@/lib/logger'
import SocialMediaUtils from '@/lib/social-media-utils'
import type {
  TikTokPost,
  FacebookPost,
  InstagramPost,
  SocialMediaError,
  SocialMediaStats,
  SocialMediaAnalytics
} from '@/types/social-media'

interface SocialMediaConfig {
  tiktok?: {
    userId: string
    apiKey: string
  }
  facebook?: {
    pageId: string
    accessToken: string
  }
  instagram?: {
    username: string
    apiKey: string
  }
}

interface SocialMediaState {
  tiktokFeed: TikTokPost[]
  facebookFeed: FacebookPost[]
  instagramFeed: InstagramPost[]
  stats: {
    tiktok?: SocialMediaStats
    facebook?: SocialMediaStats
    instagram?: SocialMediaStats
  }
  analytics: {
    tiktok?: SocialMediaAnalytics
    facebook?: SocialMediaAnalytics
    instagram?: SocialMediaAnalytics
  }
}

export function useSocialMedia(config: SocialMediaConfig) {
  const [state, setState] = useState<SocialMediaState>({
    tiktokFeed: [],
    facebookFeed: [],
    instagramFeed: [],
    stats: {},
    analytics: {}
  })
  const [isLoadingSocial, setIsLoadingSocial] = useState(true)
  const [error, setError] = useState<SocialMediaError | null>(null)

  // Fetch TikTok data
  const fetchTikTokData = useCallback(async () => {
    if (!config.tiktok?.userId || !config.tiktok?.apiKey) return

    try {
      const [posts, stats, analytics] = await Promise.all([
        SocialMediaUtils.fetchTikTokPosts(config.tiktok),
        SocialMediaUtils.fetchSocialMediaStats('tiktok', config.tiktok),
        SocialMediaUtils.fetchSocialMediaAnalytics('tiktok', config.tiktok, 'week')
      ])

      setState(prev => ({
        ...prev,
        tiktokFeed: posts,
        stats: { ...prev.stats, tiktok: stats },
        analytics: { ...prev.analytics, tiktok: analytics }
      }))

      logger.info('TikTok data fetched successfully')
    } catch (error) {
      logger.error('Error fetching TikTok data:', error)
      setError(error as SocialMediaError)
    }
  }, [config.tiktok])

  // Fetch Facebook data
  const fetchFacebookData = useCallback(async () => {
    if (!config.facebook?.pageId || !config.facebook?.accessToken) return

    try {
      const [posts, stats, analytics] = await Promise.all([
        SocialMediaUtils.fetchFacebookPosts(config.facebook),
        SocialMediaUtils.fetchSocialMediaStats('facebook', config.facebook),
        SocialMediaUtils.fetchSocialMediaAnalytics('facebook', config.facebook, 'week')
      ])

      setState(prev => ({
        ...prev,
        facebookFeed: posts,
        stats: { ...prev.stats, facebook: stats },
        analytics: { ...prev.analytics, facebook: analytics }
      }))

      logger.info('Facebook data fetched successfully')
    } catch (error) {
      logger.error('Error fetching Facebook data:', error)
      setError(error as SocialMediaError)
    }
  }, [config.facebook])

  // Fetch Instagram data
  const fetchInstagramData = useCallback(async () => {
    if (!config.instagram?.username || !config.instagram?.apiKey) return

    try {
      const [posts, stats, analytics] = await Promise.all([
        SocialMediaUtils.fetchInstagramPosts(config.instagram),
        SocialMediaUtils.fetchSocialMediaStats('instagram', config.instagram),
        SocialMediaUtils.fetchSocialMediaAnalytics('instagram', config.instagram, 'week')
      ])

      setState(prev => ({
        ...prev,
        instagramFeed: posts,
        stats: { ...prev.stats, instagram: stats },
        analytics: { ...prev.analytics, instagram: analytics }
      }))

      logger.info('Instagram data fetched successfully')
    } catch (error) {
      logger.error('Error fetching Instagram data:', error)
      setError(error as SocialMediaError)
    }
  }, [config.instagram])

  // Refresh all social feeds
  const refreshSocialFeeds = useCallback(async () => {
    setIsLoadingSocial(true)
    setError(null)

    try {
      await Promise.all([
        fetchTikTokData(),
        fetchFacebookData(),
        fetchInstagramData()
      ])
    } catch (error) {
      logger.error('Error refreshing social feeds:', error)
      setError(error as SocialMediaError)
    } finally {
      setIsLoadingSocial(false)
    }
  }, [fetchTikTokData, fetchFacebookData, fetchInstagramData])

  // Initial fetch
  useEffect(() => {
    refreshSocialFeeds()

    // Set up periodic refresh
    const refreshInterval = setInterval(() => {
      refreshSocialFeeds()
    }, 5 * 60 * 1000) // Refresh every 5 minutes

    return () => clearInterval(refreshInterval)
  }, [refreshSocialFeeds])

  return {
    ...state,
    isLoadingSocial,
    error,
    refreshSocialFeeds,
    stats: state.stats,
    analytics: state.analytics
  }
}

export type { TikTokPost, FacebookPost, InstagramPost, SocialMediaError, SocialMediaStats, SocialMediaAnalytics }
