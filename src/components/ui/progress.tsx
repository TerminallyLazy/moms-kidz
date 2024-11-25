"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    indicatorColor?: string
    showValue?: boolean
    animate?: boolean
  }
>(({ className, value = 0, indicatorColor, showValue = false, animate = true, ...props }, ref) => {
  const [hasAnimated, setHasAnimated] = React.useState(false)

  React.useEffect(() => {
    if (animate && !hasAnimated) {
      setHasAnimated(true)
    }
  }, [animate, hasAnimated])

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800",
        className
      )}
      {...props}
    >
      <motion.div
        initial={animate && !hasAnimated ? { width: 0 } : { width: `${value}%` }}
        animate={{ width: `${value}%` }}
        transition={{ duration: animate ? 0.5 : 0, ease: "easeOut" }}
        className={cn(
          "h-full w-full flex-1 transition-all",
          indicatorColor || "bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500"
        )}
      >
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-white">{value}%</span>
          </div>
        )}
      </motion.div>
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
