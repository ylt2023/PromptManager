import type { Prompt } from '@prompt-mgr/core'
import { useAppStore } from '../../stores/app-store'
import { usePrompts } from '../../hooks/usePrompts'
import { formatDate } from '../../lib/utils'
import { Star, Pin, Copy, Check, GitBranch } from 'lucide-react'
import { useState } from 'react'

interface PromptCardProps {
  prompt: Prompt
  listView?: boolean
  index?: number
}

export function PromptCard({ prompt, listView, index = 0 }: PromptCardProps) {
  const setSelectedPrompt = useAppStore((s) => s.setSelectedPrompt)
  const selectedPromptId = useAppStore((s) => s.selectedPromptId)
  const { toggleFavorite, togglePinned } = usePrompts(useAppStore((s) => s.selectedSceneId))
  const compactLayout = useAppStore((s) => s.compactLayout)
  const [copied, setCopied] = useState(false)
  const isSelected = selectedPromptId === prompt.id

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(prompt.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(prompt.id)
  }

  const handlePinned = (e: React.MouseEvent) => {
    e.stopPropagation()
    togglePinned(prompt.id)
  }

  /* ---- List View ---- */
  if (listView) {
    return (
      <div
        onClick={() => setSelectedPrompt(prompt.id)}
        className="card flex items-center cursor-pointer"
        style={{
          padding: compactLayout ? '12px 16px' : '16px 16px',
          gap: compactLayout ? '12px' : '16px',
          minHeight: compactLayout ? 60 : 80,
          background: isSelected ? 'var(--accent-bg)' : undefined,
          borderColor: isSelected ? 'var(--systemBlue)' : undefined,
          animation: `slideUp 200ms ease-out ${index * 30}ms both`,
        }}
      >
        <div className="flex items-center justify-center w-5 shrink-0">
          {prompt.isPinned && <Pin size={14} style={{ color: 'var(--systemGreen)' }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center" style={{ gap: '8px' }}>
            <span className="font-semibold truncate" style={{ fontSize: 'var(--text-headline)', color: 'var(--text-primary)' }}>
              {prompt.title}
            </span>
            {prompt.isFavorite && <Star size={14} fill="var(--systemOrange)" style={{ color: 'var(--systemOrange)' }} />}
          </div>
          <p className="truncate leading-snug" style={{ fontSize: 'var(--text-footnote)', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {prompt.content || <span style={{ color: 'var(--text-tertiary)' }}>（空内容）</span>}
          </p>
        </div>
        <div className="hidden md:flex items-center shrink-0" style={{ gap: '8px' }}>
          {prompt.tags.slice(0, 2).map((tag) => <span key={tag} className="tag">{tag}</span>)}
        </div>
        <span className="hidden sm:block shrink-0 tabular-nums" style={{ fontSize: 'var(--text-footnote)', color: 'var(--text-tertiary)' }}>
          {formatDate(prompt.updatedAt)}
        </span>
        <div className="flex items-center shrink-0" style={{ gap: '4px' }}>
          <button type="button" onClick={handleFavorite} className="btn-icon !w-8 !h-8" title="收藏">
            <Star size={15} fill={prompt.isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button type="button" onClick={handleCopy} className="btn-icon !w-8 !h-8" title="复制">
            {copied ? <Check size={15} style={{ color: 'var(--systemGreen)' }} /> : <Copy size={15} />}
          </button>
        </div>
      </div>
    )
  }

  /* ---- Grid View (Apple HIG Glassmorphism) ---- */
  return (
    <article
      onClick={() => setSelectedPrompt(prompt.id)}
      className="group relative flex flex-col cursor-pointer rounded-xl border transition-all duration-300"
      style={{
        height: compactLayout ? 180 : 220,
        background: isSelected ? 'var(--accent-bg)' : 'var(--bg-surface)',
        borderColor: isSelected ? 'var(--systemBlue)' : 'var(--border-default)',
        boxShadow: 'var(--shadow-xs)',
        animation: `scaleIn 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 60}ms both`,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
          e.currentTarget.style.borderColor = 'rgba(0,122,255,0.4)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.boxShadow = 'var(--shadow-xs)'
          e.currentTarget.style.borderColor = 'var(--border-default)'
        }
      }}
    >
      <div className="flex flex-1 overflow-hidden flex-col" style={{ padding: compactLayout ? '12px' : '16px' }}>
        {/* Title + Actions */}
        <div className="flex items-start justify-between shrink-0" style={{ gap: '8px', marginBottom: '8px' }}>
          <div className="flex-1 min-w-0 flex items-center" style={{ gap: '6px' }}>
            {prompt.isPinned && <Pin size={14} style={{ color: 'var(--systemGreen)' }} className="shrink-0 -rotate-45" />}
            <h3 className="font-semibold truncate transition-colors group-hover:text-[var(--systemBlue)]" style={{ fontSize: 'var(--text-headline)', color: 'var(--text-primary)' }}>
              {prompt.title}
            </h3>
          </div>
          <div className="flex items-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150" style={{ gap: '4px', opacity: isSelected ? 1 : undefined }}>
            <button type="button" onClick={handleFavorite} className="btn-icon !w-7 !h-7" title="收藏">
              <Star size={15} fill={prompt.isFavorite ? 'currentColor' : 'none'} style={prompt.isFavorite ? { color: 'var(--systemOrange)' } : undefined} />
            </button>
            <button type="button" onClick={handlePinned} className="btn-icon !w-7 !h-7" title="置顶"><Pin size={15} /></button>
            <button type="button" onClick={handleCopy} className="btn-icon !w-7 !h-7" title="复制">
              {copied ? <Check size={15} style={{ color: 'var(--systemGreen)' }} /> : <Copy size={15} />}
            </button>
          </div>
        </div>

        {/* Content Abstract Well */}
        <div className="flex-1 truncate-3 rounded-lg" style={{ padding: '8px', marginBottom: '8px', background: 'var(--bg-input)', fontSize: 'var(--text-caption)', fontFamily: 'var(--font-mono)', lineHeight: '1.7', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
          {prompt.content || <span style={{ color: 'var(--text-tertiary)' }}>（空内容）</span>}
        </div>

        {/* Tags */}
        {prompt.tags.length > 0 && (
          <div className="flex flex-wrap shrink-0" style={{ gap: '4px', marginBottom: '8px' }}>
            {prompt.tags.slice(0, 3).map((tag) => <span key={tag} className="tag">{tag}</span>)}
          </div>
        )}

        {/* Footer: Version + Time */}
        <div className="flex items-center justify-between shrink-0" style={{ paddingTop: '8px', borderTop: '1px solid var(--border-default)' }}>
          <span className="flex items-center tabular-nums" style={{ gap: '4px', fontSize: 'var(--text-caption-2)', color: 'var(--text-tertiary)' }}>
            <GitBranch size={11} strokeWidth={1.5} />v{prompt.versionCount}
          </span>
          <span className="tabular-nums" style={{ fontSize: 'var(--text-caption-2)', color: 'var(--text-tertiary)' }}>{formatDate(prompt.updatedAt)}</span>
        </div>
      </div>
    </article>
  )
}
