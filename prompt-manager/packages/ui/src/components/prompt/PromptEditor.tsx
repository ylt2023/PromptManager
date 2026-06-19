import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '../../stores/app-store'
import { usePrompts } from '../../hooks/usePrompts'
import { toast } from '../../hooks/useToast'
import { X, Plus, Sparkles } from 'lucide-react'

interface PromptEditorProps {
  sceneId: string
  onClose: () => void
}

export function PromptEditor({ sceneId, onClose }: PromptEditorProps) {
  const { createPrompt } = usePrompts(sceneId)
  const promptRepo = useAppStore((s) => s.promptRepo)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tagsStr, setTagsStr] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [titleError, setTitleError] = useState(false)
  const [allTags, setAllTags] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const tagInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    promptRepo?.findAllTags().then(setAllTags).catch(() => {})
  }, [promptRepo])

  // Tag autocomplete logic
  const currentTags = tagsStr.split(/[,，\s]+/).filter(Boolean)
  const lastInput = tagsStr.split(/[,，]/).pop()?.trim() || ''
  const suggestions = lastInput
    ? allTags.filter((t) => t.toLowerCase().includes(lastInput.toLowerCase()) && !currentTags.includes(t)).slice(0, 5)
    : []

  const appendTag = (tag: string) => {
    const parts = tagsStr.split(/[,，]/)
    parts[parts.length - 1] = ' ' + tag + ', '
    setTagsStr(parts.join(',').replace(/^,\s*/, ''))
    setShowSuggestions(false)
    tagInputRef.current?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setTitleError(true)
      toast.warning('请输入标题')
      return
    }
    setSubmitting(true)
    try {
      const tags = tagsStr.split(/[,，\s]+/).filter(Boolean)
      await createPrompt({ sceneId, title: title.trim(), content, tags })
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit(e)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{ background: 'var(--bg-overlay)', padding: '32px', transform: 'translateZ(0)' }}
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="relative z-10 w-full max-w-[640px] rounded-xl overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-xl)',
          animation: 'scaleIn 200ms ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-default)' }}>
          <div className="flex items-center" style={{ gap: '8px' }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ background: 'var(--accent-bg)' }}>
              <Sparkles size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <h2 className="font-semibold" style={{ fontSize: 'var(--text-title-3)', color: 'var(--text-primary)' }}>
              新建提示词
            </h2>
          </div>
          <button type="button" onClick={onClose} className="btn-icon" title="关闭 (Esc)"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label htmlFor="prompt-editor-title" className="block font-medium" style={{ fontSize: 'var(--text-callout)', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              标题 <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="prompt-editor-title"
              name="title"
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value.slice(0, 100)); setTitleError(false) }}
              maxLength={100}
              placeholder="给这个提示词起个名字"
              autoFocus
              className={`input-field ${titleError ? 'input-error' : ''}`}
              style={{ fontSize: 'var(--text-body)' }}
            />
            {titleError && (
              <p style={{ fontSize: 'var(--text-caption)', color: 'var(--danger)', marginTop: 4 }}>标题不能为空</p>
            )}
          </div>
          <div>
            <label className="block font-medium" style={{ fontSize: 'var(--text-callout)', color: 'var(--text-secondary)', marginBottom: '8px' }}>内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 10000))}
              maxLength={10000}
              placeholder="输入你的提示词内容..."
              className="input-field resize-none"
              style={{ fontFamily: 'var(--font-mono)', lineHeight: '1.7', fontSize: 'var(--text-body)', minHeight: 200, maxHeight: 400, overflowY: 'auto' }}
              rows={10}
            />
          </div>
          <div className="relative">
            <label htmlFor="prompt-editor-tags" className="block font-medium" style={{ fontSize: 'var(--text-callout)', color: 'var(--text-secondary)', marginBottom: '8px' }}>标签</label>
            <input
              id="prompt-editor-tags"
              name="tags"
              ref={tagInputRef}
              type="text"
              value={tagsStr}
              onChange={(e) => { setTagsStr(e.target.value); setShowSuggestions(true) }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="多个标签用逗号分隔，例如：react, hook, 代码生成"
              className="input-field"
              style={{ fontSize: 'var(--text-body)' }}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div
                className="absolute z-10 w-full rounded-md"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-md)', marginTop: '4px', padding: '4px 0' }}
              >
                {suggestions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); appendTag(tag) }}
                    className="flex w-full items-center transition-colors hover:bg-[var(--bg-hover)]"
                    style={{ fontSize: 'var(--text-callout)', color: 'var(--text-primary)', padding: '8px 16px' }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p style={{ fontSize: 'var(--text-caption)', color: 'var(--text-disabled)' }}>
            带 <span style={{ color: 'var(--danger)' }}>*</span> 为必填项
          </p>
          <div className="flex items-center justify-end" style={{ paddingTop: '8px' }}>
            <div className="flex items-center" style={{ gap: '8px' }}>
              <button type="button" onClick={onClose} className="btn-secondary">取消</button>
              <button type="submit" disabled={!title.trim() || submitting} className="btn-primary">
                {submitting ? (
                  <>
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white" style={{ animation: 'spin 0.8s linear infinite' }} />
                    创建中...
                  </>
                ) : (
                  <><Plus size={15} />创建</>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
