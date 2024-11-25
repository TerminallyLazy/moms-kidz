"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Gamepad2, Star, Trophy, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { LoadingStates } from "@/components/loading-states"
import { InitializationStage } from "@/types/initialization"

const LOADING_TIPS = [
  "Complete daily activities to earn points and level up!",
  "Maintain your streak for bonus points multipliers",
  "Unlock achievements to showcase your progress",
  "Challenge yourself with daily and weekly goals",
  "Track your child's milestones and celebrate together",
  "Connect with other parents in the community",
  "Use keyboard shortcuts for quick navigation",
  "Enable dark mode for a better night-time experience",
  "Customize your notifications in settings",
  "Share your achievements with friends and family"
]

interface LoadingScreenProps {
  currentProgress?: number
  showTips?: boolean
  showProgress?: boolean
  loadingStates?: Array<{
    id: InitializationStage
    message: string
    status: 'pending' | 'loading' | 'complete' | 'error'
    error?: string
  }>
  currentState?: number
}

export function LoadingScreen({ 
  currentProgress = 0, 
  showTips = true,
  showProgress = true,
  loadingStates = [],
  currentState = 0
}: LoadingScreenProps) {
  const [currentTip, setCurrentTip] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % LOADING_TIPS.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="space-y-8 text-center px-4 max-w-md">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative h-24 w-24 mx-auto"
        >
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity, repeatType: "reverse" }
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Gamepad2 className="h-12 w-12 text-primary" />
          </motion.div>

          {/* Orbiting Icons */}
          {[Star, Trophy, Sparkles].map((Icon, index) => (
            <motion.div
              key={index}
              animate={{ 
                rotate: 360,
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "linear",
                delay: index * 0.3
              }}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transformOrigin: "center center"
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: index * 0.2
                }}
                className="relative"
                style={{
                  left: `${Math.cos((index * 2 * Math.PI) / 3) * 40}px`,
                  top: `${Math.sin((index * 2 * Math.PI) / 3) * 40}px`
                }}
              >
                <Icon className={`h-6 w-6 ${
                  index === 0 ? 'text-yellow-500' :
                  index === 1 ? 'text-purple-500' :
                  'text-blue-500'
                }`} />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <h2 className="text-xl font-semibold">Mom's Kidz</h2>
          <p className="text-sm text-muted-foreground">Loading your experience...</p>
        </motion.div>

        {/* Loading States */}
        {loadingStates.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <LoadingStates 
              states={loadingStates}
              currentState={currentState}
              showCompleted={true}
            />
          </motion.div>
        )}

        {/* Progress Bar */}
        {showProgress && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-2"
          >
            <Progress value={currentProgress} className="h-1" />
            <p className="text-xs text-muted-foreground">
              {Math.round(currentProgress)}% complete
            </p>
          </motion.div>
        )}

        {/* Loading Tips */}
        {showTips && (
          <div className="h-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTip}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-muted-foreground max-w-xs mx-auto"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p>{LOADING_TIPS[currentTip]}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
