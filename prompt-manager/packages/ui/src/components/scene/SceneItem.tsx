import { useState } from 'react'
import type { Scene } from '@prompt-mgr/core'
import { useScenes } from '../../hooks/useScenes'
import { useAppStore } from '../../stores/app-store'
import { ChevronRight, ChevronDown, MoreHorizontal, Trash2 } from 'lucide-react'

interface SceneItemProps {
  scene: Scene
  children: Scene[]
  selected: boolean
  onSelect: () => void
  depth: number
}

export function SceneItem({ scene, children, selected, onSelect, depth }: SceneItemProps) {
  const [expanded, setExpanded] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const { deleteScene } = useScenes()
  const hasChildren = children.length > 0

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`确定要删除场景「${scene.name}」及其所有提示词吗？`)) {
      await deleteScene(scene.id)
    }
    setShowMenu(false)
  }

  return (
    <div>
      <div
        onClick={onSelect}
        className={`nav-item ${selected ? 'active' : ''}`}
        style={{ paddingLeft: `${depth * 20 + 16}px` }}
      >
        {hasChildren ? (
          <button type="button"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded transition-colors"
            style={{ color: 'var(--text-disabled)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
          >
            {expanded ? <ChevronDown size={12} strokeWidth={2} /> : <ChevronRight size={12} strokeWidth={2} />}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <span className="shrink-0 text-sm">{scene.icon || '📁'}</span>
        <span className="flex-1 truncate">{scene.name}</span>
        <div className="hidden group-hover:flex items-center relative">
          <button type="button"
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
            className="flex h-6 w-6 items-center justify-center rounded-md transition-colors"
            style={{ color: 'var(--text-disabled)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
          >
            <MoreHorizontal size={14} strokeWidth={1.5} />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div
                className="absolute right-0 top-full z-50 w-32 rounded-md"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  boxShadow: 'var(--shadow-lg)',
                  animation: 'scaleIn 120ms ease-out',
                  marginTop: '4px',
                  padding: '4px 0',
                }}
              >
                <button type="button"
                  onClick={handleDelete}
                  className="flex w-full items-center font-medium transition-colors"
                  style={{ gap: '8px', padding: '8px 16px', fontSize: 'var(--text-callout)', color: 'var(--danger)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--danger-bg)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                  删除
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {expanded && hasChildren && children.map((child) => (
        <SceneItemChild key={child.id} scene={child} depth={depth + 1} />
      ))}
    </div>
  )
}

function SceneItemChild({ scene, depth }: { scene: Scene; depth: number }) {
  const selectedSceneId = useAppStore((s) => s.selectedSceneId)
  const setSelectedScene = useAppStore((s) => s.setSelectedScene)
  return (
    <SceneItem
      scene={scene}
      children={[]}
      selected={selectedSceneId === scene.id}
      onSelect={() => setSelectedScene(scene.id)}
      depth={depth}
    />
  )
}
