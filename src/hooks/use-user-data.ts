import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface UserStats {
  activeDays: number
  totalActivities: number
  totalAchievements: number
}

interface Activity {
  id: string
  type: string
  date: string
  details: any
}

interface Achievement {
  id: string
  title: string
  description: string
  date: string
}

interface UserData {
  user: {
    id: string
    name: string | null
    email: string
    activities: Activity[]
    achievements: Achievement[]
  }
  stats: UserStats
}

export function useUserData() {
  const { data: session } = useSession()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!session?.user) {
          setLoading(false)
          return
        }

        const response = await fetch('/api/user')
        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }

        const data = await response.json()
        setUserData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [session])

  return { userData, loading, error }
}
