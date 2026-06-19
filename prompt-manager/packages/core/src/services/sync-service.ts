import type { IStorageAdapter } from '../storage/types'
import type { Scene, SceneRow } from '../domain/scene'
import type { Prompt, PromptRow } from '../domain/prompt'
import type { Version, VersionRow } from '../domain/version'
import { sceneFromRow, promptFromRow, versionFromRow } from '../domain'

export interface ExportPackage {
  _meta: {
    format: 'prompt-manager-export'
    version: number
    exportedAt: string
    appVersion: string
  }
  scenes: Scene[]
  prompts: Prompt[]
  versions: Version[]
}

export type MergeStrategy = 'newest-wins' | 'keep-local' | 'keep-remote'

export interface ImportResult {
  stats: {
    scenesCreated: number
    scenesUpdated: number
    promptsCreated: number
    promptsUpdated: number
    versionsCreated: number
    versionsSkipped: number
  }
  conflicts: ConflictItem[]
}

export interface ConflictItem {
  entityType: 'scene' | 'prompt'
  entityId: string
  entityName: string
  localUpdatedAt: string
  remoteUpdatedAt: string
  resolution?: 'local' | 'remote' | 'skipped'
}

export async function exportAll(adapter: IStorageAdapter): Promise<ExportPackage> {
  const [scenes, prompts, versions] = await Promise.all([
    adapter.select<SceneRow>('SELECT * FROM scenes ORDER BY sort_order'),
    adapter.select<PromptRow>('SELECT * FROM prompts ORDER BY updated_at DESC'),
    adapter.select<VersionRow>('SELECT * FROM versions ORDER BY created_at DESC'),
  ])

  return {
    _meta: {
      format: 'prompt-manager-export',
      version: 1,
      exportedAt: new Date().toISOString(),
      appVersion: '0.1.0',
    },
    scenes: scenes.map(sceneFromRow),
    prompts: prompts.map(promptFromRow),
    versions: versions.map(versionFromRow),
  }
}

export async function importData(
  adapter: IStorageAdapter,
  data: ExportPackage,
  strategy: MergeStrategy = 'newest-wins'
): Promise<ImportResult> {
  if (data._meta.format !== 'prompt-manager-export') {
    throw new Error('Invalid export format')
  }

  const stats = {
    scenesCreated: 0,
    scenesUpdated: 0,
    promptsCreated: 0,
    promptsUpdated: 0,
    versionsCreated: 0,
    versionsSkipped: 0,
  }
  const conflicts: ConflictItem[] = []

  await adapter.transaction(async (tx) => {
    // Import scenes
    const existingScenes = await tx.select<SceneRow>('SELECT * FROM scenes')
    const existingSceneMap = new Map(existingScenes.map((s) => [s.id, s]))

    for (const scene of data.scenes) {
      const existing = existingSceneMap.get(scene.id)
      if (!existing) {
        await tx.execute(
          `INSERT INTO scenes (id, name, description, parent_id, icon, sort_order, is_pinned, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [scene.id, scene.name, scene.description, scene.parentId, scene.icon, scene.sortOrder, scene.isPinned ? 1 : 0, scene.createdAt, scene.updatedAt]
        )
        stats.scenesCreated++
      } else if (strategy === 'newest-wins' && scene.updatedAt > existing.updated_at) {
        await tx.execute(
          `UPDATE scenes SET name=?, description=?, parent_id=?, icon=?, sort_order=?, is_pinned=?, updated_at=? WHERE id=?`,
          [scene.name, scene.description, scene.parentId, scene.icon, scene.sortOrder, scene.isPinned ? 1 : 0, scene.updatedAt, scene.id]
        )
        stats.scenesUpdated++
      } else if (strategy === 'keep-remote') {
        await tx.execute(
          `UPDATE scenes SET name=?, description=?, parent_id=?, icon=?, sort_order=?, is_pinned=?, updated_at=? WHERE id=?`,
          [scene.name, scene.description, scene.parentId, scene.icon, scene.sortOrder, scene.isPinned ? 1 : 0, scene.updatedAt, scene.id]
        )
        stats.scenesUpdated++
      }
      // keep-local: skip
    }

    // Import prompts
    const existingPrompts = await tx.select<PromptRow>('SELECT * FROM prompts')
    const existingPromptMap = new Map(existingPrompts.map((p) => [p.id, p]))

    for (const prompt of data.prompts) {
      const existing = existingPromptMap.get(prompt.id)
      if (!existing) {
        await tx.execute(
          `INSERT INTO prompts (id, scene_id, title, content, tags, is_favorite, is_pinned, current_version_id, version_count, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [prompt.id, prompt.sceneId, prompt.title, prompt.content, JSON.stringify(prompt.tags), prompt.isFavorite ? 1 : 0, prompt.isPinned ? 1 : 0, prompt.currentVersionId, prompt.versionCount, prompt.createdAt, prompt.updatedAt]
        )
        stats.promptsCreated++
      } else if (strategy === 'newest-wins' && prompt.updatedAt > existing.updated_at) {
        await tx.execute(
          `UPDATE prompts SET scene_id=?, title=?, content=?, tags=?, is_favorite=?, is_pinned=?, current_version_id=?, version_count=?, updated_at=? WHERE id=?`,
          [prompt.sceneId, prompt.title, prompt.content, JSON.stringify(prompt.tags), prompt.isFavorite ? 1 : 0, prompt.isPinned ? 1 : 0, prompt.currentVersionId, prompt.versionCount, prompt.updatedAt, prompt.id]
        )
        stats.promptsUpdated++
        conflicts.push({
          entityType: 'prompt',
          entityId: prompt.id,
          entityName: prompt.title,
          localUpdatedAt: existing.updated_at,
          remoteUpdatedAt: prompt.updatedAt,
          resolution: 'remote',
        })
      } else if (strategy === 'keep-remote') {
        await tx.execute(
          `UPDATE prompts SET scene_id=?, title=?, content=?, tags=?, is_favorite=?, is_pinned=?, current_version_id=?, version_count=?, updated_at=? WHERE id=?`,
          [prompt.sceneId, prompt.title, prompt.content, JSON.stringify(prompt.tags), prompt.isFavorite ? 1 : 0, prompt.isPinned ? 1 : 0, prompt.currentVersionId, prompt.versionCount, prompt.updatedAt, prompt.id]
        )
        stats.promptsUpdated++
      }
    }

    // Import versions (immutable — skip if same promptId+versionNumber exists)
    const existingVersions = await tx.select<VersionRow>('SELECT * FROM versions')
    const existingVersionKeys = new Set(existingVersions.map((v) => `${v.prompt_id}:${v.version_number}`))

    for (const version of data.versions) {
      const key = `${version.promptId}:${version.versionNumber}`
      if (existingVersionKeys.has(key)) {
        stats.versionsSkipped++
        continue
      }
      await tx.execute(
        `INSERT INTO versions (id, prompt_id, version_number, content, change_note, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [version.id, version.promptId, version.versionNumber, version.content, version.changeNote, version.createdAt]
      )
      stats.versionsCreated++
    }
  })

  return { stats, conflicts }
}

export function validateExportPackage(data: unknown): data is ExportPackage {
  if (!data || typeof data !== 'object') return false
  const pkg = data as Record<string, unknown>
  if (!pkg._meta || typeof pkg._meta !== 'object') return false
  const meta = pkg._meta as Record<string, unknown>
  return meta.format === 'prompt-manager-export'
}
