"use client"

import { AnimatedCard } from "@/components/ui/animated-card"
import { useAuth } from "@/contexts/auth-context"
import { useActivities } from "@/hooks/use-activities"
import { Award, Calendar, Star, Trophy, TrendingUp, Info } from "lucide-react"
import { motion } from "framer-motion"
import { InfoTooltip } from "@/components/ui/tooltip"
import { AchievementHoverCard } from "@/components/ui/hover-card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { StatsSkeleton } from "@/components/ui/skeleton"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  trend?: number
  delay?: number
  tooltip?: string
  progress?: {
    current: number
    total: number
    label?: string
  }
  onClick?: () => void
  isLoading?: boolean
}

function StatCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  delay = 0,
  tooltip,
  progress,
  onClick,
  isLoading = false
}: StatCardProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay }}
      >
        <AnimatedCard className="bg-white dark:bg-gray-900 dark:border-gray-800">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              {progress && (
                <div className="mt-4 space-y-2">
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </AnimatedCard>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      onClick={onClick}
      className={onClick ? "cursor-pointer" : ""}
    >
      <AnimatedCard className="bg-white dark:bg-gray-900 dark:border-gray-800">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {title}
              </div>
              {tooltip && (
                <InfoTooltip
                  title={title}
                  description={tooltip}
                  icon={<Info className="h-4 w-4 text-gray-400" />}
                >
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                </InfoTooltip>
              )}
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              {icon}
            </div>
          </div>
          <div className="flex items-baseline space-x-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </div>
            {trend !== undefined && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center"
              >
                <Badge
                  variant={trend >= 0 ? "success" : "destructive"}
                  icon={<TrendingUp className={`h-3 w-3 ${trend < 0 ? "rotate-180" : ""}`} />}
                >
                  {Math.abs(trend)}%
                </Badge>
              </motion.div>
            )}
          </div>
          {description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
          {progress && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>{progress.label || `Progress`}</span>
                <span>{Math.round((progress.current / progress.total) * 100)}%</span>
              </div>
              <Progress value={(progress.current / progress.total) * 100} />
            </div>
          )}
        </div>
      </AnimatedCard>
    </motion.div>
  )
}

export function Stats() {
  const { profile } = useAuth()
  const { activities, isLoading } = useActivities()

  if (isLoading) {
    return <StatsSkeleton />
  }

  const activityStats = activities ? activities.length : 0

  const currentMonth = new Date().toLocaleString('default', { month: 'long' })
  const monthlyActivities = activities.filter(activity => {
    const activityMonth = new Date(activity.date).toLocaleString('default', { month: 'long' })
    return activityMonth === currentMonth
  }).length

  // Calculate level progress
  const currentLevel = profile?.stats?.level || 1
  const xpForNextLevel = currentLevel * 1000 // Example calculation
  const currentXP = profile?.stats?.totalPoints || 0
  const levelProgress = {
    current: currentXP % xpForNextLevel,
    total: xpForNextLevel,
    label: `XP to Level ${currentLevel + 1}`
  }

  // Calculate trends (mock data for now)
  const trends = {
    level: 5,
    points: 12,
    achievements: -3,
    activities: 8
  }

  const stats = {
    level: currentLevel,
    totalPoints: currentXP,
    achievements: profile?.stats?.achievements?.length || 0,
    monthlyActivities
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <AchievementHoverCard
        trigger={
          <div>
            <StatCard
              title="Current Level"
              value={stats.level}
              description="Keep going to level up!"
              icon={<Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
              trend={trends.level}
              delay={0}
              progress={levelProgress}
              tooltip="Your current level reflects your overall progress and dedication"
              onClick={() => console.log('Level card clicked')}
            />
          </div>
        }
        title="Level Progress"
        description={`You need ${xpForNextLevel - (currentXP % xpForNextLevel)} XP to reach level ${currentLevel + 1}`}
        progress={levelProgress.current}
        total={levelProgress.total}
        progressLabel={levelProgress.label}
        icon={<Trophy className="h-4 w-4" />}
      />
      
      <StatCard
        title="Total Points"
        value={stats.totalPoints}
        description="Points earned from activities"
        icon={<Star className="h-5 w-5 text-yellow-500" />}
        trend={trends.points}
        delay={0.1}
        tooltip="Points are earned by completing activities and achieving milestones"
      />
      
      <StatCard
        title="Achievements"
        value={stats.achievements}
        description="Unlocked achievements"
        icon={<Award className="h-5 w-5 text-purple-500" />}
        trend={trends.achievements}
        delay={0.2}
        tooltip="Special recognition for reaching important milestones"
      />
      
      <StatCard
        title={`${currentMonth} Activities`}
        value={monthlyActivities}
        description={`${activityStats} total activities logged`}
        icon={<Calendar className="h-5 w-5 text-blue-500" />}
        trend={trends.activities}
        delay={0.3}
        tooltip="Track your monthly activity progress"
      />
    </div>
  )
}
