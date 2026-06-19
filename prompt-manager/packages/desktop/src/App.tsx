import { AppBootstrap } from '@prompt-mgr/ui'
import { AppShell } from '@prompt-mgr/ui/components/layout/AppShell'
import { initTauriAdapter } from './platform/tauri-adapter'

export default function App() {
  return (
    <AppBootstrap
      initAdapter={initTauriAdapter}
      loadingMessage="正在连接本地数据库…"
      errorHint="请确保已安装 Tauri 运行环境并正确配置数据库插件"
    >
      <AppShell />
    </AppBootstrap>
  )
}
