import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClientProviders } from "@/components/providers/client-providers"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { MainNav } from "@/components/navigation-menu"
import { cn } from "@/lib/utils"
import Script from 'next/script'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Moms Kidz - Your Parenting Journey',
  description: 'Track, share, and celebrate your parenting journey with Moms Kidz',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Twitter Widget */}
        <Script src="https://platform.twitter.com/widgets.js" strategy="lazyOnload" />
        
        {/* Facebook SDK */}
        <Script
          src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v13.0"
          strategy="lazyOnload"
          nonce="social_media_nonce"
        />
        
        {/* Instagram Embed */}
        <Script
          src="https://www.instagram.com/embed.js"
          strategy="lazyOnload"
          nonce="social_media_nonce"
        />
      </head>
      <body className={cn("min-h-screen bg-background antialiased", inter)}>
        <ClientProviders>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
            <div className="relative flex min-h-screen flex-col">
              <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <MainNav />
              </header>
              <main className="flex-1">
                {children}
              </main>
            </div>
          </ThemeProvider>
        </ClientProviders>
      </body>
    </html>
  )
}
