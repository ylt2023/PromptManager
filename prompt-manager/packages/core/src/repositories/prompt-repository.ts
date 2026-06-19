import type { IStorageAdapter } from '../storage/types'
import type { Prompt, PromptRow, CreatePromptInput, UpdatePromptInput } from '../domain/prompt'
import { promptFromRow } from '../domain/prompt'
import { generateId, now } from '../services/id-service'

export interface ListOptions {
  includeFavorite?: boolean
  includePinned?: boolean
  onlyFavorite?: boolean
  onlyPinned?: boolean
}

export class PromptRepository {
  constructor(private adapter: IStorageAdapter) {}

  async create(input: CreatePromptInput): Promise<Prompt> {
    const id = generateId()
    const timestamp = now()
    const content = input.content ?? ''
    const tags = JSON.stringify(input.tags ?? [])

    // Create initial version
    const versionId = generateId()
    await this.adapter.transaction(async (tx) => {
      await tx.execute(
        `INSERT INTO prompts (id, scene_id, title, content, tags, is_favorite, is_pinned, current_version_id, version_count, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, input.sceneId, input.title, content, tags, 0, 0, versionId, 1, timestamp, timestamp]
      )
      await tx.execute(
        `INSERT INTO versions (id, prompt_id, version_number, content, change_note, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [versionId, id, 1, content, '初始版本', timestamp]
      )
    })
    return (await this.findById(id))!
  }

  async findById(id: string): Promise<Prompt | null> {
    const row = await this.adapter.selectOne<PromptRow>('SELECT * FROM prompts WHERE id = ?', [id])
    return row ? promptFromRow(row) : null
  }

  async findBySceneId(sceneId: string, options?: ListOptions): Promise<Prompt[]> {
    let sql = 'SELECT * FROM prompts WHERE scene_id = ?'
    const params: unknown[] = [sceneId]

    if (options?.onlyFavorite) {
      sql += ' AND is_favorite = 1'
    }
    if (options?.onlyPinned) {
      sql += ' AND is_pinned = 1'
    }

    sql += ' ORDER BY is_pinned DESC, updated_at DESC'

    const rows = await this.adapter.select<PromptRow>(sql, params)
    return rows.map(promptFromRow)
  }

  async findAll(options?: { onlyFavorite?: boolean; onlyPinned?: boolean }): Promise<Prompt[]> {
    let sql = 'SELECT * FROM prompts'
    const conditions: string[] = []
    if (options?.onlyFavorite) conditions.push('is_favorite = 1')
    if (options?.onlyPinned) conditions.push('is_pinned = 1')
    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ')
    sql += ' ORDER BY updated_at DESC'
    const rows = await this.adapter.select<PromptRow>(sql)
    return rows.map(promptFromRow)
  }

  async update(id: string, input: UpdatePromptInput): Promise<Prompt> {
    const sets: string[] = []
    const values: unknown[] = []

    if (input.title !== undefined) { sets.push('title = ?'); values.push(input.title) }
    if (input.content !== undefined) { sets.push('content = ?'); values.push(input.content) }
    if (input.tags !== undefined) { sets.push('tags = ?'); values.push(JSON.stringify(input.tags)) }
    if (input.isFavorite !== undefined) { sets.push('is_favorite = ?'); values.push(input.isFavorite ? 1 : 0) }
    if (input.isPinned !== undefined) { sets.push('is_pinned = ?'); values.push(input.isPinned ? 1 : 0) }
    if (input.currentVersionId !== undefined) { sets.push('current_version_id = ?'); values.push(input.currentVersionId) }
    if (input.versionCount !== undefined) { sets.push('version_count = ?'); values.push(input.versionCount) }

    if (sets.length === 0) return (await this.findById(id))!

    sets.push('updated_at = ?')
    values.push(now())
    values.push(id)

    await this.adapter.execute(`UPDATE prompts SET ${sets.join(', ')} WHERE id = ?`, values)
    return (await this.findById(id))!
  }

  async toggleFavorite(id: string): Promise<Prompt> {
    await this.adapter.execute('UPDATE prompts SET is_favorite = 1 - is_favorite, updated_at = ? WHERE id = ?', [now(), id])
    return (await this.findById(id))!
  }

  async togglePinned(id: string): Promise<Prompt> {
    await this.adapter.execute('UPDATE prompts SET is_pinned = 1 - is_pinned, updated_at = ? WHERE id = ?', [now(), id])
    return (await this.findById(id))!
  }

  async delete(id: string): Promise<void> {
    await this.adapter.transaction(async (tx) => {
      await tx.execute('DELETE FROM versions WHERE prompt_id = ?', [id])
      await tx.execute('DELETE FROM prompts WHERE id = ?', [id])
    })
  }

  async count(): Promise<number> {
    const row = await this.adapter.selectOne<{ count: number }>('SELECT COUNT(*) as count FROM prompts')
    return row?.count ?? 0
  }

  async countBySceneId(sceneId: string): Promise<number> {
    const row = await this.adapter.selectOne<{ count: number }>('SELECT COUNT(*) as count FROM prompts WHERE scene_id = ?', [sceneId])
    return row?.count ?? 0
  }

  async countFavorites(): Promise<number> {
    const row = await this.adapter.selectOne<{ count: number }>('SELECT COUNT(*) as count FROM prompts WHERE is_favorite = 1')
    return row?.count ?? 0
  }

  async countPinned(): Promise<number> {
    const row = await this.adapter.selectOne<{ count: number }>('SELECT COUNT(*) as count FROM prompts WHERE is_pinned = 1')
    return row?.count ?? 0
  }

  async findAllTags(): Promise<string[]> {
    const rows = await this.adapter.select<{ tags: string }>('SELECT tags FROM prompts')
    const tagSet = new Set<string>()
    for (const row of rows) {
      try {
        const arr = JSON.parse(row.tags) as string[]
        arr.forEach((t) => { if (t.trim()) tagSet.add(t.trim()) })
      } catch { /* skip malformed */ }
    }
    return Array.from(tagSet).sort()
  }

  async renameTag(oldTag: string, newTag: string): Promise<void> {
    const rows = await this.adapter.select<{ id: string; tags: string }>('SELECT id, tags FROM prompts')
    for (const row of rows) {
      try {
        const arr = JSON.parse(row.tags) as string[]
        if (arr.includes(oldTag)) {
          const updated = arr.map((t) => t === oldTag ? newTag : t)
          await this.adapter.execute('UPDATE prompts SET tags = ? WHERE id = ?', [JSON.stringify(updated), row.id])
        }
      } catch { /* skip */ }
    }
  }

  async removeTagFromAll(tag: string): Promise<void> {
    const rows = await this.adapter.select<{ id: string; tags: string }>('SELECT id, tags FROM prompts')
    for (const row of rows) {
      try {
        const arr = JSON.parse(row.tags) as string[]
        if (arr.includes(tag)) {
          const updated = arr.filter((t) => t !== tag)
          await this.adapter.execute('UPDATE prompts SET tags = ? WHERE id = ?', [JSON.stringify(updated), row.id])
        }
      } catch { /* skip */ }
    }
  }

  async countAllTags(): Promise<Map<string, number>> {
    const rows = await this.adapter.select<{ tags: string }>('SELECT tags FROM prompts')
    const map = new Map<string, number>()
    for (const row of rows) {
      try {
        const arr = JSON.parse(row.tags) as string[]
        arr.forEach((t) => {
          const trimmed = t.trim()
          if (trimmed) map.set(trimmed, (map.get(trimmed) || 0) + 1)
        })
      } catch { /* skip */ }
    }
    return map
  }
}
