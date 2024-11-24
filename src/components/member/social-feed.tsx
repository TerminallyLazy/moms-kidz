"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Facebook, Instagram } from "lucide-react"

interface SocialFeedProps {
  facebookPageId: string
  instagramUsername: string
  pinterestUsername: string
  tiktokUsername: string
}

export function SocialFeed({
  facebookPageId,
  instagramUsername,
  pinterestUsername,
  tiktokUsername
}: SocialFeedProps) {
  return (
    <Card className="w-full bg-white dark:bg-gray-900 dark:border-gray-800">
      <CardContent className="p-4">
        <Tabs defaultValue="facebook" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800">
            <TabsTrigger 
              value="facebook"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
            >
              <Facebook className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
              <span className="hidden sm:inline">Facebook</span>
            </TabsTrigger>
            <TabsTrigger 
              value="instagram"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
            >
              <Instagram className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
              <span className="hidden sm:inline">Instagram</span>
            </TabsTrigger>
            <TabsTrigger 
              value="pinterest"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
            >
              <svg className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 19c-.721 0-1.418-.109-2.073-.312.286-.465.713-1.227.87-1.835l.437-1.664c.229.436.895.804 1.604.804 2.111 0 3.633-1.941 3.633-4.354 0-2.312-1.888-4.042-4.316-4.042-3.021 0-4.625 2.027-4.625 4.235 0 1.027.547 2.305 1.422 2.712.132.062.203.034.234-.094l.193-.793c.017-.071.009-.132-.049-.202-.288-.35-.521-.995-.521-1.597 0-1.544 1.169-3.038 3.161-3.038 1.72 0 2.924 1.172 2.924 2.848 0 1.894-.957 3.205-2.201 3.205-.687 0-1.201-.568-1.036-1.265.197-.833.58-1.73.58-2.331 0-.537-.288-.986-.89-.986-.705 0-1.269.73-1.269 1.708 0 .623.211 1.044.211 1.044s-.694 2.934-.821 3.479c-.142.605-.086 1.454-.025 2.008-2.603-1.02-4.448-3.553-4.448-6.518 0-3.866 3.135-7 7-7s7 3.134 7 7-3.135 7-7 7z"/>
              </svg>
              <span className="hidden sm:inline">Pinterest</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tiktok"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
            >
              <svg className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
              <span className="hidden sm:inline">TikTok</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            <TabsContent value="facebook" className="h-[500px] overflow-hidden bg-white dark:bg-gray-900">
              <div 
                className="fb-page" 
                data-href={`https://www.facebook.com/${facebookPageId}`}
                data-tabs="timeline"
                data-width="500"
                data-height="500"
                data-small-header="true"
                data-adapt-container-width="true"
                data-hide-cover="false"
                data-show-facepile="true"
              />
            </TabsContent>

            <TabsContent value="instagram" className="h-[500px] overflow-hidden bg-white dark:bg-gray-900">
              <iframe
                src={`https://www.instagram.com/${instagramUsername}/embed`}
                width="100%"
                height="500"
                frameBorder="0"
                scrolling="no"
                allowTransparency={true}
                className="bg-white dark:bg-gray-900"
              />
            </TabsContent>

            <TabsContent value="pinterest" className="h-[500px] overflow-hidden bg-white dark:bg-gray-900">
              <a
                data-pin-do="embedUser"
                data-pin-board-width="500"
                data-pin-scale-height="500"
                data-pin-scale-width="80"
                href={`https://www.pinterest.com/${pinterestUsername}/`}
                className="text-purple-600 hover:text-pink-600 dark:text-purple-400 dark:hover:text-pink-400"
              />
            </TabsContent>

            <TabsContent value="tiktok" className="h-[500px] overflow-hidden bg-white dark:bg-gray-900">
              <blockquote 
                className="tiktok-embed"
                cite={`https://www.tiktok.com/@${tiktokUsername}`}
                data-unique-id={tiktokUsername}
                data-embed-type="creator"
                style={{ maxWidth: "500px", minWidth: "288px" }}
              >
                <section>
                  <a 
                    target="_blank" 
                    href={`https://www.tiktok.com/@${tiktokUsername}`}
                    className="text-purple-600 hover:text-pink-600 dark:text-purple-400 dark:hover:text-pink-400"
                  >
                    @{tiktokUsername}
                  </a>
                </section>
              </blockquote>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
