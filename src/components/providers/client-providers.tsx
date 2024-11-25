"use client"

import { ThemeProvider } from "@/components/providers/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { GamificationProvider } from "@/contexts/gamification-context"
import { NotificationsProvider } from "@/contexts/notifications-context"
import { SettingsProvider } from "@/contexts/settings-context"
import { KeyboardShortcutsProvider } from "@/providers/keyboard-shortcuts-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import { InitializationErrorBoundary } from "@/components/error-boundary/initialization-error-boundary"
import { LoadingScreen } from "@/components/loading-screen"
import { Toaster, toast } from "sonner"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useInitialization } from "@/hooks/use-initialization"
import { InitializationStage } from "@/types/initialization"

const INITIALIZATION_ORDER: InitializationStage[] = [
  'theme',
  'auth',
  'settings',
  'notifications',
  'gamification',
  'dashboard'
]

// Custom shortcuts for the application
const APP_SHORTCUTS = {
  'command-palette': {
    combo: ['ctrl+k', 'cmd+k'],
    description: 'Open command palette',
    group: 'Navigation',
    handler: () => {
      toast.info('Command palette coming soon!')
    }
  },
  'toggle-theme': {
    combo: ['ctrl+t', 'cmd+t'],
    description: 'Toggle dark/light theme',
    group: 'Appearance',
    handler: () => {
      toast.info('Theme toggle coming soon!')
    }
  },
  'keyboard-help': {
    combo: '?',
    description: 'Show keyboard shortcuts',
    group: 'Help',
    handler: () => {
      toast.info('Keyboard shortcuts help coming soon!')
    }
  },
  'focus-search': {
    combo: ['ctrl+/', 'cmd+/'],
    description: 'Focus search',
    group: 'Navigation',
    handler: () => {
      const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]')
      if (searchInput) {
        searchInput.focus()
      }
    }
  }
}

function ProvidersInitializer({ children }: { children: React.ReactNode }) {
  const {
    isInitialized,
    showLoading,
    error,
    progress,
    handleRetry,
    canRetry,
    remainingRetries,
    stats
  } = useInitialization({
    onError: (error) => {
      console.error('Initialization error:', error)
      toast.error(`Initialization error: ${error.message}`)
    },
    onComplete: () => {
      console.log('Initialization complete')
      toast.success('Application initialized successfully')
    }
  })

  // Convert initialization stats to loading states
  const loadingStates = INITIALIZATION_ORDER.map(stage => {
    const stageStats = stats?.stageStats?.[stage]
    return {
      id: stage,
      message: `Initializing ${stage}...`,
      status: stageStats ? 
        stageStats.status === 'success' ? 'complete' :
        stageStats.status === 'failed' ? 'error' :
        stageStats.status === 'pending' && stageStats.attempts > 0 ? 'loading' :
        'pending' : 'pending',
      error: stageStats?.error?.message
    }
  })

  // Calculate current state based on completed stages
  const currentState = loadingStates.findIndex(state => 
    state.status !== 'complete'
  )

  return (
    <>
      <AnimatePresence mode="wait">
        {showLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50"
          >
            <LoadingScreen 
              currentProgress={progress}
              loadingStates={loadingStates}
              currentState={currentState === -1 ? loadingStates.length : currentState}
            />
            {error && canRetry && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-4 right-4 mx-auto max-w-md"
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Initialization Error</AlertTitle>
                  <AlertDescription className="mt-2">
                    <p className="mb-2">
                      Failed to initialize {error.stage}: {error.message}
                    </p>
                    <Button
                      variant="secondary"
                      onClick={handleRetry}
                      className="mt-2"
                    >
                      Retry ({remainingRetries} {remainingRetries === 1 ? 'attempt' : 'attempts'} remaining)
                    </Button>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {isInitialized && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </>
  )
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <KeyboardShortcutsProvider shortcuts={APP_SHORTCUTS}>
          <InitializationErrorBoundary>
            <ProvidersInitializer>
              <AuthProvider>
                <SettingsProvider>
                  <NotificationsProvider>
                    <GamificationProvider>
                      {children}
                      <Toaster 
                        position="top-right"
                        expand={false}
                        richColors
                        closeButton
                        theme="system"
                      />
                    </GamificationProvider>
                  </NotificationsProvider>
                </SettingsProvider>
              </AuthProvider>
            </ProvidersInitializer>
          </InitializationErrorBoundary>
        </KeyboardShortcutsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
