import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4">
      <div className="rounded-full bg-amber-100 p-3">
        <svg
          className="h-6 w-6 text-amber-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Page not found</h1>
        <p className="text-muted-foreground">
          Sorry, we couldn't find the page you're looking for.
        </p>
      </div>
      <div className="flex space-x-4">
        <Link href="/">
          <Button>
            Go back home
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline">
            Go to dashboard
          </Button>
        </Link>
      </div>
      <p className="text-sm text-muted-foreground">
        Need help?{" "}
        <Link 
          href="/contact" 
          className="underline underline-offset-4 hover:text-primary"
        >
          Contact support
        </Link>
      </p>
    </div>
  )
}