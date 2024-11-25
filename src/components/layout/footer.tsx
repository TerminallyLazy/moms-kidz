import Link from "next/link"
import { Icons } from "@/components/ui/icons"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Icons.logo className="h-6 w-6" />
          <p className="text-center text-sm leading-loose md:text-left">
            Built by{" "}
            <Link
              href="/about"
              className="font-medium underline underline-offset-4"
            >
              Mom's Kidz
            </Link>
            . The source code is available on{" "}
            <Link
              href="https://github.com/yourusername/moms-kidz-v3"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </Link>
            .
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/privacy"
            className="text-sm font-medium underline underline-offset-4"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-sm font-medium underline underline-offset-4"
          >
            Terms
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium underline underline-offset-4"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}