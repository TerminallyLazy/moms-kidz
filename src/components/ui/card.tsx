"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    gradient?: boolean
    hover?: boolean
    animate?: boolean
  }
>(({ className, gradient, hover, animate = true, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial={animate ? { opacity: 0, y: 20 } : undefined}
    animate={animate ? { opacity: 1, y: 0 } : undefined}
    transition={{ duration: 0.3 }}
    whileHover={hover ? { 
      scale: 1.02,
      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
    } : undefined}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900",
      gradient && "bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white",
      hover && "transition-all duration-300",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      "text-gray-900 dark:text-white",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", 
      "text-gray-500 dark:text-gray-400",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Animated variants
interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  gradient?: boolean
  hover?: boolean
  className?: string
}

const AnimatedCard = ({
  children,
  gradient,
  hover = true,
  className,
  ...props
}: AnimatedCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    whileHover={hover ? {
      scale: 1.02,
      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
    } : undefined}
    className={cn(
      "rounded-lg border shadow-sm",
      "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900",
      gradient && "bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white",
      hover && "transition-all duration-300",
      className
    )}
    {...props}
  >
    {children}
  </motion.div>
)

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  AnimatedCard,
}
