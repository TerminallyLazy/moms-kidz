import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Static routes
    const routes = [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || '',
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      },
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
    ]

    // Dynamic routes from database
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('id, updated_at')
      .order('updated_at', { ascending: false })

    if (activitiesError) {
      throw activitiesError
    }

    const activityRoutes = activities.map((activity) => ({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/activities/${activity.id}`,
      lastModified: new Date(activity.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    // Get user profiles for public pages
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('username, updated_at')
      .eq('public', true)
      .order('updated_at', { ascending: false })

    if (profilesError) {
      throw profilesError
    }

    const profileRoutes = profiles.map((profile) => ({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/profile/${profile.username}`,
      lastModified: new Date(profile.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // Get public tapestry entries
    const { data: tapestries, error: tapestriesError } = await supabase
      .from('tapestries')
      .select('id, updated_at')
      .eq('public', true)
      .order('updated_at', { ascending: false })

    if (tapestriesError) {
      throw tapestriesError
    }

    const tapestryRoutes = tapestries.map((tapestry) => ({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/tapestry/${tapestry.id}`,
      lastModified: new Date(tapestry.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    // Combine all routes
    return [
      ...routes,
      ...activityRoutes,
      ...profileRoutes,
      ...tapestryRoutes,
    ]
  } catch (error) {
    logger.error('Error generating sitemap', error as Error)
    
    // Return only static routes in case of error
    return [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || '',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ]
  }
}