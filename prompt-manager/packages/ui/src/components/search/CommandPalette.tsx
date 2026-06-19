import { useEffect, useState, useCallback } from 'react'
import { Command } from 'cmdk'
import { useAppStore } from '../../stores/app-store'
import { useScenes } from '../../hooks/useScenes'
import { useSearch } from '../../hooks/useSearch'
import {
  Search, LayoutDashboard, FolderOpen, Plus,
  FileText, Star, Pin, Download, Upload,
  Settings, Moon, Sun, ArrowRight,
} from 'lucide-react'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const setSelectedScene = useAppStore((s) => s.setSelectedScene)
  const setSelectedPrompt = useAppStore((s) => s.setSelectedPrompt)
  const setViewMode = useAppStore((s) => s.setViewMode)
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)
  const setSidebarView = useAppStore((s) => s.setSidebarView)
  const { scenes } = useScenes()
  const [query, setQuery] = useState('')
  const { results, searching } = useSearch(query)

  const handleSelect = useCallback((action: string) => {
    onClose()
    // Delay to allow dialog to close first
    setTimeout(() => {
      switch (action) {
        case 'dashboard':
          setSidebarView('dashboard')
          setSelectedScene(null)
          break
        case 'all-scenes':
          setSidebarView('all-scenes')
          break
        case 'favorites':
          setSidebarView('favorites')
          break
        case 'pinned':
          setSidebarView('pinned')
          break
        case 'new-scene':
          (document.querySelector('[data-create-scene]') as HTMLButtonElement)?.click()
          break
        case 'toggle-theme':
          setTheme(theme === 'dark' ? 'light' : 'dark')
          break
        case 'grid-view':
          setViewMode('grid')
          break
        case 'list-view':
          setViewMode('list')
          break
        case 'export':
          (document.querySelector('[data-export]') as HTMLButtonElement)?.click()
          break
        default:
          if (action.startsWith('scene:')) {
            setSelectedScene(action.slice(6))
          } else if (action.startsWith('prompt:')) {
            setSelectedPrompt(action.slice(7))
          }
      }
    }, 50)
  }, [onClose, setSelectedScene, setSelectedPrompt, setViewMode, theme, setTheme, setSidebarView])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      style={{ background: 'var(--bg-overlay)', animation: 'fadeIn 100ms ease-out' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-[520px] rounded-xl overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          boxShadow: 'var(--shadow-xl)',
          animation: 'scaleIn 150ms ease-out',
          border: '1px solid var(--border-default)',
        }}
      >
        <Command shouldFilter={false} loop>
          {/* Search input */}
          <div className="flex items-center" style={{ gap: '16px', padding: '0 16px', borderBottom: '1px solid var(--border-default)' }}>
            <Search size={16} style={{ color: 'var(--text-disabled)' }} strokeWidth={1.5} />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="搜索提示词、场景或执行操作..."
              className="flex-1 bg-transparent outline-none"
              style={{ padding: '16px 0', fontSize: 'var(--text-body)', color: 'var(--text-primary)' }}
              autoFocus
            />
            {searching && (
              <div className="h-3.5 w-3.5 rounded-full border-2 border-[var(--text-disabled)] border-t-transparent" style={{ animation: 'spin 0.8s linear infinite' }} />
            )}
            <kbd
              className="rounded font-mono"
              style={{
                padding: '4px 8px',
                fontSize: 'var(--text-micro)',
                color: 'var(--text-disabled)',
                background: 'var(--bg-hover)',
                border: '1px solid var(--border-default)',
              }}
            >
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-80 overflow-y-auto scrollbar-hide" style={{ padding: '8px' }}>
            <Command.Empty className="flex flex-col items-center" style={{ gap: '8px', padding: '40px 0' }}>
              <Search size={24} style={{ color: 'var(--text-disabled)' }} strokeWidth={1.5} />
              <span style={{ fontSize: 'var(--text-callout)', color: 'var(--text-tertiary)' }}>未找到匹配结果</span>
            </Command.Empty>

            {/* Navigation actions */}
            <Command.Group heading="导航" style={{ marginBottom: '4px' }}>
              <CommandGroupHeading />
              <CommandItem icon={<LayoutDashboard size={16} />} label="仪表盘总览" shortcut="" onSelect={() => handleSelect('dashboard')} />
              <CommandItem icon={<FolderOpen size={16} />} label="全部场景" shortcut="" onSelect={() => handleSelect('all-scenes')} />
              <CommandItem icon={<Star size={16} />} label="我的收藏" shortcut="" onSelect={() => handleSelect('favorites')} />
              <CommandItem icon={<Pin size={16} />} label="已置顶" shortcut="" onSelect={() => handleSelect('pinned')} />
            </Command.Group>

            {/* Quick actions */}
            <Command.Group heading="操作" style={{ marginBottom: '4px' }}>
              <CommandGroupHeading />
              <CommandItem icon={<Plus size={16} />} label="新建场景" shortcut="" onSelect={() => handleSelect('new-scene')} />
              <CommandItem icon={theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'} shortcut="" onSelect={() => handleSelect('toggle-theme')} />
              <CommandItem icon={<FileText size={16} />} label="卡片视图" shortcut="" onSelect={() => handleSelect('grid-view')} />
              <CommandItem icon={<FileText size={16} />} label="列表视图" shortcut="" onSelect={() => handleSelect('list-view')} />
            </Command.Group>

            {/* Scenes */}
            {scenes.length > 0 && (
              <Command.Group heading="场景" style={{ marginBottom: '4px' }}>
                <CommandGroupHeading />
                {scenes.map((scene) => (
                  <CommandItem
                    key={scene.id}
                    icon={<span>{scene.icon || '📁'}</span>}
                    label={scene.name}
                    subtitle={scene.description ?? undefined}
                    onSelect={() => handleSelect(`scene:${scene.id}`)}
                  />
                ))}
              </Command.Group>
            )}

            {/* Search results */}
            {query.length > 0 && results.length > 0 && (
              <Command.Group heading="搜索结果" style={{ marginBottom: '4px' }}>
                <CommandGroupHeading />
                {results.map((r) => (
                  <CommandItem
                    key={r.entityId}
                    icon={<FileText size={16} />}
                    label={r.title}
                    subtitle={r.snippet.replace(/<[^>]*>/g, '')}
                    onSelect={() => handleSelect(`prompt:${r.entityId}`)}
                  />
                ))}
              </Command.Group>
            )}
          </Command.List>

          {/* Footer hint */}
          <div
            className="flex items-center"
            style={{ gap: '16px', padding: '8px 16px', borderTop: '1px solid var(--border-default)', background: 'var(--bg-hover)' }}
          >
            <span style={{ fontSize: 'var(--text-micro)', color: 'var(--text-disabled)' }}>
              ↑↓ 导航
            </span>
            <span style={{ fontSize: 'var(--text-micro)', color: 'var(--text-disabled)' }}>
              ↵ 选择
            </span>
            <span style={{ fontSize: 'var(--text-micro)', color: 'var(--text-disabled)' }}>
              esc 关闭
            </span>
          </div>
        </Command>
      </div>
    </div>
  )
}

