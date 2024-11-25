"use client"

import { useEffect, useCallback, useRef } from 'react'
import { KeyboardNavigation } from '@/lib/focus-utils'

type KeyCombo = string | string[] // e.g., 'ctrl+k' or ['ctrl+k', 'cmd+k']
type ShortcutHandler = (event: KeyboardEvent) => void
type ShortcutScope = 'global' | 'modal' | 'dialog' | string

interface ShortcutOptions {
  scope?: ShortcutScope
  preventDefault?: boolean
  stopPropagation?: boolean
  repeat?: boolean
  enabled?: boolean
  description?: string
  group?: string
}

interface ShortcutDefinition extends ShortcutOptions {
  combo: KeyCombo
  handler: ShortcutHandler
}

const parseKeyCombo = (combo: string): string[] => {
  return combo.toLowerCase().split('+').map(key => key.trim())
}

const matchesKeyCombo = (event: KeyboardEvent, combo: string): boolean => {
  const keys = parseKeyCombo(combo)
  const pressedKeys = new Set<string>()

  if (event.ctrlKey) pressedKeys.add('ctrl')
  if (event.altKey) pressedKeys.add('alt')
  if (event.shiftKey) pressedKeys.add('shift')
  if (event.metaKey) pressedKeys.add('cmd')
  pressedKeys.add(event.key.toLowerCase())

  return keys.every(key => pressedKeys.has(key))
}

export function useKeyboardShortcuts(
  shortcuts: Record<string, ShortcutDefinition>,
  options: ShortcutOptions = {}
) {
  const activeShortcuts = useRef<Record<string, ShortcutDefinition>>({})
  const currentScope = useRef<ShortcutScope>('global')

  const setScope = useCallback((scope: ShortcutScope) => {
    currentScope.current = scope
  }, [])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip if target is an input element
    if (
      event.target instanceof HTMLElement &&
      (event.target.tagName === 'INPUT' ||
       event.target.tagName === 'TEXTAREA' ||
       event.target.isContentEditable)
    ) {
      return
    }

    Object.entries(activeShortcuts.current).forEach(([id, shortcut]) => {
      const {
        combo,
        handler,
        scope = 'global',
        preventDefault = true,
        stopPropagation = true,
        repeat = false,
        enabled = true
      } = shortcut

      // Skip if shortcut is disabled or wrong scope
      if (!enabled || (scope !== 'global' && scope !== currentScope.current)) {
        return
      }

      // Skip if key is repeating and repeat is disabled
      if (!repeat && event.repeat) {
        return
      }

      const combos = Array.isArray(combo) ? combo : [combo]
      if (combos.some(c => matchesKeyCombo(event, c))) {
        if (preventDefault) event.preventDefault()
        if (stopPropagation) event.stopPropagation()
        handler(event)
      }
    })
  }, [])

  useEffect(() => {
    activeShortcuts.current = shortcuts
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [shortcuts, handleKeyDown])

  const getShortcutsForScope = useCallback((scope: ShortcutScope = 'global') => {
    return Object.entries(shortcuts)
      .filter(([_, shortcut]) => shortcut.scope === scope)
      .reduce((acc, [id, shortcut]) => {
        acc[id] = shortcut
        return acc
      }, {} as Record<string, ShortcutDefinition>)
  }, [shortcuts])

  const getShortcutGroups = useCallback(() => {
    return Object.entries(shortcuts).reduce((acc, [id, shortcut]) => {
      const group = shortcut.group || 'Other'
      if (!acc[group]) acc[group] = {}
      acc[group][id] = shortcut
      return acc
    }, {} as Record<string, Record<string, ShortcutDefinition>>)
  }, [shortcuts])

  return {
    setScope,
    getShortcutsForScope,
    getShortcutGroups,
    currentScope: currentScope.current
  }
}

// Helper function to format keyboard shortcuts for display
export function formatShortcut(combo: string): string {
  const keys = parseKeyCombo(combo)
  return keys
    .map(key => {
      switch (key) {
        case 'ctrl':
          return '⌃'
        case 'alt':
          return '⌥'
        case 'shift':
          return '⇧'
        case 'cmd':
          return '⌘'
        case 'enter':
          return '↵'
        case 'tab':
          return '⇥'
        case 'escape':
          return 'Esc'
        case 'space':
          return '␣'
        case 'arrowup':
          return '↑'
        case 'arrowdown':
          return '↓'
        case 'arrowleft':
          return '←'
        case 'arrowright':
          return '→'
        default:
          return key.toUpperCase()
      }
    })
    .join(' ')
}