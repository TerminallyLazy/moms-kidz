"use client"

import { useEffect, useState } from "react"
import { GeminiChat } from "@/components/chat/gemini-chat"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, LogOut, Calendar, Plus, Bell, Loader2 } from "lucide-react"
import { NewsGrid } from "@/components/dashboard/news-grid"
import { SocialFeed } from "@/components/dashboard/social-feed"
import { Stats } from "@/components/dashboard/stats"
import { NotificationsDropdown } from "@/components/dashboard/notifications-dropdown"
import { ActivityForm, ActivityFormData } from "@/components/dashboard/activity-form"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useDb } from "@/lib/db/client"
import { Skeleton } from "@/components/ui/skeleton"
import { AnimatedCard } from "@/components/ui/animated-card"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useSocialMedia } from "@/hooks/use-social-media"
import { SocialAnalytics } from "@/components/dashboard/social-analytics"
import { AIChat } from "@/components/dashboard/ai-chat"
import { CommunityFeed } from "@/components/dashboard/community-feed"
import { TrendingContent } from "@/components/dashboard/trending-content"
import { FacebookPage } from '@/components/social/facebook-page'
import { GamificationProvider } from "@/contexts/gamification-context"
import { CareLog } from "@/components/dashboard/care-log"
import { CreateContentButton } from "@/components/dashboard/content-creator-dialog"
import { CareLogInsights } from "@/components/dashboard/care-log-insights"

const ENABLE_SOCIAL = process.env.NEXT_PUBLIC_ENABLE_SOCIAL === 'true'
const SOCIAL_CONFIG = {
  tiktok: {
    userId: process.env.NEXT_PUBLIC_TIKTOK_USER_ID,
    apiKey: process.env.NEXT_PUBLIC_TIKTOK_API_KEY,
  },
  facebook: {
    pageId: process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID,
    accessToken: process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN,
  },
  instagram: {
    username: process.env.NEXT_PUBLIC_INSTAGRAM_USERNAME,
    apiKey: process.env.NEXT_PUBLIC_INSTAGRAM_API_KEY,
  }
}

export default function MemberPage() {
  return (
    <ProtectedRoute>
      <MemberDashboard />
    </ProtectedRoute>
  )
}

