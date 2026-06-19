import { useState } from 'react'
import { useScenes } from '../../hooks/useScenes'
import { toast } from '../../hooks/useToast'
import { X, FolderPlus } from 'lucide-react'

interface SceneCreateDialogProps {
  onClose: () => void
}

export function SceneCreateDialog({ onClose }: SceneCreateDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('📁')
  const [submitting, setSubmitting] = useState(false)
  const [nameError, setNameError] = useState(false)
  const { createScene } = useScenes()

  const iconOptions = ['📁', '💼', '📝', '🔧', '📊', '🎨', '📱', '🌐', '🤖', '💬', '✍️', '📚']

  const handleSubmit = async () => {
    if (!name.trim()) {
      setNameError(true)
      toast.warning('请输入场景名称')
      return
    }
    setSubmitting(true)
    try {
      await createScene({ name: name.trim(), description: description.trim() || undefined, icon })
      onClose()
    } catch (err) {
      console.error('[SceneCreateDialog] error:', err)
      toast.error('创建场景失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{ padding: '32px', background: 'var(--bg-overlay)', transform: 'translateZ(0)' }}
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="relative z-10 w-full max-w-[480px] rounded-xl overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-xl)',
          animation: 'scaleIn 200ms ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-default)' }}>
          <div className="flex items-center" style={{ gap: '8px' }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ background: 'var(--accent-bg)' }}>
              <FolderPlus size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <h2 className="font-semibold" style={{ fontSize: 'var(--text-title-3)', color: 'var(--text-primary)' }}>
              新建场景
            </h2>
          </div>
          <button type="button" onClick={onClose} className="btn-icon" title="关闭 (Esc)"><X size={16} /></button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label className="block font-medium" style={{ fontSize: 'var(--text-callout)', color: 'var(--text-secondary)', marginBottom: '8px' }}>图标</label>
            <div className="flex flex-wrap" role="radiogroup" aria-label="场景图标" style={{ gap: '8px' }}>
              {iconOptions.map((i) => {
                const isSelected = icon === i
                return (
                  <button type="button"
                    key={i}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={isSelected ? 0 : -1}
                    onClick={() => setIcon(i)}
                    onKeyDown={(e) => {
                      const idx = iconOptions.indexOf(i)
                      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                        e.preventDefault()
                        const next = iconOptions[(idx + 1) % iconOptions.length]
                        setIcon(next)
                      }
                      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                        e.preventDefault()
                        const prev = iconOptions[(idx - 1 + iconOptions.length) % iconOptions.length]
                        setIcon(prev)
                      }
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-md text-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                    style={{
                      background: isSelected ? 'var(--accent-bg)' : 'var(--bg-hover)',
                      border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border-default)',
                      boxShadow: isSelected ? '0 0 0 3px var(--accent-bg)' : 'none',
                      transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-strong)' }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-default)' }}
                  >
                    {i}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label htmlFor="scene-create-name" className="block font-medium" style={{ fontSize: 'var(--text-callout)', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              名称 <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="scene-create-name"
              name="name"
              autoFocus
              value={name}
              onChange={(e) => { setName(e.target.value.slice(0, 50)); setNameError(false) }}
              maxLength={50}
              placeholder="例如：客服对话、代码审查、数据分析"
              className={`input-field ${nameError ? 'input-error' : ''}`}
              style={{ fontSize: 'var(--text-body)' }}
            />
            {nameError && (
              <p style={{ fontSize: 'var(--text-caption)', color: 'var(--danger)', marginTop: 4 }}>场景名称不能为空</p>
            )}
          </div>
          <div>
            <label htmlFor="scene-create-desc" className="block font-medium" style={{ fontSize: 'var(--text-callout)', color: 'var(--text-secondary)', marginBottom: '8px' }}>描述</label>
            <textarea id="scene-create-desc" name="description" value={description} onChange={(e) => setDescription(e.target.value.slice(0, 200))} maxLength={200} rows={2} placeholder="简要描述此场景用途（可选）" className="input-field resize-none" style={{ fontSize: 'var(--text-body)' }} />
          </div>
          <div className="flex justify-end" style={{ gap: '8px', paddingTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">取消</button>
            <button type="button" onClick={handleSubmit} disabled={!name.trim() || submitting} className="btn-primary">
              {submitting ? '创建中...' : '创建场景'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
