"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useActivities } from "@/hooks/use-activities"
import { useEffect, useState } from "react"

interface Streak {
  type: string
  count: number
  milestone: number
  lastActivity: Date
}

export function Streaks() {
  const { activities } = useActivities()
  const [streaks, setStreaks] = useState<Record<string, Streak>>({})

  useEffect(() => {
    // Calculate streaks from activities
    const calculateStreaks = () => {
      const newStreaks: Record<string, Streak> = {}
      const sortedActivities = [...activities].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      sortedActivities.forEach(activity => {
        const type = activity.type
        if (!newStreaks[type]) {
          newStreaks[type] = {
            type,
            count: 0,
            milestone: 7, // Default milestone
            lastActivity: new Date(activity.date)
          }
        }

        const streak = newStreaks[type]
        const activityDate = new Date(activity.date)
        const dayDiff = Math.floor(
          (streak.lastActivity.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        // If activity is from consecutive day, increment streak
        if (dayDiff === 1) {
          streak.count += 1
          streak.lastActivity = activityDate
        }
        // If activity is from same day, skip
        else if (dayDiff === 0) {
          // Do nothing
        }
        // If streak is broken, reset
        else {
          streak.count = 1
          streak.lastActivity = activityDate
        }

        // Update milestone if needed
        if (streak.count >= streak.milestone) {
          streak.milestone = streak.milestone + 7 // Increase milestone by a week
        }
      })

      setStreaks(newStreaks)
    }

    calculateStreaks()
  }, [activities])

  if (Object.keys(streaks).length === 0) {
    return null
  }

  return (
    <Card className="bg-white dark:bg-gray-900 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Your Streaks</CardTitle>
        <CardDescription className="text-gray-500 dark:text-gray-400">
          Keep the momentum going!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.values(streaks).map((streak) => (
            <div key={streak.type} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium capitalize text-gray-900 dark:text-white">
                  {streak.type}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-orange-500">🔥</span>
                  <span>{streak.count} days</span>
                </div>
              </div>
              <Progress
                value={(streak.count / streak.milestone) * 100}
                className="h-2"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {streak.milestone - streak.count} days until next reward
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}