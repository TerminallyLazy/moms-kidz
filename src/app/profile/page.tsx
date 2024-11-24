"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { UserProfile } from "@/components/user-profile"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { 
  LogOut, 
  Settings, 
  Bell,
  Calendar,
  BookOpen,
  Award,
  Activity,
  Heart
} from "lucide-react"
import { motion } from "framer-motion"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

const activityData = [
  { date: '2024-01', activities: 20 },
  { date: '2024-02', activities: 35 },
  { date: '2024-03', activities: 28 },
  { date: '2024-04', activities: 45 },
]

const achievementData = [
  { name: 'Beginner', value: 3 },
  { name: 'Intermediate', value: 2 },
  { name: 'Advanced', value: 1 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28']

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
      }
    }
    
    checkUser()
  }, [router])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast.error("Error signing out")
        console.error("Error:", error)
      } else {
        router.push('/login')
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error("Error:", error)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Welcome, {user.email}</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                3
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickStatCard
            icon={<Calendar className="h-5 w-5" />}
            label="Active Days"
            value="28"
            trend="+5% from last month"
          />
          <QuickStatCard
            icon={<BookOpen className="h-5 w-5" />}
            label="Activities Logged"
            value="156"
            trend="+12% from last month"
          />
          <QuickStatCard
            icon={<Award className="h-5 w-5" />}
            label="Achievements"
            value="15"
            trend="3 new this month"
          />
          <QuickStatCard
            icon={<Activity className="h-5 w-5" />}
            label="Current Streak"
            value="7 days"
            trend="Personal best!"
          />
        </section>

        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorActivities" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0088FE" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="activities" 
                    stroke="#0088FE" 
                    fillOpacity={1} 
                    fill="url(#colorActivities)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Achievement Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={achievementData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {achievementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {achievementData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function QuickStatCard({ icon, label, value, trend }: {
  icon: React.ReactNode
  label: string
  value: string
  trend: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {label}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{trend}</p>
      </CardContent>
    </Card>
  )
}
