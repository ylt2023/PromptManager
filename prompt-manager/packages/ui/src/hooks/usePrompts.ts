import { useState, useEffect, useCallback } from 'react'
import type { Prompt, CreatePromptInput, UpdatePromptInput } from '@prompt-mgr/core'
import { useAppStore } from '../stores/app-store'
import { toast } from './useToast'

export function usePrompts(sceneId: string | null) {
  const promptRepo = useAppStore((s) => s.promptRepo)
  const refreshKey = useAppStore((s) => s.refreshKey)
  const refresh = useAppStore((s) => s.refresh)
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!promptRepo || !sceneId) {
      setPrompts([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    promptRepo.findBySceneId(sceneId)
      .then((data) => { if (!cancelled) setPrompts(data) })
      .catch((err) => {
        console.error('[usePrompts] fetch error:', err)
        if (!cancelled) toast.error('加载提示词失败')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [promptRepo, sceneId, refreshKey])

  const createPrompt = useCallback(async (input: CreatePromptInput) => {
    if (!promptRepo) return
    try {
      const prompt = await promptRepo.create(input)
      refresh()
      toast.success('提示词已创建')
      return prompt
    } catch (err) {
      console.error('[usePrompts] create error:', err)
      toast.error('创建提示词失败')
    }
  }, [promptRepo, refresh])

  const updatePrompt = useCallback(async (id: string, input: UpdatePromptInput) => {
    if (!promptRepo) return
    try {
      const prompt = await promptRepo.update(id, input)
      refresh()
      return prompt
    } catch (err) {
      console.error('[usePrompts] update error:', err)
      toast.error('更新提示词失败')
    }
  }, [promptRepo, refresh])

  const toggleFavorite = useCallback(async (id: string) => {
    if (!promptRepo) return
    try {
      await promptRepo.toggleFavorite(id)
      refresh()
    } catch (err) {
      console.error('[usePrompts] toggleFavorite error:', err)
      toast.error('操作失败')
    }
  }, [promptRepo, refresh])

  const togglePinned = useCallback(async (id: string) => {
    if (!promptRepo) return
    try {
      await promptRepo.togglePinned(id)
      refresh()
    } catch (err) {
      console.error('[usePrompts] togglePinned error:', err)
      toast.error('操作失败')
    }
  }, [promptRepo, refresh])

  const deletePrompt = useCallback(async (id: string) => {
    if (!promptRepo) return
    try {
      await promptRepo.delete(id)
      refresh()
      toast.success('提示词已删除')
    } catch (err) {
      console.error('[usePrompts] delete error:', err)
      toast.error('删除提示词失败')
    }
  }, [promptRepo, refresh])

  return { prompts, loading, createPrompt, updatePrompt, toggleFavorite, togglePinned, deletePrompt }
}
