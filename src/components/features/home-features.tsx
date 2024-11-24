"use client"

import { AnimatedCard } from "@/components/ui/animated-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Calendar, Heart, LineChart, MessageCircle, Sparkles, Sun, Users } from "lucide-react"
import { Testimonials } from "./testimonials"

export function HomeFeatures() {
  const features = [
    {
      title: "Care Log",
      description: "Track daily activities, moods, and milestones with smart insights and weather integration.",
      icon: Calendar,
      metrics: "Join 50,000+ moms tracking 2M+ moments",
    },
    {
      title: "Milestones",
      description: "Celebrate achievements and track development with our research-backed milestone system.",
      icon: Sparkles,
      metrics: "250,000+ milestones celebrated",
    },
    {
      title: "My Library",
      description: "Your digital home for care logs, medical records, and parenting resources.",
      icon: BookOpen,
      metrics: "100,000+ documents organized",
    },
    {
      title: "Tapestry",
      description: "Share experiences, find support, and connect with moms on similar journeys.",
      icon: Users,
      metrics: "30,000+ active community members",
    },
  ]

  const communityStats = [
    {
      title: "Active Members",
      value: "50,000+",
      icon: Users,
    },
    {
      title: "Daily Check-ins",
      value: "10,000+",
      icon: Calendar,
    },
    {
      title: "Support Messages",
      value: "25,000+",
      icon: MessageCircle,
    },
    {
      title: "Success Stories",
      value: "5,000+",
      icon: Heart,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-24 md:py-32 lg:py-40 bg-white dark:bg-gray-950">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl md:text-7xl/none">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 text-transparent bg-clip-text">
                  Empowering
                </span>{" "}
                <span className="dark:text-white">Your Journey</span>
              </h1>
              <p className="max-w-[600px] text-gray-500 dark:text-gray-400 md:text-xl">
                Join our community of parents. Track milestones, share moments, and find support on your parenting
                journey.
              </p>
              <div className="w-full max-w-sm space-y-2">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-4 pr-32 py-6 text-base dark:bg-gray-900 dark:border-gray-800"
                  />
                  <Button
                    variant="gradient"
                    size="lg"
                    className="absolute right-1 top-1 bottom-1 dark:bg-gradient-to-r dark:from-purple-500 dark:to-pink-500 dark:text-white"
                  >
                    Get Started
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground dark:text-gray-400">
                  Join 50,000+ parents already using Moms Kidz
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-[#030712]">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-2 text-gray-900 dark:text-white">Features</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Everything you need to track, celebrate, and share your parenting journey.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <AnimatedCard key={feature.title} delay={index * 0.1}>
                  <div className="relative overflow-hidden rounded-lg border bg-white dark:bg-gray-900 dark:border-gray-800 p-2">
                    <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                      <feature.icon className="h-12 w-12 text-primary dark:text-purple-400" />
                      <div className="space-y-2">
                        <h3 className="font-bold dark:text-white">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground dark:text-gray-400">{feature.description}</p>
                        <p className="text-xs text-primary dark:text-purple-400">{feature.metrics}</p>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <Testimonials />

        {/* Community Stats Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-[#030712]">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-2 text-gray-900 dark:text-white">Our Growing Community</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Join thousands of parents supporting each other every day
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {communityStats.map((stat, index) => (
                <AnimatedCard key={stat.title} delay={index * 0.1}>
                  <div className="text-center p-6 bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-lg">
                    <stat.icon className="h-8 w-8 mx-auto mb-4 text-primary dark:text-purple-400" />
                    <h3 className="text-3xl font-bold mb-2 dark:text-white">{stat.value}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
