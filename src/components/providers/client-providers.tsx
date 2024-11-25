"use client"

import { ThemeProvider } from "@/components/providers/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "sonner"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
