import { useState, useEffect, useCallback } from 'react'
import type { SearchResult } from '@prompt-mgr/core'
import { useAppStore } from '../stores/app-store'

export function useSearch(query: string) {
  const searchRepo = useAppStore((s) => s.searchRepo)
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (!searchRepo || !query || query.length < 1) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const data = await searchRepo.search(query)
        setResults(data)
      } finally {
        setSearching(false)
      }
    }, 200) // debounce

    return () => clearTimeout(timer)
  }, [searchRepo, query])

  return { results, searching }
}
