"use client"

import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const HoverCard = HoverCardPrimitive.Root

const HoverCardTrigger = HoverCardPrimitive.Trigger

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900",
      className
    )}
    {...props}
  >
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      transition={{ duration: 0.2 }}
    >
      {props.children}
    </motion.div>
  </HoverCardPrimitive.Content>
))
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

// Custom components for common hover card patterns
interface InfoHoverCardProps {
  trigger: React.ReactNode
  title: string
  description: string
  icon?: React.ReactNode
  className?: string
}

function InfoHoverCard({ trigger, title, description, icon, className }: InfoHoverCardProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {trigger}
      </HoverCardTrigger>
      <HoverCardContent className={className}>
        <div className="flex space-x-4">
          {icon && (
            <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              {icon}
            </div>
          )}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

// Achievement hover card with progress
interface AchievementHoverCardProps extends Omit<InfoHoverCardProps, 'description'> {
  description: string
  progress: number
  total: number
  progressLabel?: string
}

function AchievementHoverCard({
  trigger,
  title,
  description,
  progress,
  total,
  progressLabel,
  icon,
  className
}: AchievementHoverCardProps) {
  const percentage = Math.round((progress / total) * 100)
  
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {trigger}
      </HoverCardTrigger>
      <HoverCardContent className={className}>
        <div className="flex space-x-4">
          {icon && (
            <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500">
              <div className="text-white">{icon}</div>
            </div>
          )}
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                <span>{progressLabel || `Progress: ${progress}/${total}`}</span>
                <span>{percentage}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500"
                />
              </div>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

export { 
  HoverCard, 
  HoverCardTrigger, 
  HoverCardContent,
  InfoHoverCard,
  AchievementHoverCard
}
