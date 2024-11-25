export interface InitializationState {
  theme: boolean
  auth: boolean
  settings: boolean
  notifications: boolean
  gamification: boolean
  dashboard: boolean
}

export interface InitializationError {
  stage: keyof InitializationState
  message: string
  attempt: number
  timestamp?: Date
  details?: Record<string, unknown>
}

export interface InitializationProgress {
  stage: keyof InitializationState
  progress: number
  timestamp: Date
  duration?: number
}

export interface InitializationStats {
  startTime: Date
  endTime?: Date
  totalDuration?: number
  stageStats: Record<keyof InitializationState, {
    attempts: number
    duration: number
    status: 'pending' | 'success' | 'failed'
    error?: InitializationError
  }>
}

export type InitializationStage = keyof InitializationState

export type InitializationStatus = 'idle' | 'initializing' | 'completed' | 'failed'

export interface InitializationContext {
  state: InitializationState
  status: InitializationStatus
  progress: number
  error?: InitializationError
  stats: InitializationStats
  lastUpdate: Date
}

export interface InitializerFunction {
  (): Promise<void>
}

export interface StageInitializer {
  stage: InitializationStage
  initializer: InitializerFunction
  dependencies?: InitializationStage[]
  timeout?: number
  retryCount?: number
  critical?: boolean
}

export interface InitializationOptions {
  timeout?: number
  retryCount?: number
  parallel?: boolean
  critical?: boolean
  dependencies?: InitializationStage[]
  onProgress?: (progress: InitializationProgress) => void
  onError?: (error: InitializationError) => void
  onRetry?: (stage: InitializationStage, attempt: number) => void
  onComplete?: (stats: InitializationStats) => void
}

export interface InitializationResult {
  success: boolean
  duration: number
  stats: InitializationStats
  error?: InitializationError
}

export type InitializationEventType = 
  | 'start'
  | 'progress'
  | 'stage-complete'
  | 'stage-failed'
  | 'retry'
  | 'complete'
  | 'error'

export interface InitializationEvent {
  type: InitializationEventType
  stage?: InitializationStage
  timestamp: Date
  data?: {
    progress?: number
    error?: InitializationError
    stats?: InitializationStats
    attempt?: number
  }
}

export interface InitializationLogger {
  log: (event: InitializationEvent) => void
  getEvents: () => InitializationEvent[]
  clear: () => void
}

export interface InitializationMetrics {
  totalTime: number
  averageStageTime: number
  retryCount: number
  failureRate: number
  successRate: number
  criticalFailures: number
  stageMetrics: Record<InitializationStage, {
    time: number
    attempts: number
    success: boolean
  }>
}