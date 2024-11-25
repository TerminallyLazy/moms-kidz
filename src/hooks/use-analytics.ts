"use client"

import { useEffect } from 'react'
import { AnalyticsUtils } from '@/lib/analytics-utils'

/**
 * Hook for tracking component lifecycle
 */
export function useAnalytics(componentName: string) {
  useEffect(() => {
    AnalyticsUtils.trackMount(componentName)
    return () => {
      AnalyticsUtils.trackUnmount(componentName)
    }
  }, [componentName])
}

/**
 * Hook for tracking page views
 */
export function usePageView(path?: string) {
  useEffect(() => {
    const currentPath = path || window.location.pathname
    AnalyticsUtils.trackPageView(currentPath)
  }, [path])
}

/**
 * Hook for tracking session duration
 */
export function useSessionTracking() {
  useEffect(() => {
    AnalyticsUtils.init()
    
    return () => {
      const metrics = AnalyticsUtils.getSessionMetrics()
      AnalyticsUtils.track('session_metrics', metrics)
    }
  }, [])
}

/**
 * Hook for tracking performance metrics
 */
export function usePerformanceTracking(componentName: string) {
  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const duration = performance.now() - startTime
      AnalyticsUtils.trackPerformance(`${componentName}_lifetime`, {
        duration,
      })
    }
  }, [componentName])
}

/**
 * Hook for tracking error boundaries
 */
export function useErrorTracking(componentName: string) {
  useEffect(() => {
    const handleError = (error: Error) => {
      AnalyticsUtils.trackError(error, {
        component: componentName,
      })
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [componentName])
}

export default useAnalytics