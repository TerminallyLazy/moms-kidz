"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MiniWaveform } from "@/components/ui/audio-waveform"
import { AudioPlayer } from "@/components/ui/audio-player"
import { 
  Mic, Newspaper, TrendingUp, Clock, User, 
  BarChart, MessageSquare, Share2 
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ContentUtils from '@/lib/content-utils'
import AudioUtils from '@/lib/audio-utils'

interface TrendingContentProps {
  userId: string
  onContentSelect?: (content: any) => void
  className?: string
}

export function TrendingContent({
  userId,
  onContentSelect,
  className = ''
}: TrendingContentProps) {
  const [activeTab, setActiveTab] = useState<'podcasts' | 'articles'>('podcasts')
  const [trendingContent, setTrendingContent] = useState<any[]>([])
  const [selectedContent, setSelectedContent] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTrendingContent()
  }, [activeTab])

  const fetchTrendingContent = async () => {
    try {
      setIsLoading(true)
      const content = await ContentUtils.getTrendingContent({
        type: activeTab === 'articles' ? 'article' : 'podcast',
        limit: 5,
        timeframe: 'week'
      })
      setTrendingContent(content)
    } catch (error) {
      console.error('Error fetching trending content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderPodcast = (podcast: any) => (
    <motion.div
      key={podcast.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {podcast.title}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {podcast.user.name}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {AudioUtils.formatDuration(podcast.duration)}
            </div>
            <div className="flex items-center">
              <BarChart className="h-4 w-4 mr-1" />
              {podcast.analytics?.views || 0} plays
            </div>
          </div>
          <MiniWaveform
            audioFile={podcast.audioFile}
            className="opacity-50 group-hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
      {selectedContent?.id === podcast.id && (
        <div className="mt-4">
          <AudioPlayer
            audioFile={podcast.audioFile}
            title={podcast.title}
            author={podcast.user.name}
          />
        </div>
      )}
    </motion.div>
  )

  const renderArticle = (article: any) => (
    <motion.div
      key={article.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      {article.coverImage && (
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-32 object-cover rounded-lg mb-4"
        />
      )}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {article.title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
        {article.content}
      </p>
      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
        <div className="flex items-center">
          <User className="h-4 w-4 mr-1" />
          {article.user.name}
        </div>
        <div className="flex items-center">
          <BarChart className="h-4 w-4 mr-1" />
          {article.analytics?.views || 0} reads
        </div>
        <div className="flex items-center">
          <MessageSquare className="h-4 w-4 mr-1" />
          {article.analytics?.comments || 0}
        </div>
        <div className="flex items-center">
          <Share2 className="h-4 w-4 mr-1" />
          {article.analytics?.shares || 0}
        </div>
      </div>
    </motion.div>
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-purple-500" />
          <span>Trending Now</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="podcasts" className="flex items-center space-x-2">
              <Mic className="h-4 w-4" />
              <span>Podcasts</span>
            </TabsTrigger>
            <TabsTrigger value="articles" className="flex items-center space-x-2">
              <Newspaper className="h-4 w-4" />
              <span>Articles</span>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px]">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {trendingContent.map((content) =>
                    activeTab === 'podcasts' 
                      ? renderPodcast(content)
                      : renderArticle(content)
                  )}
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  )
}
