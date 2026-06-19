import { useScenes } from '../../hooks/useScenes'
import { useState } from 'react'
import { useAppStore } from '../../stores/app-store'
import { SceneItem } from '../scene/SceneItem'
import {
  LayoutDashboard, FolderOpen, Star, Pin,
  Download, Tag, Settings, Cloud,
  ChevronDown, ChevronRight,
} from 'lucide-react'

export function SidebarPanel() {
  const { scenes, loading } = useScenes()
  const selectedSceneId = useAppStore((s) => s.selectedSceneId)
  const sidebarView = useAppStore((s) => s.sidebarView)
  const setSelectedScene = useAppStore((s) => s.setSelectedScene)
  const setSidebarView = useAppStore((s) => s.setSidebarView)
  const [sceneGroupOpen, setSceneGroupOpen] = useState(true)

  const rootScenes = scenes.filter((s) => !s.parentId)
  const childMap = new Map<string, typeof scenes>()
  for (const scene of scenes) {
    if (scene.parentId) {
      const children = childMap.get(scene.parentId) || []
      children.push(scene)
      childMap.set(scene.parentId, children)
    }
  }

  return (
    <div className="flex h-full flex-col" style={{ padding: '16px', gap: '12px' }}>
      {/* Brand */}
      <div style={{ padding: '12px 8px', marginBottom: '8px' }}>
        <div className="flex items-center" style={{ gap: '12px' }}>
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(135deg, var(--systemBlue), var(--tertiary, #8a2bb9))' }}
          >
            <Cloud size={16} strokeWidth={2} color="white" />
          </div>
          <div className="min-w-0">
            <div
              className="font-bold leading-tight"
              style={{ fontSize: 'var(--text-headline)', color: 'var(--text-primary)' }}
            >
              PromptManager
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto flex flex-col scrollbar-hide" style={{ gap: '4px' }}>
        <button type="button"
          onClick={() => setSidebarView('dashboard')}
          className={`nav-item ${sidebarView === 'dashboard' && !selectedSceneId ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span className="flex-1">Dashboard</span>
        </button>
        <button type="button"
          onClick={() => setSidebarView('all-scenes')}
          className={`nav-item ${sidebarView === 'all-scenes' ? 'active' : ''}`}
        >
          <FolderOpen size={18} />
          <span className="flex-1">全部场景</span>
          <span
            className="tabular-nums rounded-full"
            style={{
              padding: '2px 6px',
              fontSize: 'var(--text-caption-2)',
              color: 'var(--text-tertiary)',
              background: 'var(--bg-hover)',
            }}
          >
            {scenes.length}
          </span>
        </button>
        <button type="button"
          onClick={() => setSidebarView('favorites')}
          className={`nav-item ${sidebarView === 'favorites' ? 'active' : ''}`}
        >
          <Star size={18} />
          <span className="flex-1">我的收藏</span>
        </button>
        <button type="button"
          onClick={() => setSidebarView('pinned')}
          className={`nav-item ${sidebarView === 'pinned' ? 'active' : ''}`}
        >
          <Pin size={18} />
          <span className="flex-1">已置顶</span>
        </button>

        {/* Scene list */}
        {rootScenes.length > 0 && (
          <>
            <button type="button"
              onClick={() => setSceneGroupOpen(!sceneGroupOpen)}
              className="flex items-center w-full"
              style={{
                gap: '8px',
                padding: '0 8px',
                marginTop: '16px',
                marginBottom: '4px',
                fontSize: 'var(--text-caption-2)',
                color: 'var(--text-tertiary)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              {sceneGroupOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              <span>我的场景</span>
            </button>
            {sceneGroupOpen && (
              <div className="flex flex-col" style={{ gap: '4px' }}>
                {rootScenes.map((scene) => (
                  <SceneItem
                    key={scene.id}
                    scene={scene}
                    children={childMap.get(scene.id) || []}
                    selected={selectedSceneId === scene.id}
                    onSelect={() => setSelectedScene(scene.id)}
                    depth={0}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* System settings */}
        <div
          className="mt-auto flex flex-col"
          style={{ paddingTop: '16px', borderTop: '1px solid var(--border-default)', gap: '4px' }}
        >
          <button type="button"
            onClick={() => setSidebarView('import-export')}
            className={`nav-item ${sidebarView === 'import-export' ? 'active' : ''}`}
          >
            <Download size={18} />
            <span className="flex-1">导入导出</span>
          </button>
          <button type="button"
            onClick={() => setSidebarView('tags')}
            className={`nav-item ${sidebarView === 'tags' ? 'active' : ''}`}
          >
            <Tag size={18} />
            <span className="flex-1">标签管理</span>
          </button>
          <button type="button"
            onClick={() => setSidebarView('preferences')}
            className={`nav-item ${sidebarView === 'preferences' ? 'active' : ''}`}
          >
            <Settings size={18} />
            <span className="flex-1">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
