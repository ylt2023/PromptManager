export interface Version {
  id: string
  promptId: string
  versionNumber: number
  content: string
  changeNote: string | null
  createdAt: string
}

export interface CreateVersionInput {
  promptId: string
  content: string
  changeNote?: string
}

export interface VersionRow {
  id: string
  prompt_id: string
  version_number: number
  content: string
  change_note: string | null
  created_at: string
}

export function versionFromRow(row: VersionRow): Version {
  return {
    id: row.id,
    promptId: row.prompt_id,
    versionNumber: row.version_number,
    content: row.content,
    changeNote: row.change_note,
    createdAt: row.created_at,
  }
}
