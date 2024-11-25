"use client"

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import AudioUtils from '@/lib/audio-utils'

interface AudioWaveformProps {
  audioFile: File
  isPlaying: boolean
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  className?: string
}

export function AudioWaveform({
  audioFile,
  isPlaying,
  currentTime,
  duration,
  onSeek,
  className = ''
}: AudioWaveformProps) {
  const [waveformData, setWaveformData] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadWaveform = async () => {
      try {
        setIsLoading(true)
        const data = await AudioUtils.createWaveformData(audioFile, 200)
        setWaveformData(data)
      } catch (error) {
        console.error('Error creating waveform:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadWaveform()
  }, [audioFile])

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const percentage = x / rect.width
    const seekTime = duration * percentage
    onSeek(seekTime)
  }

  const progress = duration > 0 ? (currentTime / duration) : 0

  if (isLoading) {
    return (
      <div className={`h-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse ${className}`} />
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative h-24 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full flex items-center">
          {waveformData.map((amplitude, index) => {
            const barHeight = Math.max(4, amplitude * 80) // Minimum height of 4px
            const isPlayed = (index / waveformData.length) <= progress

            return (
              <motion.div
                key={index}
                className={`mx-[1px] rounded-full ${
                  isPlayed 
                    ? 'bg-purple-500 dark:bg-purple-400'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
                initial={{ height: 4 }}
                animate={{ 
                  height: barHeight,
                  scale: isPlaying && isPlayed ? [1, 1.2, 1] : 1
                }}
                transition={{
                  height: { duration: 0.5 },
                  scale: { 
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }
                }}
                style={{ width: `${100 / waveformData.length}%` }}
              />
            )
          })}
        </div>
      </div>

      {/* Time indicators */}
      <div className="absolute bottom-2 left-2 text-xs text-gray-500 dark:text-gray-400">
        {AudioUtils.formatDuration(Math.floor(currentTime))}
      </div>
      <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
        {AudioUtils.formatDuration(Math.floor(duration))}
      </div>

      {/* Progress overlay */}
      <motion.div
        className="absolute top-0 left-0 h-full bg-purple-500/10 dark:bg-purple-400/10 pointer-events-none"
        style={{ width: `${progress * 100}%` }}
        animate={{ width: `${progress * 100}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  )
}

// Mini version for podcast list items
export function MiniWaveform({
  audioFile,
  className = ''
}: {
  audioFile: File
  className?: string
}) {
  const [waveformData, setWaveformData] = useState<number[]>([])

  useEffect(() => {
    const loadWaveform = async () => {
      try {
        const data = await AudioUtils.createWaveformData(audioFile, 50)
        setWaveformData(data)
      } catch (error) {
        console.error('Error creating mini waveform:', error)
      }
    }

    loadWaveform()
  }, [audioFile])

  return (
    <div className={`h-8 flex items-center ${className}`}>
      {waveformData.map((amplitude, index) => (
        <div
          key={index}
          className="mx-[1px] bg-gray-300 dark:bg-gray-700 rounded-full"
          style={{
            height: `${Math.max(2, amplitude * 32)}px`,
            width: `${100 / waveformData.length}%`
          }}
        />
      ))}
    </div>
  )
}