import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { Footer } from "@/components/layout/footer"

export default function HomePage() {
  return (
    <><div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Icons.logo className="h-6 w-6" />
              <span className="font-bold">Mom's Kidz</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
            Track, celebrate, and share your{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              parenting journey
            </span>
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Join our community of parents. Record milestones, share experiences, and contribute to valuable research.
          </p>
          <div className="space-x-4">
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
                Get Started
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Features
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Everything you need to track your child's development and connect with other parents.
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          {features.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="relative overflow-hidden rounded-lg border bg-background p-2"
            >
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Icon className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">{title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Join Our Community
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Start tracking your child's journey today and connect with other parents.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
      <Footer />
    </>
  )
}

const features = [
  {
    title: "Activity Tracking",
    description: "Record daily activities, moods, and milestones with smart insights.",
    icon: Icons.calendar,
  },
  {
    title: "Digital Library",
    description: "Store and organize all your care logs and medical records.",
    icon: Icons.book,
  },
  {
    title: "Community",
    description: "Connect with other parents and share experiences.",
    icon: Icons.users,
  },
  {
    title: "Research",
    description: "Contribute to valuable pediatric research studies.",
    icon: Icons.research,
  },
  {
    title: "Achievements",
    description: "Earn points and unlock achievements as you track progress.",
    icon: Icons.award,
  },
  {
    title: "Insights",
    description: "Get personalized insights and recommendations.",
    icon: Icons.chart,
  },
]
