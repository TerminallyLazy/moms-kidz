"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "./card"
import { cn } from "@/lib/utils"

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number
  children: React.ReactNode
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, delay = 0, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: delay,
          duration: 0.5,
          ease: [0.4, 0, 0.2, 1],
        }}
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
        className={cn("h-full", className)}
        {...props}
      >
        <Card className="h-full transition-all duration-300 
          shadow-[0_4px_20px_-4px_rgba(0,0,0,0.15)] 
          dark:shadow-[0_4px_20px_rgba(255,255,255,0.03)]
          dark:border-slate-700/50
          hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] 
          dark:hover:shadow-[0_20px_40px_rgba(255,255,255,0.1),0_15px_20px_rgba(255,255,255,0.05)]
          hover:translate-y-[-3px]
          dark:bg-slate-800/50
          dark:hover:bg-slate-800/70
          dark:hover:border-slate-600/50">
          {children}
        </Card>
      </motion.div>
    )
  }
)
AnimatedCard.displayName = "AnimatedCard"

export { AnimatedCard }
