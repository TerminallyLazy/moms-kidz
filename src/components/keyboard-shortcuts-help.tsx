"use client"

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Keyboard, X, Command } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useKeyboardShortcutsContext } from '@/providers/keyboard-shortcuts-provider'
import { useFocusTrap } from '@/hooks/use-focus-trap'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

interface KeyboardShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
}

const shortcutVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.2,
    },
  }),
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const { getShortcutGroups, formatShortcut } = useKeyboardShortcutsContext()

  // Initialize focus trap
  useFocusTrap(dialogRef, {
    enabled: isOpen,
    initialFocus: closeButtonRef,
    returnFocus: true,
  })

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const shortcutGroups = getShortcutGroups()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "fixed inset-0 z-50",
            "bg-background/80 backdrop-blur-sm"
          )}
          onClick={onClose}
          role="presentation"
        >
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
            aria-labelledby="keyboard-shortcuts-title"
          >
            <motion.div
              ref={dialogRef}
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30
              }}
              className={cn(
                "relative w-full max-w-2xl rounded-lg border bg-card p-6 shadow-lg",
                "dark:bg-gray-900/90",
                "max-h-[80vh]"
              )}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Command className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 id="keyboard-shortcuts-title" className="text-lg font-semibold">
                      Keyboard Shortcuts
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Keyboard shortcuts to help you be more productive
                    </p>
                  </div>
                </div>
                <Button
                  ref={closeButtonRef}
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  aria-label="Close keyboard shortcuts"
                  className="rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Shortcuts Groups */}
              <ScrollArea className="h-[60vh] pr-4">
                <div className="space-y-6">
                  {Object.entries(shortcutGroups).map(([group, shortcuts], groupIndex) => (
                    <motion.div
                      key={group}
                      initial="hidden"
                      animate="visible"
                      custom={groupIndex}
                      variants={{
                        visible: {
                          transition: {
                            staggerChildren: 0.05,
                            delayChildren: groupIndex * 0.1,
                          },
                        },
                      }}
                    >
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center space-x-2">
                        <Keyboard className="h-4 w-4" />
                        <span>{group}</span>
                      </h3>
                      <div className="space-y-2">
                      {Object.entries(shortcuts).map(([id, shortcut], index) => (
                          <motion.div
                            key={id}
                            variants={shortcutVariants}
                            custom={index}
                            className={cn(
                            "flex items-center justify-between py-2 px-3",
                            "rounded-md hover:bg-accent/50",
                            "transition-colors duration-200"
                          )}
                        >
                          <span className="text-sm">{shortcut.description}</span>
                          <div className="flex items-center space-x-2">
                            {Array.isArray(shortcut.combo) ? (
                              shortcut.combo.map((combo: React.Key | null | undefined, index: number) => (
                                <React.Fragment key={combo}>
                                  <kbd className={cn(
                                    "px-2 py-1 rounded text-xs font-mono",
                                    "bg-muted text-muted-foreground",
                                    "border border-border/50 shadow-sm"
                                  )}>
                                    {formatShortcut(String(combo))}
                                  </kbd>
                                  {index < shortcut.combo.length - 1 && (
                                    <span className="text-xs text-muted-foreground">or</span>
                                  )}
                                </React.Fragment>
                              ))
                            ) : (
                              <kbd className={cn(
                                "px-2 py-1 rounded text-xs font-mono",
                                "bg-muted text-muted-foreground",
                                "border border-border/50 shadow-sm"
                              )}>
                                {formatShortcut(shortcut.combo)}
                              </kbd>
                            )}
                          </div>
                        </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  Press <kbd className="px-1 py-0.5 rounded bg-muted">?</kbd> anytime to show/hide shortcuts
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}