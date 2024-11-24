"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

export function MainNav() {
  return (
    <div className="container flex h-16 items-center">
      <div className="mr-4 flex">
        <Link href="/" className="flex space-x-2">
          <div className="relative w-68 h-14">
            <Image
              src="/mklogo.png"
              alt="Moms Kidz"
              width={155}
              height={48}
              className="object-contain"
              priority
            />
          </div>
        </Link>
      </div>
      <div className="flex items-center justify-center gap-4 flex-grow">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Features</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <Link
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                      href="/about"
                    >
                      <div className="mt-4 mb-2 text-lg font-medium">
                        Why Moms Kidz?
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        Track your child's growth and development with our comprehensive tools.
                      </p>
                    </Link>
                  </li>
                  <ListItem href="/care-log" title="Care Log">
                    Daily tracking and monitoring of your child's activities
                  </ListItem>
                  <ListItem href="/tapestry" title="Tapestry">
                    Create and share your child's digital memory book
                  </ListItem>
                  <ListItem href="/achievements" title="Achievements">
                    Track milestones and celebrate progress
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/tapestry" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Tapestry
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/care-log" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Care Log
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/achievements" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Achievements
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm">Sign In</Button>
        <Button size="sm" variant="gradient">Join Now</Button>
        <ThemeToggle />
      </div>
    </div>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
