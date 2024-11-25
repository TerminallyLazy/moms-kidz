import { logger } from './logger'

type EventCallback = (...args: any[]) => void
type EventMap = Map<string, Set<EventCallback>>

export class EventUtils {
  private static instance: EventUtils
  private events: EventMap = new Map()
  private readonly MAX_LISTENERS = 10

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): EventUtils {
    if (!EventUtils.instance) {
      EventUtils.instance = new EventUtils()
    }
    return EventUtils.instance
  }

  /**
   * Subscribe to event
   */
  public on(event: string, callback: EventCallback): () => void {
    try {
      if (!this.events.has(event)) {
        this.events.set(event, new Set())
      }

      const listeners = this.events.get(event)!

      if (listeners.size >= this.MAX_LISTENERS) {
        logger.warn('Max listeners reached for event', { event, maxListeners: this.MAX_LISTENERS })
      }

      listeners.add(callback)

      // Return unsubscribe function
      return () => this.off(event, callback)
    } catch (error) {
      logger.error('Error subscribing to event', error as Error, { event })
      return () => {}
    }
  }

  /**
   * Subscribe to event once
   */
  public once(event: string, callback: EventCallback): () => void {
    try {
      const onceCallback = (...args: any[]) => {
        this.off(event, onceCallback)
        callback(...args)
      }

      return this.on(event, onceCallback)
    } catch (error) {
      logger.error('Error subscribing to event once', error as Error, { event })
      return () => {}
    }
  }

  /**
   * Unsubscribe from event
   */
  public off(event: string, callback: EventCallback): void {
    try {
      const listeners = this.events.get(event)
      if (listeners) {
        listeners.delete(callback)
        if (listeners.size === 0) {
          this.events.delete(event)
        }
      }
    } catch (error) {
      logger.error('Error unsubscribing from event', error as Error, { event })
    }
  }

  /**
   * Emit event
   */
  public emit(event: string, ...args: any[]): void {
    try {
      const listeners = this.events.get(event)
      if (listeners) {
        listeners.forEach(callback => {
          try {
            callback(...args)
          } catch (error) {
            logger.error('Error in event callback', error as Error, { event })
          }
        })
      }
    } catch (error) {
      logger.error('Error emitting event', error as Error, { event })
    }
  }

  /**
   * Clear all event listeners
   */
  public clear(): void {
    try {
      this.events.clear()
    } catch (error) {
      logger.error('Error clearing events', error as Error)
    }
  }

  /**
   * Get number of listeners for event
   */
  public listenerCount(event: string): number {
    return this.events.get(event)?.size || 0
  }

  /**
   * Get all event names
   */
  public eventNames(): string[] {
    return Array.from(this.events.keys())
  }

  /**
   * Create custom event
   */
  public static createCustomEvent<T>(
    name: string,
    detail: T,
    options: CustomEventInit = {}
  ): CustomEvent<T> {
    return new CustomEvent(name, {
      detail,
      bubbles: true,
      cancelable: true,
      ...options,
    })
  }

  /**
   * Dispatch custom event
   */
  public static dispatchCustomEvent<T>(
    element: Element | Document | Window,
    name: string,
    detail: T,
    options: CustomEventInit = {}
  ): boolean {
    try {
      const event = this.createCustomEvent(name, detail, options)
      return element.dispatchEvent(event)
    } catch (error) {
      logger.error('Error dispatching custom event', error as Error, { name })
      return false
    }
  }

  /**
   * Add event listener with automatic cleanup
   */
  public static addListener(
    element: Element | Document | Window,
    event: string,
    callback: EventListener,
    options?: AddEventListenerOptions
  ): () => void {
    try {
      element.addEventListener(event, callback, options)
      return () => element.removeEventListener(event, callback, options)
    } catch (error) {
      logger.error('Error adding event listener', error as Error, { event })
      return () => {}
    }
  }

  /**
   * Debounce event handler
   */
  public static debounce(
    callback: (...args: any[]) => void,
    delay: number
  ): (...args: any[]) => void {
    let timeoutId: NodeJS.Timeout

    return (...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => callback(...args), delay)
    }
  }

  /**
   * Throttle event handler
   */
  public static throttle(
    callback: (...args: any[]) => void,
    limit: number
  ): (...args: any[]) => void {
    let waiting = false

    return (...args: any[]) => {
      if (!waiting) {
        callback(...args)
        waiting = true
        setTimeout(() => {
          waiting = false
        }, limit)
      }
    }
  }
}

// Export singleton instance
export const eventBus = EventUtils.getInstance()

// Export static methods
export const {
  createCustomEvent,
  dispatchCustomEvent,
  addListener,
  debounce,
  throttle,
} = EventUtils

export default eventBus