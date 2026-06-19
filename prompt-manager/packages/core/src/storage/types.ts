export interface IStorageAdapter {
  initialize(): Promise<void>
  close(): Promise<void>
  execute(sql: string, params?: unknown[]): Promise<QueryResult>
  select<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>
  selectOne<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | null>
  transaction<T>(fn: (adapter: IStorageAdapter) => Promise<T>): Promise<T>
}

export interface QueryResult {
  rowsAffected: number
  lastInsertId?: number
}
