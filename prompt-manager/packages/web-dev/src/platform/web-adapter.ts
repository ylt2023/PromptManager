import { SqlJsWasmAdapter } from '@prompt-mgr/core/adapters/sqljs-wasm'
import { runMigrations } from '@prompt-mgr/core/storage/migrations'
import { seedSampleData } from '@prompt-mgr/core/services/seed-service'
import type { IStorageAdapter } from '@prompt-mgr/core/storage/types'

let adapterInstance: IStorageAdapter | null = null
let initializing: Promise<IStorageAdapter> | null = null

export async function initWebAdapter(): Promise<IStorageAdapter> {
  if (adapterInstance) return adapterInstance
  // Guard against concurrent calls (React StrictMode double-invoke in dev, HMR, etc.)
  if (initializing) return initializing

  const adapter = new SqlJsWasmAdapter()
  initializing = (async () => {
    await adapter.initialize()
    await runMigrations(adapter)
    // Seed sample data on first launch (checks if data already exists)
    await seedSampleData(adapter)
    adapterInstance = adapter
    return adapter
  })()

  return initializing
}
