"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Icons } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "Home",
    href: "/dashboard",
    icon: Icons.home,
  },
  {
    title: "Activities",
    href: "/activities",
    icon: Icons.calendar,
  },
  {
    title: "Care",
    href: "/care-log",
    icon: Icons.book,
  },
  {
    title: "Social",
    href: "/tapestry",
    icon: Icons.users,
  },
]

interface MobileNavProps {
  className?: string
}

export function MobileNav({ className }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Navigation Bar - Fixed at bottom */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}>
        <nav className="container flex h-16 items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center space-y-1 w-16 h-16 transition-colors",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  isActive && "animate-bounce"
                )} />
                <span className="text-xs font-medium">{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Add padding at the bottom for mobile navigation */}
      <div className={cn("h-16", className)} />
    </>
  )
}
