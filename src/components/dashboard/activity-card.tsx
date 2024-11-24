"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Clock, Heart, Plus, Star } from "lucide-react"
import type { Database } from "@/types/supabase"

type Activity = Database['public']['Tables']['activities']['Row']

const ACTIVITY_ICONS = {
  sleep: Clock,
  feed: Heart,
  play: Star,
  health: Plus,
} as const

interface ActivityCardProps {
  activity: Activity
  showHeader?: boolean
  compact?: boolean
  className?: string
}

export function ActivityCard({ 
  activity, 
  showHeader = false, 
  compact = false,
  className = "" 
}: ActivityCardProps) {
  const Icon = ACTIVITY_ICONS[activity.type as keyof typeof ACTIVITY_ICONS] || Star
  const date = new Date(activity.date)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={className}
      data-track="view_activity"
      data-track-metadata={JSON.stringify({ id: activity.id, type: activity.type })}
    >
      <Card className="group relative overflow-hidden bg-white dark:bg-gray-900 dark:border-gray-800 hover:shadow-lg transition-all duration-200">
        {showHeader && (
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">
              {activity.title}
            </CardTitle>
            {activity.description && (
              <CardDescription className="text-gray-500 dark:text-gray-400">
                {activity.description}
              </CardDescription>
            )}
          </CardHeader>
        )}
        <CardContent className={compact ? "p-4" : "p-6"}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 shadow-inner">
                <Icon className="w-5 h-5 text-white drop-shadow" />
              </div>
              <div>
                {!showHeader && (
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {activity.title || `${activity.type} Activity`}
                  </p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {date.toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                {activity.details && !compact && (
                  <div className="mt-2 space-y-1">
                    {Object.entries(activity.details as Record<string, any>).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium capitalize">{key}:</span>{" "}
                        <span className="text-gray-500 dark:text-gray-400">
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {activity.points_earned > 0 && (
              <Badge 
                variant="secondary"
                className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white"
              >
                +{activity.points_earned} points
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function ActivityList({ 
  activities,
  limit = undefined,
  showHeader = false,
  compact = false
}: {
  activities: Activity[]
  limit?: number
  showHeader?: boolean
  compact?: boolean
}) {
  const displayActivities = limit ? activities.slice(0, limit) : activities

  return (
    <div className="space-y-4">
      {displayActivities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          showHeader={showHeader}
          compact={compact}
        />
      ))}
    </div>
  )
}