import { useToasts } from '../../hooks/useToast'
import type { ToastType } from '../../hooks/useToast'
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'

const iconMap: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colorMap: Record<ToastType, { icon: string; bg: string; border: string }> = {
  success: { icon: 'var(--success)', bg: 'var(--success-bg)', border: 'var(--success)' },
  error: { icon: 'var(--danger)', bg: 'var(--danger-bg)', border: 'var(--danger)' },
  warning: { icon: 'var(--warning)', bg: 'var(--warning-bg)', border: 'var(--warning)' },
  info: { icon: 'var(--info)', bg: 'var(--info-bg)', border: 'var(--info)' },
}

export function ToastContainer() {
  const { toasts, dismiss } = useToasts()
  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex flex-col"
      style={{ maxWidth: 380, gap: '8px' }}
    >
      {toasts.map((t) => {
        const Icon = iconMap[t.type]
        const colors = colorMap[t.type]
        return (
          <div
            key={t.id}
            className="flex items-start rounded-md"
            style={{ gap: '16px', padding: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-lg)', animation: 'slideUp 200ms ease-out', borderLeft: `3px solid ${colors.border}` }}
          >
            <Icon size={18} style={{ color: colors.icon, marginTop: 4, flexShrink: 0 }} strokeWidth={1.5} />
            <div className="flex-1 min-w-0">
              <p className="font-medium" style={{ fontSize: 'var(--text-callout)', color: 'var(--text-primary)' }}>
                {t.message}
              </p>
              {t.description && (
                <p style={{ fontSize: 'var(--text-caption)', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  {t.description}
                </p>
              )}
              {t.action && (
                <button type="button"
                  onClick={t.action.onClick}
                  className="font-medium"
                  style={{ fontSize: 'var(--text-caption)', color: 'var(--accent)', marginTop: '8px' }}
                >
                  {t.action.label}
                </button>
              )}
            </div>
            <button type="button"
              onClick={() => dismiss(t.id)}
              className="btn-icon !w-6 !h-6 shrink-0"
              style={{ marginTop: -4 }}
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
