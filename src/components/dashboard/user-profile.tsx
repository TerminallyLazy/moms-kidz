"use client"

import { useSession } from "next-auth/react"
import { useGamification } from "@/contexts/gamification-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Star, Trophy, Award, Zap } from "lucide-react"
import { motion } from "framer-motion"

export function UserProfile() {
  const { data: session } = useSession()
  const { state } = useGamification()

  const levelProgress = (state.xp / state.xpToNextLevel) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="h-16 w-16 rounded-full border-2 border-primary"
              />
            )}
            <div>
              <CardTitle className="text-2xl">{session?.user?.name}</CardTitle>
              <CardDescription>{session?.user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Level {state.level}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {state.xp} / {state.xpToNextLevel} XP
              </span>
            </div>
            <Progress value={levelProgress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    <span className="font-medium">Total Points</span>
                  </div>
                  <span className="text-2xl font-bold">{state.totalPoints}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="font-medium">Achievements</span>
                  </div>
                  <span className="text-2xl font-bold">{state.achievements.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {state.streaks.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Active Streaks
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {state.streaks.map((streak) => (
                  <Badge
                    key={streak.activity}
                    variant={streak.count >= 7 ? "success" : "default"}
                    className="flex items-center justify-between p-2"
                  >
                    <span>{streak.activity}</span>
                    <span className="font-bold">{streak.count} days</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {state.achievements.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Recent Achievements
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {state.achievements.slice(-3).map((achievement) => (
                  <Card key={achievement.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div>
                          <h4 className="font-semibold">{achievement.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
