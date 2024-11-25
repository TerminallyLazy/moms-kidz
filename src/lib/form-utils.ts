import { z } from 'zod'
import { logger } from './logger'

export class FormUtils {
  /**
   * Validate form data against schema
   */
  static async validate<T>(
    schema: z.Schema<T>,
    data: unknown
  ): Promise<{ data: T | null; errors: Record<string, string[]> | null }> {
    try {
      const result = await schema.safeParseAsync(data)
      
      if (!result.success) {
        const errors: Record<string, string[]> = {}
        
        result.error.errors.forEach(error => {
          const path = error.path.join('.')
          if (!errors[path]) {
            errors[path] = []
          }
          errors[path].push(error.message)
        })

        return { data: null, errors }
      }

      return { data: result.data, errors: null }
    } catch (error) {
      logger.error('Error validating form data', error as Error)
      return { 
        data: null, 
        errors: { _error: ['An unexpected error occurred during validation'] }
      }
    }
  }

  /**
   * Serialize form data to object
   */
  static serializeForm(form: HTMLFormElement): Record<string, any> {
    try {
      const formData = new FormData(form)
      const data: Record<string, any> = {}

      formData.forEach((value, key) => {
        // Handle array fields (multiple select, checkboxes)
        if (key.endsWith('[]')) {
          const arrayKey = key.slice(0, -2)
          if (!data[arrayKey]) {
            data[arrayKey] = []
          }
          data[arrayKey].push(value)
        } else {
          data[key] = value
        }
      })

      return data
    } catch (error) {
      logger.error('Error serializing form', error as Error)
      return {}
    }
  }

  /**
   * Populate form with data
   */
  static populateForm(form: HTMLFormElement, data: Record<string, any>): void {
    try {
      Object.entries(data).forEach(([key, value]) => {
        const element = form.elements.namedItem(key) as HTMLInputElement | HTMLSelectElement | null
        if (!element) return

        if (element instanceof HTMLSelectElement) {
          if (Array.isArray(value)) {
            Array.from(element.options).forEach(option => {
              option.selected = value.includes(option.value)
            })
          } else {
            element.value = value
          }
        } else if (element instanceof HTMLInputElement) {
          if (element.type === 'checkbox') {
            element.checked = Boolean(value)
          } else if (element.type === 'radio') {
            const radio = form.querySelector(`input[name="${key}"][value="${value}"]`) as HTMLInputElement
            if (radio) {
              radio.checked = true
            }
          } else {
            element.value = value
          }
        }
      })
    } catch (error) {
      logger.error('Error populating form', error as Error)
    }
  }

  /**
   * Reset form with optional default values
   */
  static resetForm(
    form: HTMLFormElement,
    defaultValues?: Record<string, any>
  ): void {
    try {
      form.reset()
      if (defaultValues) {
        this.populateForm(form, defaultValues)
      }
    } catch (error) {
      logger.error('Error resetting form', error as Error)
    }
  }

  /**
   * Get form field errors
   */
  static getFieldErrors(
    errors: Record<string, string[]> | null,
    field: string
  ): string[] {
    return errors?.[field] || []
  }

  /**
   * Check if form field has errors
   */
  static hasFieldErrors(
    errors: Record<string, string[]> | null,
    field: string
  ): boolean {
    return Boolean(errors?.[field]?.length)
  }

  /**
   * Format form data for API submission
   */
  static formatFormData(
    data: Record<string, any>,
    options: {
      trim?: boolean;
      removeEmpty?: boolean;
      removeNull?: boolean;
      removeUndefined?: boolean;
    } = {}
  ): Record<string, any> {
    try {
      const {
        trim = true,
        removeEmpty = true,
        removeNull = true,
        removeUndefined = true,
      } = options

      return Object.entries(data).reduce((acc, [key, value]) => {
        // Skip null/undefined values if configured
        if ((removeNull && value === null) || 
            (removeUndefined && value === undefined)) {
          return acc
        }

        // Handle string values
        if (typeof value === 'string') {
          const processedValue = trim ? value.trim() : value
          if (!removeEmpty || processedValue !== '') {
            acc[key] = processedValue
          }
          return acc
        }

        // Handle arrays
        if (Array.isArray(value)) {
          const processedArray = value.filter(item => {
            if (removeNull && item === null) return false
            if (removeUndefined && item === undefined) return false
            if (removeEmpty && item === '') return false
            return true
          })
          if (!removeEmpty || processedArray.length > 0) {
            acc[key] = processedArray
          }
          return acc
        }

        acc[key] = value
        return acc
      }, {} as Record<string, any>)
    } catch (error) {
      logger.error('Error formatting form data', error as Error)
      return data
    }
  }

  /**
   * Validate file upload
   */
  static validateFile(
    file: File,
    options: {
      maxSize?: number;
      allowedTypes?: string[];
      maxDimensions?: { width: number; height: number };
    } = {}
  ): Promise<{ valid: boolean; error?: string }> {
    return new Promise((resolve) => {
      try {
        const {
          maxSize,
          allowedTypes,
          maxDimensions,
        } = options

        // Check file size
        if (maxSize && file.size > maxSize) {
          resolve({
            valid: false,
            error: `File size must be less than ${maxSize / (1024 * 1024)}MB`,
          })
          return
        }

        // Check file type
        if (allowedTypes && !allowedTypes.includes(file.type)) {
          resolve({
            valid: false,
            error: `File type must be one of: ${allowedTypes.join(', ')}`,
          })
          return
        }

        // Check image dimensions
        if (maxDimensions && file.type.startsWith('image/')) {
          const img = new Image()
          const objectUrl = URL.createObjectURL(file)

          img.onload = () => {
            URL.revokeObjectURL(objectUrl)
            if (img.width > maxDimensions.width || img.height > maxDimensions.height) {
              resolve({
                valid: false,
                error: `Image dimensions must be ${maxDimensions.width}x${maxDimensions.height} or smaller`,
              })
            } else {
              resolve({ valid: true })
            }
          }

          img.onerror = () => {
            URL.revokeObjectURL(objectUrl)
            resolve({
              valid: false,
              error: 'Invalid image file',
            })
          }

          img.src = objectUrl
        } else {
          resolve({ valid: true })
        }
      } catch (error) {
        logger.error('Error validating file', error as Error)
        resolve({
          valid: false,
          error: 'Error validating file',
        })
      }
    })
  }
}

export default FormUtils