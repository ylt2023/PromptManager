import type { IStorageAdapter } from './types'

export interface Migration {
  version: number
  description: string
  sql: string
  fts5?: string  // Optional FTS5 statements (may not be supported)
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    description: 'create_initial_schema',
    sql: `
      CREATE TABLE IF NOT EXISTS scenes (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        description TEXT,
        parent_id   TEXT REFERENCES scenes(id) ON DELETE SET NULL,
        icon        TEXT,
        sort_order  INTEGER NOT NULL DEFAULT 0,
        is_pinned   INTEGER NOT NULL DEFAULT 0,
        created_at  TEXT NOT NULL,
        updated_at  TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS prompts (
        id                 TEXT PRIMARY KEY,
        scene_id           TEXT NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
        title              TEXT NOT NULL,
        content            TEXT NOT NULL DEFAULT '',
        tags               TEXT NOT NULL DEFAULT '[]',
        is_favorite        INTEGER NOT NULL DEFAULT 0,
        is_pinned          INTEGER NOT NULL DEFAULT 0,
        current_version_id TEXT,
        version_count      INTEGER NOT NULL DEFAULT 1,
        created_at         TEXT NOT NULL,
        updated_at         TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS versions (
        id             TEXT PRIMARY KEY,
        prompt_id      TEXT NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
        version_number INTEGER NOT NULL,
        content        TEXT NOT NULL,
        change_note    TEXT,
        created_at     TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_prompts_scene_id ON prompts(scene_id);
      CREATE INDEX IF NOT EXISTS idx_prompts_favorite ON prompts(is_favorite);
      CREATE INDEX IF NOT EXISTS idx_prompts_pinned ON prompts(is_pinned);
      CREATE INDEX IF NOT EXISTS idx_prompts_pinned_updated ON prompts(is_pinned, updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_versions_prompt_id ON versions(prompt_id);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_versions_prompt_number ON versions(prompt_id, version_number);
      CREATE INDEX IF NOT EXISTS idx_scenes_parent_id ON scenes(parent_id);
    `,
    fts5: `
      CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
        entity_type,
        entity_id,
        title,
        content,
        tags,
        tokenize='unicode61'
      );

      CREATE TRIGGER IF NOT EXISTS prompts_ai AFTER INSERT ON prompts BEGIN
        INSERT INTO search_index(entity_type, entity_id, title, content, tags)
        VALUES ('prompt', NEW.id, NEW.title, NEW.content, NEW.tags);
      END;

      CREATE TRIGGER IF NOT EXISTS prompts_ad AFTER DELETE ON prompts BEGIN
        DELETE FROM search_index WHERE entity_id = OLD.id AND entity_type = 'prompt';
      END;

      CREATE TRIGGER IF NOT EXISTS prompts_au AFTER UPDATE ON prompts BEGIN
        UPDATE search_index
        SET title = NEW.title, content = NEW.content, tags = NEW.tags
        WHERE entity_id = NEW.id AND entity_type = 'prompt';
      END;
    `,
  },
]

export async function runMigrations(adapter: IStorageAdapter): Promise<void> {
  // Create migration tracking table
  await adapter.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY,
      description TEXT NOT NULL,
      applied_at TEXT NOT NULL
    )
  `)

  const applied = await adapter.select<{ version: number }>(
    'SELECT version FROM _migrations ORDER BY version'
  )
  const appliedVersions = new Set(applied.map((r) => r.version))

  for (const migration of MIGRATIONS) {
    if (appliedVersions.has(migration.version)) continue

    // Execute migration SQL (may contain multiple statements)
    const statements = migration.sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    for (const stmt of statements) {
      await adapter.execute(stmt)
    }

    // Try FTS5 setup (optional — graceful fallback if not supported)
    if (migration.fts5) {
      try {
        const ftsStatements = migration.fts5
          .split(';')
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
        for (const stmt of ftsStatements) {
          await adapter.execute(stmt)
        }
      } catch {
        // FTS5 not available — search will use LIKE fallback
        console.warn('FTS5 not available, using LIKE-based search fallback')
      }
    }

    await adapter.execute(
      'INSERT INTO _migrations (version, description, applied_at) VALUES (?, ?, ?)',
      [migration.version, migration.description, new Date().toISOString()]
    )
  }
}
