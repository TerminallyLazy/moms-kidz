"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MiniWaveform } from "@/components/ui/audio-waveform"
import { AudioPlayer } from "@/components/ui/audio-player"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Pause, Clock, Calendar, User, BarChart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import AudioUtils from '@/lib/audio-utils'

interface PodcastEpisode {
  id: string
  title: string
  description: string
  audioFile: File
  author: {
    id: string
    name: string
    avatar?: string
  }
  duration: number
  publishedAt: Date
  listens: number
}

interface PodcastListProps {
  episodes: PodcastEpisode[]
  onEpisodeSelect?: (episode: PodcastEpisode) => void
  className?: string
}

export function PodcastList({
  episodes,
  onEpisodeSelect,
  className = ''
}: PodcastListProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleEpisodeClick = (episode: PodcastEpisode) => {
    if (selectedEpisode?.id === episode.id) {
      setIsPlaying(!isPlaying)
    } else {
      setSelectedEpisode(episode)
      setIsPlaying(true)
      onEpisodeSelect?.(episode)
    }
  }

  const handleEpisodeEnd = () => {
    setIsPlaying(false)
    // Auto-play next episode logic could be added here
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Latest Episodes</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {episodes.map((episode) => (
              <motion.div
                key={episode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="group"
              >
                <div className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start space-x-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-1 shrink-0"
                      onClick={() => handleEpisodeClick(episode)}
                    >
                      {selectedEpisode?.id === episode.id && isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </Button>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {episode.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                        {episode.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {episode.author.name}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {AudioUtils.formatDuration(episode.duration)}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(episode.publishedAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <BarChart className="h-4 w-4 mr-1" />
                          {episode.listens} listens
                        </div>
                      </div>
                      <div className="mt-2">
                        <MiniWaveform
                          audioFile={episode.audioFile}
                          className="opacity-50 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full Audio Player */}
                <AnimatePresence>
                  {selectedEpisode?.id === episode.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4">
                        <AudioPlayer
                          audioFile={episode.audioFile}
                          title={episode.title}
                          author={episode.author.name}
                          onEnded={handleEpisodeEnd}
                          showDownload
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}