function MemberDashboard() {
  const { user, profile, signOut } = useAuth()
  const db = useDb()
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingActivity, setIsLoadingActivity] = useState(false)
  
  // Only initialize social media if enabled
  const { 
    tiktokFeed,
    facebookFeed,
    instagramFeed,
    isLoadingSocial,
    refreshSocialFeeds,
    error: socialError
  } = ENABLE_SOCIAL ? useSocialMedia({
    tiktok: {
      userId: SOCIAL_CONFIG.tiktok.userId || '',
      apiKey: SOCIAL_CONFIG.tiktok.apiKey || '',
    },
    facebook: {
      pageId: SOCIAL_CONFIG.facebook.pageId || '',
      accessToken: SOCIAL_CONFIG.facebook.accessToken || '',
    },
    instagram: {
      username: SOCIAL_CONFIG.instagram.username || '',
      apiKey: SOCIAL_CONFIG.instagram.apiKey || '',
    }
  }) : {
    tiktokFeed: null,
    facebookFeed: null,
    instagramFeed: null,
    isLoadingSocial: false,
    refreshSocialFeeds: () => {},
    error: null
  }

  interface Article {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    category: string;
    type: 'article' | 'video';
    url: string;
  }

  const handleContentCreated = () => {
    // Refresh the feeds or relevant data
    toast.success("Content created successfully!")
  }
  const [articles, setArticles] = useState<Article[]>([
    {
      id: '1',
      title: "Understanding Child Development Milestones",
      description: "A comprehensive guide to tracking your child's developmental progress through key milestones.",
      imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=300&auto=format&fit=crop",
      category: "Pediatric",
      type: "article" as const,
      url: "https://openmd.com/directory/pediatric/child-development",
    },
    {
      id: '2',
      title: "Women's Health: Essential Wellness Tips",
      description: "Expert advice on maintaining optimal health and wellness for women at every life stage.",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&auto=format&fit=crop",
      category: "Women's Health",
      type: 'article' as const,
      url: "https://openmd.com/directory/women-health/wellness",
    },
    {
      id: '3',
      title: "Introduction to Parenting",
      description: "Learn the basics of parenting in this comprehensive video guide.",
      imageUrl: "https://images.unsplash.com/photo-1531722569936-825d3dd91b15?w=400&h=300&auto=format&fit=crop",
      category: "Tutorial",
      type: 'video' as const,
      url: "https://example.com/parenting-basics",
    },
    {
      id: '4',
      title: "Advanced Parenting Techniques",
      description: "Master advanced parenting techniques with our expert instructors.",
      imageUrl: "https://images.unsplash.com/photo-1584545284372-f22510eb7c26?w=400&h=300&auto=format&fit=crop",
      category: "Tutorial",
      type: 'video' as const,
      url: "https://example.com/advanced-parenting",
    }
  ])

  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      title: "New Achievement Unlocked!", 
      message: "You've reached Level 2!",
      timestamp: new Date().toLocaleString(),
      read: false
    },
    { 
      id: 2, 
      title: "Daily Reminder", 
      message: "Don't forget to log today's activities",
      timestamp: new Date().toLocaleString(),
      read: false
    },
    { 
      id: 3, 
      title: "New Content Available", 
      message: "Check out our latest parenting guides",
      timestamp: new Date().toLocaleString(),
      read: false
    }
  ])

  const handleSearch = async (query: string) => {
    try {
      setIsLoading(true)
      // Implement search across articles and social media content
      const results = await Promise.all([
        // Search articles
        articles.filter(article => 
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.description.toLowerCase().includes(query.toLowerCase())
        ),
        // Search social media content
        tiktokFeed?.filter(post => post.description?.toLowerCase().includes(query.toLowerCase())),
        facebookFeed?.filter(post => post.message?.toLowerCase().includes(query.toLowerCase())),
        instagramFeed?.filter(post => post.caption?.toLowerCase().includes(query.toLowerCase()))
      ])

      toast.success(`Found ${results.flat().length} results`)
      // Update UI with search results
    } catch (error) {
      toast.error("Search failed")
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddActivity = () => {
    setShowActivityForm(true)
  }

  const handleSettings = () => {
    toast.info("Opening settings...")
  }

  const handleDismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    toast.success("Notification dismissed")
  }

  const handleMarkAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    toast.success("Marked as read")
  }

  const handleActivitySubmit = async (data: ActivityFormData) => {
    setIsLoadingActivity(true)
    try {
      if (!user) throw new Error('User not authenticated')

      const activity = {
        user_id: user.id,
        ...data,
        points_earned: calculatePoints(data.type),
        metadata: {
          ...data.metadata,
          location: data.location,
        }
      }

      const { error } = await db.from('activities').insert({
        ...activity,
        date: activity.date.toISOString(),
        type: activity.type as "sleep" | "play" | "health" | "feed",
        details: {
          points_earned: activity.points_earned,
          title: activity.title,
          description: activity.description,
          metadata: activity.metadata
        }
      })
      if (error) throw error

      const newNotification = {
        id: Date.now(),
        title: "Activity Logged!",
        message: `Successfully logged ${data.type}: ${data.title}`,
        timestamp: new Date().toLocaleString(),
        read: false
      }
      setNotifications(prev => [newNotification, ...prev])

      toast.success("Activity logged successfully!")
      setShowActivityForm(false)
    } catch (error) {
      console.error('Error logging activity:', error)
      toast.error("Failed to log activity")
      throw error
    } finally {
      setIsLoadingActivity(false)
    }
  }

  const calculatePoints = (type: string): number => {
    const pointsMap: Record<string, number> = {
      health: 50,
      milestone: 100,
      feeding: 20,
      sleep: 30,
      activity: 25,
      other: 15
    }
    return pointsMap[type] || 10
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingDashboard />
  }

  return (
    <GamificationProvider userId={user?.id || ''}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-white dark:bg-gray-950"
      >
        <main className="container py-8">
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="flex justify-between items-center mb-8"
          >
            <div>
              <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl text-gray-900 dark:text-white">
                Welcome back, <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 text-transparent bg-clip-text">{profile?.name || 'Mom'}</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Your journey continues...
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <CreateContentButton 
                userId={user?.id || ''}
                onContentCreated={handleContentCreated}
              />
              <NotificationsDropdown
                notifications={notifications}
                onDismiss={handleDismissNotification}
                onMarkAsRead={handleMarkAsRead}
              />
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleSettings}
                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={signOut}
                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6"
          >
            <div className="flex gap-4">
              <Button
                onClick={() => setShowActivityForm(true)}
                disabled={isLoadingActivity}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700
                         dark:from-purple-500 dark:to-pink-500 dark:hover:from-purple-600 dark:hover:to-pink-600"
              >
                {isLoadingActivity ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Logging...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Log Activity
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.info("Opening calendar...")}
                className="border-purple-200 dark:border-purple-800"
              >
                <Calendar className="h-4 w-4 mr-2" />
                View Calendar
              </Button>
            </div>
          </motion.div>

          <div className="mb-8">
            <Stats />
          </div>

          {/* Only render social components if enabled */}
          {ENABLE_SOCIAL && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <SocialAnalytics
                  stats={{
                    tiktok: tiktokFeed?.[0] ? {
                      platform: 'tiktok',
                      followers: tiktokFeed[0].followerCount || 0,
                      following: tiktokFeed[0].followingCount || 0,
                      posts: tiktokFeed.length || 0,
                      engagement_rate: tiktokFeed[0].engagementRate || 0
                    } : null,
                    facebook: facebookFeed?.[0] ? {
                      platform: 'facebook',
                      followers: facebookFeed[0].fanCount || 0,
                      following: 0,
                      posts: facebookFeed.length || 0,
                      engagement_rate: facebookFeed[0].engagementRate || 0
                    } : null,
                    instagram: instagramFeed?.[0] ? {
                      platform: 'instagram', 
                      followers: instagramFeed[0].followers || 0,
                      following: instagramFeed[0].following || 0,
                      posts: instagramFeed.length || 0,
                      engagement_rate: instagramFeed[0].engagementRate || 0
                    } : null
                  }}
                  analytics={{
                    tiktok: tiktokFeed ? {
                      platform: 'tiktok',
                      period: 'month',
                      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                      end_date: new Date().toISOString(),
                      views: tiktokFeed.reduce((sum, post) => sum + (post.metrics?.playCount || 0), 0),
                      likes: tiktokFeed.reduce((sum, post) => sum + (post.metrics?.likeCount || 0), 0), 
                      comments: tiktokFeed.reduce((sum, post) => sum + (post.metrics?.commentCount || 0), 0),
                      shares: tiktokFeed.reduce((sum, post) => sum + (post.metrics?.shareCount || 0), 0),
                      reach: tiktokFeed.reduce((sum, post) => sum + (post.metrics?.reachCount || 0), 0),
                      impressions: tiktokFeed.reduce((sum, post) => sum + (post.metrics?.impressionCount || 0), 0)
                    } : null,
                    facebook: facebookFeed ? {
                      platform: 'facebook',
                      period: 'month', 
                      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                      end_date: new Date().toISOString(),
                      views: facebookFeed.reduce((sum, post) => sum + (post.metrics?.viewCount || 0), 0),
                      likes: facebookFeed.reduce((sum, post) => sum + (post.metrics?.likeCount || 0), 0),
                      comments: facebookFeed.reduce((sum, post) => sum + (post.metrics?.commentCount || 0), 0),
                      shares: facebookFeed.reduce((sum, post) => sum + (post.metrics?.shareCount || 0), 0),
                      reach: facebookFeed.reduce((sum, post) => sum + (post.metrics?.reachCount || 0), 0),
                      impressions: facebookFeed.reduce((sum, post) => sum + (post.metrics?.impressionCount || 0), 0)
                    } : null,
                    instagram: instagramFeed ? {
                      platform: 'instagram',
                      period: 'month',
                      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                      end_date: new Date().toISOString(),
                      views: instagramFeed.reduce((sum, post) => sum + (post.metrics?.viewCount || 0), 0),
                      likes: instagramFeed.reduce((sum, post) => sum + (post.metrics?.likeCount || 0), 0),
                      comments: instagramFeed.reduce((sum, post) => sum + (post.metrics?.commentCount || 0), 0),
                      shares: instagramFeed.reduce((sum, post) => sum + (post.metrics?.shareCount || 0), 0),
                      reach: instagramFeed.reduce((sum, post) => sum + (post.metrics?.reachCount || 0), 0),
                      impressions: instagramFeed.reduce((sum, post) => sum + (post.metrics?.impressionCount || 0), 0)
                    } : null
                  }}
                  isLoading={isLoadingSocial}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Facebook Page</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FacebookPage
                      pageUrl="https://www.facebook.com/facebook"
                      width={400}
                      height={800}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-8">
              <CareLog />
              <CareLogInsights userId={user?.id || ''} />
            </div>

            <div className="lg:col-span-4 space-y-8">
              <CommunityFeed 
                userId={user?.id || ''}
                userName={profile?.name || ''}
                userAvatar={profile?.image_url ?? undefined}
              />
              <NewsGrid articles={articles} onSearch={handleSearch} />
            </div>

            <div className="lg:col-span-4 space-y-8">
              <AIChat 
                userId={user?.id || ''}
                userName={profile?.name || ''}
                userAvatar={profile?.image_url ?? undefined}
              />
              <TrendingContent 
                userId={user?.id || ''}
                onContentSelect={(content) => {
                  console.log('Selected content:', content)
                }}
              />
            </div>
          </div>

          <div className="mt-8">
            <SocialFeed
              facebookUrl={`https://facebook.com/${SOCIAL_CONFIG.facebook.pageId}`}
              instagramUrl={`https://instagram.com/${SOCIAL_CONFIG.instagram.username}`}
              pinterestUrl=""
              tiktokUrl={`https://tiktok.com/@${SOCIAL_CONFIG.tiktok.userId}`}
              isLoading={isLoadingSocial}
            />
          </div>
            </TabsContent>

            <TabsContent value="assistant" className="mt-6">
              <div className="mx-auto max-w-5xl">
                <GeminiChat />
              </div>
            </TabsContent>
          </Tabs>

          <ActivityForm
            open={showActivityForm}
            onOpenChange={setShowActivityForm}
            onSubmit={handleActivitySubmit}
            isLoading={isLoadingActivity}
          />
        </main>
      </motion.div>
    </GamificationProvider>
  )
}

// Loading state component
function LoadingDashboard() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container py-8 px-4 md:px-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <Skeleton variant="text" className="w-64 h-8" />
            <Skeleton variant="text" className="w-48" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton variant="avatar" className="h-10 w-10" />
            <Skeleton variant="avatar" className="h-10 w-10" />
            <Skeleton variant="avatar" className="h-10 w-10" />
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="mb-6">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-8">
          <Stats />
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-8">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Social Feed Skeleton */}
        <div className="mt-8">
          <SocialFeed
            facebookUrl={`https://facebook.com/${SOCIAL_CONFIG.facebook.pageId}`}
            instagramUrl={`https://instagram.com/${SOCIAL_CONFIG.instagram.username}`}
            pinterestUrl=""
            tiktokUrl={`https://tiktok.com/@${SOCIAL_CONFIG.tiktok.userId}`}
            isLoading={true}
          />
        </div>
      </div>
    </div>
  )
}
