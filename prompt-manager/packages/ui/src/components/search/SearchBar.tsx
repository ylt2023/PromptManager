import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '../../stores/app-store'
import { useSearch } from '../../hooks/useSearch'
import { Search, X } from 'lucide-react'

export function SearchBar() {
  const searchQuery = useAppStore((s) => s.searchQuery)
  const setSearchQuery = useAppStore((s) => s.setSearchQuery)
  const setSelectedPrompt = useAppStore((s) => s.setSelectedPrompt)
  const setSelectedScene = useAppStore((s) => s.setSelectedScene)
  const promptRepo = useAppStore((s) => s.promptRepo)
  const { results, searching } = useSearch(searchQuery)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+K is handled by AppShell (opens Command Palette)
      if (e.key === 'Escape') {
        setFocused(false)
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleSelect = async (entityId: string) => {
    // First try to find the prompt's scene so DetailPanel can locate it
    try {
      const prompt = await promptRepo?.findById(entityId)
      if (prompt?.sceneId) {
        setSelectedScene(prompt.sceneId)
      }
    } catch {}
    // Then open the detail panel
    setSelectedPrompt(entityId)
    setFocused(false)
    setSearchQuery('')
    inputRef.current?.blur()
  }

  return (
    <div className="relative">
      <div
        className="flex items-center transition-all duration-150"
        style={{
          gap: '8px',
          padding: '8px 16px',
          background: 'var(--bg-input)',
          border: `1px solid ${focused ? 'var(--systemBlue)' : 'var(--border-default)'}`,
          borderRadius: '9999px',
          boxShadow: focused ? '0 0 0 3px rgba(0,122,255,0.15)' : undefined,
          width: focused ? 300 : 220,
        }}
      >
        <Search size={14} style={{ color: 'var(--text-disabled)' }} strokeWidth={1.5} />
        <input
          ref={inputRef}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { setTimeout(() => setFocused(false), 200) }}
          placeholder="搜索提示词..."
          className="flex-1 bg-transparent outline-none placeholder:text-[var(--text-disabled)]"
          style={{ fontSize: 'var(--text-callout)', color: 'var(--text-primary)' }}
        />
        {searching && (
          <div className="h-3.5 w-3.5 rounded-full border-2 border-[var(--text-disabled)] border-t-transparent" style={{ animation: 'spin 0.8s linear infinite' }} />
        )}
        {searchQuery && (
          <button type="button" onClick={() => setSearchQuery('')} className="btn-icon" style={{ width: 24, height: 24 }} title="清除搜索">
            <X size={12} />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {focused && results.length > 0 && (
        <div
          className="absolute right-0 top-full w-[320px] rounded-md overflow-hidden z-50"
          style={{
            marginTop: '8px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-lg)',
            animation: 'scaleIn 120ms ease-out',
          }}
        >
          <div className="max-h-72 overflow-y-auto">
            {results.map((r) => (
              <button type="button"
                key={r.entityId}
                onClick={() => handleSelect(r.entityId)}
                className="flex w-full flex-col text-left transition-colors duration-100 hover:bg-[var(--bg-hover)]"
                style={{ gap: '4px', padding: '16px', borderBottom: '1px solid var(--border-subtle)' }}
              >
                <span className="font-medium truncate" style={{ fontSize: 'var(--text-body)', color: 'var(--text-primary)' }}>
                  {r.title}
                </span>
                <span className="leading-relaxed truncate" style={{ fontSize: 'var(--text-caption)', color: 'var(--text-tertiary)' }}>
                  {r.snippet.replace(/<[^>]*>/g, '').slice(0, 80)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {focused && searchQuery && results.length === 0 && !searching && (
        <div
          className="absolute right-0 top-full w-[320px] rounded-md text-center z-50"
          style={{
            marginTop: '8px',
            padding: '16px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-lg)',
            animation: 'scaleIn 120ms ease-out',
          }}
        >
          <Search size={20} className="mx-auto" style={{ marginBottom: '8px', color: 'var(--text-disabled)' }} strokeWidth={1.5} />
          <p style={{ fontSize: 'var(--text-callout)', color: 'var(--text-tertiary)' }}>未找到匹配结果</p>
        </div>
      )}
    </div>
  )
}
