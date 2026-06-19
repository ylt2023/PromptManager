export interface Prompt {
  id: string
  sceneId: string
  title: string
  content: string
  tags: string[]
  isFavorite: boolean
  isPinned: boolean
  currentVersionId: string | null
  versionCount: number
  createdAt: string
  updatedAt: string
}

export interface CreatePromptInput {
  sceneId: string
  title: string
  content?: string
  tags?: string[]
}

export interface UpdatePromptInput {
  title?: string
  content?: string
  tags?: string[]
  isFavorite?: boolean
  isPinned?: boolean
  currentVersionId?: string
  versionCount?: number
}

export interface PromptRow {
  id: string
  scene_id: string
  title: string
  content: string
  tags: string
  is_favorite: number
  is_pinned: number
  current_version_id: string | null
  version_count: number
  created_at: string
  updated_at: string
}

export function promptFromRow(row: PromptRow): Prompt {
  return {
    id: row.id,
    sceneId: row.scene_id,
    title: row.title,
    content: row.content,
    tags: JSON.parse(row.tags || '[]'),
    isFavorite: row.is_favorite === 1,
    isPinned: row.is_pinned === 1,
    currentVersionId: row.current_version_id,
    versionCount: row.version_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
