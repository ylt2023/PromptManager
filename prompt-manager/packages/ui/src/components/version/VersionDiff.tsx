import { computeDiff } from '@prompt-mgr/core'
import { GitCompare } from 'lucide-react'

interface VersionDiffProps {
  oldContent: string
  newContent: string
}

export function VersionDiff({ oldContent, newContent }: VersionDiffProps) {
  const { changes, hasChanges } = computeDiff(oldContent, newContent)

  if (!hasChanges) {
    return (
      <div
        className="flex flex-col items-center rounded-md"
        style={{ padding: '16px', gap: '16px', background: 'var(--bg-input)', border: '1px solid var(--border-default)' }}
      >
        <GitCompare size={20} style={{ color: 'var(--text-disabled)' }} strokeWidth={1.5} />
        <span className="text-center" style={{ fontSize: 'var(--text-callout)', color: 'var(--text-tertiary)' }}>
          两个版本内容完全相同
        </span>
      </div>
    )
  }

  return (
    <div
      className="rounded-md leading-relaxed overflow-auto max-h-72"
      style={{
        padding: '16px',
        background: 'var(--bg-input)',
        border: '1px solid var(--border-default)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-callout)',
        whiteSpace: 'pre-wrap',
        lineHeight: '1.8',
      }}
    >
      {changes.map((change, i) => {
        if (change.added) return <span key={i} className="diff-added">{change.value}</span>
        if (change.removed) return <span key={i} className="diff-removed">{change.value}</span>
        return <span key={i} style={{ color: 'var(--text-secondary)' }}>{change.value}</span>
      })}
    </div>
  )
}
