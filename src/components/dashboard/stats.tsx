"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthContext } from "@/contexts/auth-context"
import { useActivities } from "@/hooks/use-activities"
import { Award, Calendar, Star, Trophy } from "lucide-react"
import { motion } from "framer-motion"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
}

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white dark:bg-gray-900 dark:border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
            {title}
          </CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function Stats() {
  const { stats } = useAuthContext()
  const { activities } = useActivities()
  const activityStats = activities ? activities.length : 0

  const currentMonth = new Date().toLocaleString('default', { month: 'long' })
  const monthlyActivities = activities.filter(activity => {
    const activityMonth = new Date(activity.date).toLocaleString('default', { month: 'long' })
    return activityMonth === currentMonth
  }).length

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Level"
        value={stats?.level || 1}
        description="Keep going to level up!"
        icon={<Trophy className="h-4 w-4 text-primary" />}
      />
      
      <StatCard
        title="Total Points"
        value={stats?.totalPoints || 0}
        description="Points earned from activities"
        icon={<Star className="h-4 w-4 text-yellow-500" />}
      />
      
      <StatCard
        title="Achievements"
        value={stats?.achievements?.length || 0}
        description="Unlocked achievements"
        icon={<Award className="h-4 w-4 text-purple-500" />}
      />
      
      <StatCard
        title={`${currentMonth} Activities`}
        value={monthlyActivities}
        description={`${activityStats} total activities logged`}
        icon={<Calendar className="h-4 w-4 text-blue-500" />}
      />
    </div>
  )
}

export function StatsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistics</CardTitle>
        <CardDescription>Your progress and achievements</CardDescription>
      </CardHeader>
      <CardContent>
        <Stats />
      </CardContent>
    </Card>
  )
}