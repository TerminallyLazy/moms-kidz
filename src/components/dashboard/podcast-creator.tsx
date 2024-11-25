"use client"

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mic, Upload, Loader2, Play, Pause, Clock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import ContentUtils from '@/lib/content-utils'

interface PodcastCreatorProps {
  userId: string
  onPodcastCreated?: () => void
}

export function PodcastCreator({ userId, onPodcastCreated }: PodcastCreatorProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const file = new File([blob], 'recording.webm', { type: 'audio/webm' })
        setAudioFile(file)
        chunksRef.current = []
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      toast.info('Recording started')
    } catch (error) {
      toast.error('Failed to start recording')
      console.error('Recording error:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      toast.success('Recording completed')
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast.error('File size should be less than 100MB')
        return
      }
      setAudioFile(file)
      toast.success('Audio file uploaded')
    }
  }

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !audioFile) {
      toast.error('Please fill in all fields and provide audio')
      return
    }

    setIsLoading(true)
    try {
      // Upload audio file to storage (implement your storage solution)
      const audioUrl = await uploadAudioFile(audioFile)

      // Create podcast
      await ContentUtils.createPodcast({
        userId,
        title,
        description,
        audioUrl,
        duration,
        metadata: {
          originalFileName: audioFile.name,
          fileSize: audioFile.size,
          mimeType: audioFile.type
        }
      })

      toast.success('Podcast created successfully')
      onPodcastCreated?.()
      
      // Reset form
      setTitle('')
      setDescription('')
      setAudioFile(null)
      setDuration(0)
    } catch (error) {
      toast.error('Failed to create podcast')
      console.error('Podcast creation error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Implement this based on your storage solution (e.g., Supabase Storage)
  const uploadAudioFile = async (file: File): Promise<string> => {
    // TODO: Implement file upload
    return 'audio_url'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mic className="h-5 w-5 text-purple-500" />
          <span>Create Podcast</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter podcast title"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your podcast"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Audio</Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant={isRecording ? "destructive" : "default"}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Record
                  </>
                )}
              </Button>
              <span className="text-gray-500">or</span>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('audio-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Audio
              </Button>
              <input
                id="audio-upload"
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {audioFile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 truncate">
                  {audioFile.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={togglePlayback}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <audio
                ref={audioRef}
                src={URL.createObjectURL(audioFile)}
                onLoadedMetadata={(e) => {
                  const audio = e.currentTarget
                  setDuration(Math.round(audio.duration))
                }}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
              {duration > 0 && (
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
                </div>
              )}
            </motion.div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !title || !description || !audioFile}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Podcast'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}