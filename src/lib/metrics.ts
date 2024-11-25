import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client'

// Configure default metrics
collectDefaultMetrics({
  prefix: 'momskidz_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5], // Garbage collection buckets
})

// HTTP Metrics
export const httpRequestsTotal = new Counter({
  name: 'momskidz_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status']
})

export const httpRequestDurationSeconds = new Histogram({
  name: 'momskidz_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10] // in seconds
})

// User Metrics
export const activeUsers = new Gauge({
  name: 'momskidz_active_users',
  help: 'Number of currently active users',
  labelNames: ['tier']
})

export const userRegistrationsTotal = new Counter({
  name: 'momskidz_user_registrations_total',
  help: 'Total number of user registrations'
})

// Care Log Metrics
export const careLogEntriesTotal = new Counter({
  name: 'momskidz_care_log_entries_total',
  help: 'Total number of care log entries',
  labelNames: ['type']
})

export const careLogStreak = new Gauge({
  name: 'momskidz_care_log_streak_days',
  help: 'Current streak length in days',
  labelNames: ['user_id', 'user_tier']
})

export const careLogCompletionRate = new Gauge({
  name: 'momskidz_care_log_completion_rate',
  help: 'Care log completion rate',
  labelNames: ['user_tier']
})

// Authentication Metrics
export const authFailuresTotal = new Counter({
  name: 'momskidz_auth_failures_total',
  help: 'Total number of authentication failures',
  labelNames: ['reason']
})

export const authSuccessTotal = new Counter({
  name: 'momskidz_auth_success_total',
  help: 'Total number of successful authentications',
  labelNames: ['provider']
})

// API Performance Metrics
export const apiLatency = new Histogram({
  name: 'momskidz_api_latency_seconds',
  help: 'API endpoint latency in seconds',
  labelNames: ['endpoint'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5]
})

// Database Metrics
export const dbQueryDuration = new Histogram({
  name: 'momskidz_db_query_duration_seconds',
  help: 'Database query duration in seconds',
  labelNames: ['operation'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
})

export const dbConnectionsActive = new Gauge({
  name: 'momskidz_db_connections_active',
  help: 'Number of active database connections'
})

// Cache Metrics
export const cacheHits = new Counter({
  name: 'momskidz_cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache']
})

export const cacheMisses = new Counter({
  name: 'momskidz_cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache']
})

// Error Metrics
export const errorTotal = new Counter({
  name: 'momskidz_errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'code']
})

// Initialize metrics
export function initMetrics() {
  // Clear any existing metrics
  register.clear()

  // Register custom metrics
  register.registerMetric(httpRequestsTotal)
  register.registerMetric(httpRequestDurationSeconds)
  register.registerMetric(activeUsers)
  register.registerMetric(userRegistrationsTotal)
  register.registerMetric(careLogEntriesTotal)
  register.registerMetric(careLogStreak)
  register.registerMetric(careLogCompletionRate)
  register.registerMetric(authFailuresTotal)
  register.registerMetric(authSuccessTotal)
  register.registerMetric(apiLatency)
  register.registerMetric(dbQueryDuration)
  register.registerMetric(dbConnectionsActive)
  register.registerMetric(cacheHits)
  register.registerMetric(cacheMisses)
  register.registerMetric(errorTotal)

  // Enable default metrics
  collectDefaultMetrics({ register })
}

// Export register for use in metrics endpoint
export { register }