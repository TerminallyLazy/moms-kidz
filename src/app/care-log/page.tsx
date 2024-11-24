"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { ProgressBar } from "@/components/progress-bar"
import { MainNav } from "@/components/main-nav"
import { Challenges } from "@/components/challenges"
import { Camera, Clock, Heart, Plus, Smile, Star } from "lucide-react"
import { motion } from "framer-motion"
import { useGamification } from "@/contexts/gamification-context"

// Mood options with emojis and points
const MOODS = [
  { value: 'happy', label: 'Happy', emoji: '😊', points: 15 },
  { value: 'calm', label: 'Calm', emoji: '😌', points: 15 },
  { value: 'tired', label: 'Tired', emoji: '😴', points: 15 },
  { value: 'fussy', label: 'Fussy', emoji: '😣', points: 15 },
]

// Activity categories with icons and base points
const ACTIVITIES = [
  { id: 'sleep', label: 'Sleep', icon: Clock, basePoints: 10 },
  { id: 'feed', label: 'Feeding', icon: Heart, basePoints: 10 },
  { id: 'play', label: 'Play Time', icon: Star, basePoints: 10 },
  { id: 'health', label: 'Health', icon: Plus, basePoints: 15 },
]

export default function CareLog() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedActivity, setSelectedActivity] = useState('')
  const [mood, setMood] = useState('')
  const [notes, setNotes] = useState('')
  const [hasPhoto, setHasPhoto] = useState(false)
  
  const { state, trackEvent } = useGamification()

  const handleLogActivity = () => {
    if (!selectedActivity) return

    // Track the activity in our gamification system
    trackEvent({
      type: 'activity_log',
      action: selectedActivity,
      metadata: {
        withMood: !!mood,
        withNotes: notes.length > 0,
        withPhoto: hasPhoto,
        detailed: notes.length > 50,
        date: selectedDate.toISOString(),
      },
      timestamp: Date.now(),
    })

    // Reset form
    setSelectedActivity('')
    setMood('')
    setNotes('')
    setHasPhoto(false)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <main className="container py-8">
        <div className="grid gap-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Care Log</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Track your child's daily activities and earn points for consistent logging
            </p>
          </div>

          <ProgressBar 
            points={state.totalPoints}
            level={state.level}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Activity Logger */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Log Activity</CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">
                    Record a new activity and earn points
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-gray-900 dark:text-white">Activity Type</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {ACTIVITIES.map((activity) => (
                        <Button
                          key={activity.id}
                          variant={selectedActivity === activity.id ? "default" : "outline"}
                          className="h-24 flex flex-col items-center justify-center gap-2 relative overflow-hidden group dark:bg-gray-900 dark:border-gray-800"
                          onClick={() => setSelectedActivity(activity.id)}
                          data-track="select_activity"
                          data-track-metadata={JSON.stringify({ activity: activity.id })}
                        >
                          <activity.icon className="w-6 h-6" />
                          <span>{activity.label}</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                          <Badge className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            +{activity.basePoints} pts
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-gray-900 dark:text-white">Date & Time</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="rounded-md border dark:bg-gray-900 dark:border-gray-800"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-gray-900 dark:text-white">Mood</Label>
                    <RadioGroup
                      value={mood}
                      onValueChange={setMood}
                      className="grid grid-cols-4 gap-4"
                      data-track="select_mood"
                    >
                      {MOODS.map((moodOption) => (
                        <Label
                          key={moodOption.value}
                          className="flex flex-col items-center space-y-2 cursor-pointer relative group"
                        >
                          <RadioGroupItem
                            value={moodOption.value}
                            className="sr-only"
                          />
                          <div className="relative">
                            <span className="text-2xl transition-transform group-hover:scale-110">
                              {moodOption.emoji}
                            </span>
                            <Badge 
                              className="absolute -top-2 -right-2 scale-0 group-hover:scale-100 transition-transform"
                              variant="secondary"
                            >
                              +{moodOption.points}
                            </Badge>
                          </div>
                          <span className="text-sm">{moodOption.label}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-gray-900 dark:text-white">Notes</Label>
                    <Textarea
                      placeholder="Add any additional details..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[100px] dark:bg-gray-900 dark:border-gray-800"
                      data-track="add_notes"
                    />
                    {notes.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-gray-500 dark:text-gray-400"
                      >
                        {notes.length >= 50 ? (
                          <span className="text-green-600 dark:text-green-400">
                            Detailed note bonus: +15 points
                          </span>
                        ) : (
                          <span>
                            Write {50 - notes.length} more characters for a bonus
                          </span>
                        )}
                      </motion.div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      className="w-full relative group dark:bg-gray-900 dark:border-gray-800"
                      onClick={() => setHasPhoto(!hasPhoto)}
                      data-track="add_photo"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {hasPhoto ? 'Photo Added' : 'Add Photo'}
                      <Badge 
                        className="absolute -top-2 -right-2 scale-0 group-hover:scale-100 transition-transform"
                        variant="secondary"
                      >
                        +20 pts
                      </Badge>
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white"
                    onClick={handleLogActivity}
                    disabled={!selectedActivity}
                    data-track="submit_log"
                  >
                    Save Activity
                  </Button>
                </CardFooter>
              </Card>

              {/* Activity Feed */}
              <Card className="overflow-hidden bg-white dark:bg-gray-900 dark:border-gray-800">
                <CardHeader className="space-y-1 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500">
                  <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500">Recent Activities</CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">Your logged activities and earned points</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {state.pointsHistory
                      .filter(activity => activity.activityType === 'activity_log')
                      .map((activity) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ 
                            scale: 1.02,
                            transition: { duration: 0.2 }
                          }}
                          className="group relative flex items-center justify-between p-4 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 hover:bg-accent/5 transition-all duration-200 ease-in-out shadow-md hover:shadow-xl"
                        >
                          <motion.div 
                            className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-200"
                            initial={false}
                          />
                          <div className="flex items-center gap-4 z-10">
                            <div className="p-3 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 shadow-inner">
                              <Star className="w-5 h-5 text-purple-600 dark:text-purple-500 drop-shadow" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white group-hover:text-gray-900 transition-colors duration-200">
                                {activity.description}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-500 transition-colors duration-200">
                                {new Date(activity.timestamp).toLocaleDateString(undefined, {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            variant="secondary"
                            className="z-10 px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-sm group-hover:shadow"
                          >
                            +{activity.points} points
                          </Badge>
                        </motion.div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Challenges Section */}
            <div className="space-y-6">
              <Challenges />
              
              {/* Streaks Card */}
              <Card className="bg-white dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Your Streaks</CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">Keep the momentum going!</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(state.streaks).map(([type, streak]) => (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium capitalize text-gray-900 dark:text-white">{type}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-orange-500">🔥</span>
                            <span>{streak.count} days</span>
                          </div>
                        </div>
                        <Progress
                          value={(streak.count / streak.milestone) * 100}
                          className="h-2"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {streak.milestone - streak.count} days until next reward
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
