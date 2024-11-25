export interface TikTokConfig {
  userId: string
  apiKey: string
}

export interface FacebookConfig {
  pageId: string
  accessToken: string
}

export interface InstagramConfig {
  username: string
  apiKey: string
}

export interface TikTokPost {
  metrics: any
  engagementRate: number
  followingCount: number
  followerCount: number
  id: string
  description: string
  video_url: string
  cover_url: string
  likes: number
  comments: number
  shares: number
  created_at: string
  author: {
    id: string
    username: string
    avatar_url: string
  }
  statistics: {
    views: number
    shares: number
    comments: number
    likes: number
  }
  music: {
    title: string
    author: string
    url: string
  }
  hashtags: string[]
}

export interface FacebookPost {
  fanCount: number
  engagementRate: number
  metrics: any
  id: string
  message: string
  picture?: string
  link?: string
  created_time: string
  likes: {
    summary: {
      total_count: number
      can_like: boolean
      has_liked: boolean
    }
  }
  comments: {
    summary: {
      total_count: number
      can_comment: boolean
    }
  }
  shares?: {
    count: number
  }
  attachments?: {
    data: Array<{
      type: string
      url: string
      title: string
      description: string
    }>
  }
  place?: {
    id: string
    name: string
    location: {
      city: string
      country: string
      latitude: number
      longitude: number
    }
  }
}

export interface InstagramPost {
  followers: number
  following: number
  engagementRate: number
  metrics: any
  id: string
  caption: string
  media_url: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  permalink: string
  timestamp: string
  like_count: number
  comments_count: number
  children?: {
    data: Array<{
      id: string
      media_type: 'IMAGE' | 'VIDEO'
      media_url: string
    }>
  }
  location?: {
    id: string
    name: string
  }
  tags?: string[]
  user: {
    id: string
    username: string
  }
}

export interface SocialMediaError extends Error {
  code: string
  platform: 'tiktok' | 'facebook' | 'instagram'
  details?: Record<string, any>
}

export interface SocialMediaStats {
  followers: number
  following: number
  posts: number
  engagement_rate: number
  platform: 'tiktok' | 'facebook' | 'instagram'
}

export interface SocialMediaAnalytics {
  views: number
  likes: number
  comments: number
  shares: number
  reach: number
  impressions: number
  platform: 'tiktok' | 'facebook' | 'instagram'
  period: 'day' | 'week' | 'month'
  start_date: string
  end_date: string
}