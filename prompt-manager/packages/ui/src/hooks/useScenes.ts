import { useState, useEffect, useCallback } from 'react'
import type { Scene, CreateSceneInput, UpdateSceneInput } from '@prompt-mgr/core'
import { useAppStore } from '../stores/app-store'
import { toast } from './useToast'

export function useScenes() {
  const sceneRepo = useAppStore((s) => s.sceneRepo)
  const refreshKey = useAppStore((s) => s.refreshKey)
  const refresh = useAppStore((s) => s.refresh)
  const [scenes, setScenes] = useState<Scene[]>([])
  const [loading, setLoading] = useState(true)

  const fetchScenes = useCallback(async () => {
    if (!sceneRepo) return
    setLoading(true)
    try {
      const data = await sceneRepo.findAll()
      setScenes(data)
    } catch (err) {
      console.error('[useScenes] fetch error:', err)
      toast.error('加载场景失败')
    } finally {
      setLoading(false)
    }
  }, [sceneRepo])

  useEffect(() => { fetchScenes() }, [fetchScenes, refreshKey])

  const createScene = useCallback(async (input: CreateSceneInput) => {
    if (!sceneRepo) return
    try {
      const scene = await sceneRepo.create(input)
      refresh()
      toast.success('场景已创建')
      return scene
    } catch (err) {
      console.error('[useScenes] create error:', err)
      toast.error('创建场景失败')
    }
  }, [sceneRepo, refresh])

  const updateScene = useCallback(async (id: string, input: UpdateSceneInput) => {
    if (!sceneRepo) return
    try {
      const scene = await sceneRepo.update(id, input)
      refresh()
      return scene
    } catch (err) {
      console.error('[useScenes] update error:', err)
      toast.error('更新场景失败')
    }
  }, [sceneRepo, refresh])

  const deleteScene = useCallback(async (id: string) => {
    if (!sceneRepo) return
    try {
      await sceneRepo.delete(id)
      refresh()
      toast.success('场景已删除')
    } catch (err) {
      console.error('[useScenes] delete error:', err)
      toast.error('删除场景失败')
    }
  }, [sceneRepo, refresh])

  return { scenes, loading, createScene, updateScene, deleteScene }
}
