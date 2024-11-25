"use client"

// Types for focus management
export interface FocusableElement extends HTMLElement {
  focus(options?: FocusOptions): void
  blur(): void
}

// Check if an element is focusable
export function isFocusable(element: HTMLElement): boolean {
  if (!(element instanceof HTMLElement)) return false

  // Check if element is visible
  const isVisible = !!(
    element.offsetWidth ||
    element.offsetHeight ||
    element.getClientRects().length
  )

  // Check computed style
  const computedStyle = window.getComputedStyle(element)
  const isVisibleStyle = 
    computedStyle.visibility !== 'hidden' &&
    computedStyle.display !== 'none'

  // Check if element is enabled and not hidden
  const isEnabled = !element.hasAttribute('disabled') &&
                   !element.hasAttribute('hidden') &&
                   !element.hasAttribute('aria-hidden')

  // Check tabindex
  const tabIndex = element.getAttribute('tabindex')
  const hasValidTabIndex = tabIndex === null || parseInt(tabIndex) >= 0

  return isVisible && isVisibleStyle && isEnabled && hasValidTabIndex
}

// Get all focusable elements within a container
export function getFocusableElements(container: HTMLElement): FocusableElement[] {
  const FOCUSABLE_SELECTORS = [
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

  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
  ).filter(isFocusable) as FocusableElement[]
}

// Get the next focusable element
export function getNextFocusableElement(
  container: HTMLElement,
  currentElement: HTMLElement,
  reverse: boolean = false
): FocusableElement | null {
  const focusableElements = getFocusableElements(container)
  const currentIndex = focusableElements.indexOf(currentElement as FocusableElement)

  if (currentIndex === -1) return null

  const nextIndex = reverse
    ? (currentIndex - 1 + focusableElements.length) % focusableElements.length
    : (currentIndex + 1) % focusableElements.length

  return focusableElements[nextIndex]
}

// Focus management with scroll prevention
export function focusElement(
  element: FocusableElement,
  options: FocusOptions = { preventScroll: true }
): void {
  try {
    element.focus(options)
  } catch (error) {
    console.warn('Failed to focus element:', error)
  }
}

// Save and restore focus
export class FocusGuard {
  private previouslyFocused: HTMLElement | null = null

  saveFocus(): void {
    this.previouslyFocused = document.activeElement as HTMLElement
  }

  restoreFocus(options: FocusOptions = { preventScroll: true }): void {
    if (this.previouslyFocused && this.previouslyFocused instanceof HTMLElement) {
      focusElement(this.previouslyFocused as FocusableElement, options)
    }
  }
}

// Keyboard navigation utilities
export const KeyboardNavigation = {
  isTab: (event: KeyboardEvent): boolean => event.key === 'Tab',
  isShiftTab: (event: KeyboardEvent): boolean => event.key === 'Tab' && event.shiftKey,
  isEscape: (event: KeyboardEvent): boolean => event.key === 'Escape',
  isEnter: (event: KeyboardEvent): boolean => event.key === 'Enter',
  isSpace: (event: KeyboardEvent): boolean => event.key === ' ' || event.key === 'Spacebar',
  isArrowUp: (event: KeyboardEvent): boolean => event.key === 'ArrowUp',
  isArrowDown: (event: KeyboardEvent): boolean => event.key === 'ArrowDown',
  isArrowLeft: (event: KeyboardEvent): boolean => event.key === 'ArrowLeft',
  isArrowRight: (event: KeyboardEvent): boolean => event.key === 'ArrowRight',
  isHome: (event: KeyboardEvent): boolean => event.key === 'Home',
  isEnd: (event: KeyboardEvent): boolean => event.key === 'End',
  isPageUp: (event: KeyboardEvent): boolean => event.key === 'PageUp',
  isPageDown: (event: KeyboardEvent): boolean => event.key === 'PageDown',
  isModifier: (event: KeyboardEvent): boolean => event.ctrlKey || event.altKey || event.metaKey,
  isNavigationKey: (event: KeyboardEvent): boolean => {
    return KeyboardNavigation.isArrowUp(event) ||
           KeyboardNavigation.isArrowDown(event) ||
           KeyboardNavigation.isArrowLeft(event) ||
           KeyboardNavigation.isArrowRight(event) ||
           KeyboardNavigation.isHome(event) ||
           KeyboardNavigation.isEnd(event) ||
           KeyboardNavigation.isPageUp(event) ||
           KeyboardNavigation.isPageDown(event)
  }
}

// Focus trap boundary for handling focus wrapping
export class FocusTrapBoundary {
  private container: HTMLElement
  private focusGuard: FocusGuard

  constructor(container: HTMLElement) {
    this.container = container
    this.focusGuard = new FocusGuard()
  }

  activate(): void {
    this.focusGuard.saveFocus()
    const firstFocusable = getFocusableElements(this.container)[0]
    if (firstFocusable) {
      focusElement(firstFocusable)
    }
  }

  deactivate(): void {
    this.focusGuard.restoreFocus()
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (!KeyboardNavigation.isTab(event)) return

    const focusableElements = getFocusableElements(this.container)
    if (!focusableElements.length) return

    const firstFocusable = focusableElements[0]
    const lastFocusable = focusableElements[focusableElements.length - 1]
    const activeElement = document.activeElement as HTMLElement

    if (KeyboardNavigation.isShiftTab(event) && activeElement === firstFocusable) {
      event.preventDefault()
      focusElement(lastFocusable)
    } else if (!event.shiftKey && activeElement === lastFocusable) {
      event.preventDefault()
      focusElement(firstFocusable)
    }
  }
}