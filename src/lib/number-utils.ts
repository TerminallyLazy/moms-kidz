import { logger } from './logger'

export class NumberUtils {
  /**
   * Format number with commas and decimal places
   */
  static format(
    number: number,
    options: { 
      decimals?: number;
      separator?: string;
      decimalPoint?: string;
    } = {}
  ): string {
    try {
      const {
        decimals = 2,
        separator = ',',
        decimalPoint = '.'
      } = options

      const parts = number.toFixed(decimals).split('.')
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)
      return parts.join(decimalPoint)
    } catch (error) {
      logger.error('Error formatting number', error as Error, { number, options })
      return number.toString()
    }
  }

  /**
   * Format number as currency
   */
  static formatCurrency(
    amount: number,
    options: {
      currency?: string;
      locale?: string;
      decimals?: number;
    } = {}
  ): string {
    try {
      const {
        currency = 'USD',
        locale = 'en-US',
        decimals = 2
      } = options

      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(amount)
    } catch (error) {
      logger.error('Error formatting currency', error as Error, { amount, options })
      return `${amount}`
    }
  }

  /**
   * Format number as percentage
   */
  static formatPercentage(
    number: number,
    options: {
      decimals?: number;
      includeSymbol?: boolean;
    } = {}
  ): string {
    try {
      const {
        decimals = 1,
        includeSymbol = true
      } = options

      const formatted = (number * 100).toFixed(decimals)
      return includeSymbol ? `${formatted}%` : formatted
    } catch (error) {
      logger.error('Error formatting percentage', error as Error, { number, options })
      return `${number}`
    }
  }

  /**
   * Round number to specified decimal places
   */
  static round(number: number, decimals = 2): number {
    try {
      const factor = Math.pow(10, decimals)
      return Math.round(number * factor) / factor
    } catch (error) {
      logger.error('Error rounding number', error as Error, { number, decimals })
      return number
    }
  }

  /**
   * Clamp number between min and max values
   */
  static clamp(number: number, min: number, max: number): number {
    try {
      return Math.min(Math.max(number, min), max)
    } catch (error) {
      logger.error('Error clamping number', error as Error, { number, min, max })
      return number
    }
  }

  /**
   * Generate random number between min and max
   */
  static random(min: number, max: number, decimals = 0): number {
    try {
      const rand = Math.random() * (max - min) + min
      return this.round(rand, decimals)
    } catch (error) {
      logger.error('Error generating random number', error as Error, { min, max, decimals })
      return min
    }
  }

  /**
   * Calculate percentage
   */
  static calculatePercentage(value: number, total: number): number {
    try {
      if (total === 0) return 0
      return this.round((value / total) * 100, 1)
    } catch (error) {
      logger.error('Error calculating percentage', error as Error, { value, total })
      return 0
    }
  }

  /**
   * Format number as file size
   */
  static formatFileSize(bytes: number): string {
    try {
      const units = ['B', 'KB', 'MB', 'GB', 'TB']
      let size = bytes
      let unitIndex = 0

      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
      }

      return `${this.round(size, 2)} ${units[unitIndex]}`
    } catch (error) {
      logger.error('Error formatting file size', error as Error, { bytes })
      return `${bytes} B`
    }
  }

  /**
   * Format number with metric prefix (K, M, B, etc.)
   */
  static formatMetric(number: number): string {
    try {
      const units = ['', 'K', 'M', 'B', 'T']
      let unitIndex = 0
      let value = number

      while (value >= 1000 && unitIndex < units.length - 1) {
        value /= 1000
        unitIndex++
      }

      return `${this.round(value, 1)}${units[unitIndex]}`
    } catch (error) {
      logger.error('Error formatting metric number', error as Error, { number })
      return number.toString()
    }
  }

  /**
   * Calculate average of numbers
   */
  static average(numbers: number[]): number {
    try {
      if (numbers.length === 0) return 0
      return this.round(numbers.reduce((a, b) => a + b, 0) / numbers.length)
    } catch (error) {
      logger.error('Error calculating average', error as Error, { numbers })
      return 0
    }
  }

  /**
   * Calculate sum of numbers
   */
  static sum(numbers: number[]): number {
    try {
      return this.round(numbers.reduce((a, b) => a + b, 0))
    } catch (error) {
      logger.error('Error calculating sum', error as Error, { numbers })
      return 0
    }
  }
}

export default NumberUtils