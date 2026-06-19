import type { IStorageAdapter } from '../storage/types'
import type { Version, VersionRow, CreateVersionInput } from '../domain/version'
import { versionFromRow } from '../domain/version'
import { generateId, now } from '../services/id-service'

export class VersionRepository {
  constructor(private adapter: IStorageAdapter) {}

  async create(input: CreateVersionInput): Promise<Version> {
    const id = generateId()
    const timestamp = now()

    // Get next version number
    const latest = await this.adapter.selectOne<{ max_num: number | null }>(
      'SELECT MAX(version_number) as max_num FROM versions WHERE prompt_id = ?',
      [input.promptId]
    )
    const nextNum = (latest?.max_num ?? 0) + 1

    await this.adapter.transaction(async (tx) => {
      await tx.execute(
        `INSERT INTO versions (id, prompt_id, version_number, content, change_note, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, input.promptId, nextNum, input.content, input.changeNote ?? null, timestamp]
      )
      // Sync prompt's content and version info
      await tx.execute(
        `UPDATE prompts SET content = ?, current_version_id = ?, version_count = version_count + 1, updated_at = ? WHERE id = ?`,
        [input.content, id, timestamp, input.promptId]
      )
    })

    return (await this.findById(id))!
  }

  async findById(id: string): Promise<Version | null> {
    const row = await this.adapter.selectOne<VersionRow>('SELECT * FROM versions WHERE id = ?', [id])
    return row ? versionFromRow(row) : null
  }

  async findByPromptId(promptId: string): Promise<Version[]> {
    const rows = await this.adapter.select<VersionRow>(
      'SELECT * FROM versions WHERE prompt_id = ? ORDER BY version_number DESC',
      [promptId]
    )
    return rows.map(versionFromRow)
  }

  async findByPromptIdAndNumber(promptId: string, versionNumber: number): Promise<Version | null> {
    const row = await this.adapter.selectOne<VersionRow>(
      'SELECT * FROM versions WHERE prompt_id = ? AND version_number = ?',
      [promptId, versionNumber]
    )
    return row ? versionFromRow(row) : null
  }

  async count(): Promise<number> {
    const row = await this.adapter.selectOne<{ count: number }>('SELECT COUNT(*) as count FROM versions')
    return row?.count ?? 0
  }

  /** Restore a specific version — creates a new version with the old content */
  async restore(promptId: string, versionNumber: number, changeNote?: string): Promise<Version> {
    const oldVersion = await this.findByPromptIdAndNumber(promptId, versionNumber)
    if (!oldVersion) throw new Error(`Version ${versionNumber} not found`)

    return this.create({
      promptId,
      content: oldVersion.content,
      changeNote: changeNote ?? `从 v${versionNumber} 恢复`,
    })
  }
}
