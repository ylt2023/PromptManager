import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex h-full w-full items-center justify-center" style={{ padding: '32px' }}>
          <div className="flex flex-col items-center text-center max-w-sm" style={{ gap: '16px' }}>
            <div
              className="flex h-12 w-12 items-center justify-center rounded-md"
              style={{ background: 'var(--danger-bg)' }}
            >
              <span style={{ fontSize: '20px' }}>⚠️</span>
            </div>
            <h3 className="font-semibold" style={{ fontSize: 'var(--text-title-3)', color: 'var(--text-primary)' }}>
              组件加载出错
            </h3>
            <p style={{ fontSize: 'var(--text-callout)', color: 'var(--text-tertiary)' }}>
              {this.state.error?.message || '发生了未知错误'}
            </p>
            <button type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="btn-secondary"
              style={{ marginTop: '8px' }}
            >
              重试
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
