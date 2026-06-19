/**
 * Tauri File System utilities
 *
 * Wraps @tauri-apps/plugin-fs and @tauri-apps/plugin-dialog
 * for native file operations in the desktop environment.
 */

export async function saveFileDialog(content: string, defaultName: string): Promise<boolean> {
  try {
    const { save } = await import('@tauri-apps/plugin-dialog')
    const { writeTextFile } = await import('@tauri-apps/plugin-fs')

    const filePath = await save({
      defaultPath: defaultName,
      filters: [{ name: 'JSON', extensions: ['json'] }],
    })

    if (filePath) {
      await writeTextFile(filePath, content)
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to save file:', error)
    return false
  }
}

export async function openFileDialog(): Promise<string | null> {
  try {
    const { open } = await import('@tauri-apps/plugin-dialog')
    const { readTextFile } = await import('@tauri-apps/plugin-fs')

    const filePath = await open({
      filters: [{ name: 'JSON', extensions: ['json'] }],
      multiple: false,
      directory: false,
    })

    if (filePath) {
      return await readTextFile(filePath as string)
    }
    return null
  } catch (error) {
    console.error('Failed to open file:', error)
    return null
  }
}

/**
 * Get the app data directory for persistent storage
 */
export async function getAppDataDir(): Promise<string> {
  const { appDataDir } = await import('@tauri-apps/api/path')
  return appDataDir()
}
