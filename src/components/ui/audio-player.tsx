"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from './button'
import { AudioWaveform } from './audio-waveform'
import { 
  Play, Pause, SkipBack, SkipForward, 
  Volume2, VolumeX, Download 
} from 'lucide-react'
import { motion } from 'framer-motion'
import AudioUtils from '@/lib/audio-utils'

interface AudioPlayerProps {
  audioFile: File
  title?: string
  author?: string
  onEnded?: () => void
  showDownload?: boolean
  className?: string
}

export function AudioPlayer({
  audioFile,
  title,
  author,
  onEnded,
  showDownload = false,
  className = ''
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      onEnded?.()
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [onEnded])

  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (time: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }

  const skipForward = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.min(currentTime + 10, duration)
  }

  const skipBackward = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.max(currentTime - 10, 0)
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    const newMuted = !isMuted
    audioRef.current.muted = newMuted
    setIsMuted(newMuted)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    if (!audioRef.current) return
    audioRef.current.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const handleDownload = () => {
    const url = URL.createObjectURL(audioFile)
    const a = document.createElement('a')
    a.href = url
    a.download = audioFile.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`p-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg ${className}`}>
      <audio
        ref={audioRef}
        src={URL.createObjectURL(audioFile)}
        preload="metadata"
        className="hidden"
      />

      {/* Title and Author */}
      {(title || author) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {author && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {author}
            </p>
          )}
        </div>
      )}

      {/* Waveform */}
      <AudioWaveform
        audioFile={audioFile}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        className="mb-4"
      />

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={skipBackward}
            disabled={isLoading}
          >
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlayPause}
            disabled={isLoading}
            className="h-12 w-12"
          >
            <motion.div
              animate={{ scale: isPlaying ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.5 }}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </motion.div>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={skipForward}
            disabled={isLoading}
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              disabled={isLoading}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-24"
            />
          </div>

          {/* Download Button */}
          {showDownload && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              disabled={isLoading}
            >
              <Download className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}