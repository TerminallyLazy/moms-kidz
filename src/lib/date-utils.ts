import { format, formatDistance, formatRelative, isValid, parseISO } from 'date-fns'
import { logger } from './logger'

export class DateUtils {
  /**
   * Format a date using a specified format string
   */
  static format(date: Date | string | number, formatStr: string = 'PPP'): string {
    try {
      const dateObj = this.toDate(date)
      if (!isValid(dateObj)) {
        throw new Error('Invalid date')
      }
      return format(dateObj, formatStr)
    } catch (error) {
      logger.error('Error formatting date', error as Error, { date, formatStr })
      return 'Invalid date'
    }
  }

  /**
   * Convert various date inputs to a Date object
   */
  static toDate(date: Date | string | number): Date {
    if (date instanceof Date) return date
    if (typeof date === 'string') return parseISO(date)
    return new Date(date)
  }

  /**
   * Get relative time string (e.g., "5 minutes ago")
   */
  static getRelativeTime(date: Date | string | number, baseDate: Date = new Date()): string {
    try {
      const dateObj = this.toDate(date)
      if (!isValid(dateObj)) {
        throw new Error('Invalid date')
      }
      return formatDistance(dateObj, baseDate, { addSuffix: true })
    } catch (error) {
      logger.error('Error getting relative time', error as Error, { date })
      return 'Invalid date'
    }
  }

  /**
   * Format relative date based on current date (e.g., "yesterday at 2:30 PM")
   */
  static formatRelative(date: Date | string | number, baseDate: Date = new Date()): string {
    try {
      const dateObj = this.toDate(date)
      if (!isValid(dateObj)) {
        throw new Error('Invalid date')
      }
      return formatRelative(dateObj, baseDate)
    } catch (error) {
      logger.error('Error formatting relative date', error as Error, { date })
      return 'Invalid date'
    }
  }

  /**
   * Get start of day
   */
  static startOfDay(date: Date | string | number): Date {
    const dateObj = this.toDate(date)
    dateObj.setHours(0, 0, 0, 0)
    return dateObj
  }

  /**
   * Get end of day
   */
  static endOfDay(date: Date | string | number): Date {
    const dateObj = this.toDate(date)
    dateObj.setHours(23, 59, 59, 999)
    return dateObj
  }

  /**
   * Check if a date is today
   */
  static isToday(date: Date | string | number): boolean {
    const today = new Date()
    const dateObj = this.toDate(date)
    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    )
  }

  /**
   * Get date ranges for common periods
   */
  static getDateRange(period: 'today' | 'week' | 'month' | 'year') {
    const now = new Date()
    const start = new Date(now)
    const end = new Date(now)

    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        break
      case 'week':
        start.setDate(now.getDate() - now.getDay())
        start.setHours(0, 0, 0, 0)
        end.setDate(start.getDate() + 6)
        end.setHours(23, 59, 59, 999)
        break
      case 'month':
        start.setDate(1)
        start.setHours(0, 0, 0, 0)
        end.setMonth(start.getMonth() + 1)
        end.setDate(0)
        end.setHours(23, 59, 59, 999)
        break
      case 'year':
        start.setMonth(0, 1)
        start.setHours(0, 0, 0, 0)
        end.setMonth(11, 31)
        end.setHours(23, 59, 59, 999)
        break
    }

    return { start, end }
  }

  /**
   * Format duration in milliseconds to human readable string
   */
  static formatDuration(ms: number): string {
    const seconds = Math.floor((ms / 1000) % 60)
    const minutes = Math.floor((ms / (1000 * 60)) % 60)
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
    const days = Math.floor(ms / (1000 * 60 * 60 * 24))

    const parts = []
    if (days > 0) parts.push(`${days}d`)
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)
    if (seconds > 0) parts.push(`${seconds}s`)

    return parts.join(' ') || '0s'
  }

  /**
   * Get age from birthdate
   */
  static getAge(birthDate: Date | string | number): number {
    const today = new Date()
    const birth = this.toDate(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  /**
   * Format age in months for young children
   */
  static formatAgeInMonths(birthDate: Date | string | number): string {
    const today = new Date()
    const birth = this.toDate(birthDate)
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + 
      (today.getMonth() - birth.getMonth())
    
    if (months < 24) {
      return `${months} month${months === 1 ? '' : 's'}`
    }
    
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    
    if (remainingMonths === 0) {
      return `${years} year${years === 1 ? '' : 's'}`
    }
    
    return `${years} year${years === 1 ? '' : 's'} ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`
  }
}

export default DateUtils