"use client"

import { Suspense } from "react"
import { TapestryLayout } from "../_components/tapestry-layout"
import { TapestryData } from "../_components/tapestry-data"
import { TapestrySkeleton } from "../_components/tapestry-skeleton"

export default function TapestryPage() {
  return (
    <TapestryLayout>
      <Suspense fallback={<TapestrySkeleton />}>
        <TapestryData />
      </Suspense>
    </TapestryLayout>
  )
}