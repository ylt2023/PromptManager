import { diffWords, diffLines, type Change } from 'diff'

export type DiffMode = 'words' | 'lines'

export interface DiffResult {
  changes: Change[]
  hasChanges: boolean
}

export function computeDiff(oldText: string, newText: string, mode: DiffMode = 'words'): DiffResult {
  const changes = mode === 'words' ? diffWords(oldText, newText) : diffLines(oldText, newText)
  const hasChanges = changes.some((c) => c.added || c.removed)
  return { changes, hasChanges }
}
