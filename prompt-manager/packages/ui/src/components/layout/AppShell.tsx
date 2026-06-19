import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '../../stores/app-store'
import { useScenes } from '../../hooks/useScenes'
import { SidebarPanel } from './SidebarPanel'
import { ContentPanel } from './ContentPanel'
import { DetailPanel } from './DetailPanel'
import { ThemeToggle } from '../common/ThemeToggle'
import { SearchBar } from '../search/SearchBar'
import { CommandPalette } from '../search/CommandPalette'
import { ExportImportBar } from '../sync/ExportImportBar'
import { ErrorBoundary } from '../common/ErrorBoundary'
import { ToastContainer } from '../common/ToastContainer'
import { ChevronRight } from 'lucide-react'

export function AppShell() {
  const selectedSceneId = useAppStore((s) => s.selectedSceneId)
  const detailPanelOpen = useAppStore((s) => s.detailPanelOpen)
  const selectedPromptId = useAppStore((s) => s.selectedPromptId)
  const theme = useAppStore((s) => s.theme)
  const sidebarView = useAppStore((s) => s.sidebarView)
  const setSelectedScene = useAppStore((s) => s.setSelectedScene)
  const setSidebarView = useAppStore((s) => s.setSidebarView)
  const { scenes } = useScenes()
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  // Global keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ctrl+K / Cmd+K — Command Palette
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      setCommandPaletteOpen((prev) => !prev)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const pageTitle = selectedSceneId ? '场景详情' : '仪表盘总览'

  // Breadcrumb mapping
  const breadcrumbMap: Record<string, string> = {
    'dashboard': '仪表盘总览',
    'all-scenes': '全部场景',
    'favorites': '我的收藏',
    'pinned': '已置顶',
    'tags': '标签管理',
    'import-export': '导入导出',
    'preferences': '偏好设置',
  }
  const currentScene = selectedSceneId ? scenes.find((s) => s.id === selectedSceneId) : null
  const subPage = selectedSceneId
    ? currentScene?.name || '场景详情'
    : breadcrumbMap[sidebarView] || '仪表盘总览'
  const isSubPage = selectedSceneId || sidebarView !== 'dashboard'

  return (
    <>
    <div
      className="flex h-screen w-screen overflow-hidden min-w-[800px]"
      style={{ background: 'var(--bg-canvas)' }}
    >
      {/* Sidebar — thinMaterial glass with Mac shadow */}
      <aside
        className="shrink-0 flex flex-col overflow-hidden mac-shadow"
        style={{
          width: 'var(--sidebar-width)',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-default)',
        }}
      >
        <SidebarPanel />
      </aside>

      {/* Right content area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top bar — glass morphism */}
        <header
          className="shrink-0 flex items-center justify-between"
          style={{
            height: 'var(--topbar-height)',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-default)',
            paddingLeft: '24px',
            paddingRight: '24px',
          }}
        >
          {/* Left: 轻量面包屑，dashboard 下不显示重复标题 */}
          <div className="flex items-center" style={{ gap: '8px' }}>
            {isSubPage && (
              <div className="flex items-center" style={{ gap: '8px' }}>
                <button type="button"
                  onClick={() => { setSelectedScene(null); setSidebarView('dashboard') }}
                  className="btn-ghost"
                  style={{ fontSize: 'var(--text-footnote)', color: 'var(--text-tertiary)' }}
                >
                  仪表盘总览
                </button>
                <ChevronRight
                  size={12}
                  style={{ color: 'var(--text-disabled)' }}
                />
                <span
                  style={{ fontSize: 'var(--text-footnote)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}
                >
                  {subPage}
                </span>
              </div>
            )}
          </div>

          {/* Right: search + actions */}
          <div className="flex items-center" style={{ gap: '16px' }}>
            <SearchBar />
            <ExportImportBar />
            <div
              className="h-5 w-px"
              style={{ background: 'var(--border-default)' }}
            />
            <ThemeToggle />
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden" style={{ background: 'var(--bg-canvas)' }}>
          <main className="flex flex-1 min-w-0 overflow-hidden justify-center">
            <ErrorBoundary>
              <ContentPanel />
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </div>

    {/* Command Palette */}
    {commandPaletteOpen && (
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    )}

    {/* Detail Panel modal */}
    {detailPanelOpen && selectedPromptId && (
      <ErrorBoundary>
        <DetailPanel />
      </ErrorBoundary>
    )}

    {/* Toast Notifications */}
    <ToastContainer />
    </>
  )
}
