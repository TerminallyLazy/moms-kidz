"use client"

import React, { createContext, useContext, useCallback, useState } from 'react'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { toast } from 'sonner'
import { KeyboardShortcutsHelp } from '@/components/keyboard-shortcuts-help'

interface KeyboardShortcutsContextType {
  setScope: (scope: string) => void
  getShortcutsForScope: (scope?: string) => Record<string, any>
  getShortcutGroups: () => Record<string, Record<string, any>>
  currentScope: string
  formatShortcut: (combo: string) => string
  showShortcutsHelp: () => void
  hideShortcutsHelp: () => void
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined)

// Default application shortcuts
const DEFAULT_SHORTCUTS = {
  'command-palette': {
    combo: ['ctrl+k', 'cmd+k'],
    description: 'Open command palette',
    group: 'Navigation',
    handler: () => {
      toast.info('Command palette coming soon!')
    }
  },
  'toggle-theme': {
    combo: ['ctrl+t', 'cmd+t'],
    description: 'Toggle dark/light theme',
    group: 'Appearance',
    handler: () => {
      toast.info('Theme toggle coming soon!')
    }
  },
  'keyboard-help': {
    combo: '?',
    description: 'Show keyboard shortcuts',
    group: 'Help',
    handler: () => {
      // This will be overridden in the provider
      toast.info('Keyboard shortcuts help coming soon!')
    }
  },
  'focus-search': {
    combo: ['ctrl+/', 'cmd+/'],
    description: 'Focus search',
    group: 'Navigation',
    handler: () => {
      const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]')
      if (searchInput) {
        searchInput.focus()
      }
    }
  },
  'escape': {
    combo: 'escape',
    description: 'Close modal/dialog',
    group: 'Navigation',
    scope: 'modal',
    handler: () => {
      // This will be handled by individual modals
    }
  }
}

export function KeyboardShortcutsProvider({
  children,
  shortcuts: customShortcuts = {}
}: {
  children: React.ReactNode
  shortcuts?: Record<string, any>
}) {
  const [isHelpVisible, setIsHelpVisible] = useState(false)

  // Merge custom shortcuts with defaults, overriding the keyboard help handler
  const shortcuts = {
    ...DEFAULT_SHORTCUTS,
    ...customShortcuts,
    'keyboard-help': {
      ...DEFAULT_SHORTCUTS['keyboard-help'],
      handler: () => setIsHelpVisible(true)
    }
  }

  const {
    setScope,
    getShortcutsForScope,
    getShortcutGroups,
    currentScope,
    formatShortcut
  } = useKeyboardShortcuts(shortcuts)

  const showShortcutsHelp = useCallback(() => {
    setIsHelpVisible(true)
  }, [])

  const hideShortcutsHelp = useCallback(() => {
    setIsHelpVisible(false)
  }, [])

  const value = {
    setScope,
    getShortcutsForScope,
    getShortcutGroups,
    currentScope,
    formatShortcut,
    showShortcutsHelp,
    hideShortcutsHelp
  }

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
      <KeyboardShortcutsHelp 
        isOpen={isHelpVisible}
        onClose={hideShortcutsHelp}
      />
    </KeyboardShortcutsContext.Provider>
  )
}

export function useKeyboardShortcutsContext() {
  const context = useContext(KeyboardShortcutsContext)
  if (context === undefined) {
    throw new Error(
      'useKeyboardShortcutsContext must be used within a KeyboardShortcutsProvider'
    )
  }
  return context
}

// Hook for components that need to register their own shortcuts
export function useComponentShortcuts(
  componentShortcuts: Record<string, any>,
  scope: string
) {
  const { setScope } = useKeyboardShortcutsContext()

  const registerShortcuts = useCallback(() => {
    setScope(scope)
    // Additional registration logic can be added here
  }, [setScope, scope])

  const unregisterShortcuts = useCallback(() => {
    setScope('global')
    // Additional cleanup logic can be added here
  }, [setScope])

  React.useEffect(() => {
    registerShortcuts()
    return () => {
      unregisterShortcuts()
    }
  }, [registerShortcuts, unregisterShortcuts])

  return {
    registerShortcuts,
    unregisterShortcuts
  }
}

// Helper hook for modal/dialog keyboard shortcuts
export function useModalShortcuts(onClose: () => void) {
  return useComponentShortcuts({
    'modal-close': {
      combo: 'escape',
      description: 'Close modal',
      handler: onClose
    }
  }, 'modal')
}

// Helper hook for form keyboard shortcuts
export function useFormShortcuts(onSubmit: () => void) {
  return useComponentShortcuts({
    'form-submit': {
      combo: ['ctrl+enter', 'cmd+enter'],
      description: 'Submit form',
      handler: onSubmit
    }
  }, 'form')
}
