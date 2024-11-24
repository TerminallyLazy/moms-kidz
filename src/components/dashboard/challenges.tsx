"use client"

import { AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Star, Trophy } from "lucide-react"
import { motion } from "framer-motion"
import { useGamification } from "@/contexts/gamification-context"
import type { Challenge } from "@/contexts/gamification-context"

const CHALLENGE_TYPES = [
  { id: 'daily', label: 'Daily', icon: Clock },
  { id: 'weekly', label: 'Weekly', icon: Calendar },
  { id: 'special', label: 'Special', icon: Star },
]

// Example challenges - in a real app, these would come from your backend
const SAMPLE_CHALLENGES: Challenge[] = [
  {
    id: 'daily_log',
    title: 'Daily Logger',
    description: 'Log at least 3 activities today',
    type: 'daily',
    requirements: {
      type: 'activity_count',
      target: 3,
      current: 0,
    },
    rewards: {
      points: 50,
      badges: ['consistent_logger'],
    },
    startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
    endDate: new Date(new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'weekly_photos',
    title: 'Memory Keeper',
    description: 'Add 5 photos to your logs this week',
    type: 'weekly',
    requirements: {
      type: 'photo_count',
      target: 5,
      current: 2,
    },
    rewards: {
      points: 100,
      badges: ['photographer'],
    },
    startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
    endDate: new Date(new Date().setHours(0, 0, 0, 0) + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'special_milestone',
    title: 'Growth Tracker',
    description: 'Record 3 developmental milestones',
    type: 'special',
    requirements: {
      type: 'milestone_count',
      target: 3,
      current: 1,
    },
    rewards: {
      points: 200,
      badges: ['milestone_master'],
    },
    startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
    endDate: new Date(new Date().setHours(0, 0, 0, 0) + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
]

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const progress = (challenge.requirements.current / challenge.requirements.target) * 100
  const timeLeft = new Date(challenge.endDate).getTime() - new Date().setHours(0, 0, 0, 0)
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24))
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      data-track="view_challenge"
      data-track-metadata={JSON.stringify({ id: challenge.id, type: challenge.type })}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>{challenge.title}</CardTitle>
              <CardDescription>{challenge.description}</CardDescription>
            </div>
            <Badge variant={challenge.status === 'active' ? 'default' : 'secondary'}>
              {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span>
                  {challenge.requirements.current} / {challenge.requirements.target}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trophy className="w-4 h-4" />
                <span>Rewards:</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">+{challenge.rewards.points} points</Badge>
                {challenge.rewards.badges?.map((badge: boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<AwaitedReactNode> | Key | null | undefined) => (
                  <Badge variant="secondary">
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function Challenges() {
  const [selectedType, setSelectedType] = useState<string>('daily')
  const { state } = useGamification()
  
  const challenges = SAMPLE_CHALLENGES.filter(
    challenge => challenge.type === selectedType
  )

  return (
    <div className="space-y-6" data-track="challenges_section">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Challenges</h2>
          <p className="text-muted-foreground">
            Complete challenges to earn points and badges
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          {state.challengesCompleted} completed
        </Badge>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {CHALLENGE_TYPES.map(type => (
            <TabsTrigger
              key={type.id}
              value={type.id}
              onClick={() => setSelectedType(type.id)}
              className="flex items-center gap-2"
              data-track="select_challenge_type"
              data-track-metadata={JSON.stringify({ type: type.id })}
            >
              <type.icon className="w-4 h-4" />
              <span>{type.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedType} className="mt-6">
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
