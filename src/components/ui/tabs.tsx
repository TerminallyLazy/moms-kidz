"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: "default" | "pills" | "underline"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center",
      variant === "default" && "h-10 rounded-md bg-muted p-1 text-muted-foreground",
      variant === "pills" && "space-x-2",
      variant === "underline" && "border-b border-gray-200 dark:border-gray-800",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: "default" | "pills" | "underline"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      variant === "default" && 
        "rounded-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      variant === "pills" && 
        "rounded-full bg-transparent data-[state=active]:bg-gradient-to-r from-purple-600 to-pink-600 data-[state=active]:text-white dark:data-[state=active]:from-purple-500 dark:data-[state=active]:to-pink-500",
      variant === "underline" && 
        "border-b-2 border-transparent data-[state=active]:border-purple-600 dark:data-[state=active]:border-purple-500",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & {
    animate?: boolean
  }
>(({ className, animate = true, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  >
    {animate ? (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
      >
        {props.children}
      </motion.div>
    ) : (
      props.children
    )}
  </TabsPrimitive.Content>
))
TabsContent.displayName = TabsPrimitive.Content.displayName

// Animated Tabs Container
interface AnimatedTabsProps extends React.ComponentProps<typeof Tabs> {
  items: {
    value: string
    label: string
    icon?: React.ReactNode
    content: React.ReactNode
  }[]
  variant?: "default" | "pills" | "underline"
}

function AnimatedTabs({ items, variant = "default", className, ...props }: AnimatedTabsProps) {
  return (
    <Tabs defaultValue={items[0].value} {...props}>
      <TabsList variant={variant} className={cn("w-full", className)}>
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            variant={variant}
            className="flex-1"
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsContent key={item.value} value={item.value}>
          {item.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, AnimatedTabs }
