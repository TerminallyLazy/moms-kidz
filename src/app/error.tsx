"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-8">{error.message}</p>
      <div className="flex gap-4">
        <Button onClick={() => window.location.href = "/login"}>
          Back to Login
        </Button>
        <Button variant="outline" onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </div>
  )
}
