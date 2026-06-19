import { useEffect, useState, useRef, type ReactNode } from 'react'
import type { IStorageAdapter } from '@prompt-mgr/core/storage/types'
import { useAppStore } from '../../stores/app-store'

export interface AppBootstrapProps {
  /** Platform-specific adapter initialization function */
  initAdapter: () => Promise<IStorageAdapter>
  /** Content to render once initialization succeeds */
  children: ReactNode
  /** Loading message shown with the spinner */
  loadingMessage?: string
  /** Optional hint shown below the error stack trace */
  errorHint?: string
}

export function AppBootstrap({
  initAdapter,
  children,
  loadingMessage = '正在初始化数据库…',
  errorHint,
}: AppBootstrapProps) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    initAdapter()
      .then((adapter) => {
        if (!mountedRef.current) return
        useAppStore.getState().setAdapter(adapter)
        setReady(true)
      })
      .catch((err) => {
        if (!mountedRef.current) return
        const msg = err instanceof Error ? `${err.message}\n${err.stack || ''}` : String(err)
        console.error('[DB] Init failed:', err)
        setError(msg)
      })

    return () => {
      mountedRef.current = false
    }
  }, [initAdapter])

  // Error state
  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center" style={{ background: 'var(--bg-canvas)' }}>
        <div className="flex flex-col items-center max-w-md text-center" style={{ gap: '12px' }}>
          <p className="font-semibold" style={{ fontSize: 'var(--text-title-2)', color: 'var(--text-primary)' }}>
            数据库初始化失败
          </p>
          <pre style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'left', whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto' }}>{error}</pre>
          {errorHint && (
            <p style={{ fontSize: 'var(--text-caption)', color: 'var(--text-disabled)' }}>
              {errorHint}
            </p>
          )}
        </div>
      </div>
    )
  }

  // Loading state
  if (!ready) {
    return (
      <div className="flex h-screen w-screen items-center justify-center" style={{ background: 'var(--bg-canvas)' }}>
        <div className="flex flex-col items-center" style={{ gap: '12px' }}>
          <div className="h-8 w-8 rounded-full border-2 border-[var(--accent)] border-t-transparent" style={{ animation: 'spin 0.8s linear infinite' }} />
          <p style={{ fontSize: 'var(--text-callout)', color: 'var(--text-tertiary)' }}>{loadingMessage}</p>
        </div>
      </div>
    )
  }

  // Ready state
  return <>{children}</>
}
