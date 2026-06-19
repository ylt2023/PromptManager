import { useAppStore } from '../../stores/app-store'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)

  return (
    <button type="button"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="btn-icon"
      title={theme === 'dark' ? '切换到亮色模式' : '切换到深色模式'}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
