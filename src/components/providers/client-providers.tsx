"use client"

import { Toaster } from 'sonner'
import { AuthProvider } from "./auth-provider"
import { GamificationProvider } from "@/contexts/gamification-context"
import { SessionProvider } from "next-auth/react"

interface ClientProvidersProps {
  children: React.ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <SessionProvider>
      <AuthProvider>
        <GamificationProvider>
          {children}
          <Toaster richColors position="top-right" />
        </GamificationProvider>
      </AuthProvider>
    </SessionProvider>
  )
}
