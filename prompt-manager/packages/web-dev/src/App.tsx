import { AppBootstrap } from '@prompt-mgr/ui'
import { AppShell } from '@prompt-mgr/ui/components/layout/AppShell'
import { initWebAdapter } from './platform/web-adapter'

export default function App() {
  return (
    <AppBootstrap initAdapter={initWebAdapter}>
      <AppShell />
    </AppBootstrap>
  )
}
