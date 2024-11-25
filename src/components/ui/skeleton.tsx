"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "card" | "avatar" | "badge" | "text"
  animate?: boolean
}

function Skeleton({
  className,
  variant = "default",
  animate = true,
  ...props
}: SkeletonProps) {
  const baseClasses = "bg-gray-200 dark:bg-gray-800 rounded-md"
  const variants = {
    default: "h-4",
    card: "h-[200px]",
    avatar: "h-12 w-12 rounded-full",
    badge: "h-5 w-16 rounded-full",
    text: "h-4 w-[250px]"
  }

  return (
    <motion.div
      className={cn(
        baseClasses,
        variants[variant],
        animate && "animate-pulse",
        className
      )}
      {...props}
    />
  )
}

// Predefined skeleton layouts
function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton variant="card" />
      <div className="space-y-2">
        <Skeleton variant="text" className="w-3/4" />
        <Skeleton variant="text" className="w-1/2" />
      </div>
    </div>
  )
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-6 space-y-4 border rounded-lg border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center">
            <Skeleton variant="text" className="w-1/3" />
            <Skeleton variant="avatar" className="h-8 w-8" />
          </div>
          <Skeleton variant="text" className="w-1/2" />
          <Skeleton variant="text" className="w-2/3" />
        </div>
      ))}
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton variant="avatar" className="h-16 w-16" />
      <div className="space-y-2">
        <Skeleton variant="text" className="w-[200px]" />
        <Skeleton variant="text" className="w-[150px]" />
      </div>
    </div>
  )
}

function TableRowSkeleton() {
  return (
    <div className="flex items-center space-x-4 py-3">
      <Skeleton variant="avatar" className="h-10 w-10" />
      <div className="space-y-2 flex-1">
        <Skeleton variant="text" className="w-1/4" />
        <Skeleton variant="text" className="w-1/3" />
      </div>
      <Skeleton variant="badge" />
    </div>
  )
}

function FeedSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton variant="avatar" />
            <div className="space-y-2">
              <Skeleton variant="text" className="w-[200px]" />
              <Skeleton variant="text" className="w-[100px]" />
            </div>
          </div>
          <Skeleton variant="card" className="h-[300px]" />
          <div className="flex space-x-4">
            <Skeleton variant="badge" />
            <Skeleton variant="badge" />
            <Skeleton variant="badge" />
          </div>
        </div>
      ))}
    </div>
  )
}

export {
  Skeleton,
  CardSkeleton,
  StatsSkeleton,
  ProfileSkeleton,
  TableRowSkeleton,
  FeedSkeleton
}