"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {
  className?: string
}

export function MainNav({ className, ...props }: MainNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/member"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/member"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Dashboard
      </Link>
      <Link
        href="/care-log"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/care-log"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Care Log
      </Link>
      <Link
        href="/community"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/community"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Community
      </Link>
      <Link
        href="/resources"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/resources"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Resources
      </Link>
    </nav>
  )
} 