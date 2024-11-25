"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Icons.home,
  },
  {
    title: "Activities",
    href: "/activities",
    icon: Icons.calendar,
  },
  {
    title: "Care Log",
    href: "/care-log",
    icon: Icons.book,
  },
  {
    title: "Achievements",
    href: "/achievements",
    icon: Icons.award,
  },
  {
    title: "Tapestry",
    href: "/tapestry",
    icon: Icons.users,
  },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Icons.menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 w-full",
                      pathname === item.href
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}
