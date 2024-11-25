"use client"

import { useEffect, useRef, RefObject, useCallback } from 'react'

interface UseFocusTrapOptions {
  enabled?: boolean
  initialFocus?: RefObject<HTMLElement>
  returnFocus?: boolean
  escapeDeactivates?: boolean
  clickOutsideDeactivates?: boolean
  onDeactivate?: () => void
  onActivate?: () => void
}

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]',
  'audio[controls]',
  'video[controls]',
  'details>summary:first-of-type',
  'details',
].join(',')

export function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  options: UseFocusTrapOptions = {}
) {
  const {
    enabled = true,
    initialFocus,
    returnFocus = true,
    escapeDeactivates = true,
    clickOutsideDeactivates = false,
    onDeactivate,
    onActivate
  } = options

  const firstFocusableRef = useRef<HTMLElement | null>(null)
  const lastFocusableRef = useRef<HTMLElement | null>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)
  const clickOutsideTimeoutRef = useRef<NodeJS.Timeout>()

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []

    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS)
    ).filter(el => {
      // Additional checks for visibility and actual focusability
      return !el.hasAttribute('disabled') &&
             !el.hasAttribute('hidden') &&
             el.offsetWidth > 0 &&
             el.offsetHeight > 0 &&
             window.getComputedStyle(el).visibility !== 'hidden'
    })
  }, [containerRef])

  const updateRefs = useCallback(() => {
    const focusableElements = getFocusableElements()
    firstFocusableRef.current = focusableElements[0]
    lastFocusableRef.current = focusableElements[focusableElements.length - 1]
  }, [getFocusableElements])

  const setInitialFocus = useCallback(() => {
    if (initialFocus?.current) {
      initialFocus.current.focus({ preventScroll: true })
    } else if (firstFocusableRef.current) {
      firstFocusableRef.current.focus({ preventScroll: true })
    }
  }, [initialFocus])

  const deactivate = useCallback(() => {
    if (returnFocus && previousActiveElement.current) {
      previousActiveElement.current.focus({ preventScroll: true })
    }
    onDeactivate?.()
  }, [returnFocus, onDeactivate])

  useEffect(() => {
    if (!enabled || !containerRef.current) return

    // Save current active element
    previousActiveElement.current = document.activeElement as HTMLElement

    // Initialize
    updateRefs()
    setInitialFocus()
    onActivate?.()

    // Handle tab key
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle escape key
      if (escapeDeactivates && event.key === 'Escape') {
        event.preventDefault()
        deactivate()
        return
      }

      if (event.key !== 'Tab') return

      // Update refs in case DOM has changed
      updateRefs()

      if (!firstFocusableRef.current || !lastFocusableRef.current) return

      const isTabbing = !event.shiftKey
      const isShiftTabbing = event.shiftKey

      if (isTabbing && document.activeElement === lastFocusableRef.current) {
        event.preventDefault()
        firstFocusableRef.current.focus({ preventScroll: true })
      }

      if (isShiftTabbing && document.activeElement === firstFocusableRef.current) {
        event.preventDefault()
        lastFocusableRef.current.focus({ preventScroll: true })
      }
    }

    // Handle clicks outside
    const handleClickOutside = (event: MouseEvent) => {
      if (!clickOutsideDeactivates || !containerRef.current) return

      const target = event.target as Node
      if (!containerRef.current.contains(target)) {
        // Small timeout to allow other click handlers to execute
        clickOutsideTimeoutRef.current = setTimeout(() => {
          deactivate()
        }, 0)
      }
    }

    // Handle focus outside
    const handleFocusOutside = (event: FocusEvent) => {
      if (!containerRef.current) return

      const target = event.target as Node
      if (!containerRef.current.contains(target)) {
        const focusableElements = getFocusableElements()
        const lastFocused = focusableElements[focusableElements.length - 1]
        if (lastFocused) {
          lastFocused.focus({ preventScroll: true })
        }
      }
    }

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('focusin', handleFocusOutside)

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('focusin', handleFocusOutside)
      clearTimeout(clickOutsideTimeoutRef.current)

      if (enabled) {
        deactivate()
      }
    }
  }, [
    enabled,
    containerRef,
    initialFocus,
    escapeDeactivates,
    clickOutsideDeactivates,
    updateRefs,
    setInitialFocus,
    deactivate,
    getFocusableElements,
    onActivate
  ])

  return {
    focusFirst: () => firstFocusableRef.current?.focus({ preventScroll: true }),
    focusLast: () => lastFocusableRef.current?.focus({ preventScroll: true }),
    getFocusableElements,
    updateRefs,
    deactivate
  }
}
