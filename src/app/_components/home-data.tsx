import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function HomeData() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Fetch recent activities and achievements
  const { data: recentActivities } = await supabase
    .from('activities')
    .select('*')
    .order('date', { ascending: false })
    .limit(5)

  const { data: recentAchievements } = await supabase
    .from('achievements')
    .select('*')
    .order('date', { ascending: false })
    .limit(5)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Recent Activities</h2>
        <div className="space-y-2">
          {recentActivities?.map((activity) => (
            <div key={activity.id} className="p-4 rounded-lg border bg-card">
              <div className="flex justify-between items-center">
                <span className="font-medium capitalize">{activity.type}</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(activity.date).toLocaleDateString()}
                </span>
              </div>
              {activity.details && (
                <p className="text-sm text-muted-foreground mt-2">
                  {JSON.stringify(activity.details)}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Recent Achievements</h2>
        <div className="space-y-2">
          {recentAchievements?.map((achievement) => (
            <div key={achievement.id} className="p-4 rounded-lg border bg-card">
              <h3 className="font-medium">{achievement.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {achievement.description}
              </p>
              <span className="text-sm text-muted-foreground block mt-2">
                {new Date(achievement.date).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
