"use client"

import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Activity {
  id: string
  type: string
  title: string
  description: string
  date: string
  location: string
  user_id: string
  profiles: {
    username: string
    name: string | null
  }
  details: {
    [key: string]: string
  }
}

export function TapestryData() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          console.error('Error fetching user:', userError)
          return
        }

        const { data, error } = await supabase
          .from('activities')
          .select(`
            *,
            profiles (
              username,
              name
            )
          `)
          .eq('user_id', user.id)
          .order('date', { ascending: false })

        if (error) {
          console.error('Error fetching activities:', error)
          return
        }

        if (data) {
          setActivities(data)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [supabase])

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading your memories...</p>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No memories yet. Start by adding your first one!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {activities.map((activity) => (
        <Card key={activity.id} className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium capitalize bg-primary/10 text-primary px-3 py-1 rounded-full">
              {activity.type}
            </span>
            <span className="text-sm text-muted-foreground">
              {new Date(activity.date).toLocaleDateString()}
            </span>
          </div>
          {activity.title && (
            <h3 className="text-lg font-semibold mb-2">{activity.title}</h3>
          )}
          {activity.description && (
            <p className="text-muted-foreground mb-4">{activity.description}</p>
          )}
          {activity.details && (
            <div className="space-y-2">
              {Object.entries(activity.details).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium capitalize">{key}:</span>{" "}
                  <span className="text-muted-foreground">{String(value)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Posted by {activity.profiles?.name || activity.profiles?.username}
            </p>
          </div>
        </Card>
      ))}
    </div>
  )
}
