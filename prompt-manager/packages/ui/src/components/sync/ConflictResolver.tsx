import { useState } from 'react'
import { X, AlertTriangle, Check, ArrowRight } from 'lucide-react'
import type { ConflictItem, MergeStrategy } from '@prompt-mgr/core'

interface ConflictResolverProps {
  conflicts: ConflictItem[]
  stats: {
    scenesCreated: number
    scenesUpdated: number
    promptsCreated: number
    promptsUpdated: number
    versionsCreated: number
    versionsSkipped: number
  }
  onStrategyChange: (strategy: MergeStrategy) => void
  onClose: () => void
}

export function ConflictResolver({ conflicts, stats, onStrategyChange, onClose }: ConflictResolverProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<MergeStrategy>('newest-wins')

  const strategies: { key: MergeStrategy; label: string; desc: string }[] = [
    { key: 'newest-wins', label: '最新优先', desc: '按更新时间，保留较新的版本' },
    { key: 'keep-local', label: '保留本地', desc: '不覆盖本地已有数据' },
    { key: 'keep-remote', label: '使用导入', desc: '全部使用导入文件中的数据' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'var(--bg-overlay)', animation: 'fadeIn 150ms ease-out', transform: 'translateZ(0)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg rounded-md overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          boxShadow: 'var(--shadow-xl)',
          animation: 'scaleIn 200ms ease-out',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-default)' }}>
          <div className="flex items-center" style={{ gap: '8px' }}>
            <AlertTriangle size={16} style={{ color: 'var(--warning)' }} strokeWidth={1.5} />
            <h2 className="font-semibold" style={{ fontSize: 'var(--text-title-3)', color: 'var(--text-primary)' }}>
              导入结果
            </h2>
          </div>
          <button type="button" onClick={onClose} className="btn-icon" title="关闭"><X size={16} /></button>
        </div>

        {/* Stats summary */}
        <div style={{ padding: '24px 24px', borderBottom: '1px solid var(--border-default)' }}>
          <h3 className="font-medium" style={{ marginBottom: '16px', fontSize: 'var(--text-callout)', color: 'var(--text-secondary)' }}>
            导入统计
          </h3>
          <div className="grid grid-cols-2" style={{ gap: '16px' }}>
            <StatRow label="新增场景" value={stats.scenesCreated} />
            <StatRow label="更新场景" value={stats.scenesUpdated} />
            <StatRow label="新增提示词" value={stats.promptsCreated} />
            <StatRow label="更新提示词" value={stats.promptsUpdated} />
            <StatRow label="新增版本" value={stats.versionsCreated} />
            <StatRow label="跳过版本" value={stats.versionsSkipped} />
          </div>
        </div>

        {/* Conflicts */}
        {conflicts.length > 0 && (
          <div style={{ padding: '24px 24px', borderBottom: '1px solid var(--border-default)' }}>
            <h3 className="font-medium" style={{ marginBottom: '16px', fontSize: 'var(--text-callout)', color: 'var(--text-secondary)' }}>
              冲突解决策略
            </h3>
            <div className="flex flex-col" style={{ gap: '8px' }}>
              {strategies.map((s) => (
                <button type="button"
                  key={s.key}
                  onClick={() => setSelectedStrategy(s.key)}
                  className="flex items-center rounded-md text-left transition-all duration-150 cursor-pointer"
                  style={{
                    gap: '16px',
                    padding: '16px 16px',
                    border: `1px solid ${selectedStrategy === s.key ? 'var(--accent)' : 'var(--border-default)'}`,
                    background: selectedStrategy === s.key ? 'var(--accent-bg)' : 'var(--bg-surface)',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedStrategy !== s.key) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = selectedStrategy === s.key ? 'var(--accent-bg)' : 'var(--bg-surface)'
                  }}
                >
                  <div
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    style={{
                      border: `2px solid ${selectedStrategy === s.key ? 'var(--accent)' : 'var(--border-strong)'}`,
                    }}
                  >
                    {selectedStrategy === s.key && (
                      <div className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--accent)' }} />
                    )}
                  </div>
                  <div>
                    <div className="font-medium" style={{ fontSize: 'var(--text-body)', color: 'var(--text-primary)' }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 'var(--text-caption)', color: 'var(--text-tertiary)' }}>
                      {s.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conflict list */}
        {conflicts.length > 0 && (
          <div className="max-h-40 overflow-y-auto scrollbar-hide" style={{ padding: '16px 24px' }}>
            <h4 className="font-medium" style={{ marginBottom: '8px', fontSize: 'var(--text-caption)', color: 'var(--text-disabled)' }}>
              冲突项 ({conflicts.length})
            </h4>
            <div className="flex flex-col" style={{ gap: '8px' }}>
              {conflicts.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center rounded-md"
                  style={{ gap: '16px', padding: '8px 16px', background: 'var(--bg-input)', fontSize: 'var(--text-caption)' }}
                >
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {c.entityName}
                  </span>
                  <ArrowRight size={12} style={{ color: 'var(--text-disabled)' }} />
                  <span style={{ color: 'var(--text-tertiary)' }}>
                    {c.resolution === 'remote' ? '已更新' : '已保留'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end" style={{ gap: '8px', padding: '16px 24px', borderTop: '1px solid var(--border-default)' }}>
          <button type="button" onClick={onClose} className="btn-primary">
            <Check size={15} />
            完成
          </button>
        </div>
      </div>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-md" style={{ padding: '8px 16px', background: 'var(--bg-input)' }}>
      <span style={{ fontSize: 'var(--text-caption)', color: 'var(--text-tertiary)' }}>{label}</span>
      <span className="font-semibold tabular-nums" style={{ fontSize: 'var(--text-body)', color: value > 0 ? 'var(--accent)' : 'var(--text-disabled)' }}>
        {value}
      </span>
    </div>
  )
}
