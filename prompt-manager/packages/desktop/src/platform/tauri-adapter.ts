/**
 * Tauri SQLite Adapter
 *
 * Uses @tauri-apps/plugin-sql to communicate with a local SQLite database
 * through Tauri's native Rust backend.
 */
import type { IStorageAdapter, QueryResult } from '@prompt-mgr/core/storage/types'
import Database from '@tauri-apps/plugin-sql'

interface TauriDatabase {
  execute(sql: string, bindValues?: unknown[]): Promise<QueryResult>
  select<T>(sql: string, bindValues?: unknown[]): Promise<T[]>
  close(): Promise<void>
}

let dbInstance: Database | null = null

async function getDatabase(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = await Database.load('sqlite:prompt-manager.db')
  }
  return dbInstance
}

export class TauriSqliteAdapter implements IStorageAdapter {
  private db: Database | null = null

  async initialize(): Promise<void> {
    this.db = await getDatabase()
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close()
      this.db = null
    }
  }

  async execute(sql: string, params?: unknown[]): Promise<QueryResult> {
    if (!this.db) throw new Error('Database not initialized')
    return this.db.execute(sql, params)
  }

  async select<T>(sql: string, params?: unknown[]): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized')
    const result = await this.db.select<T>(sql, params)
    // Tauri plugin-sql may return single object or array depending on version
    if (Array.isArray(result)) return result
    if (result === null || result === undefined) return []
    return [result]
  }

  async selectOne<T>(sql: string, params?: unknown[]): Promise<T | null> {
    const results = await this.select<T>(sql, params)
    return results[0] ?? null
  }

  async transaction<T>(fn: (adapter: IStorageAdapter) => Promise<T>): Promise<T> {
    if (!this.db) throw new Error('Database not initialized')

    await this.db.execute('BEGIN TRANSACTION')
    try {
      const result = await fn(this)
      await this.db.execute('COMMIT')
      return result
    } catch (error) {
      await this.db.execute('ROLLBACK')
      throw error
    }
  }
}

let adapterInstance: TauriSqliteAdapter | null = null
let initializing: Promise<IStorageAdapter> | null = null

export async function initTauriAdapter(): Promise<IStorageAdapter> {
  if (adapterInstance) return adapterInstance
  // Guard against concurrent calls (React StrictMode double-invoke in dev, HMR, etc.)
  if (initializing) return initializing

  const { runMigrations } = await import('@prompt-mgr/core/storage/migrations')
  const { seedSampleData } = await import('@prompt-mgr/core/services/seed-service')

  const adapter = new TauriSqliteAdapter()
  initializing = (async () => {
    await adapter.initialize()
    await runMigrations(adapter)
    await seedSampleData(adapter)
    adapterInstance = adapter
    return adapter
  })()

  return initializing
}
