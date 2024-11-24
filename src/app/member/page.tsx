"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, LogOut } from "lucide-react"
import { NewsGrid } from "@/components/member/news-grid"
import { SocialFeed } from "@/components/member/social-feed"
import { useRouter } from "next/navigation"

export default function MemberPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()

  // Sample articles data
  const [articles] = useState([
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
      title: "Introduction to Windsurfing",
      description: "Learn the basics of windsurfing in this comprehensive video guide.",
      imageUrl: "https://images.unsplash.com/photo-1531722569936-825d3dd91b15?w=400&h=300&auto=format&fit=crop",
      category: "Tutorial",
      type: 'video',
      url: "https://example.com/windsurfing-basics",
    },
    {
      id: '4',
      title: "Advanced Windsurfing Techniques",
      description: "Master advanced windsurfing maneuvers with our expert instructors.",
      imageUrl: "https://images.unsplash.com/photo-1584545284372-f22510eb7c26?w=400&h=300&auto=format&fit=crop",
      category: "Tutorial",
      type: 'video',
      url: "https://example.com/advanced-windsurfing",
    }
  ])

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser(user)
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          setProfile(profile)
        } else {
          router.push('/login')
          return
        }
      } catch (error) {
        console.error('Error:', error)
        router.push('/login')
        return
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndProfile()
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleSearch = (query: string) => {
    window.open(`https://openmd.com/search?q=${encodeURIComponent(query)}`, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 dark:border-purple-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container py-8 px-4 md:px-6">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 bg-white dark:bg-gray-950">
          <div>
            <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl text-gray-900 dark:text-white">
              Welcome back, <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 text-transparent bg-clip-text">{profile?.username || 'User'}</span>
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
              onClick={handleLogout}
              className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
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
