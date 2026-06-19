import { useState } from 'react'
import { useVersions } from '../../hooks/useVersions'
import { Plus, X, GitBranch } from 'lucide-react'

interface VersionFormProps {
  promptId: string
  currentContent: string
  onClose: () => void
}

export function VersionForm({ promptId, currentContent, onClose }: VersionFormProps) {
  const { createVersion } = useVersions(promptId)
  const [content, setContent] = useState(currentContent)
  const [changeNote, setChangeNote] = useState('')
  const [saving, setSaving] = useState(false)

  const handleCreate = async () => {
    if (!content.trim()) return
    setSaving(true)
    try {
      await createVersion({ promptId, content, changeNote: changeNote || undefined })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = content !== currentContent

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
            <GitBranch size={16} style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
            <h2 className="font-semibold" style={{ fontSize: 'var(--text-title-3)', color: 'var(--text-primary)' }}>
              新建版本
            </h2>
          </div>
          <button type="button" onClick={onClose} className="btn-icon" title="关闭"><X size={16} /></button>
        </div>

        {/* Body */}
        <div className="flex flex-col" style={{ padding: '24px 24px', gap: '16px' }}>
          <div>
            <label htmlFor="version-form-note" className="block font-medium" style={{ fontSize: 'var(--text-callout)', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              变更说明
            </label>
            <input
              id="version-form-note"
              name="changeNote"
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder="例如：优化了措辞、修正了逻辑错误..."
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="version-form-content" className="block font-medium" style={{ fontSize: 'var(--text-callout)', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              版本内容
            </label>
            <textarea
              id="version-form-content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input-field resize-none"
              style={{
                fontFamily: 'var(--font-mono)',
                lineHeight: '1.7',
                minHeight: 200,
                fontSize: 'var(--text-callout)',
              }}
              rows={10}
            />
          </div>
          {!hasChanges && (
            <p style={{ fontSize: 'var(--text-caption)', color: 'var(--warning)' }}>
              内容与当前版本相同，仍会创建新版本
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end" style={{ gap: '8px', padding: '16px 24px', borderTop: '1px solid var(--border-default)' }}>
          <button type="button" onClick={onClose} className="btn-secondary">取消</button>
          <button type="button" onClick={handleCreate} className="btn-primary" disabled={saving || !content.trim()}>
            <Plus size={15} strokeWidth={2} />
            {saving ? '保存中...' : '创建版本'}
          </button>
        </div>
      </div>
    </div>
  )
}
