import { useState, useEffect, useCallback } from 'react'
import type { Version, CreateVersionInput } from '@prompt-mgr/core'
import { useAppStore } from '../stores/app-store'
import { toast } from './useToast'

export function useVersions(promptId: string | null) {
  const versionRepo = useAppStore((s) => s.versionRepo)
  const refreshKey = useAppStore((s) => s.refreshKey)
  const refresh = useAppStore((s) => s.refresh)
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!versionRepo || !promptId) {
      setVersions([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    versionRepo.findByPromptId(promptId)
      .then((data) => { if (!cancelled) setVersions(data) })
      .catch((err) => {
        console.error('[useVersions] fetch error:', err)
        if (!cancelled) toast.error('加载版本历史失败')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [versionRepo, promptId, refreshKey])

  const createVersion = useCallback(async (input: CreateVersionInput) => {
    if (!versionRepo) return
    try {
      const version = await versionRepo.create(input)
      refresh()
      toast.success('新版本已创建')
      return version
    } catch (err) {
      console.error('[useVersions] create error:', err)
      toast.error('创建版本失败')
    }
  }, [versionRepo, refresh])

  const restoreVersion = useCallback(async (promptId: string, versionNumber: number) => {
    if (!versionRepo) return
    try {
      await versionRepo.restore(promptId, versionNumber)
      refresh()
      toast.success(`已恢复到 v${versionNumber}`)
    } catch (err) {
      console.error('[useVersions] restore error:', err)
      toast.error('恢复版本失败')
    }
  }, [versionRepo, refresh])

  return { versions, loading, createVersion, restoreVersion }
}
