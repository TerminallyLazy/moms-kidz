"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800",
      "text-gray-900 dark:text-gray-100",
      className
    )}
    {...props}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      {props.children}
    </motion.div>
  </TooltipPrimitive.Content>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Custom tooltip with icon
interface IconTooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  icon?: React.ReactNode
  className?: string
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
}

function IconTooltip({
  content,
  children,
  icon,
  className,
  side = "top",
  align = "center"
}: IconTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} align={align} className={className}>
          <div className="flex items-center space-x-2">
            {icon && <span className="text-gray-500 dark:text-gray-400">{icon}</span>}
            <span>{content}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Custom tooltip with title and description
interface InfoTooltipProps extends Omit<IconTooltipProps, 'content'> {
  title: string
  description: string
}

function InfoTooltip({
  title,
  description,
  children,
  icon,
  className,
  side = "top",
  align = "center"
}: InfoTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          align={align} 
          className={cn("max-w-[300px] p-3", className)}
        >
          <div className="flex space-x-3">
            {icon && (
              <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                {icon}
              </div>
            )}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  IconTooltip,
  InfoTooltip
}
