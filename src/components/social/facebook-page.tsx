'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    FB: any
  }
}

interface FacebookPageProps {
  pageUrl: string
  width?: number
  height?: number
  showFacepile?: boolean
  smallHeader?: boolean
  hideCover?: boolean
  showTimeline?: boolean
  adaptContainerWidth?: boolean
}

export function FacebookPage({
  pageUrl,
  width = 400,
  height = 800,
  showFacepile = true,
  smallHeader = true,
  hideCover = false,
  showTimeline = true,
  adaptContainerWidth = true
}: FacebookPageProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load Facebook SDK
    const loadFacebookSDK = () => {
      const script = document.createElement('script')
      script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0'
      script.async = true
      script.defer = true
      script.crossOrigin = 'anonymous'
      script.id = 'facebook-jssdk'
      script.nonce = 'random123'  // You should generate this dynamically
      
      const firstScript = document.getElementsByTagName('script')[0]
      firstScript?.parentNode?.insertBefore(script, firstScript)
    }

    if (!document.getElementById('facebook-jssdk')) {
      loadFacebookSDK()
    }
    // Initialize Facebook SDK
    (window as any).fbAsyncInit = function() {
      window.FB?.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
        xfbml: true,
        version: 'v18.0'
      })
    }

    // Clean up
    return () => {
      const script = document.getElementById('facebook-jssdk')
      script?.remove()
      // Need to cast window to any to avoid TypeScript error when deleting dynamic property
      delete (window as any).fbAsyncInit
    }
  }, [])

  return (
    <div ref={containerRef} style={{ width: `${width}px`, maxWidth: '100%' }}>
      <div
        className="fb-page"
        data-href={pageUrl}
        data-width={width}
        data-height={height}
        data-small-header={smallHeader}
        data-adapt-container-width={adaptContainerWidth}
        data-hide-cover={hideCover}
        data-show-facepile={showFacepile}
        data-tabs={showTimeline ? 'timeline' : ''}
      />
    </div>
  )
} 