"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
    orientation?: "vertical" | "horizontal"
  }
>(({ className, children, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar orientation={orientation} />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb
      className={cn(
        "relative rounded-full",
        "bg-gray-200 dark:bg-gray-800",
        "hover:bg-gray-300 dark:hover:bg-gray-700",
        "transition-colors duration-200"
      )}
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

// Custom ScrollArea with gradient fade
interface GradientScrollAreaProps extends React.ComponentProps<typeof ScrollArea> {
  fadeTop?: boolean
  fadeBottom?: boolean
  gradientClassName?: string
}

const GradientScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollArea>,
  GradientScrollAreaProps
>(({ 
  fadeTop = true, 
  fadeBottom = true, 
  gradientClassName,
  className,
  children,
  ...props 
}, ref) => (
  <div className="relative">
    <ScrollArea ref={ref} className={className} {...props}>
      {children}
    </ScrollArea>
    {fadeTop && (
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-8 pointer-events-none",
          "bg-gradient-to-b from-white to-transparent dark:from-gray-900",
          gradientClassName
        )}
      />
    )}
    {fadeBottom && (
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-8 pointer-events-none",
          "bg-gradient-to-t from-white to-transparent dark:from-gray-900",
          gradientClassName
        )}
      />
    )}
  </div>
))
GradientScrollArea.displayName = "GradientScrollArea"

export { ScrollArea, ScrollBar, GradientScrollArea }
