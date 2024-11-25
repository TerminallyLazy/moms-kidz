import { z } from 'zod'
import { ApiResponse } from './api-response'
import { logger } from './logger'
import { NextResponse } from 'next/dist/server/web/spec-extension/response'

// Common validation schemas
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email must not exceed 255 characters')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must not exceed 72 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  )

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must not exceed 30 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username can only contain letters, numbers, underscores, and dashes'
  )

// Common schemas for the application
export const schemas = {
  auth: {
    login: z.object({
      email: emailSchema,
      password: passwordSchema,
    }),
    
    signup: z.object({
      email: emailSchema,
      password: passwordSchema,
      username: usernameSchema,
    }),
    
    resetPassword: z.object({
      email: emailSchema,
    }),
    
    updatePassword: z.object({
      currentPassword: passwordSchema,
      newPassword: passwordSchema,
    }).refine(
      data => data.currentPassword !== data.newPassword,
      {
        message: "New password must be different from current password",
        path: ["newPassword"],
      }
    ),
  },

  profile: {
    update: z.object({
      username: usernameSchema.optional(),
      fullName: z.string().min(2).max(100).optional(),
      bio: z.string().max(500).optional(),
      avatar: z.string().url().optional(),
    }),
  },

  activity: {
    create: z.object({
      type: z.enum(['sleep', 'feed', 'play', 'health']),
      title: z.string().min(3).max(100),
      description: z.string().max(500).optional(),
      date: z.string().datetime(),
      location: z.string().max(100).optional(),
      details: z.record(z.unknown()).optional(),
    }),

    update: z.object({
      type: z.enum(['sleep', 'feed', 'play', 'health']).optional(),
      title: z.string().min(3).max(100).optional(),
      description: z.string().max(500).optional(),
      date: z.string().datetime().optional(),
      location: z.string().max(100).optional(),
      details: z.record(z.unknown()).optional(),
    }),
  },

  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),

  dateRange: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }).refine(
    data => new Date(data.startDate) <= new Date(data.endDate),
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  ),
}

// Validation wrapper for API routes
export async function validateRequest<T>(
  schema: z.Schema<T>,
  data: unknown,
  errorMessage = 'Validation failed'
): Promise<{ data: T | null; error: NextResponse | null }> {
  try {
    return {
      data: await schema.parseAsync(data),
      error: null,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors: Record<string, string[]> = {}
      
      error.errors.forEach((err) => {
        const key = err.path.join('.') || '_error'
        if (!formattedErrors[key]) {
          formattedErrors[key] = []
        }
        formattedErrors[key].push(err.message)
      })

      logger.warn('Validation error', {
        errors: formattedErrors,
        data: process.env.NODE_ENV === 'development' ? data : undefined,
      })

      return {
        data: null,
        error: ApiResponse.validationError(formattedErrors),
      }
    }

    logger.error('Unexpected validation error', error as Error)
    return {
      data: null,
      error: ApiResponse.error({
        error: errorMessage,
        status: 400,
      }),
    }
  }
}

// Helper functions for common validation scenarios
export const validate = {
  body: async <T>(schema: z.Schema<T>, body: unknown) => {
    return validateRequest(schema, body, 'Invalid request body')
  },

  query: async <T>(schema: z.Schema<T>, query: unknown) => {
    return validateRequest(schema, query, 'Invalid query parameters')
  },

  params: async <T>(schema: z.Schema<T>, params: unknown) => {
    return validateRequest(schema, params, 'Invalid path parameters')
  },

  all: async <T extends Record<string, z.Schema>>({
    body,
    query,
    params,
    schemas,
  }: {
    body?: unknown
    query?: unknown
    params?: unknown
    schemas: T
  }) => {
    const results: Record<string, any> = {}
    const errors: Record<string, any> = {}

    if (body && schemas.body) {
      const { data, error } = await validate.body(schemas.body, body)
      if (error) errors.body = error
      if (data) results.body = data
    }

    if (query && schemas.query) {
      const { data, error } = await validate.query(schemas.query, query)
      if (error) errors.query = error
      if (data) results.query = data
    }

    if (params && schemas.params) {
      const { data, error } = await validate.params(schemas.params, params)
      if (error) errors.params = error
      if (data) results.params = data
    }

    if (Object.keys(errors).length > 0) {
      return { data: null, error: errors }
    }

    return { data: results, error: null }
  },
}

export default validate