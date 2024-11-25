declare namespace NodeJS {
  interface ProcessEnv {
    // Base Configuration
    NODE_ENV: 'development' | 'production' | 'test'
    NEXT_PUBLIC_APP_URL: string
    NEXT_PUBLIC_APP_NAME: string
    NEXT_PUBLIC_APP_DESCRIPTION: string

    // TikTok Configuration
    NEXT_PUBLIC_TIKTOK_API_KEY: string
    NEXT_PUBLIC_TIKTOK_API_SECRET: string
    NEXT_PUBLIC_TIKTOK_USER_ID: string

    // Facebook Configuration
    NEXT_PUBLIC_FACEBOOK_APP_ID: string
    NEXT_PUBLIC_FACEBOOK_PAGE_ID: string
    NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN: string

    // Instagram Configuration
    NEXT_PUBLIC_INSTAGRAM_API_KEY: string
    NEXT_PUBLIC_INSTAGRAM_USERNAME: string

    // Feature Flags
    NEXT_PUBLIC_ENABLE_SOCIAL_FEATURES: string
    NEXT_PUBLIC_ENABLE_RESEARCH_FEATURES: string

    // Analytics and Monitoring
    NEXT_PUBLIC_ANALYTICS_ID?: string
    SENTRY_DSN?: string

    // API Rate Limiting
    RATE_LIMIT_REQUESTS?: string
    RATE_LIMIT_WINDOW_MS?: string

    // Cache Configuration
    REDIS_URL?: string

    // Database Configuration
    DATABASE_URL: string

    // Authentication
    NEXTAUTH_URL: string
    NEXTAUTH_SECRET: string

    // OAuth Providers
    GOOGLE_CLIENT_ID?: string
    GOOGLE_CLIENT_SECRET?: string

    // Email Configuration
    SMTP_HOST?: string
    SMTP_PORT?: string
    SMTP_USER?: string
    SMTP_PASSWORD?: string
    EMAIL_FROM?: string

    // News API Configuration
    NEWS_API_KEY?: string

    // Push Notifications
    NEXT_PUBLIC_VAPID_KEY?: string
  }
}

// Environment variables validation
interface EnvValidation {
  // Required variables
  required: string[]
  // Optional variables
  optional: string[]
  // Validation rules
  rules: {
    [key: string]: (value: string) => boolean
  }
}

export const envValidation: EnvValidation = {
  required: [
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_APP_NAME',
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_TIKTOK_API_KEY',
    'NEXT_PUBLIC_FACEBOOK_APP_ID',
    'NEXT_PUBLIC_INSTAGRAM_API_KEY'
  ],
  optional: [
    'NEXT_PUBLIC_ANALYTICS_ID',
    'SENTRY_DSN',
    'REDIS_URL',
    'SMTP_HOST',
    'NEWS_API_KEY',
    'NEXT_PUBLIC_VAPID_KEY'
  ],
  rules: {
    NODE_ENV: (value) => ['development', 'production', 'test'].includes(value),
    NEXT_PUBLIC_APP_URL: (value) => value.startsWith('http'),
    DATABASE_URL: (value) => value.includes('://'),
    NEXTAUTH_URL: (value) => value.startsWith('http'),
    RATE_LIMIT_REQUESTS: (value) => !isNaN(Number(value)),
    RATE_LIMIT_WINDOW_MS: (value) => !isNaN(Number(value)),
    SMTP_PORT: (value) => !isNaN(Number(value))
  }
}

// Helper type for environment variables
export type EnvVar = keyof NodeJS.ProcessEnv

// Helper type for feature flags
export type FeatureFlag = 'ENABLE_SOCIAL_FEATURES' | 'ENABLE_RESEARCH_FEATURES'

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (flag: FeatureFlag): boolean => {
  const envVar = `NEXT_PUBLIC_${flag}`
  return process.env[envVar] === 'true'
}