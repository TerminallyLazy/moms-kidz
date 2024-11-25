"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from "framer-motion"
import type { SocialMediaStats, SocialMediaAnalytics } from "@/types/social-media"

interface SocialAnalyticsProps {
  stats: {
    tiktok?: SocialMediaStats | null
    facebook?: SocialMediaStats | null
    instagram?: SocialMediaStats | null
  }
  analytics: {
    tiktok?: SocialMediaAnalytics | null
    facebook?: SocialMediaAnalytics | null
    instagram?: SocialMediaAnalytics | null
  }
  isLoading?: boolean
}

export function SocialAnalytics({ stats, analytics, isLoading = false }: SocialAnalyticsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const renderStats = (platform: 'tiktok' | 'facebook' | 'instagram') => {
    if (!stats || !stats[platform]) return null
    const platformStats = stats[platform]
    if (!platformStats) return null

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
        >
          <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
          <div className="text-2xl font-bold">{formatNumber(platformStats.followers)}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
        >
          <div className="text-sm text-gray-500 dark:text-gray-400">Following</div>
          <div className="text-2xl font-bold">{formatNumber(platformStats.following)}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
        >
          <div className="text-sm text-gray-500 dark:text-gray-400">Posts</div>
          <div className="text-2xl font-bold">{formatNumber(platformStats.posts)}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
        >
          <div className="text-sm text-gray-500 dark:text-gray-400">Engagement Rate</div>
          <div className="text-2xl font-bold">{platformStats.engagement_rate.toFixed(2)}%</div>
        </motion.div>
      </div>
    )
  }

  const renderAnalytics = (platform: 'tiktok' | 'facebook' | 'instagram') => {
    if (!analytics || !analytics[platform]) return null
    const platformAnalytics = analytics[platform]
    if (!platformAnalytics) return null

    const data = [
      { name: 'Views', value: platformAnalytics.views },
      { name: 'Likes', value: platformAnalytics.likes },
      { name: 'Comments', value: platformAnalytics.comments },
      { name: 'Shares', value: platformAnalytics.shares },
      { name: 'Reach', value: platformAnalytics.reach },
      { name: 'Impressions', value: platformAnalytics.impressions },
    ]

    return (
      <div className="h-[300px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => formatNumber(value)}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Social Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
              ))}
            </div>
            <div className="h-[300px] bg-gray-200 dark:bg-gray-700 rounded mt-4" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats?.tiktok && !stats?.facebook && !stats?.instagram) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Social Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No social media data available. Please connect your social media accounts.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tiktok">
          <TabsList className="w-full">
            <TabsTrigger value="tiktok" disabled={!stats?.tiktok} className="flex-1">TikTok</TabsTrigger>
            <TabsTrigger value="facebook" disabled={!stats?.facebook} className="flex-1">Facebook</TabsTrigger>
            <TabsTrigger value="instagram" disabled={!stats?.instagram} className="flex-1">Instagram</TabsTrigger>
          </TabsList>
          <TabsContent value="tiktok" className="space-y-4">
            {renderStats('tiktok')}
            {renderAnalytics('tiktok')}
          </TabsContent>
          <TabsContent value="facebook" className="space-y-4">
            {renderStats('facebook')}
            {renderAnalytics('facebook')}
          </TabsContent>
          <TabsContent value="instagram" className="space-y-4">
            {renderStats('instagram')}
            {renderAnalytics('instagram')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}