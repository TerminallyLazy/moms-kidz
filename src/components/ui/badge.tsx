"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-500/20 text-green-600 dark:bg-green-500/10 dark:text-green-400",
        warning:
          "border-transparent bg-yellow-500/20 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400",
        info:
          "border-transparent bg-blue-500/20 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
        gradient:
          "border-transparent bg-gradient-to-r from-purple-600 to-pink-600 text-white dark:from-purple-400 dark:to-pink-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  onClick?: () => void
}

function Badge({ className, variant, onClick, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({ variant }),
        onClick && "cursor-pointer hover:opacity-90",
        className
      )}
      onClick={onClick}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
