// Domain
export * from './domain'

// Storage
export type { IStorageAdapter, QueryResult } from './storage/types'
export { runMigrations, type Migration } from './storage/migrations'

// Adapters
export { SqlJsWasmAdapter } from './adapters/sqljs-wasm'

// Repositories
export { SceneRepository, PromptRepository, VersionRepository, SearchRepository } from './repositories'
export type { ListOptions, SearchOptions, SearchResult } from './repositories'

// Services
export { generateId, now } from './services/id-service'
export { computeDiff, type DiffMode, type DiffResult } from './services/diff-service'
export { seedSampleData } from './services/seed-service'
export {
  exportAll,
  importData,
  validateExportPackage,
  type ExportPackage,
  type MergeStrategy,
  type ImportResult,
  type ConflictItem,
} from './services/sync-service'
