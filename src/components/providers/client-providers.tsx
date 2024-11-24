"use client"

import { Toaster } from 'sonner'
import { AuthProvider } from "@/contexts/auth-context"
import { GamificationProvider } from "@/contexts/gamification-context"
import { InteractionProvider } from "@/components/analytics/interaction-tracker"
import { ThemeProvider } from "./theme-provider"
import { ShortcutsProvider } from "./shortcuts-provider"
import { CommandMenu } from "@/components/command-menu"

interface ClientProvidersProps {
  children: React.ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <GamificationProvider>
          <InteractionProvider>
            <ShortcutsProvider>
              <CommandMenu />
              {children}
              <Toaster 
                position="top-right"
                richColors
                closeButton
                theme="system"
              />
            </ShortcutsProvider>
          </InteractionProvider>
        </GamificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
