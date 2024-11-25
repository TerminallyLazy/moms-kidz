"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"

export default function Error({
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
    <div className="flex h-screen flex-col items-center justify-center space-y-4">
      <div className="rounded-full bg-red-100 p-3">
        <Icons.close className="h-6 w-6 text-red-600" />
      </div>
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Oops! Something went wrong</h1>
        <p className="text-muted-foreground">
          {error.message || "An unexpected error occurred"}
        </p>
        {error.digest && (
          <p className="text-sm text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex space-x-4">
        <Button onClick={() => reset()}>
          Try again
        </Button>
        <Link href="/">
          <Button variant="outline">
            Go back home
          </Button>
        </Link>
      </div>
      <p className="text-sm text-muted-foreground">
        If the problem persists, please{" "}
        <Link 
          href="/contact" 
          className="underline underline-offset-4 hover:text-primary"
        >
          contact support
        </Link>
      </p>
    </div>
  )
}
