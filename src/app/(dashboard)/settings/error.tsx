"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="container max-w-2xl">
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="rounded-full bg-red-100 p-3">
            <Icons.close className="h-6 w-6 text-red-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight">
              Settings Error
            </h2>
            <p className="text-sm text-muted-foreground">
              {error.message || "There was an error loading your settings"}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <div className="flex space-x-4">
            <Button onClick={() => reset()}>
              Try again
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/dashboard'}
            >
              Go to Dashboard
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            If this error persists, please try refreshing the page or contact support.
          </p>
        </div>
      </Card>
    </div>
  )
}