"use client"

import { useChallenges } from '@/hooks/use-challenges'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Target, Clock, CheckCircle2, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

export function Challenges() {
  const { loading, activeChallenges, completedChallenges, calculateProgress } = useChallenges()

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Challenges</span>
          <span className="text-sm font-normal text-muted-foreground">
            {completedChallenges.length} completed
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Challenges */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">Active</h4>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {activeChallenges.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={cn(
                    "rounded-lg border p-4 bg-card",
                    "transition-colors hover:bg-accent/50"
                  )}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4 text-primary" />
                          <p className="font-medium leading-none">{challenge.title}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      </div>
                      <div className="text-sm font-medium text-primary">
                        +{challenge.points} pts
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Progress value={challenge.progress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{Math.round(challenge.progress)}% complete</span>
                        {challenge.deadline && (
                          <span>
                            Ends {formatDistanceToNow(new Date(challenge.deadline), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Recently Completed Challenges */}
        {completedChallenges.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">Recently Completed</h4>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {completedChallenges.slice(0, 3).map((challenge) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={cn(
                      "rounded-lg border p-4 bg-card/50",
                      "transition-colors"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <div>
                          <p className="font-medium leading-none">{challenge.title}</p>
                          <p className="text-sm text-muted-foreground">+{challenge.points} points earned</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-6">
            <div className="space-y-2 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Target className="h-6 w-6 text-muted-foreground" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Loading challenges...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && activeChallenges.length === 0 && completedChallenges.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="font-medium">No active challenges</h3>
            <p className="text-sm text-muted-foreground">
              New challenges will appear here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
