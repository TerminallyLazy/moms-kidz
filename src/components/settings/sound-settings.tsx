"use client"

import { useState, useEffect } from 'react'
import { useGamificationSounds } from '@/lib/sounds'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Volume2, VolumeX, Music, Bell, Trophy, Flame, Star, PlayCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const SOUND_EXAMPLES = [
  { name: 'Achievement', icon: Trophy, sound: 'achievement' },
  { name: 'Level Up', icon: Star, sound: 'levelUp' },
  { name: 'Points', icon: Music, sound: 'points' },
  { name: 'Streak', icon: Flame, sound: 'streak' },
  { name: 'Challenge', icon: Trophy, sound: 'challenge' },
  { name: 'Notification', icon: Bell, sound: 'notification' }
] as const

export function SoundSettings() {
  const sounds = useGamificationSounds()
  const [enabled, setEnabled] = useState(sounds.isEnabled())
  const [volume, setVolume] = useState(sounds.getVolume())
  const [playing, setPlaying] = useState<string | null>(null)

  useEffect(() => {
    sounds.setEnabled(enabled)
  }, [enabled])

  useEffect(() => {
    sounds.setVolume(volume)
  }, [volume])

  const handlePlaySound = async (soundName: string) => {
    if (!enabled) return
    setPlaying(soundName)
    try {
      const methodName = `play${soundName.replace(/\s/g, '')}Sound` as keyof typeof sounds
      const playMethod = sounds[methodName]
      if (typeof playMethod === 'function') {
        await (playMethod as (volume: number) => Promise<void>)(volume)
      }
    } finally {
      setPlaying(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Volume2 className="h-5 w-5" />
          <span>Sound Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Sound Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="font-medium">Sound Effects</div>
            <div className="text-sm text-muted-foreground">
              Enable or disable all game sounds
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
            aria-label="Toggle sounds"
          />
        </div>

        {/* Volume Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-medium">Volume</div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setVolume(0)}
                disabled={!enabled}
              >
                <VolumeX className="h-4 w-4" />
              </Button>
              <span className="min-w-[3ch] text-sm">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
          <Slider
            value={[volume * 100]}
            onValueChange={([value]) => setVolume(value / 100)}
            max={100}
            step={1}
            disabled={!enabled}
            className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
          />
        </div>

        {/* Sound Examples */}
        <div className="space-y-2">
          <div className="font-medium">Preview Sounds</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {SOUND_EXAMPLES.map(({ name, icon: Icon, sound }) => (
              <motion.div
                key={name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handlePlaySound(name)}
                  disabled={!enabled || playing !== null}
                >
                  <div className="flex w-full items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{name}</span>
                    {playing === name ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        <PlayCircle className="h-4 w-4 text-primary" />
                      </motion.div>
                    ) : (
                      <PlayCircle className="h-4 w-4" />
                    )}
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sound Status */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Sound Status</div>
              <div className="text-sm text-muted-foreground">
                {enabled
                  ? `Sounds enabled at ${Math.round(volume * 100)}% volume`
                  : 'Sounds are currently disabled'}
              </div>
            </div>
            <div
              className={`h-2 w-2 rounded-full ${
                enabled ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}