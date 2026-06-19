import { useState } from 'react'
import { useAppStore } from '../../stores/app-store'
import { usePrompts } from '../../hooks/usePrompts'
import { useVersions } from '../../hooks/useVersions'
import { toast } from '../../hooks/useToast'
import { VersionTimeline } from '../version/VersionTimeline'
import { VersionDiff } from '../version/VersionDiff'
import { VersionForm } from '../version/VersionForm'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { formatDate } from '../../lib/utils'
import {
  X, Star, Pin, Copy, Trash2, Edit3, Check,
  Tag, Calendar, GitBranch, FileText, Clock,
  Plus,
} from 'lucide-react'
import type { Version } from '@prompt-mgr/core'

const TITLE_MAX = 100
const CONTENT_MAX = 10000

export function DetailPanel() {
  const selectedPromptId = useAppStore((s) => s.selectedPromptId)
  const setSelectedPrompt = useAppStore((s) => s.setSelectedPrompt)
  const setDetailPanelOpen = useAppStore((s) => s.setDetailPanelOpen)
  const {
    prompts, toggleFavorite, togglePinned,
    deletePrompt, updatePrompt,
  } = usePrompts(useAppStore((s) => s.selectedSceneId))
  const { versions, restoreVersion } = useVersions(selectedPromptId)
  const prompt = prompts.find((p) => p.id === selectedPromptId)

  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [diffVersions, setDiffVersions] = useState<[Version, Version] | null>(null)
  const [showVersionForm, setShowVersionForm] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmRestore, setConfirmRestore] = useState<number | null>(null)

  if (!prompt) return null

  const handleClose = () => {
    setSelectedPrompt(null)
    setDetailPanelOpen(false)
    setEditing(false)
  }

  const handleOverlayKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleClose()
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content)
      setCopied(true)
      toast.info('已复制到剪贴板')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('复制失败')
    }
  }

  const handleDelete = async () => {
    await deletePrompt(prompt.id)
    setConfirmDelete(false)
    handleClose()
  }

  const startEdit = () => {
    setEditTitle(prompt.title)
    setEditContent(prompt.content)
    setEditing(true)
  }

  const saveEdit = async () => {
    if (!editTitle.trim()) {
      toast.warning('标题不能为空')
      return
    }
    await updatePrompt(prompt.id, { title: editTitle.trim(), content: editContent })
    setEditing(false)
    toast.success('已保存')
  }

  const handleRestore = async (versionNumber: number) => {
    await restoreVersion(prompt.id, versionNumber)
    setConfirmRestore(null)
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 animate-fade-in"
        style={{ background: 'var(--bg-overlay)', transform: 'translateZ(0)' }}
        onClick={handleClose}
        onKeyDown={handleOverlayKeyDown}
      />
      <div
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
        style={{ paddingTop: '48px', paddingBottom: '48px', pointerEvents: 'none', transform: 'translateZ(0)' }}
      >
      <div
        className="w-full max-w-[720px] overflow-hidden"
        style={{
          pointerEvents: 'auto',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          animation: 'scaleIn 200ms ease-out',
          marginTop: 'auto',
          marginBottom: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
    <div className="flex h-full flex-col" style={{ maxHeight: 'calc(100vh - 96px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between shrink-0" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-default)' }}>
        <span className="font-semibold" style={{ fontSize: 'var(--text-callout)', color: 'var(--text-secondary)' }}>
          详情
        </span>
        <button type="button" onClick={handleClose} className="btn-icon" title="关闭 (Esc)">
          <X size={16} />
        </button>
      </div>

      {/* Title + Meta */}
      <div style={{ padding: '24px 24px', borderBottom: '1px solid var(--border-default)' }}>
        {editing ? (
          <div>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value.slice(0, TITLE_MAX))}
              maxLength={TITLE_MAX}
              className="input-field"
              style={{ fontSize: 'var(--text-title-3)', fontWeight: 'var(--weight-semibold)' }}
            />
            <div style={{ fontSize: 'var(--text-micro)', color: 'var(--text-disabled)', textAlign: 'right', marginTop: 4 }}>
              {editTitle.length}/{TITLE_MAX}
            </div>
          </div>
        ) : (
          <h2 className="font-semibold leading-snug" style={{ fontSize: 'var(--text-title-2)', color: 'var(--text-primary)' }}>
            {prompt.title}
          </h2>
        )}
        <div className="flex items-center" style={{ gap: '16px', marginTop: '16px' }}>
          <span className="flex items-center" style={{ gap: '8px', fontSize: 'var(--text-caption)', color: 'var(--text-secondary)' }}>
            <GitBranch size={12} strokeWidth={1.5} />
            {prompt.versionCount} 个版本
          </span>
          <span className="flex items-center" style={{ gap: '8px', fontSize: 'var(--text-caption)', color: 'var(--text-secondary)' }}>
            <Calendar size={12} strokeWidth={1.5} />
            {formatDate(prompt.updatedAt)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center" style={{ gap: '12px', padding: '16px 24px', borderBottom: '1px solid var(--border-default)' }}>
        <ActionBtn icon={<Star size={14} fill={prompt.isFavorite ? 'currentColor' : 'none'} />} label="收藏" active={prompt.isFavorite} activeColor="var(--warning)" onClick={() => toggleFavorite(prompt.id)} />
        <ActionBtn icon={<Pin size={14} />} label="置顶" active={prompt.isPinned} activeColor="var(--accent)" onClick={() => togglePinned(prompt.id)} />
        <ActionBtn icon={copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />} label={copied ? '已复制' : '复制'} onClick={handleCopy} />
        <ActionBtn icon={editing ? <Check size={14} /> : <Edit3 size={14} />} label={editing ? '保存' : '编辑'} active={editing} onClick={editing ? saveEdit : startEdit} />
        <div className="flex-1" />
        <ActionBtn icon={<Trash2 size={14} />} label="删除" danger onClick={() => setConfirmDelete(true)} />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ padding: '24px 24px' }}>
        {prompt.tags.length > 0 && (
          <section style={{ marginBottom: '32px' }}>
            <SectionLabel icon={<Tag size={12} />} label="标签" />
            <div className="flex flex-wrap" style={{ gap: '8px', marginTop: '16px' }}>
              {prompt.tags.map((tag) => (
                <span key={tag} className="tag-accent">{tag}</span>
              ))}
            </div>
          </section>
        )}

        <section style={{ marginBottom: '32px' }}>
          <SectionLabel icon={<FileText size={12} />} label="内容" />
          <div style={{ marginTop: '16px' }}>
            {editing ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value.slice(0, CONTENT_MAX))}
                  maxLength={CONTENT_MAX}
                  className="input-field resize-none"
                  style={{ fontFamily: 'var(--font-mono)', lineHeight: '1.7', minHeight: 220, fontSize: 'var(--text-callout)' }}
                  rows={12}
                />
                <div style={{ fontSize: 'var(--text-micro)', color: 'var(--text-disabled)', textAlign: 'right', marginTop: 4 }}>
                  {editContent.length}/{CONTENT_MAX}
                </div>
              </div>
            ) : (
              <div
                className="rounded-lg whitespace-pre-wrap leading-relaxed"
                style={{
                  padding: '16px',
                  background: 'var(--bg-input)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-callout)',
                  lineHeight: '1.7',
                }}
              >
                {prompt.content || <span style={{ color: 'var(--text-disabled)' }}>（空内容）</span>}
              </div>
            )}
          </div>
        </section>

        {versions.length > 0 && (
          <section style={{ marginBottom: '32px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
              <SectionLabel icon={<Clock size={12} />} label={`版本历史 (${versions.length})`} />
              <button type="button"
                onClick={() => setShowVersionForm(true)}
                className="btn-ghost"
                style={{ fontSize: 'var(--text-caption)' }}
              >
                <Plus size={12} />
                新建版本
              </button>
            </div>
            <div style={{ marginTop: '8px' }}>
              <VersionTimeline
                versions={versions}
                currentVersionId={prompt.currentVersionId}
                onCompare={(v1, v2) => setDiffVersions([v1, v2])}
                onRestore={(versionNumber: number) => setConfirmRestore(versionNumber)}
              />
            </div>
          </section>
        )}

        {diffVersions && (
          <section style={{ marginBottom: '32px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
              <SectionLabel icon={<GitBranch size={12} />} label={`对比: v${diffVersions[1].versionNumber} → v${diffVersions[0].versionNumber}`} />
              <button type="button" onClick={() => setDiffVersions(null)} className="btn-ghost" style={{ fontSize: 'var(--text-caption)' }}>关闭</button>
            </div>
            <VersionDiff oldContent={diffVersions[1].content} newContent={diffVersions[0].content} />
          </section>
        )}
      </div>

      {/* Version Form Dialog */}
      {showVersionForm && (
        <VersionForm
          promptId={prompt.id}
          currentContent={prompt.content}
          onClose={() => setShowVersionForm(false)}
        />
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={confirmDelete}
        title="删除提示词"
        message={`确定要删除「${prompt.title}」吗？此操作不可撤销。`}
        confirmLabel="删除"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      {/* Restore Confirm Dialog */}
      <ConfirmDialog
        open={confirmRestore !== null}
        title="恢复版本"
        message={confirmRestore !== null ? `确定要将内容恢复到 v${confirmRestore} 吗？这将创建一个新版本。` : ''}
        confirmLabel="恢复"
        onConfirm={() => confirmRestore !== null && handleRestore(confirmRestore)}
        onCancel={() => setConfirmRestore(null)}
      />
    </div>
      </div>
    </div>
    </>
  )
}

function ActionBtn({ icon, label, active, activeColor, danger, onClick }: {
  icon: React.ReactNode; label: string; active?: boolean; activeColor?: string; danger?: boolean; onClick: () => void
}) {
  const color = danger ? 'var(--danger)' : active ? (activeColor || 'var(--accent)') : 'var(--text-secondary)'
  const bg = active ? (danger ? 'var(--danger-bg)' : 'var(--bg-hover)') : 'transparent'

  return (
    <button type="button"
      onClick={onClick}
      className="flex items-center rounded-lg cursor-pointer transition-[background,color] duration-150 hover:!bg-[var(--bg-hover)]"
      style={{ gap: '8px', padding: '8px', fontSize: 'var(--text-caption)', color, background: bg }}
      title={label}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center" style={{ gap: '8px' }}>
      <span style={{ color: 'var(--text-tertiary)' }}>{icon}</span>
      <span className="font-semibold uppercase tracking-wider" style={{ fontSize: 'var(--text-micro)', color: 'var(--text-tertiary)' }}>
        {label}
      </span>
    </div>
  )
}
