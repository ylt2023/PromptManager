/**
 * Tauri Global Shortcuts
 *
 * Registers system-wide keyboard shortcuts using Tauri's global-shortcut plugin.
 */

type ShortcutHandler = () => void

interface ShortcutRegistration {
  shortcut: string
  handler: ShortcutHandler
}

const registrations: ShortcutRegistration[] = []

export async function registerGlobalShortcuts(): Promise<void> {
  try {
    const { register } = await import('@tauri-apps/plugin-global-shortcut')

    // Ctrl+K / Cmd+K — Open command palette
    await register('CmdOrCtrl+K', () => {
      dispatchShortcutEvent('command-palette')
    })

    // Ctrl+N / Cmd+N — New scene
    await register('CmdOrCtrl+N', () => {
      dispatchShortcutEvent('new-scene')
    })

    // Ctrl+Shift+E / Cmd+Shift+E — Export
    await register('CmdOrCtrl+Shift+E', () => {
      dispatchShortcutEvent('export')
    })

    // Ctrl+Shift+I / Cmd+Shift+I — Import
    await register('CmdOrCtrl+Shift+I', () => {
      dispatchShortcutEvent('import')
    })

    console.log('Global shortcuts registered successfully')
  } catch (error) {
    console.warn('Failed to register global shortcuts:', error)
  }
}

export async function unregisterAllShortcuts(): Promise<void> {
  try {
    const { unregisterAll } = await import('@tauri-apps/plugin-global-shortcut')
    await unregisterAll()
  } catch {
    // Plugin might not be available
  }
}

function dispatchShortcutEvent(action: string) {
  window.dispatchEvent(new CustomEvent('tauri-shortcut', { detail: action }))
}

export function onShortcut(action: string, handler: ShortcutHandler): () => void {
  const listener = (e: Event) => {
    const customEvent = e as CustomEvent<string>
    if (customEvent.detail === action) {
      handler()
    }
  }
  window.addEventListener('tauri-shortcut', listener)
  return () => window.removeEventListener('tauri-shortcut', listener)
}
