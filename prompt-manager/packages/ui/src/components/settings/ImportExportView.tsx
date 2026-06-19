import { useState, useRef } from 'react'
import { useAppStore } from '../../stores/app-store'
import { exportAll, importData, validateExportPackage, type ExportPackage, type ImportResult } from '@prompt-mgr/core'
import { Download, Upload, FileJson, Shield, AlertTriangle } from 'lucide-react'
import { toast } from '../../hooks/useToast'
import { ConflictResolver } from '../sync/ConflictResolver'
import type { MergeStrategy } from '@prompt-mgr/core'

const MAX_IMPORT_SIZE = 50 * 1024 * 1024 // 50MB

export function ImportExportView() {
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
      toast.success('数据导出成功', { description: `${data.scenes.length} 个场景, ${data.prompts.length} 个提示词` })
    } catch {
      toast.error('导出失败', { description: '请检查数据库连接' })
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !adapter) return

    // File size check
    if (file.size > MAX_IMPORT_SIZE) {
      toast.error('文件过大', { description: `最大允许 50MB，当前 ${(file.size / 1024 / 1024).toFixed(1)}MB` })
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setImporting(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text)

      // Deep schema validation
      if (!validateExportPackage(data)) {
        toast.error('无效的导出文件格式', { description: '文件缺少 _meta.format 标识' })
        return
      }
      const pkg = data as ExportPackage
      if (!Array.isArray(pkg.scenes) || !Array.isArray(pkg.prompts) || !Array.isArray(pkg.versions)) {
        toast.error('导出文件结构错误', { description: 'scenes/prompts/versions 必须为数组' })
        return
      }
      // Validate each scene has required fields
      for (const s of pkg.scenes) {
        if (!s.id || !s.name) {
          toast.error('场景数据不完整', { description: `缺少 id 或 name 字段: ${JSON.stringify(s).slice(0, 60)}` })
          return
        }
      }
      for (const p of pkg.prompts) {
        if (!p.id || !p.sceneId || !p.title) {
          toast.error('提示词数据不完整', { description: `缺少必填字段: ${JSON.stringify(p).slice(0, 60)}` })
          return
        }
      }

      const result = await importData(adapter, pkg, 'newest-wins')
      refresh()
      setImportResult(result)
      toast.success('导入完成', {
        description: `新建 ${result.stats.scenesCreated} 场景, ${result.stats.promptsCreated} 提示词`,
      })
    } catch (err) {
      toast.error('导入失败', { description: err instanceof Error ? err.message : '未知错误' })
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-[640px] w-full mx-auto" style={{ padding: '32px 24px 40px' }}>
      <div className="flex items-center" style={{ gap: '8px', marginBottom: '24px' }}>
        <Download size={20} style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
        <h1 className="font-bold" style={{ fontSize: 'var(--text-display)', color: 'var(--text-primary)' }}>导入导出</h1>
      </div>
      <p style={{ fontSize: 'var(--text-body)', color: 'var(--text-tertiary)', marginBottom: '32px' }}>
        导出所有数据为 JSON 文件用于备份，或从文件导入数据并合并。
      </p>

      <div className="flex flex-col" style={{ gap: '16px' }}>
        {/* Export */}
        <div className="card" style={{ padding: '16px' }}>
          <div className="flex items-center" style={{ gap: '16px', marginBottom: '16px' }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-md" style={{ background: 'var(--success-bg)' }}>
              <Download size={18} style={{ color: 'var(--success)' }} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold" style={{ fontSize: 'var(--text-title-3)', color: 'var(--text-primary)' }}>导出数据</h3>
              <p style={{ fontSize: 'var(--text-caption)', color: 'var(--text-tertiary)' }}>将所有场景、提示词和版本导出为 JSON 文件</p>
            </div>
          </div>
          <button type="button" onClick={handleExport} className="btn-primary" disabled={!adapter}>
            <Download size={15} /> 导出全部数据
          </button>
        </div>

        {/* Import */}
        <div className="card" style={{ padding: '16px' }}>
          <div className="flex items-center" style={{ gap: '16px', marginBottom: '16px' }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-md" style={{ background: 'var(--info-bg)' }}>
              <Upload size={18} style={{ color: 'var(--info)' }} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold" style={{ fontSize: 'var(--text-title-3)', color: 'var(--text-primary)' }}>导入数据</h3>
              <p style={{ fontSize: 'var(--text-caption)', color: 'var(--text-tertiary)' }}>从 JSON 文件导入并合并到现有数据中（最大 50MB）</p>
            </div>
          </div>
          <button type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary"
            disabled={importing || !adapter}
          >
            <Upload size={15} />
            {importing ? '导入中...' : '选择文件导入'}
          </button>
          <input
            ref={fileInputRef} type="file" accept=".json"
            onChange={handleImport}
            style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0, pointerEvents: 'none' as React.CSSProperties['pointerEvents'] }}
          />
        </div>

        {/* Security notice */}
        <div className="card" style={{ padding: '16px', background: 'var(--warning-bg)', borderColor: 'var(--warning)' }}>
          <div className="flex items-start" style={{ gap: '16px' }}>
            <Shield size={18} style={{ color: 'var(--warning)', marginTop: 4 }} strokeWidth={1.5} />
            <div>
              <h3 className="font-semibold" style={{ fontSize: 'var(--text-callout)', color: 'var(--text-primary)' }}>安全提示</h3>
              <p style={{ fontSize: 'var(--text-caption)', color: 'var(--text-tertiary)', lineHeight: '1.6' }}>
                仅导入来自可信来源的导出文件。恶意文件可能包含异常数据。系统会自动验证文件结构和数据完整性。
              </p>
            </div>
          </div>
        </div>
      </div>

      {importResult && (
        <ConflictResolver
          conflicts={importResult.conflicts}
          stats={importResult.stats}
          onStrategyChange={() => {}}
          onClose={() => setImportResult(null)}
        />
      )}
    </div>
  )
}
