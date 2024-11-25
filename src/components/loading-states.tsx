"use client"

import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, XCircle, AlertCircle, Loader2, Info, Keyboard, X } from "lucide-react"
import { InitializationStage } from "@/types/initialization"
import { cn } from "@/lib/utils"
import { Tooltip } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { useEffect, useRef, KeyboardEvent, useState } from "react"
import { useFocusTrap } from "@/hooks/use-focus-trap"

interface LoadingState {
  id: InitializationStage
  message: string
  status: 'pending' | 'loading' | 'complete' | 'error'
  error?: string
}

interface LoadingStatesProps {
  states: LoadingState[]
  currentState: number
  showCompleted?: boolean
}

const LOADING_STATES: Record<InitializationStage, string> = {
  theme: 'Loading theme preferences...',
  auth: 'Checking authentication...',
  settings: 'Loading your settings...',
  notifications: 'Initializing notifications...',
  gamification: 'Loading gamification data...',
  dashboard: 'Preparing your dashboard...'
}

const stateVariants = {
  initial: {
    opacity: 0,
    height: 0,
    scale: 0.95,
    y: 20
  },
  animate: {
    opacity: 1,
    height: "auto",
    scale: 1,
    y: 0,
    transition: {
      height: {
        type: "spring",
        stiffness: 500,
        damping: 30,
      },
      opacity: {
        duration: 0.2,
      },
      scale: {
        type: "spring",
        stiffness: 500,
        damping: 30,
      },
      y: {
        type: "spring",
        stiffness: 500,
        damping: 25,
      }
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    scale: 0.95,
    y: -20,
    transition: {
      height: {
        duration: 0.2,
      },
      opacity: {
        duration: 0.1,
      },
    },
  },
}

const iconVariants = {
  initial: { 
    scale: 0, 
    rotate: -180,
    opacity: 0 
  },
  animate: { 
    scale: 1, 
    rotate: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
      opacity: {
        duration: 0.2,
      },
    },
  },
  exit: { 
    scale: 0, 
    rotate: 180,
    opacity: 0,
    transition: {
      duration: 0.2,
      opacity: {
        duration: 0.1,
      },
    },
  },
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const errorMessageVariants = {
  initial: { 
    opacity: 0, 
    y: -10,
    height: 0 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    height: "auto",
    transition: {
      duration: 0.2,
    },
  },
  exit: { 
    opacity: 0, 
    y: 10,
    height: 0,
    transition: {
      duration: 0.2,
    },
  },
}

const hoverVariants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  },
  tap: { 
    scale: 0.98,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }
}

const KEYBOARD_INSTRUCTIONS = [
  { key: '↑/←', description: 'Previous step' },
  { key: '↓/→', description: 'Next step' },
  { key: 'Home', description: 'First step' },
  { key: 'End', description: 'Last step' },
  { key: 'Tab', description: 'Navigate between elements' },
  { key: 'Space/Enter', description: 'Activate element' },
  { key: '?', description: 'Toggle keyboard help' }
]

const getStatusDetails = (status: LoadingState['status']) => {
  switch (status) {
    case 'complete':
      return {
        label: 'Completed successfully',
        color: 'text-green-500',
        icon: CheckCircle2
      }
    case 'error':
      return {
        label: 'Failed to initialize',
        color: 'text-destructive',
        icon: XCircle
      }
    case 'loading':
      return {
        label: 'Initializing...',
        color: 'text-yellow-500',
        icon: AlertCircle
      }
    default:
      return {
        label: 'Pending',
        color: 'text-muted-foreground',
        icon: Info
      }
  }
}

