import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mom's Kidz",
    short_name: "Mom's Kidz",
    description: "Track, celebrate, and share your parenting journey",
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#9333ea', // Purple-600
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    orientation: 'portrait',
    categories: ['parenting', 'health', 'lifestyle'],
    shortcuts: [
      {
        name: 'Log Activity',
        short_name: 'Log',
        description: 'Log a new activity',
        url: '/activities/new',
        icons: [
          {
            src: '/icons/shortcuts/log.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
      {
        name: 'View Dashboard',
        short_name: 'Dashboard',
        description: 'Go to your dashboard',
        url: '/dashboard',
        icons: [
          {
            src: '/icons/shortcuts/dashboard.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
    ],
    screenshots: [
      {
        src: '/screenshots/dashboard.png',
        sizes: '1280x720',
        type: 'image/png',
      },
      {
        src: '/screenshots/activity.png',
        sizes: '1280x720',
        type: 'image/png',
      },
      {
        src: '/screenshots/achievements.png',
        sizes: '1280x720',
        type: 'image/png',
      },
    ],
    prefer_related_applications: false,
    related_applications: [
      {
        platform: 'play',
        url: 'https://play.google.com/store/apps/details?id=com.momskidz.app',
        id: 'com.momskidz.app',
      },
      {
        platform: 'itunes',
        url: 'https://apps.apple.com/app/momskidz/id123456789',
      },
    ],
    protocol_handlers: [
      {
        protocol: 'web+momskidz',
        url: '/share?data=%s',
      },
    ],
    share_target: {
      action: '/share-target',
      method: 'post',
      enctype: 'multipart/form-data',
      params: [
        {
          name: 'text',
          value: 'text',
        },
      ],
    },
  }
}
