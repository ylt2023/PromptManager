import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '../../stores/app-store'
import { toast } from '../../hooks/useToast'
import { Search, FileText, Edit2, Trash2, X, Check } from 'lucide-react'

// ─── Tag with count ────────────────────────────────────────────────────────────
interface TagItem {
  name: string
  count: number
}

// ─── Component ────────────────────────────────────────────────────────────────
export function TagManager() {
  const promptRepo = useAppStore((s) => s.promptRepo)
  const refreshKey = useAppStore((s) => s.refreshKey)
  const refresh = useAppStore((s) => s.refresh)

  const [tags, setTags] = useState<TagItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const fetchTags = useCallback(async () => {
    if (!promptRepo) return
    setLoading(true)
    try {
      const [allTags, countMap] = await Promise.all([
        promptRepo.findAllTags(),
        promptRepo.countAllTags(),
      ])
      setTags(allTags.map((name) => ({ name, count: countMap.get(name) ?? 0 })))
    } catch (err) {
      console.error('[TagManager] fetch error:', err)
      toast.error('加载标签失败')
    } finally {
      setLoading(false)
    }
  }, [promptRepo])

  useEffect(() => { fetchTags() }, [fetchTags, refreshKey])

  const handleRename = async (oldName: string) => {
    const newName = editValue.trim()
    if (!newName || newName === oldName) {
      setEditingTag(null)
      setEditValue('')
      return
    }
    if (!promptRepo) return
    try {
      await promptRepo.renameTag(oldName, newName)
      refresh()
      toast.success(`标签已重命名为 "${newName}"`)
    } catch {
      toast.error('重命名失败')
    } finally {
      setEditingTag(null)
      setEditValue('')
    }
  }

  const handleDelete = async (tagName: string) => {
    if (!promptRepo) return
    try {
      await promptRepo.removeTagFromAll(tagName)
      refresh()
      toast.success(`标签 "${tagName}" 已删除`)
    } catch {
      toast.error('删除失败')
    }
  }

  const filtered = search
    ? tags.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    : tags

  return (
    <div className="flex flex-col" style={{ gap: '20px', padding: '24px' }}>
      {/* ── Header ──────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>标签管理</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            共 {tags.length} 个标签
          </p>
        </div>
      </div>

      {/* ── Search ────────────────────────────────── */}
      <div className="relative" style={{ maxWidth: 320 }}>
        <Search
          size={15}
          className="pointer-events-none absolute top-1/2 -translate-y-1/2"
          style={{ left: 12, color: 'var(--text-tertiary)' }}
        />
        <input
          className="w-full rounded-full border text-sm transition-colors focus:outline-none"
          style={{
            height: 36,
            paddingLeft: 36,
            paddingRight: 12,
            borderColor: 'var(--border-default)',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
          }}
          placeholder="搜索标签…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--systemBlue)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)' }}
        />
      </div>

      {/* ── Tag grid ─────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center" style={{ padding: '64px 0' }}>
          <div
            className="h-6 w-6 animate-spin rounded-full border-2"
            style={{ borderColor: 'var(--border-default)', borderTopColor: 'var(--systemBlue)' }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center" style={{ gap: '8px', padding: '64px 0' }}>
          <FileText size={40} style={{ color: 'var(--text-tertiary)' }} />
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {search ? `未找到匹配 "${search}" 的标签` : '暂无标签，为提示词添加标签后将在此显示'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '12px' }}>
          {filtered.map((tag) => {
            const isEditing = editingTag === tag.name
            return (
              <div
                key={tag.name}
                className="group relative flex flex-col rounded-xl border transition-all"
                style={{
                  gap: '12px',
                  padding: '16px',
                  background: 'var(--bg-surface)',
                  borderColor: 'var(--border-default)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
                  ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,122,255,0.3)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                  ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-default)'
                }}
              >
                {/* Tag name + count */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center" style={{ gap: '8px' }}>
                    {isEditing ? (
                      <div className="flex items-center" style={{ gap: '6px' }}>
                        <input
                          className="rounded border text-sm focus:outline-none"
                          style={{
                            padding: '2px 8px',
                            borderColor: 'var(--systemBlue)',
                            background: 'var(--bg-surface)',
                            color: 'var(--text-primary)',
                            width: 100,
                          }}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(tag.name)
                            if (e.key === 'Escape') { setEditingTag(null); setEditValue('') }
                          }}
                          autoFocus
                        />
                        <button type="button"
                          className="rounded-full transition-colors"
                          style={{ padding: '4px' }}
                          onClick={() => handleRename(tag.name)}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(52,199,89,0.12)' }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                        >
                          <Check size={13} style={{ color: 'var(--systemGreen)' }} />
                        </button>
                        <button type="button"
                          className="rounded-full transition-colors"
                          style={{ padding: '4px', color: 'var(--text-tertiary)' }}
                          onClick={() => { setEditingTag(null); setEditValue('') }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)' }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span
                          className="rounded-full text-xs font-medium"
                          style={{
                            padding: '2px 10px',
                            background: 'var(--blue-bg, rgba(0,122,255,0.1))',
                            color: 'var(--systemBlue)',
                          }}
                        >
                          {tag.name}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Action buttons — visible on hover */}
                  {!isEditing && (
                    <div className="flex opacity-0 transition-opacity group-hover:opacity-100" style={{ gap: '4px' }}>
                      <button type="button"
                        className="rounded-full transition-colors"
                        style={{ padding: '6px', color: 'var(--text-tertiary)' }}
                        onClick={() => { setEditingTag(tag.name); setEditValue(tag.name) }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                        title="重命名"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button type="button"
                        className="rounded-full transition-colors"
                        style={{ padding: '6px', color: 'var(--systemRed)' }}
                        onClick={() => handleDelete(tag.name)}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,59,48,0.08)' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                        title="删除"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Count */}
                <div className="flex items-center" style={{ gap: '6px' }}>
                  <FileText size={13} style={{ color: 'var(--text-tertiary)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    用于 {tag.count} 个提示词
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
