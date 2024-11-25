"use client"

import { Icons } from "@/components/ui/icons"

interface LoadingProps {
  text?: string
  className?: string
}

export function Loading({ text = "Loading...", className }: LoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <Icons.spinner className="h-6 w-6 animate-spin" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <Loading />
    </div>
  )
}

export function LoadingSpinner({ className }: { className?: string }) {
  return <Icons.spinner className={`h-4 w-4 animate-spin ${className}`} />
}

export function LoadingDots() {
  return (
    <span className="inline-flex items-center space-x-1">
      <span className="animate-ping h-1.5 w-1.5 rounded-full bg-current opacity-75"></span>
      <span className="animate-ping h-1.5 w-1.5 rounded-full bg-current opacity-75 delay-75"></span>
      <span className="animate-ping h-1.5 w-1.5 rounded-full bg-current opacity-75 delay-150"></span>
    </span>
  )
}

export function LoadingPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Icons.logo className="h-12 w-12 animate-pulse" />
        <Loading text="Loading application..." />
      </div>
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="space-y-3">
        <div className="h-4 w-[60%] animate-pulse rounded bg-muted"></div>
        <div className="h-4 w-[80%] animate-pulse rounded bg-muted"></div>
        <div className="h-4 w-[40%] animate-pulse rounded bg-muted"></div>
      </div>
    </div>
  )
}

export function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  )
}
