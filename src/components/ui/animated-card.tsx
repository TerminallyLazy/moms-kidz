"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card, CardProps } from "./card"

interface AnimatedCardProps extends CardProps {
  delay?: number
}

export function AnimatedCard({ className, delay = 0, ...props }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
      }}
      className={cn(
        "transition-shadow duration-300",
        "shadow-lg dark:shadow-gray-900/30",
        "hover:shadow-xl dark:hover:shadow-gray-900/40",
        className
      )}
    >
      <Card {...props} className="bg-white dark:bg-gray-900 border-0" />
    </motion.div>
  )
}
