"use client"

import { useHotkeys } from "react-hotkeys-hook"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useAuthContext } from "@/contexts/auth-context"

interface UseShortcutsOptions {
  onCommandPalette?: () => void
  onShortcutsDialog?: () => void
}

export function useShortcuts(options: UseShortcutsOptions = {}) {
  const router = useRouter()
  const { setTheme, theme } = useTheme()
  const { user } = useAuthContext()

  // Command palette
  useHotkeys('cmd+k, ctrl+k', (e) => {
    e.preventDefault()
    options.onCommandPalette?.()
  })

  // Navigation shortcuts (only work when authenticated)
  useHotkeys('cmd+p, ctrl+p', () => {
    if (user) router.push('/profile')
  })

  useHotkeys('cmd+l, ctrl+l', () => {
    if (user) router.push('/care-log')
  })

  useHotkeys('cmd+a, ctrl+a', () => {
    if (user) router.push('/activities')
  })

  // Theme toggle
  useHotkeys('cmd+d, ctrl+d', () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  })

  // Keyboard shortcuts dialog
  useHotkeys('cmd+/, ctrl+/', () => {
    options.onShortcutsDialog?.()
  })

  // Return the list of available shortcuts for documentation
  const shortcuts = [
    { keys: ['⌘', 'K'], description: 'Open command menu' },
    { keys: ['⌘', 'P'], description: 'Open profile settings' },
    { keys: ['⌘', 'L'], description: 'Open care log' },
    { keys: ['⌘', 'A'], description: 'View all activities' },
    { keys: ['⌘', '/'], description: 'Show keyboard shortcuts' },
    { keys: ['⌘', 'D'], description: 'Toggle dark mode' },
  ]

  return {
    shortcuts,
    isAuthenticated: !!user,
    currentTheme: theme,
  }
}

// Constants for use in components
export const SHORTCUT_KEYS = {
  COMMAND_PALETTE: ['⌘', 'K'],
  PROFILE: ['⌘', 'P'],
  CARE_LOG: ['⌘', 'L'],
  ACTIVITIES: ['⌘', 'A'],
  SHORTCUTS: ['⌘', '/'],
  THEME: ['⌘', 'D'],
} as const

export type ShortcutKey = keyof typeof SHORTCUT_KEYS