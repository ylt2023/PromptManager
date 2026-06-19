export interface Scene {
  id: string
  name: string
  description: string | null
  parentId: string | null
  icon: string | null
  sortOrder: number
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateSceneInput {
  name: string
  description?: string
  parentId?: string
  icon?: string
  sortOrder?: number
}

export interface UpdateSceneInput {
  name?: string
  description?: string | null
  parentId?: string | null
  icon?: string | null
  sortOrder?: number
  isPinned?: boolean
}

// DB row format (snake_case)
export interface SceneRow {
  id: string
  name: string
  description: string | null
  parent_id: string | null
  icon: string | null
  sort_order: number
  is_pinned: number
  created_at: string
  updated_at: string
}

export function sceneFromRow(row: SceneRow): Scene {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    parentId: row.parent_id,
    icon: row.icon,
    sortOrder: row.sort_order,
    isPinned: row.is_pinned === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
