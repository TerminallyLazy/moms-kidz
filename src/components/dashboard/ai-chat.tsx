"use client"

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LoadingSpinner } from "@/components/ui/loading"
import { Image, Send, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import Markdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface AIResponse {
  response: string
  timestamp: string
}

interface AIError {
  error: string
}

export function AIChat({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (validateImage(file)) {
        setSelectedImage(file)
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreviewUrl(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const validateImage = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or WebP image.')
      return false
    }

    if (file.size > maxSize) {
      toast.error('Image size should be less than 5MB.')
      return false
    }

    return true
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }

  const handleSubmit = async () => {
    if (!input.trim() && !selectedImage) return

    try {
      setIsLoading(true)

      // Add user message
      const userMessage: Message = {
        role: 'user',
        content: input,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, userMessage])
      setInput('')

      // Prepare form data
      const formData = new FormData()
      formData.append('message', input)
      formData.append('userId', userId)
      if (selectedImage) {
        formData.append('image', selectedImage)
      }

      // Send request
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        body: formData
      })

      const data: AIResponse | AIError = await response.json()

      if ('error' in data) {
        throw new Error(data.error)
      }

      // Add AI response
      const aiMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp
      }
      setMessages(prev => [...prev, aiMessage])

      // Clear image after successful submission
      removeImage()
      scrollToBottom()

    } catch (error) {
      toast.error('Failed to send message')
      console.error('Chat error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mom's Kidz AI Assistant</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea 
          ref={scrollAreaRef}
          className="h-[400px] pr-4"
        >
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex flex-col mb-4 ${
                  message.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <Markdown className="prose dark:prose-invert">
                      {message.content}
                    </Markdown>
                  ) : (
                    message.content
                  )}
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>

        <div className="space-y-2">
          {imagePreviewUrl && (
            <div className="relative w-24 h-24">
              <img
                src={imagePreviewUrl}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 w-6 h-6"
                onClick={removeImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Image className="w-4 h-4" />
            </Button>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your child's health..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <LoadingSpinner className="mr-2" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}