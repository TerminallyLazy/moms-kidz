"use client"

import { useEffect } from 'react'

type InteractionEvent = {
  type: string
  target: string
  metadata?: Record<string, any>
  timestamp: number
}

export function useInteractionTracker() {
  useEffect(() => {
    const trackInteraction = (event: InteractionEvent) => {
      // In a real app, this would send data to your analytics service
      console.log('Interaction tracked:', event)
    }

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const interactiveElements = target.closest('[data-track]')
      
      if (interactiveElements) {
        const trackData = interactiveElements.getAttribute('data-track')
        const metadata = interactiveElements.getAttribute('data-track-metadata')
        
        trackInteraction({
          type: 'click',
          target: trackData || 'unknown',
          metadata: metadata ? JSON.parse(metadata) : undefined,
          timestamp: Date.now()
        })
      }
    }

    const handleScroll = () => {
      // Track meaningful scroll events
      const scrollDepth = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)
      
      if (scrollDepth % 25 === 0) { // Track at 25%, 50%, 75%, 100%
        trackInteraction({
          type: 'scroll_milestone',
          target: 'page',
          metadata: { depth: scrollDepth },
          timestamp: Date.now()
        })
      }
    }

    const handleVisibilityChange = () => {
      trackInteraction({
        type: 'visibility_change',
        target: 'page',
        metadata: { visible: !document.hidden },
        timestamp: Date.now()
      })
    }

    // Track time spent on sections
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target
          const section = target.getAttribute('data-section')
          
          trackInteraction({
            type: 'section_view',
            target: section || 'unknown',
            metadata: { visible: true },
            timestamp: Date.now()
          })
        }
      })
    }, {
      threshold: 0.5 // Track when section is 50% visible
    })

    // Observe all sections
    document.querySelectorAll('[data-section]').forEach((section) => {
      observer.observe(section)
    })

    // Add event listeners
    document.addEventListener('click', handleClick)
    document.addEventListener('scroll', handleScroll)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('scroll', handleScroll)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      observer.disconnect()
    }
  }, [])
}

export function InteractionProvider({ children }: { children: React.ReactNode }) {
  useInteractionTracker()
  return <>{children}</>
}
