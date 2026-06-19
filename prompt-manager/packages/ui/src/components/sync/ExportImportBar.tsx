import { useAppStore } from '../../stores/app-store'
import { exportAll, importData, validateExportPackage, type ExportPackage, type ImportResult } from '@prompt-mgr/core'
import { toast } from '../../hooks/useToast'
import { Download, Upload } from 'lucide-react'
import { useState, useRef } from 'react'
import { ConflictResolver } from './ConflictResolver'

const MAX_IMPORT_SIZE = 50 * 1024 * 1024 // 50MB

export function ExportImportBar() {
  const adapter = useAppStore((s) => s.adapter)
  const refresh = useAppStore((s) => s.refresh)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const handleExport = async () => {
    if (!adapter) return
    try {
      const data = await exportAll(adapter)
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `prompt-manager-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('数据已导出')
    } catch (err) {
      console.error('[ExportImportBar] export error:', err)
      toast.error('导出失败')
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !adapter) return

    // File size check
    if (file.size > MAX_IMPORT_SIZE) {
      toast.error(`文件过大，最大允许 50MB`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setImporting(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (!validateExportPackage(data)) {
        toast.error('无效的导出文件格式')
        return
      }
      const result = await importData(adapter, data as ExportPackage, 'newest-wins')
      refresh()
      setImportResult(result)
      toast.success(`导入完成: ${result.stats.scenesCreated} 场景, ${result.stats.promptsCreated} 提示词`)
    } catch (err) {
      console.error('[ExportImportBar] import error:', err)
      toast.error('导入失败: ' + (err instanceof Error ? err.message : '未知错误'))
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <>
      <div className="flex items-center" style={{ gap: '4px' }}>
        <button type="button"
          onClick={handleExport}
          className="btn-icon"
          title="导出所有数据为 JSON"
          disabled={!adapter}
          data-export
        >
          <Download size={16} />
        </button>
        <button type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn-icon"
          title="从 JSON 文件导入"
          disabled={importing}
        >
          <Upload size={16} />
        </button>
        <input
          ref={fileInputRef} type="file" accept=".json" onChange={handleImport}
          style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0, pointerEvents: 'none' as React.CSSProperties['pointerEvents'] }}
        />
      </div>

      {importResult && (
        <ConflictResolver
          conflicts={importResult.conflicts}
          stats={importResult.stats}
          onStrategyChange={() => {}}
          onClose={() => setImportResult(null)}
        />
      )}
    </>
  )
}