export function LoadingStates({ 
  states, 
  currentState, 
  showCompleted = true 
}: LoadingStatesProps) {
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const stateRefs = useRef<(HTMLDivElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const helpTimeoutRef = useRef<NodeJS.Timeout>()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Initialize focus trap
  useFocusTrap(dialogRef, {
    enabled: showKeyboardHelp,
    initialFocus: closeButtonRef
  })

  // Show keyboard help when user starts using keyboard navigation
  const handleFirstKeyboardInteraction = () => {
    if (!showKeyboardHelp) {
      setShowKeyboardHelp(true)
      clearTimeout(helpTimeoutRef.current)
      helpTimeoutRef.current = setTimeout(() => setShowKeyboardHelp(false), 5000)
    }
  }

  // Global keyboard shortcut handler
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === '?' && !event.repeat) {
        event.preventDefault()
        setShowKeyboardHelp(show => !show)
        clearTimeout(helpTimeoutRef.current)
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown as any)
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown as any)
      clearTimeout(helpTimeoutRef.current)
    }
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>, index: number) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault()
        const nextIndex = Math.min(index + 1, states.length - 1)
        stateRefs.current[nextIndex]?.focus()
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault()
        const prevIndex = Math.max(index - 1, 0)
        stateRefs.current[prevIndex]?.focus()
        break
      case 'Home':
        event.preventDefault()
        stateRefs.current[0]?.focus()
        break
      case 'End':
        event.preventDefault()
        stateRefs.current[states.length - 1]?.focus()
        break
      case 'Tab':
        // Allow natural tab navigation
        break
      default:
        // Prevent other keys from scrolling the container
        if (event.key !== 'Tab') {
          event.preventDefault()
        }
    }
  }

  // Reset refs when states change
  useEffect(() => {
    stateRefs.current = stateRefs.current.slice(0, states.length)
  }, [states.length])

  // Focus management for current state
  useEffect(() => {
    if (currentState >= 0 && currentState < states.length) {
      stateRefs.current[currentState]?.focus()
    }
  }, [currentState, states.length])

  const visibleStates = states.slice(Math.max(0, currentState - 2), currentState + 1)
  const completedCount = states.filter(s => s.status === 'complete').length
  const errorCount = states.filter(s => s.status === 'error').length
  const progress = Math.round((completedCount / states.length) * 100)

  function handleClose(event: MouseEvent): void {
    event.preventDefault()
    setShowKeyboardHelp(false)
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-2"
    >
      {/* Keyboard Instructions */}
      <AnimatePresence>
        {showKeyboardHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed inset-0 z-50",
              "bg-background/80 backdrop-blur-sm"
            )}
            onClick={(event) => handleClose(event.nativeEvent)}
            role="presentation"
          >
            <div 
              className="fixed inset-0 flex items-center justify-center p-4"
              aria-modal="true" 
              role="dialog" 
              aria-labelledby="keyboard-shortcuts-title"
            />
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
                  "relative w-full max-w-sm rounded-lg border bg-card p-6 shadow-lg",
                  "dark:bg-gray-900/90"
                )}
                onClick={e => e.stopPropagation()}
              >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Keyboard className="h-5 w-5 text-primary" />
                  <h3 id="keyboard-shortcuts-title" className="text-lg font-semibold">
                    Keyboard Shortcuts
                  </h3>
                </div>
                <Button
                  ref={closeButtonRef}
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(event) => handleClose(event.nativeEvent)}
                  aria-label="Close keyboard shortcuts"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div 
                className="space-y-2"
                role="list"
                aria-label="Available keyboard shortcuts"
              >
                {KEYBOARD_INSTRUCTIONS.map(({ key, description }) => (
                  <div 
                    key={key} 
                    className={cn(
                      "flex items-center justify-between py-2",
                      "border-b border-border/50 last:border-0"
                    )}
                  >
                    <span className="text-sm text-muted-foreground">
                      {description}
                    </span>
                    <kbd className={cn(
                      "px-2 py-1 rounded text-xs font-mono",
                      "bg-muted text-muted-foreground",
                      "border border-border/50 shadow-sm"
                    )}>
                      {key}
                    </kbd>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground text-center">
                Press <kbd className="px-1 py-0.5 rounded bg-muted">?</kbd> anytime to show/hide shortcuts
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        ref={containerRef}
        className="h-[120px] overflow-hidden rounded-lg border bg-card p-1"
        role="list"
        aria-label={`Initialization Progress - ${progress}% complete`}
        aria-live="polite"
        onKeyDown={handleFirstKeyboardInteraction}
      >
        <AnimatePresence mode="popLayout">
          {visibleStates.map((state, index) => {
            const statusDetails = getStatusDetails(state.status)
            const StatusIcon = statusDetails.icon
            const absoluteIndex = Math.max(0, currentState - 2) + index
            const isCurrentStep = absoluteIndex === currentState
            const stepNumber = absoluteIndex + 1

            return (
              <motion.div
                key={state.id}
                ref={(el: HTMLDivElement | null) => {
                  stateRefs.current[index] = el;
                }}
                variants={stateVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                whileHover="hover"
                whileTap="tap"
                className={cn(
                  "flex items-center justify-between space-x-2 rounded-md px-3 py-2",
                  "transition-colors duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  "hover:bg-accent/50",
                  state.status === 'error' ? 'bg-destructive/10' : 
                  state.status === 'complete' ? 'bg-primary/10' : 
                  'bg-muted/50',
                  state.status === 'loading' && 'animate-pulse'
                )}
                tabIndex={0}
                role="listitem"
                aria-label={`Step ${stepNumber} of ${states.length}: ${LOADING_STATES[state.id]} - ${statusDetails.label}`}
                onKeyDown={(e) => handleKeyDown(e, absoluteIndex)}
                data-state={state.status}
                aria-current={isCurrentStep ? 'step' : undefined}
                aria-setsize={states.length}
                aria-posinset={stepNumber}
                aria-busy={state.status === 'loading'}
                aria-invalid={state.status === 'error'}
                aria-errormessage={state.error ? `error-${state.id}` : undefined}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {LOADING_STATES[state.id]}
                    </span>
                    {state.status === 'loading' && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="h-3 w-3 text-muted-foreground" />
                      </motion.div>
                    )}
                  </div>
                  <AnimatePresence mode="wait">
                    {state.error && (
                      <motion.p
                        id={`error-${state.id}`}
                        variants={errorMessageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="text-xs text-destructive"
                        role="alert"
                      >
                        {state.error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence mode="wait">
                  <Tooltip content={statusDetails.label}>
                    <motion.div
                      variants={iconVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className={cn(
                        "rounded-full p-1",
                        "transition-colors duration-200",
                        "hover:bg-background/50"
                      )}
                    >
                      <StatusIcon className={cn("h-4 w-4", statusDetails.color)} />
                    </motion.div>
                  </Tooltip>
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Add keyboard hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xs text-muted-foreground text-center"
      >
        <button
          onClick={() => setShowKeyboardHelp(show => !show)}
          className="inline-flex items-center space-x-1 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-2 py-1"
        >
          <Keyboard className="h-3 w-3" />
          <span>Press '?' for keyboard shortcuts</span>
        </button>
      </motion.div>

      {showCompleted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-between px-2 text-xs text-muted-foreground"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <motion.div
            className="flex items-center space-x-2"
            animate={{ 
              opacity: [0.5, 1, 0.5],
              transition: { 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
          >
            <span>
              {completedCount} of {states.length} complete ({progress}%)
            </span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              aria-hidden="true"
            >
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            </motion.div>
          </motion.div>
          {errorCount > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 text-destructive"
            >
              <span>
                {errorCount} error{errorCount === 1 ? '' : 's'}
              </span>
              <XCircle className="h-3 w-3" aria-hidden="true" />
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
