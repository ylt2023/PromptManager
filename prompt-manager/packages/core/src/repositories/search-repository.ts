import type { IStorageAdapter } from '../storage/types'

export interface SearchOptions {
  limit?: number
  offset?: number
}

export interface SearchResult {
  entityType: string
  entityId: string
  title: string
  snippet: string
  rank: number
}

interface SearchRow {
  entity_type: string
  entity_id: string
  title: string
  snippet: string
  rank: number
}

export class SearchRepository {
  constructor(private adapter: IStorageAdapter) {}

  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    if (!query || query.trim().length < 1) return []

    const limit = options?.limit ?? 50
    const offset = options?.offset ?? 0

    // Escape special FTS5 characters and build query
    const escapedQuery = query.replace(/["*]/g, '').trim()
    if (!escapedQuery) return []

    // Use FTS5 search with highlighting
    try {
      const rows = await this.adapter.select<SearchRow>(
        `SELECT
          entity_type,
          entity_id,
          title,
          snippet(search_index, 3, '<mark>', '</mark>', '...', 32) as snippet,
          rank
         FROM search_index
         WHERE search_index MATCH ?
         ORDER BY rank
         LIMIT ? OFFSET ?`,
        [escapedQuery, limit, offset]
      )

      return rows.map((row) => ({
        entityType: row.entity_type,
        entityId: row.entity_id,
        title: row.title,
        snippet: row.snippet,
        rank: row.rank,
      }))
    } catch {
      // FTS5 might not be available in all sql.js builds
      // Fallback to LIKE-based search
      return this.fallbackSearch(escapedQuery, limit, offset)
    }
  }

  private async fallbackSearch(query: string, limit: number, offset: number): Promise<SearchResult[]> {
    const likeQuery = `%${query}%`
    const rows = await this.adapter.select<{
      id: string
      title: string
      content: string
    }>(
      `SELECT id, title, content FROM prompts
       WHERE title LIKE ? OR content LIKE ?
       ORDER BY updated_at DESC
       LIMIT ? OFFSET ?`,
      [likeQuery, likeQuery, limit, offset]
    )

    return rows.map((row) => ({
      entityType: 'prompt',
      entityId: row.id,
      title: row.title,
      snippet: this.highlightSnippet(row.content, query),
      rank: 0,
    }))
  }

  private escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  private highlightSnippet(content: string, query: string, contextLen = 40): string {
    const lower = content.toLowerCase()
    const idx = lower.indexOf(query.toLowerCase())
    if (idx === -1) return this.escapeHtml(content.slice(0, 80))

    const start = Math.max(0, idx - contextLen)
    const end = Math.min(content.length, idx + query.length + contextLen)
    let snippet = this.escapeHtml(content.slice(start, end))
    if (start > 0) snippet = '...' + snippet
    if (end < content.length) snippet += '...'

    // Highlight match (safe: query is escaped, content is already HTML-escaped)
    const escapedQuery = this.escapeHtml(query)
    const re = new RegExp(`(${escapedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    snippet = snippet.replace(re, '<mark>$1</mark>')
    return snippet
  }

  async rebuildIndex(): Promise<void> {
    // Ensure search_index table exists (may not have been created during first migration
    // if FTS5 wasn't available at that point)
    if (!(await this.ensureSearchIndex())) {
      throw new Error('FTS5 搜索引擎不可用，无法重建全文索引，搜索将使用 LIKE 回退模式')
    }
    await this.adapter.execute('DELETE FROM search_index')
    await this.adapter.execute(`
      INSERT INTO search_index(entity_type, entity_id, title, content, tags)
      SELECT 'prompt', id, title, content, tags FROM prompts
    `)
  }

  private async ensureSearchIndex(): Promise<boolean> {
    try {
      // Test if search_index exists by running a dummy query
      await this.adapter.select('SELECT 1 FROM search_index LIMIT 0')
      return true
    } catch {
      // Table doesn't exist — try to create it
      try {
        await this.adapter.execute(`
          CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
            entity_type, entity_id, title, content, tags,
            tokenize='unicode61'
          )
        `)
        // Also recreate triggers
        await this.adapter.execute(`
          CREATE TRIGGER IF NOT EXISTS prompts_ai AFTER INSERT ON prompts BEGIN
            INSERT INTO search_index(entity_type, entity_id, title, content, tags)
            VALUES ('prompt', NEW.id, NEW.title, NEW.content, NEW.tags);
          END
        `)
        await this.adapter.execute(`
          CREATE TRIGGER IF NOT EXISTS prompts_ad AFTER DELETE ON prompts BEGIN
            DELETE FROM search_index WHERE entity_id = OLD.id AND entity_type = 'prompt';
          END
        `)
        await this.adapter.execute(`
          CREATE TRIGGER IF NOT EXISTS prompts_au AFTER UPDATE ON prompts BEGIN
            UPDATE search_index
            SET title = NEW.title, content = NEW.content, tags = NEW.tags
            WHERE entity_id = NEW.id AND entity_type = 'prompt';
          END
        `)
        return true
      } catch {
        // FTS5 truly not available
        return false
      }
    }
  }
}
