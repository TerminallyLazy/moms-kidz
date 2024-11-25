import { Inter } from "next/font/google"
import { ClientProviders } from "@/components/providers/client-providers"
import { PWAPrompt } from "@/components/pwa-prompt"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Mom's Kidz",
  description: "Track, celebrate, and share your parenting journey",
  manifest: "/manifest.json",
  themeColor: "#9333ea",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mom's Kidz",
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#9333ea" />
        <meta name="msapplication-TileColor" content="#9333ea" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Mom's Kidz" />
        <meta name="application-name" content="Mom's Kidz" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        <ClientProviders>
          {children}
          <PWAPrompt />
        </ClientProviders>
      </body>
    </html>
  )
}
