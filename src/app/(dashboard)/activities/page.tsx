"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ActivityFilter } from "@/components/dashboard/activity-filter"
import { ActivityList } from "@/components/dashboard/activity-card"
import { Stats } from "@/components/dashboard/stats"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { useActivities } from "@/hooks/use-activities"
import type { Database } from "@/types/supabase"

type Activity = Database['public']['Tables']['activities']['Row']

const ACTIVITY_TYPES = ['sleep', 'feed', 'play', 'health']

function ActivitiesDashboard() {
  const { activities, isLoading, fetchActivities } = useActivities()
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([])

  useEffect(() => {
    fetchActivities()
  }, [])

  useEffect(() => {
    setFilteredActivities(activities)
  }, [activities])

  const handleFilterChange = ({
    search,
    type,
    dateRange,
  }: {
    search: string
    type: string | null
    dateRange: { from: Date | null; to: Date | null }
  }) => {
    let filtered = [...activities]

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        activity =>
          activity.title?.toLowerCase().includes(searchLower) ||
          activity.description?.toLowerCase().includes(searchLower) ||
          activity.type.toLowerCase().includes(searchLower)
      )
    }

    // Apply type filter
    if (type) {
      filtered = filtered.filter(activity => activity.type === type)
    }

    // Apply date range filter
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.date)
        if (dateRange.from && dateRange.to) {
          return activityDate >= dateRange.from && activityDate <= dateRange.to
        }
        if (dateRange.from) {
          return activityDate >= dateRange.from
        }
        if (dateRange.to) {
          return activityDate <= dateRange.to
        }
        return true
      })
    }

    setFilteredActivities(filtered)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <main className="container py-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activities</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Track and manage your daily activities
            </p>
          </div>

          {/* Stats Overview */}
          <Stats />

          {/* Filters */}
          <ActivityFilter
            types={ACTIVITY_TYPES}
            onFilterChange={handleFilterChange}
          />

          {/* Activities List */}
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>
                {filteredActivities.length} activities found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : filteredActivities.length > 0 ? (
                <ActivityList
                  activities={filteredActivities}
                  showHeader
                />
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No activities found. Try adjusting your filters.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function ActivitiesPage() {
  return (
    <ProtectedRoute>
      <ActivitiesDashboard />
    </ProtectedRoute>
  )
}