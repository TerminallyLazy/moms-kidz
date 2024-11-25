"use client"

import { usePoints } from '@/hooks/use-points'
import { useGamification } from '@/contexts/gamification-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Star, Flame, TrendingUp, Award } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

export function PointsDisplay() {
  const { level, streak } = useGamification()
  const { 
    loading,
    getPointsToNextLevel,
    getProgressToNextLevel,
    getRecentActivity,
    getPointsStats
  } = usePoints()

  const stats = getPointsStats()
  const progress = getProgressToNextLevel()
  const pointsToNext = getPointsToNextLevel()
  const recentActivity = getRecentActivity()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Points */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Points</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">
            Level {level} • {Math.round(progress)}% to next level
          </div>
          <Progress value={progress} className="mt-2 h-1" />
        </CardContent>
      </Card>

      {/* Today's Points */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Points</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.today.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">
            Current multiplier: {stats.multiplier.toFixed(1)}x
          </div>
        </CardContent>
      </Card>

      {/* Streak */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <Flame className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{streak} days</div>
          <div className="text-xs text-muted-foreground">
            {streak > 0 ? `+${(streak * 10)}% bonus` : 'Start a streak for bonus points'}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Points */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.thisWeek.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">
            Points earned in the last 7 days
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Star className="h-6 w-6 text-muted-foreground" />
              </motion.div>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.timestamp.toString()}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.reason}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                    <div className={`text-sm font-medium ${
                      activity.points >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {activity.formattedPoints} points
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {recentActivity.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No recent activity
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}