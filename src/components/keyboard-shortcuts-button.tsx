"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Keyboard } from 'lucide-react'
import { useKeyboardShortcutsContext } from '@/providers/keyboard-shortcuts-provider'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/ui/tooltip'

interface KeyboardShortcutsButtonProps {
  className?: string
  variant?: 'default' | 'secondary' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showTooltip?: boolean
}

export function KeyboardShortcutsButton({
  className,
  variant = 'outline',
  size = 'icon',
  showTooltip = true
}: KeyboardShortcutsButtonProps) {
  const { showShortcutsHelp } = useKeyboardShortcutsContext()

  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={showShortcutsHelp}
      className={cn(
        "relative",
        size === 'icon' && "h-9 w-9",
        className
      )}
      aria-label="Show keyboard shortcuts"
    >
      <Keyboard className={cn(
        "h-4 w-4",
        size !== 'icon' && "mr-2"
      )} />
      {size !== 'icon' && (
        <span>Keyboard Shortcuts</span>
      )}
      <kbd className={cn(
        "absolute right-1.5 top-1.5",
        "pointer-events-none select-none",
        "rounded bg-muted px-1.5 py-0.5",
        "text-[10px] font-medium text-muted-foreground",
        "opacity-100 transition-opacity duration-100",
        "group-hover:opacity-0",
        size === 'icon' ? "flex" : "hidden"
      )}>
        ?
      </kbd>
    </Button>
  )

  if (!showTooltip) return button

  return (
    <Tooltip content="Show keyboard shortcuts (Press '?' to toggle)">
      {button}
    </Tooltip>
  )
}

// Floating variant that can be positioned anywhere on the screen
export function FloatingKeyboardShortcutsButton({
  position = 'bottom-right',
  className,
  ...props
}: KeyboardShortcutsButtonProps & {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}) {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  }

  return (
    <div className={cn(
      "fixed z-50",
      positionClasses[position],
      className
    )}>
      <KeyboardShortcutsButton {...props} />
    </div>
  )
}

// Mini variant for compact spaces
export function MiniKeyboardShortcutsButton({
  className,
  ...props
}: KeyboardShortcutsButtonProps) {
  return (
    <KeyboardShortcutsButton
      variant="ghost"
      size="sm"
      className={cn("h-7 w-7 rounded-full", className)}
      {...props}
    />
  )
}

// Text variant that shows the shortcut inline
export function TextKeyboardShortcutsButton({
  className,
  ...props
}: KeyboardShortcutsButtonProps) {
  const { showShortcutsHelp } = useKeyboardShortcutsContext()

  return (
    <button
      onClick={showShortcutsHelp}
      className={cn(
        "inline-flex items-center space-x-1",
        "text-sm text-muted-foreground",
        "hover:text-foreground transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "rounded px-1.5 py-0.5",
        className
      )}
      {...props}
    >
      <Keyboard className="h-3 w-3" />
      <span>Press</span>
      <kbd className="px-1 py-0.5 rounded bg-muted text-xs">?</kbd>
      <span>for shortcuts</span>
    </button>
  )
}