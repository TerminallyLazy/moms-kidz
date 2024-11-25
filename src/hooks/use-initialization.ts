"use client"

import { useState, useEffect, useCallback } from 'react'
import { initManager } from '@/lib/initialization'
import { initLogger } from '@/lib/initialization-logger'
import { InitializationError, InitializationStage } from '@/types/initialization'

const MAX_RETRIES = 3

interface UseInitializationOptions {
  onComplete?: () => void
  onError?: (error: InitializationError) => void
}

export function useInitialization(options: UseInitializationOptions = {}) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [showLoading, setShowLoading] = useState(true)
  const [error, setError] = useState<InitializationError | null>(null)
  const [progress, setProgress] = useState(0)
  const [retryAttempts, setRetryAttempts] = useState(0)

  const stageInitializers = {
    theme: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
    },
    auth: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
    },
    settings: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
    },
    notifications: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
    },
    gamification: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
    },
    dashboard: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  const handleRetry = useCallback(() => {
    if (retryAttempts >= MAX_RETRIES) {
      throw new Error('Maximum retry attempts exceeded')
    }

    setError(null)
    setRetryAttempts(prev => prev + 1)
  }, [retryAttempts])

  const initialize = useCallback(async () => {
    try {
      initLogger.log({
        type: 'start',
        timestamp: new Date()
      })

      await initManager.initializeAll(stageInitializers, {
        timeout: 10000,
        retryCount: MAX_RETRIES - retryAttempts,
        onProgress: (stage, progress) => {
          setProgress(progress)
          initLogger.log({
            type: 'progress',
            stage,
            timestamp: new Date(),
            data: { progress }
          })
        },
        onError: (error) => {
          setError(error)
          options.onError?.(error)
          if (retryAttempts >= MAX_RETRIES - 1) {
            throw error
          }
          initLogger.log({
            type: 'error',
            stage: error.stage,
            timestamp: new Date(),
            data: { error }
          })
        },
        onRetry: (stage, attempt) => {
          setRetryAttempts(prev => prev + 1)
          initLogger.log({
            type: 'retry',
            stage,
            timestamp: new Date(),
            data: { attempt }
          })
        }
      })

      initLogger.log({
        type: 'complete',
        timestamp: new Date(),
        data: {
          stats: initLogger.getStats()
        }
      })

      setIsInitialized(true)
      setTimeout(() => {
        setShowLoading(false)
        options.onComplete?.()
      }, 500)

    } catch (error) {
      if (retryAttempts >= MAX_RETRIES - 1) {
        throw error
      }
      setError(error as InitializationError)
    }
  }, [retryAttempts, options])

  useEffect(() => {
    initialize()

    return () => {
      initManager.reset()
    }
  }, [initialize])

  const getInitializationState = useCallback(() => {
    const stats = initLogger.getStats()
    const metrics = initLogger.getMetrics()

    return {
      isInitialized,
      showLoading,
      error,
      progress,
      retryAttempts,
      maxRetries: MAX_RETRIES,
      stats,
      metrics,
      canRetry: retryAttempts < MAX_RETRIES,
      remainingRetries: MAX_RETRIES - retryAttempts
    }
  }, [isInitialized, showLoading, error, progress, retryAttempts])

  return {
    ...getInitializationState(),
    handleRetry,
    initialize
  }
}