import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Video } from "lucide-react"

interface Article {
  id: string
  title: string
  description: string
  category: string
  imageUrl?: string
  type: 'article' | 'video'
  url: string
}

interface NewsGridProps {
  articles: Article[]
  onSearch: (query: string) => void
}

export function NewsGrid({ articles, onSearch }: NewsGridProps) {
  const videos = articles.filter(article => article.type === 'video')
  const textArticles = articles.filter(article => article.type === 'article')

  return (
    <Card className="w-full bg-white dark:bg-gray-900 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tighter text-gray-900 dark:text-white">Latest Updates</CardTitle>
        <CardDescription className="text-gray-500 dark:text-gray-400">Stay informed with the latest articles and videos</CardDescription>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="search"
            placeholder="Search articles..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-4 pr-32 py-2 text-base dark:bg-gray-900 dark:border-gray-800"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="articles" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800">
            <TabsTrigger 
              value="articles"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Articles
            </TabsTrigger>
            <TabsTrigger 
              value="videos"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
            >
              <Video className="h-4 w-4 mr-2" />
              Videos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="articles">
            <div className="grid gap-4 md:grid-cols-2">
              {textArticles.map((article) => (
                <Card key={article.id} className="flex flex-col bg-white dark:bg-gray-900 dark:border-gray-800 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    {article.imageUrl && (
                      <div className="relative w-full h-48 mb-4">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="object-cover w-full h-full rounded-md"
                        />
                      </div>
                    )}
                    <CardTitle className="text-lg text-gray-900 dark:text-white">{article.title}</CardTitle>
                    <CardDescription className="text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 text-transparent bg-clip-text">
                      {article.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{article.description}</p>
                  </CardContent>
                  <div className="p-4 mt-auto">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-purple-600 hover:text-pink-600 dark:text-purple-400 dark:hover:text-pink-400 hover:underline"
                    >
                      Read more
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="videos">
            <div className="grid gap-4 md:grid-cols-2">
              {videos.map((video) => (
                <Card key={video.id} className="flex flex-col bg-white dark:bg-gray-900 dark:border-gray-800 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    {video.imageUrl && (
                      <div className="relative w-full h-48 mb-4 group">
                        <img
                          src={video.imageUrl}
                          alt={video.title}
                          className="object-cover w-full h-full rounded-md"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Video className="h-12 w-12 text-white" />
                        </div>
                      </div>
                    )}
                    <CardTitle className="text-lg text-gray-900 dark:text-white">{video.title}</CardTitle>
                    <CardDescription className="text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 text-transparent bg-clip-text">
                      {video.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{video.description}</p>
                  </CardContent>
                  <div className="p-4 mt-auto">
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-purple-600 hover:text-pink-600 dark:text-purple-400 dark:hover:text-pink-400 hover:underline"
                    >
                      Watch video
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
