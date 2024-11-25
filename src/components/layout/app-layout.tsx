"use client"

import React from 'react'
import { 
  FloatingKeyboardShortcutsButton,
  TextKeyboardShortcutsButton,
  MiniKeyboardShortcutsButton 
} from '@/components/keyboard-shortcuts-button'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  children: React.ReactNode
  className?: string
  showKeyboardShortcuts?: boolean
  keyboardShortcutsPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  showGradient?: boolean
}

export function AppLayout({
  children,
  className,
  showKeyboardShortcuts = true,
  keyboardShortcutsPosition = 'bottom-right',
  showGradient = true
}: AppLayoutProps) {
  return (
    <div className={cn(
      "relative min-h-screen bg-background",
      "flex flex-col",
      className
    )}>
      {/* Accessibility Skip Links */}
      <div className="sr-only focus-within:not-sr-only">
        <a
          href="#main-content"
          className={cn(
            "absolute left-4 top-4 z-50",
            "rounded-md bg-background px-4 py-2",
            "text-sm font-medium text-foreground",
            "ring-2 ring-ring",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          )}
        >
          Skip to main content
        </a>
      </div>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 relative">
        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>

        {/* Background Decorations */}
        {showGradient && (
          <div 
            className="pointer-events-none fixed inset-0 z-30 transition duration-300 lg:absolute"
            aria-hidden="true"
          >
            <div className="absolute inset-0 overflow-hidden">
              <div 
                className={cn(
                  "h-full bg-gradient-to-tr",
                  "from-primary/10 via-purple-500/10 to-cyan-500/10",
                  "dark:from-purple-500/5 dark:via-cyan-500/5 dark:to-primary/5",
                  "opacity-30 dark:opacity-40",
                  "transition-opacity duration-500"
                )} 
              />
              <div 
                className={cn(
                  "absolute inset-0 bg-background/80",
                  "backdrop-blur-[1px]",
                  "transition-opacity duration-500"
                )}
              />
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Button */}
        {showKeyboardShortcuts && (
          <FloatingKeyboardShortcutsButton 
            position={keyboardShortcutsPosition}
            className={cn(
              "animate-in fade-in slide-in-from-bottom-4",
              "duration-500 delay-500",
              "shadow-lg dark:shadow-primary/10"
            )}
          />
        )}
      </main>
    </div>
  )
}

// Header variant with keyboard shortcuts in the navigation
export function AppHeader({
  className,
  children,
  showKeyboardShortcuts = true,
  sticky = true
}: {
  className?: string
  children: React.ReactNode
  showKeyboardShortcuts?: boolean
  sticky?: boolean
}) {
  return (
    <header 
      className={cn(
        sticky && "sticky top-0 z-40",
        "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "transition-colors duration-500",
        className
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          {children}
        </div>
        {showKeyboardShortcuts && (
          <div className="flex items-center gap-4">
            <TextKeyboardShortcutsButton 
              className="hidden sm:flex"
            />
            <MiniKeyboardShortcutsButton 
              className="sm:hidden"
              showTooltip={false}
            />
          </div>
        )}
      </div>
    </header>
  )
}

// Sidebar variant with keyboard shortcuts at the bottom
export function AppSidebar({
  className,
  children,
  showKeyboardShortcuts = true,
  side = 'left'
}: {
  className?: string
  children: React.ReactNode
  showKeyboardShortcuts?: boolean
  side?: 'left' | 'right'
}) {
  return (
    <aside 
      className={cn(
        "fixed inset-y-0 z-30",
        side === 'left' ? 'left-0' : 'right-0',
        "w-64 border-r bg-background/95",
        "backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "flex flex-col",
        "transition-colors duration-500",
        className
      )}
    >
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
      {showKeyboardShortcuts && (
        <div className="border-t p-4">
          <MiniKeyboardShortcutsButton 
            className="w-full"
            variant="ghost"
          />
        </div>
      )}
    </aside>
  )
}

// Content wrapper for use with sidebar
export function AppContent({
  className,
  children,
  sidebarSide = 'left'
}: {
  className?: string
  children: React.ReactNode
  sidebarSide?: 'left' | 'right'
}) {
  return (
    <div 
      className={cn(
        "ml-64",
        sidebarSide === 'right' && "ml-0 mr-64",
        className
      )}
    >
      {children}
    </div>
  )
}
