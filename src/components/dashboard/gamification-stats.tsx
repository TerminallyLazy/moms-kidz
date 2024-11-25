"use client"

import { useGamification } from '@/contexts/gamification-context'
import { usePoints } from '@/hooks/use-points'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, 
  Target, 
  Flame, 
  Star, 
  Award,
  TrendingUp,
  Medal,
  Crown
} from 'lucide-react'
import { motion } from 'framer-motion'

const RANK_THRESHOLDS = {
  BRONZE: 1000,
  SILVER: 5000,
  GOLD: 10000,
  PLATINUM: 25000,
  DIAMOND: 50000,
  MASTER: 100000
}

const RANK_ICONS = {
  BRONZE: Medal,
  SILVER: Medal,
  GOLD: Medal,
  PLATINUM: Crown,
  DIAMOND: Crown,
  MASTER: Crown
}

const RANK_COLORS = {
  BRONZE: 'text-orange-500',
  SILVER: 'text-gray-400',
  GOLD: 'text-yellow-500',
  PLATINUM: 'text-purple-400',
  DIAMOND: 'text-blue-400',
  MASTER: 'text-red-500'
}

export function GamificationStats() {
  const { points, level, streak, achievements, challenges } = useGamification()
  const { getPointsStats } = usePoints()
  const stats = getPointsStats()

  // Calculate current rank
  const getCurrentRank = () => {
    const ranks = Object.entries(RANK_THRESHOLDS)
    for (let i = ranks.length - 1; i >= 0; i--) {
      if (points >= ranks[i][1]) {
        return ranks[i][0]
      }
    }
    return 'BRONZE'
  }

  const currentRank = getCurrentRank()
  const RankIcon = RANK_ICONS[currentRank]
  const rankColor = RANK_COLORS[currentRank]

  // Calculate next rank progress
  const getNextRankProgress = () => {
    const ranks = Object.entries(RANK_THRESHOLDS)
    const currentRankIndex = ranks.findIndex(([rank]) => rank === currentRank)
    const nextRank = ranks[currentRankIndex + 1]
    
    if (!nextRank) return 100

    const currentThreshold = ranks[currentRankIndex][1]
    const nextThreshold = nextRank[1]
    const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    
    return Math.min(Math.max(progress, 0), 100)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Rank Card */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Rank</span>
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 4
              }}
            >
              <RankIcon className={`h-6 w-6 ${rankColor}`} />
            </motion.div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-2xl font-bold ${rankColor}`}>{currentRank}</div>
              <div className="text-sm text-muted-foreground">Level {level}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{points.toLocaleString()} points</div>
              <div className="text-sm text-muted-foreground">Total earned</div>
            </div>
          </div>
          <div className="space-y-1">
            <Progress value={getNextRankProgress()} className="h-2" />
            <div className="text-xs text-muted-foreground text-right">
              Progress to next rank
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Trophy className="h-8 w-8 text-primary" />
            <div>
              <div className="text-2xl font-bold">{achievements.length}</div>
              <div className="text-xs text-muted-foreground">Total unlocked</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Challenge Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Target className="h-8 w-8 text-primary" />
            <div>
              <div className="text-2xl font-bold">
                {challenges.filter(c => c.completed).length}
              </div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streak Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Best Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Flame className="h-8 w-8 text-primary" />
            <div>
              <div className="text-2xl font-bold">{streak} days</div>
              <div className="text-xs text-muted-foreground">Current streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="text-sm">Weekly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-4">
              <Star className="h-6 w-6 text-primary" />
              <div>
                <div className="text-lg font-bold">{stats.today.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Points today</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <TrendingUp className="h-6 w-6 text-primary" />
              <div>
                <div className="text-lg font-bold">{stats.thisWeek.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Points this week</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Award className="h-6 w-6 text-primary" />
              <div>
                <div className="text-lg font-bold">{stats.multiplier.toFixed(1)}x</div>
                <div className="text-xs text-muted-foreground">Current multiplier</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}