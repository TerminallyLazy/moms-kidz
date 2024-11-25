"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { formatDate } from "@/lib/utils"
import { Activity, Award, Heart, Star } from "lucide-react"
import { db } from "@/lib/supabase"

interface DashboardStats {
  totalActivities: number
  totalPoints: number
  achievements: number
  currentStreak: number
}

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalActivities: 0,
    totalPoints: 0,
    achievements: 0,
    currentStreak: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        setError(null)

        // Get activities
        const activitiesResult = await db.activities.list(user.id)
        if (activitiesResult.error) throw activitiesResult.error
        const activities = activitiesResult.data
        
        // Get achievements
        const achievementsResult = await db.achievements.list(user.id)
        if (achievementsResult.error) throw achievementsResult.error
        const achievements = achievementsResult.data

        // Calculate current streak (simplified version)
        const streak = activities ? activities.reduce((acc, curr) => {
          const today = new Date().setHours(0, 0, 0, 0)
          if (!('created_at' in curr)) return acc
          const activityDate = new Date(curr.created_at as string).setHours(0, 0, 0, 0)
          return today === activityDate ? acc + 1 : acc
        }, 0) : 0

        // Calculate total points (1 point per activity for now)
        const points = activities ? activities.length * 10 : 0

        setStats({
          totalActivities: activities ? activities.length : 0,
          totalPoints: points,
          achievements: achievements ? achievements.length : 0,
          currentStreak: streak
        })
      } catch (error) {
        console.error('Error loading dashboard stats:', error)
        setError('Failed to load dashboard stats')
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to view your dashboard</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {profile.name}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your activities today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              ) : (
                stats.totalActivities
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              ) : (
                stats.totalPoints
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              ) : (
                stats.achievements
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              ) : (
                `${stats.currentStreak} days`
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Button
          className="w-full"
          onClick={() => window.location.href = '/activities/new'}
        >
          Log New Activity
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.location.href = '/achievements'}
        >
          View Achievements
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.location.href = '/profile'}
        >
          Update Profile
        </Button>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Member Since</p>
              <p>{formatDate(user.created_at || new Date())}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}