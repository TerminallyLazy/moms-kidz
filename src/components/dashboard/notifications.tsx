"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  timestamp: string
  read?: boolean
}

const notifications: Notification[] = [
  {
    id: "1",
    title: "New Achievement Unlocked!",
    message: "You've reached Level 2!",
    timestamp: "11/25/2024, 12:41:26 AM"
  },
  {
    id: "2",
    title: "Daily Reminder",
    message: "Don't forget to log today's activities",
    timestamp: "11/25/2024, 12:41:28 AM"
  },
  {
    id: "3",
    title: "New Content Available",
    message: "Check out our latest parenting guides",
    timestamp: "11/25/2024, 12:41:26 AM"
  }
]

export function Notifications() {
  return (
    <Card className="w-[300px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Notifications</CardTitle>
        <span className="text-xs text-muted-foreground">{notifications.length} unread</span>
      </CardHeader>
      <CardContent className="grid gap-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
          >
            <span className="flex h-2 w-2 translate-y-1 rounded-full bg-purple-500" />
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium leading-none">
                  {notification.title}
                </p>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground">
                {notification.timestamp}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 