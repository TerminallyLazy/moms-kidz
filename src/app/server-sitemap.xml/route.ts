import { getServerSideSitemap } from 'next-sitemap'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Get public activities
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('id, updated_at')
      .eq('public', true)
      .order('updated_at', { ascending: false })

    if (activitiesError) throw activitiesError

    // Get public profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('username, updated_at')
      .eq('public', true)
      .order('updated_at', { ascending: false })

    if (profilesError) throw profilesError

    // Get public tapestry entries
    const { data: tapestries, error: tapestriesError } = await supabase
      .from('tapestries')
      .select('id, updated_at')
      .eq('public', true)
      .order('updated_at', { ascending: false })

    if (tapestriesError) throw tapestriesError

    // Combine all dynamic URLs
    const fields = [
      // Activity pages
      ...activities.map((activity) => ({
        loc: `${baseUrl}/activities/${activity.id}`,
        lastmod: new Date(activity.updated_at).toISOString(),
        changefreq: 'daily' as const,
        priority: 0.7,
      })),

      // Profile pages
      ...profiles.map((profile) => ({
        loc: `${baseUrl}/profile/${profile.username}`,
        lastmod: new Date(profile.updated_at).toISOString(),
        changefreq: 'weekly' as const,
        priority: 0.6,
      })),

      // Tapestry pages
      ...tapestries.map((tapestry) => ({
        loc: `${baseUrl}/tapestry/${tapestry.id}`,
        lastmod: new Date(tapestry.updated_at).toISOString(),
        changefreq: 'daily' as const,
        priority: 0.8,
      })),
    ]

    // Return the sitemap
    return getServerSideSitemap(fields)
  } catch (error) {
    logger.error('Error generating server sitemap', error as Error)
    
    // Return empty sitemap in case of error
    return getServerSideSitemap([])
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour