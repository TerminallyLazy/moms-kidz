"use client"

import { Suspense, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { TapestryData } from "./tapestry-data"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { TapestrySkeleton } from "./tapestry-skeleton"

interface TapestryLayoutProps {
  children: React.ReactNode
}

export function TapestryLayout({ children }: TapestryLayoutProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push("/login")
      }
    }
    
    checkUser()
  }, [router, supabase])

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Your Tapestry</h1>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Memory
        </Button>
      </div>

      <Suspense fallback={<TapestrySkeleton />}>
        {children}
      </Suspense>
    </div>
  )
}
