"use client"

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useDb } from '@/lib/db/client'

interface SearchableItem {
  id: string
  type: 'activity' | 'achievement' | 'article' | 'challenge'
  title: string
  description?: string
  url?: string
  category?: string
  tags?: string[]
}

interface UseSearchOptions {
  initialItems?: SearchableItem[]
  onSearch?: (query: string) => void
  debounceMs?: number
}

export function useSearch({ initialItems = [], onSearch, debounceMs = 300 }: UseSearchOptions = {}) {
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<SearchableItem[]>(initialItems)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const db = useDb()

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeout: NodeJS.Timeout
      return (searchQuery: string) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          performSearch(searchQuery)
        }, debounceMs)
      }
    })(),
    [debounceMs]
  )

  // Perform the actual search
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setItems(initialItems)
      return
    }

    setIsLoading(true)
    try {
      // Custom search handler if provided
      if (onSearch) {
        onSearch(searchQuery)
      }

      // Search in activities
      const { data: activities } = await db
        .from('activities')
        .select('*')
        .ilike('title', `%${searchQuery}%`)

      // Convert activities to searchable items
      const activityItems: SearchableItem[] = activities.map((activity: { id: any; title: any; type: any; description: any; metadata: { tags: any } }) => ({
        id: activity.id,
        type: 'activity',
        title: activity.title || `${activity.type} Activity`,
        description: activity.description,
        category: activity.type,
        tags: activity.metadata?.tags,
      }))

      // Combine all searchable items
      setItems([...activityItems])
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter items based on query
  const filteredItems = useMemo(() => {
    if (!query) return items

    const searchTerms = query.toLowerCase().split(' ')
    return items.filter(item => {
      const searchableText = [
        item.title,
        item.description,
        item.category,
        ...(item.tags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchTerms.every(term => searchableText.includes(term))
    })
  }, [items, query])

  // Navigate to item
  const navigateToItem = useCallback((item: SearchableItem) => {
    switch (item.type) {
      case 'activity':
        router.push(`/activities/${item.id}`)
        break
      case 'achievement':
        router.push(`/achievements#${item.id}`)
        break
      case 'article':
        if (item.url) {
          window.open(item.url, '_blank')
        }
        break
      case 'challenge':
        router.push(`/challenges/${item.id}`)
        break
    }
  }, [router])

  return {
    query,
    setQuery: (newQuery: string) => {
      setQuery(newQuery)
      debouncedSearch(newQuery)
    },
    items: filteredItems,
    isLoading,
    navigateToItem,
    clearSearch: () => {
      setQuery('')
      setItems(initialItems)
    },
  }
}

export type { SearchableItem }