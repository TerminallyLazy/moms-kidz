"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Calendar, Heart, Star, Trophy, Users } from "lucide-react"
import { motion } from "framer-motion"
import { ACHIEVEMENTS, type Achievement } from '@/lib/gamification'

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Trophy },
  { id: 'care', label: 'Care', icon: Heart },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'research', label: 'Research', icon: Star },
  { id: 'milestone', label: 'Milestones', icon: Calendar },
]

function AchievementCard({ achievement, unlocked = false }: { achievement: Achievement, unlocked?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      data-track="view_achievement"
      data-track-metadata={JSON.stringify({ id: achievement.id, unlocked })}
    >
      <Card className={`bg-white dark:bg-gray-900 dark:border-gray-800 ${unlocked ? 'border-primary' : 'opacity-75'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${unlocked ? 'bg-primary/20' : 'bg-muted'}`}>
                <span className="text-2xl" role="img" aria-label={achievement.title}>
                  {achievement.icon}
                </span>
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">{achievement.title}</CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">{achievement.description}</CardDescription>
              </div>
            </div>
            <Badge variant={unlocked ? "default" : "outline"}>
              {unlocked ? 'Unlocked' : 'Locked'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {achievement.criteria.current} / {achievement.criteria.target}
              </span>
            </div>
            <Progress
              value={(achievement.criteria.current / achievement.criteria.target) * 100}
              className="h-2"
            />
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-muted-foreground">Reward</span>
              <Badge variant="secondary">+{achievement.points} points</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  // Mock unlocked achievements - in real app, this would come from your backend
  const unlockedAchievements = ['first-log', 'streak-week']
  
  const filteredAchievements = ACHIEVEMENTS.filter(
    achievement => selectedCategory === 'all' || achievement.category === selectedCategory
  )

  const stats = {
    totalAchievements: ACHIEVEMENTS.length,
    unlockedAchievements: unlockedAchievements.length,
    totalPoints: ACHIEVEMENTS.reduce((sum, achievement) => 
      unlockedAchievements.includes(achievement.id) ? sum + achievement.points : sum, 0
    ),
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      
      <main className="container py-8">
        <div className="grid gap-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Achievements</h1>
            <p className="text-muted-foreground text-gray-500 dark:text-gray-400">
              Track your progress and unlock rewards for your parenting journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Total Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary dark:text-purple-400" />
                  <span className="text-2xl font-bold">
                    {stats.unlockedAchievements} / {stats.totalAchievements}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary dark:text-purple-400" />
                  <span className="text-2xl font-bold">
                    {Math.round((stats.unlockedAchievements / stats.totalAchievements) * 100)}%
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Points Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary dark:text-purple-400" />
                  <span className="text-2xl font-bold">
                    {stats.totalPoints}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {CATEGORIES.map(category => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                  data-track="select_category"
                  data-track-metadata={JSON.stringify({ category: category.id })}
                >
                  <category.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{category.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={selectedCategory} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    unlocked={unlockedAchievements.includes(achievement.id)}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
