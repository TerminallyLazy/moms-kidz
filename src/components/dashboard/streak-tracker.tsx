"use client"

import { useGamification } from '@/contexts/gamification-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Flame, Calendar, Award, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, startOfWeek, eachDayOfInterval, addDays } from 'date-fns'

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 90]
const STREAK_REWARDS = {
  3: { bonus: '15%', description: 'Point bonus on all activities' },
  7: { bonus: '25%', description: 'Point bonus + special badge' },
  14: { bonus: '35%', description: 'Point bonus + exclusive challenges' },
  30: { bonus: '50%', description: 'Point bonus + mentor status' },
  60: { bonus: '75%', description: 'Point bonus + custom profile theme' },
  90: { bonus: '100%', description: 'Double points on all activities' }
}

export function StreakTracker() {
  const { streak } = useGamification()
  
  const nextMilestone = STREAK_MILESTONES.find(milestone => streak < milestone)
  const currentReward = STREAK_REWARDS[
    STREAK_MILESTONES.filter(milestone => streak >= milestone).pop() || 3
  ]

  // Get week days for streak calendar
  const startOfCurrentWeek = startOfWeek(new Date())
  const weekDays = eachDayOfInterval({
    start: startOfCurrentWeek,
    end: addDays(startOfCurrentWeek, 6)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-primary" />
            <span>Activity Streak</span>
          </span>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center space-x-2"
          >
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-normal text-muted-foreground">
              Next reset at midnight
            </span>
          </motion.div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Streak */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-2xl font-bold">{streak} Days</div>
              <div className="text-sm text-muted-foreground">
                Current streak bonus: {currentReward.bonus}
              </div>
            </div>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, -10, 10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              <Flame className="h-8 w-8 text-primary" />
            </motion.div>
          </div>
        </div>

        {/* Week Calendar */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>This Week</span>
          </h4>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => (
              <div
                key={day.toString()}
                className="flex flex-col items-center space-y-1"
              >
                <div className="text-xs text-muted-foreground">
                  {format(day, 'EEE')}
                </div>
                <motion.div
                  initial={false}
                  animate={{
                    scale: index < streak % 7 ? [1, 1.1, 1] : 1,
                    opacity: index < streak % 7 ? 1 : 0.5
                  }}
                  transition={{ duration: 0.2 }}
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    index < streak % 7
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {format(day, 'd')}
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Milestone */}
        {nextMilestone && (
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium">Next Milestone: {nextMilestone} Days</div>
                <div className="text-sm text-muted-foreground">
                  {STREAK_REWARDS[nextMilestone].bonus} bonus - {STREAK_REWARDS[nextMilestone].description}
                </div>
              </div>
              <Award className="h-5 w-5 text-primary" />
            </div>
            <Progress 
              value={(streak / nextMilestone) * 100} 
              className="mt-4 h-1.5" 
            />
          </div>
        )}

        {/* Streak Milestones */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Streak Rewards</h4>
          <div className="grid gap-2">
            <AnimatePresence>
              {STREAK_MILESTONES.map((milestone, index) => (
                <motion.div
                  key={milestone}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center space-x-2 rounded-lg border p-2 ${
                    streak >= milestone 
                      ? 'bg-primary/10 border-primary/20' 
                      : 'bg-muted/50'
                  }`}
                >
                  <Flame className={`h-4 w-4 ${
                    streak >= milestone ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{milestone} Day Streak</div>
                    <div className="text-xs text-muted-foreground">
                      {STREAK_REWARDS[milestone].description}
                    </div>
                  </div>
                  {streak >= milestone && (
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