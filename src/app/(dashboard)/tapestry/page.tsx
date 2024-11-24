"use client"

import { Suspense } from "react"
import { TapestryLayout } from "@/components/features/tapestry-layout"
import { TapestryData } from "@/components/features/tapestry-data"
import { TapestrySkeleton } from "@/components/features/tapestry-skeleton"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { Loading } from "@/components/ui/loading"

function TapestryDashboard() {
  return (
    <TapestryLayout>
      <Suspense fallback={<Loading text="Loading your memories..." />}>
        <TapestryData />
      </Suspense>
    </TapestryLayout>
  )
}

export default function TapestryPage() {
  return (
    <ProtectedRoute>
      <TapestryDashboard />
    </ProtectedRoute>
  )
}
