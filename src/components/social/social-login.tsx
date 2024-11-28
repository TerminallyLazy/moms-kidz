"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { toast } from "sonner"
import { SocialEmbed } from "@/components/social/social-embed"

interface SocialLoginProps {
  onLogin: (platform: string, data: any) => void
}

export function SocialLogin({ onLogin }: SocialLoginProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [showEmbed, setShowEmbed] = useState<{
    platform: 'tiktok' | 'facebook' | 'instagram' | null
    url: string
  } | null>(null)

  const handleSocialLogin = async (platform: 'tiktok' | 'facebook' | 'instagram') => {
    setLoading(platform)
    try {
      let url = ''
      const state = Math.random().toString(36).substring(7)
      const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/${platform}/callback`)

      switch (platform) {
        case 'tiktok':
          const tiktokClientId = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_ID
          url = `https://www.tiktok.com/auth/authorize?client_key=${tiktokClientId}&response_type=code&scope=user.info.basic,video.list&redirect_uri=${redirectUri}&state=${state}`
          break
        case 'facebook':
          const fbAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
          url = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${fbAppId}&redirect_uri=${redirectUri}&scope=pages_show_list,pages_read_engagement,pages_manage_posts&response_type=code&state=${state}`
          break
        case 'instagram':
          const igClientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID
          url = `https://api.instagram.com/oauth/authorize?client_id=${igClientId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code&state=${state}`
          break
      }

      setShowEmbed({ platform, url })

      // Listen for messages from the iframe
      window.addEventListener('message', (event) => {
        if (event.data.type === `${platform}-login`) {
          setShowEmbed(null)
          onLogin(platform, event.data)
        }
      })

    } catch (error) {
      toast.error(`${platform} login failed`)
      console.error(`${platform} login error:`, error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Your Social Media</CardTitle>
        <CardDescription>
          Connect your social media accounts to view analytics and manage your content.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {showEmbed ? (
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 z-10"
              onClick={() => setShowEmbed(null)}
            >
              <Icons.close className="h-4 w-4" />
            </Button>
            <SocialEmbed
              platform={showEmbed.platform}
              url={showEmbed.url}
              width={400}
              height={600}
            />
          </div>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => handleSocialLogin('tiktok')}
              disabled={loading === 'tiktok'}
              className="w-full"
            >
              {loading === 'tiktok' ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.tiktok className="mr-2 h-4 w-4" />
              )}
              Connect TikTok
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleSocialLogin('facebook')}
              disabled={loading === 'facebook'}
              className="w-full"
            >
              {loading === 'facebook' ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.facebook className="mr-2 h-4 w-4" />
              )}
              Connect Facebook
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleSocialLogin('instagram')}
              disabled={loading === 'instagram'}
              className="w-full"
            >
              {loading === 'instagram' ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.instagram className="mr-2 h-4 w-4" />
              )}
              Connect Instagram
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
} 