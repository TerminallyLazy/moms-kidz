"use client"

import { useState } from "react"
import { AnimatedCard } from "@/components/ui/animated-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ExternalLink, Video, Newspaper } from "lucide-react"
import { CardSkeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { motion } from "framer-motion"

interface Article {
  id: string
  title: string
  description: string
  imageUrl: string
  category: string
  type: 'article' | 'video'
  url: string
}

interface NewsGridProps {
  articles: Article[]
  onSearch: (query: string) => void
  isLoading?: boolean
}

export function NewsGrid({ articles, onSearch, isLoading = false }: NewsGridProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  if (isLoading) {
    return (
      <AnimatedCard className="overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Latest Health & Parenting News
          </h2>
          
          {/* Search Bar Skeleton */}
          <div className="flex gap-2 mb-6">
            <div className="flex-1">
              <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse" />
            </div>
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse" />
          </div>

          {/* Articles Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        </div>
      </AnimatedCard>
    )
  }

  return (
    <AnimatedCard className="overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
          Latest Health & Parenting News
        </h2>
        
        {/* Search Bar */}
        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="dark:bg-gray-800 dark:border-gray-700"
          />
          <Button
            onClick={() => onSearch(searchQuery)}
            variant="default"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700
                     dark:from-purple-500 dark:to-pink-500 dark:hover:from-purple-600 dark:hover:to-pink-600"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Articles Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
              className="group"
            >
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <AnimatedCard className="h-full overflow-hidden">
                  <div className="relative">
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {article.type === 'video' ? (
                          <Video className="w-3 h-3 mr-1" />
                        ) : (
                          <Newspaper className="w-3 h-3 mr-1" />
                        )}
                        {article.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      {article.description}
                    </p>
                    <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium">
                      Read more
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                </AnimatedCard>
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </AnimatedCard>
  )
}
