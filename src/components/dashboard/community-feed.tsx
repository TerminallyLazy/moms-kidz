"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Heart, MessageCircle, Share2, Bookmark, 
  Mic, Newspaper, Trophy, TrendingUp, Users 
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface CommunityPost {
  id: string
  type: 'article' | 'podcast' | 'discussion' | 'milestone'
  userId: string
  userName: string
  userAvatar?: string
  content: string
  title?: string
  mediaUrl?: string
  likes: number
  comments: number
  shares: number
  timestamp: Date
  tags: string[]
  isLiked?: boolean
  isBookmarked?: boolean
}

interface CommunityFeedProps {
  userId: string
  userName: string
  userAvatar?: string
}

export function CommunityFeed({ userId, userName, userAvatar }: CommunityFeedProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [activeTab, setActiveTab] = useState('trending')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [activeTab])

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/community/posts?type=${activeTab}`)
      const data = await response.json()
      setPosts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load community posts:', error)
      toast.error('Failed to load community posts')
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
        body: JSON.stringify({ userId })
      })
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked 
            }
          : post
      ))
    } catch (error) {
      toast.error('Failed to like post')
    }
  }

  const renderPost = (post: CommunityPost) => (
    <motion.div
      key={post.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="border-b border-gray-200 dark:border-gray-800 p-4"
    >
      <div className="flex items-start space-x-4">
        <Avatar className="h-10 w-10">
          <img src={post.userAvatar} alt={post.userName} />
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {post.userName}
              </h3>
              <p className="text-sm text-gray-500">
                {new Date(post.timestamp).toLocaleDateString()}
              </p>
            </div>
            {post.type === 'milestone' && (
              <div className="bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded-full">
                <Trophy className="h-4 w-4 text-purple-500 dark:text-purple-300" />
              </div>
            )}
          </div>

          {post.title && (
            <h4 className="font-medium text-gray-900 dark:text-white mt-2">
              {post.title}
            </h4>
          )}

          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {post.content}
          </p>

          {post.mediaUrl && (
            <div className="mt-3">
              {post.type === 'podcast' ? (
                <audio controls className="w-full">
                  <source src={post.mediaUrl} type="audio/mpeg" />
                </audio>
              ) : (
                <img 
                  src={post.mediaUrl} 
                  alt={post.title || 'Post media'} 
                  className="rounded-lg max-h-96 object-cover"
                />
              )}
            </div>
          )}

          <div className="mt-4 flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLike(post.id)}
              className={`${post.isLiked ? 'text-pink-500' : 'text-gray-500'}`}
            >
              <Heart className="h-4 w-4 mr-1" />
              {post.likes}
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500">
              <MessageCircle className="h-4 w-4 mr-1" />
              {post.comments}
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500">
              <Share2 className="h-4 w-4 mr-1" />
              {post.shares}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`ml-auto ${post.isBookmarked ? 'text-purple-500' : 'text-gray-500'}`}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>Community</CardTitle>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 gap-4">
            <TabsTrigger value="trending">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="podcasts">
              <Mic className="h-4 w-4 mr-2" />
              Podcasts
            </TabsTrigger>
            <TabsTrigger value="articles">
              <Newspaper className="h-4 w-4 mr-2" />
              Articles
            </TabsTrigger>
            <TabsTrigger value="milestones">
              <Trophy className="h-4 w-4 mr-2" />
              Milestones
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="flex-1">
        <ScrollArea className="h-full">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map(renderPost)}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}