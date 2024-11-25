"use client"

import { usePoints } from '@/hooks/use-points'
import { useGamification } from '@/contexts/gamification-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Sparkles, ChevronUp, Trophy, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const LEVEL_MILESTONES = [5, 10, 25, 50, 100]
const LEVEL_BADGES = {
  1: '🌱 Beginner',
  5: '⭐ Rising Star',
  10: '🌟 Expert',
  25: '💫 Master',
  50: '👑 Champion',
  100: '🏆 Legend'
}

export function LevelProgress() {
  const { level, points } = useGamification()
  const { getPointsToNextLevel, getProgressToNextLevel } = usePoints()

  const progress = getProgressToNextLevel()
  const pointsToNext = getPointsToNextLevel()
  const currentBadge = LEVEL_BADGES[
    LEVEL_MILESTONES.filter(milestone => level >= milestone).pop() || 1
  ]
  const nextMilestone = LEVEL_MILESTONES.find(milestone => level < milestone)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Level Progress</span>
          </span>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center space-x-2 text-sm font-normal"
          >
            <span>{currentBadge}</span>
          </motion.div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Level Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-2xl font-bold">Level {level}</div>
              <div className="text-sm text-muted-foreground">
                {pointsToNext.toLocaleString()} points to next level
              </div>
            </div>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <ChevronUp className="h-6 w-6 text-primary" />
            </motion.div>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{points.toLocaleString()} points</span>
            <span>{(points + pointsToNext).toLocaleString()} points</span>
          </div>
        </div>

        {/* Next Milestone */}
        {nextMilestone && (
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium">Next Milestone</div>
                <div className="text-sm text-muted-foreground">
                  Level {nextMilestone} - {LEVEL_BADGES[nextMilestone]}
                </div>
              </div>
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <Progress 
              value={(level / nextMilestone) * 100} 
              className="mt-4 h-1.5" 
            />
          </div>
        )}

        {/* Level Perks */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Level Perks</h4>
          <div className="grid gap-2">
            <AnimatePresence>
              {[
                { level: 1, perk: 'Basic activities and challenges' },
                { level: 5, perk: 'Unlock custom profile badges' },
                { level: 10, perk: 'Access to exclusive content' },
                { level: 25, perk: 'Create custom challenges' },
                { level: 50, perk: 'Become a community mentor' },
              ].map((perk, index) => (
                <motion.div
                  key={perk.level}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center space-x-2 rounded-lg border p-2 ${
                    level >= perk.level 
                      ? 'bg-primary/10 border-primary/20' 
                      : 'bg-muted/50'
                  }`}
                >
                  <Star className={`h-4 w-4 ${
                    level >= perk.level ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Level {perk.level}</div>
                    <div className="text-xs text-muted-foreground">{perk.perk}</div>
                  </div>
                  {level >= perk.level && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-xs font-medium text-primary"
                    >
                      Unlocked
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}