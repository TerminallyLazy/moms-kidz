"use client"

import { useState, useEffect } from 'react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useMediaQuery } from '@/hooks/use-media-query'

interface AppLayoutPreferences {
  sidebarCollapsed: boolean
  sidebarPosition: 'left' | 'right'
  showKeyboardShortcuts: boolean
  keyboardShortcutsPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  showGradient: boolean
  contentWidth: 'default' | 'full' | 'narrow'
}

const DEFAULT_PREFERENCES: AppLayoutPreferences = {
  sidebarCollapsed: false,
  sidebarPosition: 'left',
  showKeyboardShortcuts: true,
  keyboardShortcutsPosition: 'bottom-right',
  showGradient: true,
  contentWidth: 'default'
}

export function useAppLayout() {
  // Local storage for persisting preferences
  const [preferences, setPreferences] = useLocalStorage<AppLayoutPreferences>(
    'app-layout-preferences',
    DEFAULT_PREFERENCES
  )

  // Responsive state
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Automatically collapse sidebar on mobile
  useEffect(() => {
    if (!isDesktop && !preferences.sidebarCollapsed) {
      setPreferences(prev => ({ ...prev, sidebarCollapsed: true }))
    }
  }, [isDesktop, preferences.sidebarCollapsed, setPreferences])

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (isDesktop && isMobileMenuOpen) {
      setIsMobileMenuOpen(false)
    }
  }, [isDesktop, isMobileMenuOpen])

  // Toggle functions
  const toggleSidebar = () => {
    setPreferences(prev => ({
      ...prev,
      sidebarCollapsed: !prev.sidebarCollapsed
    }))
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev)
  }

  const setSidebarPosition = (position: 'left' | 'right') => {
    setPreferences(prev => ({ ...prev, sidebarPosition: position }))
  }

  const setKeyboardShortcutsPosition = (
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  ) => {
    setPreferences(prev => ({ ...prev, keyboardShortcutsPosition: position }))
  }

  const toggleKeyboardShortcuts = () => {
    setPreferences(prev => ({
      ...prev,
      showKeyboardShortcuts: !prev.showKeyboardShortcuts
    }))
  }

  const toggleGradient = () => {
    setPreferences(prev => ({ ...prev, showGradient: !prev.showGradient }))
  }

  const setContentWidth = (width: 'default' | 'full' | 'narrow') => {
    setPreferences(prev => ({ ...prev, contentWidth: width }))
  }

  // Reset preferences to defaults
  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES)
  }

  // Computed values
  const contentMaxWidth = {
    default: 'max-w-7xl',
    full: 'max-w-none',
    narrow: 'max-w-3xl'
  }[preferences.contentWidth]

  const sidebarWidth = preferences.sidebarCollapsed ? 'w-16' : 'w-64'

  return {
    // State
    preferences,
    isDesktop,
    isMobileMenuOpen,
    contentMaxWidth,
    sidebarWidth,

    // Actions
    toggleSidebar,
    toggleMobileMenu,
    setSidebarPosition,
    setKeyboardShortcutsPosition,
    toggleKeyboardShortcuts,
    toggleGradient,
    setContentWidth,
    resetPreferences,

    // Computed
    isSidebarVisible: isDesktop || isMobileMenuOpen,
    shouldShowGradient: preferences.showGradient && !preferences.sidebarCollapsed,
    contentPadding: preferences.sidebarCollapsed ? 'pl-16' : 'pl-64'
  }
}

// Types for use in components
export type AppLayoutPreferences = AppLayoutPreferences
export type ContentWidth = AppLayoutPreferences['contentWidth']
export type KeyboardShortcutsPosition = AppLayoutPreferences['keyboardShortcutsPosition']
export type SidebarPosition = AppLayoutPreferences['sidebarPosition']