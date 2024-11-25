"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, RefreshCw, Eraser, MessageSquarePlus, Keyboard } from "lucide-react"
import { Tooltip } from "@/components/ui/tooltip"
import { useHotkeys } from "react-hotkeys-hook"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: number
}

const SUGGESTED_PROMPTS = [
  "What activities can help develop my toddler's motor skills?",
  "How can I establish a good bedtime routine?",
  "What are some healthy snack ideas for kids?",
  "How do I handle toddler tantrums effectively?",
]

const KEYBOARD_SHORTCUTS = [
  { key: "⌘/Ctrl + Enter", description: "Send message" },
  { key: "⌘/Ctrl + L", description: "Clear chat" },
  { key: "⌘/Ctrl + K", description: "Focus chat input" },
  { key: "Esc", description: "Clear input" },
]

export function GeminiChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      })
      
      const data = await response.json()
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: Date.now()
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Keyboard shortcuts
  useHotkeys('mod+enter', (e) => {
    e.preventDefault()
    handleSubmit()
  }, { enableOnFormTags: true })

  useHotkeys('mod+l', (e) => {
    e.preventDefault()
    clearChat()
  })

  useHotkeys('mod+k', (e) => {
    e.preventDefault()
    inputRef.current?.focus()
  })

  useHotkeys('esc', (e) => {
    e.preventDefault()
    setInput("")
  }, { enableOnFormTags: true })

  const clearChat = () => {
    setMessages([])
  }

  const refreshChat = () => {
    setMessages([])
  }

  const usePrompt = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  return (
    <Card className={cn(
      "flex h-[calc(100vh-12rem)] flex-col space-y-4 chat-container relative",
      isDark && "bg-opacity-50"
    )}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold">Gemini Assistant</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Tooltip content="Keyboard shortcuts">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowShortcuts(!showShortcuts)}
              className="h-8 w-8"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Refresh chat">
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshChat}
              className="h-8 w-8"
              disabled={isLoading || messages.length === 0}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Clear chat">
            <Button
              variant="ghost"
              size="icon"
              onClick={clearChat}
              className="h-8 w-8"
              disabled={isLoading || messages.length === 0}
            >
              <Eraser className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 right-4 z-50 w-72 rounded-lg border bg-card p-4 shadow-lg"
          >
            <h4 className="font-medium mb-2">Keyboard Shortcuts</h4>
            <div className="space-y-2">
              {KEYBOARD_SHORTCUTS.map(({ key, description }) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{description}</span>
                  <kbd className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages */}
      <ScrollArea 
        ref={scrollRef}
        className="flex-1 px-4"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            <div className="space-y-4">
              <Bot className="h-12 w-12 mx-auto text-purple-500" />
              <div>
                <p className="text-lg font-medium">Chat with your personal assistant</p>
                <p className="text-sm text-muted-foreground">Ask me anything about parenting, child development, or daily care routines.</p>
              </div>
            </div>
            
            <div className="space-y-4 w-full max-w-md">
              <p className="text-sm font-medium text-muted-foreground">Try asking about:</p>
              <div className="grid grid-cols-1 gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    className="justify-start text-left h-auto py-3 px-4"
                    onClick={() => usePrompt(prompt)}
                  >
                    <MessageSquarePlus className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{prompt}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.timestamp}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ 
                  duration: 0.2,
                  ease: "easeOut"
                }}
                className={cn(
                  "mb-4 flex w-max max-w-[80%] flex-col rounded-lg p-4",
                  message.role === "user" ? "ml-auto chat-message-user" : "chat-message-assistant"
                )}
              >
                <div className={cn(
                  "text-sm font-medium",
                  message.role === "user" ? "text-white" : "text-foreground"
                )}>
                  {message.role === "user" ? "You" : "Assistant"}
                </div>
                <div className={cn(
                  "mt-1 leading-relaxed", 
                  message.role === "user" ? "text-white" : "text-foreground"
                )}>
                  {message.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex space-x-2 p-4 rounded-lg w-max chat-message-assistant"
          >
            <div className="h-2 w-2 rounded-full chat-loading-dot" />
            <div className="h-2 w-2 rounded-full chat-loading-dot" />
            <div className="h-2 w-2 rounded-full chat-loading-dot" />
          </motion.div>
        )}
      </ScrollArea>

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message... (⌘ + Enter to send)"
            className="chat-input min-h-[60px] flex-1 resize-none"
            maxLength={1000}
            disabled={isLoading}
          />
          <Tooltip content="Send message (⌘ + Enter)">
            <Button 
              type="submit" 
              size="icon"
              disabled={isLoading || !input.trim()}
              className="chat-send-button w-12 h-12"
            >
              <Send className="h-5 w-5" />
            </Button>
          </Tooltip>
        </div>
        <div className="mt-2 text-xs text-muted-foreground text-right">
          {input.length}/1000 characters
        </div>
      </form>
    </Card>
  )
}