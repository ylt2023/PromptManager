import { useAppStore } from '../../stores/app-store'
import { toast } from '../../hooks/useToast'
import { Sun, Moon, Monitor, Trash2, Shield, FileText } from 'lucide-react'

// ─── Radio A11y helpers ───────────────────────────────────────────────────────
interface RadioOption<T extends string> {
  value: T
  label: string
  description?: string
}

function useRadioGroupNav<T extends string>(
  options: RadioOption<T>[],
  value: T,
  onChange: (v: T) => void,
) {
  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    let next = idx
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      next = (idx + 1) % options.length
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      next = (idx - 1 + options.length) % options.length
    } else if (e.key === ' ') {
      e.preventDefault()
      onChange(options[idx].value)
      return
    } else {
      return
    }
    onChange(options[next].value)
    const el = document.getElementById(`radio-${options[next].value}`)
    el?.focus()
  }
  return { handleKeyDown }
}

// ─── Theme thumbnail data ─────────────────────────────────────────────────────
const themeOptions: { value: 'light' | 'dark'; label: string; icon: typeof Sun; desc: string }[] = [
  { value: 'light', label: '浅色', icon: Sun, desc: '始终使用浅色外观' },
  { value: 'dark', label: '深色', icon: Moon, desc: '始终使用深色外观' },
]

// ─── Component ────────────────────────────────────────────────────────────────
export function PreferencesView() {
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)
  const viewMode = useAppStore((s) => s.viewMode)
  const setViewMode = useAppStore((s) => s.setViewMode)
  const setSidebarView = useAppStore((s) => s.setSidebarView)

  const compactLayout = useAppStore((s) => s.compactLayout)
  const setCompactLayout = useAppStore((s) => s.setCompactLayout)

  const { handleKeyDown: handleThemeKey } = useRadioGroupNav(themeOptions, theme, setTheme)

  const handleClearCache = () => {
    localStorage.clear()
    sessionStorage.clear()
    toast.success('缓存已清除，刷新页面生效')
  }

  return (
    <div className="flex flex-col" style={{ gap: '32px', padding: '24px', maxWidth: 720 }}>
      {/* ── 外观 ─────────────────────────────────────────── */}
      <section className="flex flex-col" style={{ gap: '16px' }}>
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>外观</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>选择应用的外观主题</p>

        <div className="flex" role="radiogroup" aria-label="主题选择" style={{ gap: '16px' }}>
          {themeOptions.map((opt, idx) => {
            const Icon = opt.icon
            const active = theme === opt.value
            return (
              <button type="button"
                key={opt.value}
                id={`radio-${opt.value}`}
                role="radio"
                aria-checked={active}
                tabIndex={active ? 0 : -1}
                onKeyDown={(e) => handleThemeKey(e, idx)}
                onClick={() => setTheme(opt.value)}
                className="flex flex-col items-center rounded-xl border-2 transition-all focus:outline-none"
                style={{
                  gap: '8px',
                  padding: '12px',
                  borderColor: active ? 'var(--systemBlue)' : 'var(--border-default)',
                  background: active ? 'var(--blue-bg, rgba(0,122,255,0.06))' : 'var(--bg-surface)',
                  width: 140,
                }}
              >
                {/* Thumbnail preview */}
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    aspectRatio: '4/3',
                    width: '100%',
                    background: opt.value === 'dark'
                      ? 'linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)'
                      : 'linear-gradient(135deg, #F2F2F7 0%, #FFFFFF 100%)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  <Icon
                    size={24}
                    style={{ color: opt.value === 'dark' ? '#0A84FF' : '#007AFF' }}
                  />
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {opt.label}
                </span>
                <span className="text-center" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                  {opt.desc}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── 显示 ─────────────────────────────────────────── */}
      <section className="flex flex-col" style={{ gap: '16px' }}>
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>显示</h2>

        {/* View mode segmented control */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>视图模式</p>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>提示词卡片的默认显示方式</p>
          </div>
          <div className="segmented-control">
            <button type="button"
              className={`segmented-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              网格
            </button>
            <button type="button"
              className={`segmented-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              列表
            </button>
          </div>
        </div>

        {/* Compact layout toggle */}
        <div className="flex items-center justify-between rounded-lg border"
          style={{ padding: '12px 16px', borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>紧凑布局</p>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>减少卡片间距，显示更多内容</p>
          </div>
          <button type="button"
            role="switch"
            aria-checked={compactLayout}
            onClick={() => setCompactLayout(!compactLayout)}
            className="toggle-switch"
          >
            <span className="toggle-track" data-checked={compactLayout || undefined} />
          </button>
        </div>
      </section>

      {/* ── 搜索与数据 ─────────────────────────────────────── */}
      <section className="flex flex-col" style={{ gap: '16px' }}>
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>搜索与数据</h2>

        <div className="flex flex-col" style={{ gap: '12px' }}>
          {/* Clear cache */}
          <div className="flex items-center justify-between rounded-lg border"
            style={{ padding: '12px 16px', borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>清除本地缓存</p>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>清除所有本地存储数据，此操作不可撤销</p>
            </div>
            <button type="button"
              className="flex items-center rounded-full border text-sm font-medium transition-colors"
              style={{
                gap: '6px',
                padding: '0 12px',
                height: 32,
                borderColor: 'var(--systemRed)',
                color: 'var(--systemRed)',
                background: 'transparent',
              }}
              onClick={handleClearCache}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,59,48,0.08)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
              <Trash2 size={14} />
              清除
            </button>
          </div>
        </div>
      </section>

      {/* ── 系统信息 ─────────────────────────────────────── */}
      <section className="flex flex-col" style={{ gap: '16px' }}>
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>系统信息</h2>
        <div className="card overflow-hidden">
          {[
            { label: '版本', value: '1.0.0' },
            { label: '存储引擎', value: 'SQLite (sql.js)' },
            { label: '构建', value: 'Tauri 2.x' },
          ].map((item, i, arr) => (
            <div
              key={item.label}
              className="flex items-center justify-between"
              style={{ padding: '12px 16px', ...(i < arr.length - 1 ? { borderBottom: '1px solid var(--border-default)' } : {}) }}
            >
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Links */}
        <div className="flex" style={{ gap: '16px' }}>
          <button type="button"
            onClick={() => setSidebarView('privacy-policy')}
            className="flex items-center text-sm transition-opacity hover:opacity-70"
            style={{ gap: '6px', color: 'var(--systemBlue)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <Shield size={14} />
            隐私政策
          </button>
          <button type="button"
            onClick={() => setSidebarView('terms-of-service')}
            className="flex items-center text-sm transition-opacity hover:opacity-70"
            style={{ gap: '6px', color: 'var(--systemBlue)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <FileText size={14} />
            服务条款
          </button>
        </div>
      </section>
    </div>
  )
}
