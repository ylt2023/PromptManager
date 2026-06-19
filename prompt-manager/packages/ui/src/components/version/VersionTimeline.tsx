import type { Version } from '@prompt-mgr/core'
import { formatDate } from '../../lib/utils'
import { useState } from 'react'
import { GitCompareArrows, Check, GitBranch, RotateCcw } from 'lucide-react'

interface VersionTimelineProps {
  versions: Version[]
  currentVersionId: string | null
  onCompare: (v1: Version, v2: Version) => void
  onRestore: (versionNumber: number) => void
}

export function VersionTimeline({ versions, currentVersionId, onCompare, onRestore }: VersionTimelineProps) {
  const [selected, setSelected] = useState<string[]>([])

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 2) return [prev[1], id]
      return [...prev, id]
    })
  }

  const handleCompare = () => {
    if (selected.length !== 2) return
    const v1 = versions.find((v) => v.id === selected[0])
    const v2 = versions.find((v) => v.id === selected[1])
    if (v1 && v2) onCompare(v1, v2)
  }

  return (
    <div>
      {selected.length === 2 && (
        <button type="button" onClick={handleCompare} className="btn-secondary" style={{ marginBottom: '16px', fontSize: 'var(--text-callout)' }}>
          <GitCompareArrows size={14} strokeWidth={1.5} />
          对比选中的 2 个版本
        </button>
      )}

      <div className="relative flex flex-col" style={{ gap: '8px' }}>
        {versions.length > 1 && (
          <div className="absolute left-[13px] top-4 bottom-4 w-px" style={{ background: 'var(--border-default)' }} />
        )}

        {versions.map((v, i) => {
          const isCurrent = v.id === currentVersionId
          const isSelected = selected.includes(v.id)
          return (
            <div
              key={v.id}
              className="group relative flex items-center rounded-md cursor-pointer transition-all duration-150"
              style={{
                gap: '16px',
                padding: '8px 16px',
                background: isSelected ? 'var(--accent-bg)' : 'var(--bg-surface)',
                border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border-default)'}`,
                animation: `slideUp 200ms ease-out ${i * 30}ms both`,
              }}
              onClick={() => toggleSelect(v.id)}
            >
              <div
                className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-all duration-150"
                style={{
                  background: isCurrent ? 'var(--accent)' : 'var(--bg-hover)',
                  color: isCurrent ? 'white' : 'var(--text-tertiary)',
                  border: isSelected && !isCurrent ? '2px solid var(--accent)' : 'none',
                }}
              >
                {isCurrent ? <Check size={13} strokeWidth={2.5} /> : v.versionNumber}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center" style={{ gap: '8px' }}>
                  <span className="font-semibold" style={{ fontSize: 'var(--text-callout)', color: 'var(--text-primary)' }}>
                    v{v.versionNumber}
                  </span>
                  {isCurrent && <span className="badge badge-success">当前</span>}
                </div>
                {v.changeNote && (
                  <p className="truncate leading-snug" style={{ fontSize: 'var(--text-caption)', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    {v.changeNote}
                  </p>
                )}
              </div>
              <span className="shrink-0 font-mono tabular-nums" style={{ fontSize: 'var(--text-micro)', color: 'var(--text-disabled)' }}>
                {formatDate(v.createdAt)}
              </span>
              {!isCurrent && (
                <button type="button"
                  onClick={(e) => { e.stopPropagation(); onRestore(v.versionNumber) }}
                  className="shrink-0 btn-ghost transition-opacity duration-150"
                  style={{ padding: '4px 8px', fontSize: 'var(--text-micro)' }}
                  title={`恢复到 v${v.versionNumber}`}
                >
                  <RotateCcw size={12} /> 回滚
                </button>
              )}
            </div>
          )
        })}
      </div>

      {selected.length > 0 && (
        <p className="font-medium" style={{ fontSize: 'var(--text-caption)', color: 'var(--text-tertiary)', marginTop: '8px' }}>
          已选择 {selected.length}/2 个版本用于对比
        </p>
      )}
    </div>
  )
}
