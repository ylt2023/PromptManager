import { useState, useEffect } from 'react'
import { useAppStore } from '../stores/app-store'

interface DashboardStats {
  totalScenes: number
  totalPrompts: number
  favoritePrompts: number
  pinnedPrompts: number
  loading: boolean
}

export function useDashboardStats(): DashboardStats {
  const promptRepo = useAppStore((s) => s.promptRepo)
  const refreshKey = useAppStore((s) => s.refreshKey)
  const [stats, setStats] = useState<DashboardStats>({
    totalScenes: 0,
    totalPrompts: 0,
    favoritePrompts: 0,
    pinnedPrompts: 0,
    loading: true,
  })

  useEffect(() => {
    if (!promptRepo) {
      setStats((s) => ({ ...s, loading: false }))
      return
    }

    let cancelled = false
    const fetchStats = async () => {
      try {
        const [totalPrompts, favoritePrompts, pinnedPrompts] = await Promise.all([
          promptRepo.count(),
          promptRepo.countFavorites(),
          promptRepo.countPinned(),
        ])
        if (!cancelled) {
          setStats({
            totalScenes: 0, // will be set from useScenes
            totalPrompts,
            favoritePrompts,
            pinnedPrompts,
            loading: false,
          })
        }
      } catch {
        if (!cancelled) setStats((s) => ({ ...s, loading: false }))
      }
    }
    fetchStats()
    return () => { cancelled = true }
  }, [promptRepo, refreshKey])

  return stats
}
