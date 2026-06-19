import { useEffect, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open, title, message, confirmLabel = '确认', cancelLabel = '取消',
  danger, onConfirm, onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      confirmRef.current?.focus()
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onCancel()
      }
      window.addEventListener('keydown', handleKey)
      return () => window.removeEventListener('keydown', handleKey)
    }
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ background: 'var(--bg-overlay)', animation: 'fadeIn 100ms ease-out', padding: '32px', transform: 'translateZ(0)' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[420px] rounded-xl overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-xl)',
          animation: 'scaleIn 150ms ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-default)' }}>
          <div className="flex items-center" style={{ gap: '8px' }}>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-md"
              style={{ background: danger ? 'var(--danger-bg)' : 'var(--warning-bg)' }}
            >
              <AlertTriangle size={16} style={{ color: danger ? 'var(--danger)' : 'var(--warning)' }} />
            </div>
            <h2 className="font-semibold" style={{ fontSize: 'var(--text-title-3)', color: 'var(--text-primary)' }}>
              {title}
            </h2>
          </div>
          <button type="button" onClick={onCancel} className="btn-icon" title="关闭"><X size={16} /></button>
        </div>
        <div style={{ padding: '24px 24px' }}>
          <p style={{ fontSize: 'var(--text-body)', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {message}
          </p>
        </div>
        <div className="flex items-center justify-end" style={{ gap: '8px', padding: '16px 24px', borderTop: '1px solid var(--border-default)' }}>
          <button type="button" onClick={onCancel} className="btn-secondary">{cancelLabel}</button>
          <button type="button"
            ref={confirmRef}
            onClick={onConfirm}
            className={danger ? 'btn-danger' : 'btn-primary'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
