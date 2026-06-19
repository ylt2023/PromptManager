import type { IStorageAdapter, QueryResult } from '../storage/types'

type SqlJsDatabase = {
  run: (sql: string, params?: unknown[]) => void
  exec: (sql: string, params?: unknown[]) => { columns: string[]; values: unknown[][] }[]
  prepare: (sql: string) => SqlJsStatement
  getRowsModified: () => number
  close: () => void
}

type SqlJsStatement = {
  bind: (params?: unknown[]) => void
  step: () => boolean
  getAsObject: () => Record<string, unknown>
  free: () => void
}

export class SqlJsWasmAdapter implements IStorageAdapter {
  private db: SqlJsDatabase | null = null

  async initialize(): Promise<void> {
    // Dynamic import to handle CJS/ESM interop
    const SQLModule = await import('sql.js')
    const initSqlJs = (SQLModule as any).default || SQLModule
    const SQL = await initSqlJs({
      locateFile: (file: string) => `/${file}`,
    })
    this.db = new SQL.Database()
    this.db!.run('PRAGMA foreign_keys = ON')
  }

  async close(): Promise<void> {
    this.db?.close()
    this.db = null
  }

  async execute(sql: string, params?: unknown[]): Promise<QueryResult> {
    if (!this.db) throw new Error('Database not initialized')
    this.db.run(sql, params as (string | number | null | Uint8Array)[] | undefined)
    return { rowsAffected: this.db.getRowsModified() }
  }

  async select<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized')
    const stmt = this.db.prepare(sql)
    if (params) {
      stmt.bind(params as (string | number | null | Uint8Array)[])
    }
    const results: T[] = []
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as T)
    }
    stmt.free()
    return results
  }

  async selectOne<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | null> {
    const rows = await this.select<T>(sql, params)
    return rows[0] ?? null
  }

  async transaction<T>(fn: (adapter: IStorageAdapter) => Promise<T>): Promise<T> {
    await this.execute('BEGIN TRANSACTION')
    try {
      const result = await fn(this)
      await this.execute('COMMIT')
      return result
    } catch (err) {
      await this.execute('ROLLBACK')
      throw err
    }
  }

  getDb(): SqlJsDatabase | null {
    return this.db
  }
}
