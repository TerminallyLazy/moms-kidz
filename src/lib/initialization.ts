"use client"

import { InitializationState, InitializationError } from "@/types/initialization"

const RETRY_DELAYS = [1000, 2000, 5000] // Increasing delays between retries
const MAX_RETRIES = 3

interface InitOptions {
  timeout?: number
  retryCount?: number
  onProgress?: (stage: keyof InitializationState, progress: number) => void
  onError?: (error: InitializationError) => void
  onRetry?: (stage: keyof InitializationState, attempt: number) => void
}

class InitializationManager {
  private retryAttempts: Map<keyof InitializationState, number>
  private initState: InitializationState
  private timeouts: Map<string, NodeJS.Timeout>

  constructor() {
    this.retryAttempts = new Map()
    this.timeouts = new Map()
    this.initState = {
      theme: false,
      auth: false,
      settings: false,
      notifications: false,
      gamification: false,
      dashboard: false
    }
  }

  async initializeStage(
    stage: keyof InitializationState,
    initFunction: () => Promise<void>,
    options: InitOptions = {}
  ): Promise<void> {
    const {
      timeout = 10000,
      retryCount = MAX_RETRIES,
      onProgress,
      onError,
      onRetry
    } = options

    const attempts = this.retryAttempts.get(stage) || 0

    try {
      // Set timeout for the initialization
      const timeoutPromise = new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`Initialization timeout for ${stage}`))
        }, timeout)
        this.timeouts.set(stage, timeoutId)
      })

      // Race between initialization and timeout
      await Promise.race([
        initFunction(),
        timeoutPromise
      ])

      // Clear timeout if successful
      this.clearTimeout(stage)
      this.initState[stage] = true
      onProgress?.(stage, this.getProgress())

    } catch (error) {
      this.clearTimeout(stage)
      
      const initError: InitializationError = {
        stage,
        message: error instanceof Error ? error.message : 'Unknown error',
        attempt: attempts + 1
      }

      onError?.(initError)

      // Handle retry logic
      if (attempts < retryCount) {
        this.retryAttempts.set(stage, attempts + 1)
        onRetry?.(stage, attempts + 1)

        // Exponential backoff with jitter
        const delay = RETRY_DELAYS[attempts] || RETRY_DELAYS[RETRY_DELAYS.length - 1]
        const jitter = Math.random() * 1000
        await new Promise(resolve => setTimeout(resolve, delay + jitter))

        // Retry initialization
        return this.initializeStage(stage, initFunction, options)
      }

      throw initError
    }
  }

  private clearTimeout(stage: string) {
    const timeoutId = this.timeouts.get(stage)
    if (timeoutId) {
      clearTimeout(timeoutId)
      this.timeouts.delete(stage)
    }
  }

  getProgress(): number {
    const totalStages = Object.keys(this.initState).length
    const completedStages = Object.values(this.initState).filter(Boolean).length
    return (completedStages / totalStages) * 100
  }

  isInitialized(): boolean {
    return Object.values(this.initState).every(Boolean)
  }

  reset() {
    this.retryAttempts.clear()
    this.timeouts.forEach(clearTimeout)
    this.timeouts.clear()
    Object.keys(this.initState).forEach(key => {
      this.initState[key as keyof InitializationState] = false
    })
  }

  getFailedStages(): Array<keyof InitializationState> {
    return Object.entries(this.initState)
      .filter(([_, initialized]) => !initialized)
      .map(([stage]) => stage as keyof InitializationState)
  }

  async initializeAll(
    stageInitializers: Record<keyof InitializationState, () => Promise<void>>,
    options: InitOptions = {}
  ): Promise<void> {
    const stages = Object.keys(this.initState) as Array<keyof InitializationState>

    for (const stage of stages) {
      await this.initializeStage(stage, stageInitializers[stage], {
        ...options,
        onProgress: (currentStage, progress) => {
          options.onProgress?.(currentStage, progress)
          console.debug(`Initialized ${currentStage} (${progress}% complete)`)
        }
      })
    }
  }
}

export const initManager = new InitializationManager()