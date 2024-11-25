"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Facebook, Instagram } from "lucide-react"

interface SocialFeedProps {
  facebookUrl: string
  instagramUrl: string
  pinterestUrl: string
  tiktokUrl: string
  isLoading?: boolean
}

export function SocialFeed({
  facebookUrl,
  instagramUrl,
  pinterestUrl,
  tiktokUrl,
  isLoading = false
}: SocialFeedProps) {
  return (
    <Card className="bg-white dark:bg-gray-900 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Social Media</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Social links here - implement as needed */}
        {/* Example structure: */}
        <div className="flex gap-4">
          {facebookUrl && <Facebook className="h-6 w-6" />}
          {instagramUrl && <Instagram className="h-6 w-6" />}
          {/* {pinterestUrl && <Pinterest className="h-6 w-6" />}
          {tiktokUrl && <Tiktok className="h-6 w-6" />} */}
        </div>
      </CardContent>
    </Card>
  )
}
