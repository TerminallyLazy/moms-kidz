"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Menu, X } from "lucide-react"
import { useAuthContext } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

const routes = {
  public: [
    {
      title: "About",
      href: "/about",
    },
  ],
  authenticated: [
    {
      title: "Dashboard",
      href: "/member",
    },
    {
      title: "Care Log",
      href: "/care-log",
    },
    {
      title: "Activities",
      href: "/activities",
    },
    {
      title: "Achievements",
      href: "/achievements",
    },
    {
      title: "Tapestry",
      href: "/tapestry",
    },
    {
      title: "Profile",
      href: "/profile",
    },
  ],
}

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuthContext()

  const handleSignOut = async () => {
    await signOut()
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-left text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
            Moms Kidz
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
          <div className="flex flex-col space-y-4">
            {user ? (
              <>
                {routes.authenticated.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                      pathname === route.href && "bg-accent"
                    )}
                  >
                    <div className="text-sm font-medium leading-none">
                      {route.title}
                    </div>
                  </Link>
                ))}
                <Button
                  onClick={handleSignOut}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                {routes.public.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                      pathname === route.href && "bg-accent"
                    )}
                  >
                    <div className="text-sm font-medium leading-none">
                      {route.title}
                    </div>
                  </Link>
                ))}
                <div className="flex flex-col space-y-2">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      Join Now
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}