/** Sub-component: group heading style override */
function CommandGroupHeading() {
  return null // cmdk renders its own heading, we just style via CSS
}

function CommandItem({
  icon, label, subtitle, shortcut, onSelect,
}: {
  icon: React.ReactNode
  label: string
  subtitle?: string
  shortcut?: string
  onSelect: () => void
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center rounded-md cursor-pointer transition-colors duration-100"
      style={{
        gap: '16px',
        padding: '8px 16px',
        fontSize: 'var(--text-body)',
        color: 'var(--text-secondary)',
      }}
    >
      <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-md" style={{ background: 'var(--bg-hover)', color: 'var(--text-tertiary)' }}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{label}</div>
        {subtitle && (
          <div className="truncate" style={{ fontSize: 'var(--text-caption)', color: 'var(--text-tertiary)' }}>
            {subtitle.slice(0, 80)}
          </div>
        )}
      </div>
      {shortcut && (
        <kbd className="shrink-0 rounded font-mono" style={{
          padding: '4px 8px',
          fontSize: 'var(--text-micro)',
          color: 'var(--text-disabled)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
        }}>
          {shortcut}
        </kbd>
      )}
      <ArrowRight size={14} className="shrink-0" style={{ color: 'var(--text-disabled)' }} />
    </Command.Item>
  )
}
