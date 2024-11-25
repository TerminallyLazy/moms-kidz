import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { StorageUtils } from '@/lib/storage-utils'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    // Get the current user
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse the form data
    const formData = await request.formData()
    const title = formData.get('title') as string
    const text = formData.get('text') as string
    const url = formData.get('url') as string
    const photos = formData.getAll('photos') as File[]

    // Upload any photos
    const uploadedPhotos = []
    for (const photo of photos) {
      if (photo.type.startsWith('image/')) {
        const { url: photoUrl } = await StorageUtils.uploadFile(photo, {
          bucket: 'shared-photos',
          path: `${session.user.id}/${Date.now()}`,
        })
        uploadedPhotos.push(photoUrl)
      }
    }

    // Create activity from shared content
    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .insert({
        user_id: session.user.id,
        type: 'shared',
        title: title || 'Shared Content',
        description: text,
        details: {
          shared_url: url,
          photos: uploadedPhotos,
        },
        date: new Date().toISOString(),
      })
      .select()
      .single()

    if (activityError) {
      throw activityError
    }

    // Create notification for shared content
    await supabase
      .from('notifications')
      .insert({
        user_id: session.user.id,
        type: 'share',
        title: 'Content Shared',
        description: `Successfully shared ${title || 'content'}`,
        data: {
          activity_id: activity.id,
        },
      })

    // Log the share event
    logger.info('Content shared successfully', {
      userId: session.user.id,
      activityId: activity.id,
      hasPhotos: photos.length > 0,
    })

    // Redirect to the new activity
    return NextResponse.redirect(
      new URL(`/activities/${activity.id}`, request.url),
      {
        status: 303, // See Other
      }
    )
  } catch (error) {
    logger.error('Error handling shared content', error as Error)
    
    // Redirect to error page
    return NextResponse.redirect(
      new URL('/error?type=share', request.url),
      {
        status: 303,
      }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
}