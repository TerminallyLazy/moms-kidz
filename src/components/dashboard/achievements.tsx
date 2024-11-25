"use client"

import { useAchievements } from '@/hooks/use-achievements'
import { useGamification } from '@/contexts/gamification-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Trophy, Star, Medal, Crown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const ACHIEVEMENT_ICONS = {
  FIRST_ACTIVITY: Trophy,
  STREAK_MASTER: Star,
  POINT_COLLECTOR: Medal,
  LEVEL_UP: Crown,
  SUPER_USER: Crown,
}

export function Achievements() {
  const { achievements } = useGamification()
  const { loading, availableAchievements, getProgress, getNextAchievement } = useAchievements()
  const nextAchievement = getNextAchievement()

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Achievements</span>
          <span className="text-sm font-normal text-muted-foreground">
            {achievements.length} / {achievements.length + availableAchievements.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Next Achievement */}
        {nextAchievement && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Next Achievement</h4>
            <div className="rounded-lg border p-4 bg-card">
              <div className="flex items-start space-x-4">
                {(() => {
                  const Icon = ACHIEVEMENT_ICONS[nextAchievement.id as keyof typeof ACHIEVEMENT_ICONS] || Trophy
                  return (
                    <div className="rounded-full bg-primary/10 p-2">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  )
                })()}
                <div className="flex-1 space-y-1">
                  <p className="font-medium leading-none">{nextAchievement.title}</p>
                  <p className="text-sm text-muted-foreground">{nextAchievement.description}</p>
                  <div className="mt-2 space-y-1">
                    <Progress value={getProgress(nextAchievement.id)} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">
                      {Math.round(getProgress(nextAchievement.id))}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Unlocked Achievements */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Unlocked</h4>
          <div className="space-y-2">
            <AnimatePresence>
              {achievements.map((achievement) => {
                const Icon = ACHIEVEMENT_ICONS[achievement.id as keyof typeof ACHIEVEMENT_ICONS] || Trophy
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={cn(
                      "rounded-lg border p-4 bg-card",
                      "transition-colors hover:bg-accent/50"
                    )}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium leading-none">{achievement.title}</p>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        +{achievement.points} pts
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-6">
            <div className="space-y-2 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Trophy className="h-6 w-6 text-muted-foreground" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Loading achievements...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && achievements.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="font-medium">No achievements yet</h3>
            <p className="text-sm text-muted-foreground">
              Complete activities to unlock achievements
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}