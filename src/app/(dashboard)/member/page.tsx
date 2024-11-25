"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, LogOut } from "lucide-react"
import { NewsGrid } from "@/components/dashboard/news-grid"
import { SocialFeed } from "@/components/dashboard/social-feed"
import { Stats } from "@/components/dashboard/stats"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useDb } from "@/lib/db/client"

function MemberDashboard() {
  const { user, profile, signOut } = useAuth()
  const [articles, setArticles] = useState([
    {
      id: '1',
      title: "Understanding Child Development Milestones",
      description: "A comprehensive guide to tracking your child's developmental progress through key milestones.",
      imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=300&auto=format&fit=crop",
      category: "Pediatric",
      type: 'article',
      url: "https://openmd.com/directory/pediatric/child-development",
    },
    {
      id: '2',
      title: "Women's Health: Essential Wellness Tips",
      description: "Expert advice on maintaining optimal health and wellness for women at every life stage.",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&auto=format&fit=crop",
      category: "Women's Health",
      type: 'article',
      url: "https://openmd.com/directory/women-health/wellness",
    },
    {
      id: '3',
      title: "Introduction to Parenting",
      description: "Learn the basics of parenting in this comprehensive video guide.",
      imageUrl: "https://images.unsplash.com/photo-1531722569936-825d3dd91b15?w=400&h=300&auto=format&fit=crop",
      category: "Tutorial",
      type: 'video',
      url: "https://example.com/parenting-basics",
    },
    {
      id: '4',
      title: "Advanced Parenting Techniques",
      description: "Master advanced parenting techniques with our expert instructors.",
      imageUrl: "https://images.unsplash.com/photo-1584545284372-f22510eb7c26?w=400&h=300&auto=format&fit=crop",
      category: "Tutorial",
      type: 'video',
      url: "https://example.com/advanced-parenting",
    }
  ])

  const handleSearch = (query: string) => {
    // Implement search functionality
    console.log('Searching for:', query)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container py-8 px-4 md:px-6">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl text-gray-900 dark:text-white">
              Welcome back, <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 text-transparent bg-clip-text">{profile?.username || 'Mom'}</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Your journey continues...
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={signOut}
              className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-8">
          <Stats />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* News Section */}
          <div className="col-span-1">
            <NewsGrid articles={articles} onSearch={handleSearch} />
          </div>

          {/* Social Feed Section */}
          <div className="col-span-1">
            <SocialFeed
              facebookPageId="YourFacebookPageId"
              instagramUsername="YourInstagramUsername"
              pinterestUsername="YourPinterestUsername"
              tiktokUsername="YourTikTokUsername"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MemberPage() {
  return (
    <ProtectedRoute>
      <MemberDashboard />
    </ProtectedRoute>
  )
}
