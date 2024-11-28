'use client'

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface SocialEmbedProps {
  platform: "facebook" | "instagram" | "tiktok"
  url: string
  width?: string | number
  height?: string | number
  className?: string
}

export function SocialEmbed({
  platform,
  url,
  width = "100%", 
  height = "100%",
  className
}: SocialEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadSocialSDK = () => {
      if (platform === "facebook") {
        // Load Facebook SDK
        const script = document.createElement("script")
        script.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0"
        script.async = true
        script.defer = true
        script.crossOrigin = "anonymous"
        document.body.appendChild(script)

        // Enable scrolling for Facebook
        if (iframeRef.current) {
          iframeRef.current.scrolling = "yes"
        }
      } else if (platform === "instagram") {
        // Load Instagram Embed SDK
        const script = document.createElement("script")
        script.src = "https://www.instagram.com/embed.js"
        script.async = true
        script.defer = true
        document.body.appendChild(script)

        // Enable scrolling for Instagram
        if (iframeRef.current) {
          iframeRef.current.scrolling = "yes"
        }
      } else if (platform === "tiktok") {
        // Load TikTok Embed SDK
        const script = document.createElement("script")
        script.src = "https://www.tiktok.com/embed.js"
        script.async = true
        document.body.appendChild(script)

        // Enable scrolling for TikTok
        if (iframeRef.current) {
          iframeRef.current.scrolling = "yes"
        }
      }
    }

    loadSocialSDK()
  }, [platform])

  const getEmbedUrl = () => {
    switch (platform) {
      case "facebook":
        return `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&show_text=true&width=500`
      case "instagram":
        return `https://www.instagram.com/p/${url.split('/').pop()}/embed`
      case "tiktok":
        const videoId = url.split('/').pop()
        return `https://www.tiktok.com/embed/v2/${videoId}`
      default:
        return ""
    }
  }

  const handleIframeLoad = () => {
    setIsLoaded(true)
  }

  return (
    <div 
      className={cn(
        "relative w-full h-full overflow-hidden rounded-lg",
        !isLoaded && "animate-pulse bg-gray-200 dark:bg-gray-800",
        className
      )}
    >
      <iframe
        ref={iframeRef}
        src={getEmbedUrl()}
        width={width}
        height={height}
        style={{ border: 'none', overflow: 'hidden' }}
        scrolling="no"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        onLoad={handleIframeLoad}
        className={cn(
          "absolute inset-0 w-full h-full bg-white",
          !isLoaded && "opacity-0"
        )}
      />
    </div>
  )
} 