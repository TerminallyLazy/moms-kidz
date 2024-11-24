"use client"

import { Card } from "@/components/ui/card"

export function TapestrySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((index) => (
        <Card key={index} className="p-6">
          <div className="h-[200px] bg-muted animate-pulse rounded-lg mb-4" />
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
          </div>
        </Card>
      ))}
    </div>
  )
}
