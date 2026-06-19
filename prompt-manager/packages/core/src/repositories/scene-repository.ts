import type { IStorageAdapter } from '../storage/types'
import type { Scene, SceneRow, CreateSceneInput, UpdateSceneInput } from '../domain/scene'
import { sceneFromRow } from '../domain/scene'
import { generateId, now } from '../services/id-service'

export class SceneRepository {
  constructor(private adapter: IStorageAdapter) {}

  async create(input: CreateSceneInput): Promise<Scene> {
    const id = generateId()
    const timestamp = now()
    await this.adapter.execute(
      `INSERT INTO scenes (id, name, description, parent_id, icon, sort_order, is_pinned, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, input.name, input.description ?? null, input.parentId ?? null, input.icon ?? null, input.sortOrder ?? 0, 0, timestamp, timestamp]
    )
    return (await this.findById(id))!
  }

  async findById(id: string): Promise<Scene | null> {
    const row = await this.adapter.selectOne<SceneRow>('SELECT * FROM scenes WHERE id = ?', [id])
    return row ? sceneFromRow(row) : null
  }

  async findAll(): Promise<Scene[]> {
    const rows = await this.adapter.select<SceneRow>('SELECT * FROM scenes ORDER BY sort_order ASC, created_at ASC')
    return rows.map(sceneFromRow)
  }

  async findChildren(parentId: string | null): Promise<Scene[]> {
    if (parentId === null) {
      const rows = await this.adapter.select<SceneRow>('SELECT * FROM scenes WHERE parent_id IS NULL ORDER BY sort_order ASC')
      return rows.map(sceneFromRow)
    }
    const rows = await this.adapter.select<SceneRow>('SELECT * FROM scenes WHERE parent_id = ? ORDER BY sort_order ASC', [parentId])
    return rows.map(sceneFromRow)
  }

  async update(id: string, input: UpdateSceneInput): Promise<Scene> {
    const sets: string[] = []
    const values: unknown[] = []

    if (input.name !== undefined) { sets.push('name = ?'); values.push(input.name) }
    if (input.description !== undefined) { sets.push('description = ?'); values.push(input.description) }
    if (input.parentId !== undefined) { sets.push('parent_id = ?'); values.push(input.parentId) }
    if (input.icon !== undefined) { sets.push('icon = ?'); values.push(input.icon) }
    if (input.sortOrder !== undefined) { sets.push('sort_order = ?'); values.push(input.sortOrder) }
    if (input.isPinned !== undefined) { sets.push('is_pinned = ?'); values.push(input.isPinned ? 1 : 0) }

    if (sets.length === 0) return (await this.findById(id))!

    sets.push('updated_at = ?')
    values.push(now())
    values.push(id)

    await this.adapter.execute(`UPDATE scenes SET ${sets.join(', ')} WHERE id = ?`, values)
    return (await this.findById(id))!
  }

  async delete(id: string): Promise<void> {
    // Cascade: delete versions of prompts in this scene, then prompts, then scene
    await this.adapter.transaction(async (tx) => {
      const promptIds = await tx.select<{ id: string }>('SELECT id FROM prompts WHERE scene_id = ?', [id])
      if (promptIds.length > 0) {
        const ids = promptIds.map((p) => p.id)
        for (const pid of ids) {
          await tx.execute('DELETE FROM versions WHERE prompt_id = ?', [pid])
        }
      }
      await tx.execute('DELETE FROM prompts WHERE scene_id = ?', [id])
      // Also set children's parent_id to null
      await tx.execute('UPDATE scenes SET parent_id = NULL WHERE parent_id = ?', [id])
      await tx.execute('DELETE FROM scenes WHERE id = ?', [id])
    })
  }

  async count(): Promise<number> {
    const row = await this.adapter.selectOne<{ count: number }>('SELECT COUNT(*) as count FROM scenes')
    return row?.count ?? 0
  }
}
