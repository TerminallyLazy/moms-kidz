"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LoadingProps {
  className?: string
  size?: "sm" | "md" | "lg"
  text?: string
  fullScreen?: boolean
}

export function Loading({ 
  className, 
  size = "md", 
  text = "Loading...",
  fullScreen = false 
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-16 w-16 border-2",
    md: "h-24 w-24 border-3",
    lg: "h-32 w-32 border-4"
  }

  const containerClasses = cn(
    "flex flex-col items-center justify-center gap-4",
    fullScreen && "min-h-screen",
    className
  )

  return (
    <div className={containerClasses}>
      <motion.div
        className={cn(
          "rounded-full border-b-purple-600 dark:border-b-purple-400",
          "animate-spin",
          sizeClasses[size]
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      {text && (
        <motion.p
          className="text-muted-foreground text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm">
      <Loading fullScreen text="Loading your experience..." />
    </div>
  )
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn(
        "h-4 w-4 rounded-full border-2 border-b-purple-600 dark:border-b-purple-400 animate-spin",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  )
}