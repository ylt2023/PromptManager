import { create } from 'zustand'
import type { IStorageAdapter, SceneRepository, PromptRepository, VersionRepository, SearchRepository } from '@prompt-mgr/core'
import { SceneRepository as SceneRepo, PromptRepository as PromptRepo, VersionRepository as VersionRepo, SearchRepository as SearchRepo } from '@prompt-mgr/core'

interface AppState {
  // Storage adapter & repositories
  adapter: IStorageAdapter | null
  sceneRepo: SceneRepository | null
  promptRepo: PromptRepository | null
  versionRepo: VersionRepository | null
  searchRepo: SearchRepository | null
  setAdapter: (adapter: IStorageAdapter) => void

  // Selection state
  selectedSceneId: string | null
  selectedPromptId: string | null
  sidebarView: 'dashboard' | 'all-scenes' | 'favorites' | 'pinned' | 'import-export' | 'tags' | 'preferences' | 'privacy-policy' | 'terms-of-service'
  setSelectedScene: (id: string | null) => void
  setSelectedPrompt: (id: string | null) => void
  setSidebarView: (view: 'dashboard' | 'all-scenes' | 'favorites' | 'pinned' | 'import-export' | 'tags' | 'preferences' | 'privacy-policy' | 'terms-of-service') => void

  // Search
  searchQuery: string
  setSearchQuery: (q: string) => void

  // UI state
  sidebarCollapsed: boolean
  detailPanelOpen: boolean
  viewMode: 'grid' | 'list'
  compactLayout: boolean
  setCompactLayout: (v: boolean) => void
  toggleSidebar: () => void
  setViewMode: (mode: 'grid' | 'list') => void
  setDetailPanelOpen: (open: boolean) => void

  // Theme
  theme: 'dark' | 'light'
  setTheme: (theme: 'dark' | 'light') => void

  // Data refresh trigger (increment to force re-fetch)
  refreshKey: number
  refresh: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  adapter: null,
  sceneRepo: null,
  promptRepo: null,
  versionRepo: null,
  searchRepo: null,

  setAdapter: (adapter) => set({
    adapter,
    sceneRepo: new SceneRepo(adapter),
    promptRepo: new PromptRepo(adapter),
    versionRepo: new VersionRepo(adapter),
    searchRepo: new SearchRepo(adapter),
  }),

  selectedSceneId: null,
  selectedPromptId: null,
  sidebarView: 'dashboard',
  setSelectedScene: (id) => set({ selectedSceneId: id, selectedPromptId: null, sidebarView: id ? 'dashboard' : 'dashboard' }),
  setSelectedPrompt: (id) => set({ selectedPromptId: id, detailPanelOpen: id !== null }),
  setSidebarView: (view) => set({ sidebarView: view, selectedSceneId: null, selectedPromptId: null, detailPanelOpen: false }),

  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  sidebarCollapsed: false,
  detailPanelOpen: false,
  viewMode: 'grid',
  compactLayout: (() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('pm-compact-layout') === 'true'
  })(),
  setCompactLayout: (v) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pm-compact-layout', String(v))
    }
    set({ compactLayout: v })
  },
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setViewMode: (mode) => set({ viewMode: mode }),
  setDetailPanelOpen: (open) => set({ detailPanelOpen: open }),

  theme: (() => {
    if (typeof window === 'undefined') return 'light'
    // 清除旧缓存的深色主题偏好，确保默认浅色商务模式
    const stored = localStorage.getItem('pm-theme')
    if (stored === 'dark') {
      localStorage.removeItem('pm-theme')
      return 'light'
    }
    return (stored as 'dark' | 'light') || 'light'
  })(),
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('pm-theme', theme)
    }
    set({ theme })
  },

  refreshKey: 0,
  refresh: () => set((s) => ({ refreshKey: s.refreshKey + 1 })),
}))
