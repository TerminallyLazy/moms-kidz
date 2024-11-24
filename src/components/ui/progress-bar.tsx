"use client"

import { useState, useEffect } from 'react'
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { LEVEL_THRESHOLDS, formatPoints } from '@/lib/gamification'

interface ProgressBarProps {
  points: number
  level: number
  showPopup?: boolean
  onPopupComplete?: () => void
}

export function ProgressBar({ points, level, showPopup, onPopupComplete }: ProgressBarProps) {
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0
    const nextThreshold = LEVEL_THRESHOLDS[level] || currentThreshold
    const levelProgress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    
    setProgress(Math.min(levelProgress, 100))
  }, [points, level])
  
  return (
    <div className="relative w-full space-y-2" data-track="progress_bar">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-bold">
            Level {level}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {formatPoints(points)} points
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          Next level: {formatPoints(LEVEL_THRESHOLDS[level] || points)} points
        </span>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute -top-16 left-1/2 -translate-x-1/2"
            onAnimationComplete={onPopupComplete}
          >
            <Card className="p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
              <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                <Trophy className="w-4 h-4" />
                <span className="font-semibold">Level Up!</span>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
