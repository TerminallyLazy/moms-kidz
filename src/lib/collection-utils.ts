import { logger } from './logger'

export class CollectionUtils {
  /**
   * Group array items by a key
   */
  static groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    try {
      return array.reduce((groups, item) => {
        const groupKey = String(item[key])
        return {
          ...groups,
          [groupKey]: [...(groups[groupKey] || []), item],
        }
      }, {} as Record<string, T[]>)
    } catch (error) {
      logger.error('Error grouping array', error as Error, { key })
      return {}
    }
  }

  /**
   * Sort array by key
   */
  static sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    try {
      return [...array].sort((a, b) => {
        const valueA = a[key]
        const valueB = b[key]

        if (valueA < valueB) return order === 'asc' ? -1 : 1
        if (valueA > valueB) return order === 'asc' ? 1 : -1
        return 0
      })
    } catch (error) {
      logger.error('Error sorting array', error as Error, { key, order })
      return array
    }
  }

  /**
   * Remove duplicates from array
   */
  static unique<T>(array: T[], key?: keyof T): T[] {
    try {
      if (key) {
        const seen = new Set()
        return array.filter(item => {
          const value = item[key]
          if (seen.has(value)) return false
          seen.add(value)
          return true
        })
      }
      return Array.from(new Set(array))
    } catch (error) {
      logger.error('Error removing duplicates', error as Error, { key })
      return array
    }
  }

  /**
   * Chunk array into smaller arrays
   */
  static chunk<T>(array: T[], size: number): T[][] {
    try {
      return array.reduce((chunks, item, index) => {
        const chunkIndex = Math.floor(index / size)
        if (!chunks[chunkIndex]) {
          chunks[chunkIndex] = []
        }
        chunks[chunkIndex].push(item)
        return chunks
      }, [] as T[][])
    } catch (error) {
      logger.error('Error chunking array', error as Error, { size })
      return [array]
    }
  }

  /**
   * Deep clone an object or array
   */
  static deepClone<T>(obj: T): T {
    try {
      return JSON.parse(JSON.stringify(obj))
    } catch (error) {
      logger.error('Error cloning object', error as Error)
      return obj
    }
  }

  /**
   * Deep merge objects
   */
  static deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
    try {
      if (!sources.length) return target
      const source = sources.shift()
      if (source === undefined) return target

      if (this.isObject(target) && this.isObject(source)) {
        Object.keys(source).forEach(key => {
          if (this.isObject(source[key])) {
            if (!target[key]) Object.assign(target, { [key]: {} })
            this.deepMerge(target[key], source[key])
          } else {
            Object.assign(target, { [key]: source[key] })
          }
        })
      }

      return this.deepMerge(target, ...sources)
    } catch (error) {
      logger.error('Error merging objects', error as Error)
      return target
    }
  }

  /**
   * Check if value is an object
   */
  private static isObject(item: any): item is object {
    return item && typeof item === 'object' && !Array.isArray(item)
  }

  /**
   * Pick specific keys from object
   */
  static pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    try {
      return keys.reduce((acc, key) => {
        if (key in obj) acc[key] = obj[key]
        return acc
      }, {} as Pick<T, K>)
    } catch (error) {
      logger.error('Error picking keys from object', error as Error, { keys })
      return {} as Pick<T, K>
    }
  }

  /**
   * Omit specific keys from object
   */
  static omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    try {
      const result = { ...obj }
      keys.forEach(key => delete result[key])
      return result
    } catch (error) {
      logger.error('Error omitting keys from object', error as Error, { keys })
      return obj
    }
  }

  /**
   * Flatten an array of arrays
   */
  static flatten<T>(array: (T | T[])[]): T[] {
    try {
      return array.reduce((flat, item) => 
        flat.concat(Array.isArray(item) ? this.flatten(item) : item), 
        [] as T[]
      )
    } catch (error) {
      logger.error('Error flattening array', error as Error)
      return array as T[]
    }
  }

  /**
   * Get the difference between two arrays
   */
  static difference<T>(array1: T[], array2: T[]): T[] {
    try {
      return array1.filter(item => !array2.includes(item))
    } catch (error) {
      logger.error('Error getting array difference', error as Error)
      return array1
    }
  }
}

export default CollectionUtils