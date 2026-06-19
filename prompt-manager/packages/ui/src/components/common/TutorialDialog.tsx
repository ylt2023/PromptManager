import { X, Layers, ArrowRight, FileText, GitBranch, Search, Download, Tag, Star } from 'lucide-react'

interface TutorialDialogProps {
  onClose: () => void
}

export function TutorialDialog({ onClose }: TutorialDialogProps) {
  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'var(--bg-overlay)', transform: 'translateZ(0)' }} onClick={onClose} />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ padding: '32px', pointerEvents: 'none', transform: 'translateZ(0)' }}
      >
        <div
          className="w-full max-w-[560px] rounded-xl overflow-y-auto"
          style={{
            pointerEvents: 'auto',
            maxHeight: '80vh',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            animation: 'scaleIn 200ms ease-out',
          }}
          onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-default)' }}>
          <div className="flex items-center" style={{ gap: '8px' }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ background: 'var(--accent-bg)' }}>
              <Layers size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <h2 className="font-semibold" style={{ fontSize: 'var(--text-title-3)', color: 'var(--text-primary)' }}>
              如何使用场景？
            </h2>
          </div>
          <button type="button" onClick={onClose} className="btn-icon" title="关闭"><X size={16} /></button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Step 1 */}
          <div className="flex" style={{ gap: '16px' }}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>1</div>
            <div>
              <h3 className="font-semibold" style={{ fontSize: 'var(--text-callout)', color: 'var(--text-primary)', marginBottom: '4px' }}>创建场景</h3>
              <p style={{ fontSize: 'var(--text-subheadline)', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                点击仪表盘右上角的"新建场景"按钮，输入场景名称和描述。场景是独立的工作区，用于组织和管理特定业务领域的提示词集合。
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex" style={{ gap: '16px' }}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>2</div>
            <div>
              <h3 className="font-semibold" style={{ fontSize: 'var(--text-callout)', color: 'var(--text-primary)', marginBottom: '4px' }}>添加提示词</h3>
              <p style={{ fontSize: 'var(--text-subheadline)', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                进入场景后点击"新建提示词"，编写 AI 提示词内容。每个提示词支持标题、标签、版本管理和收藏置顶功能。
              </p>
              <div className="flex flex-wrap" style={{ gap: '6px', marginTop: '8px' }}>
                <span className="tag"><FileText size={12} /> 标题与内容</span>
                <span className="tag"><GitBranch size={12} /> 版本管理</span>
                <span className="tag"><Star size={12} /> 收藏置顶</span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex" style={{ gap: '16px' }}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>3</div>
            <div>
              <h3 className="font-semibold" style={{ fontSize: 'var(--text-callout)', color: 'var(--text-primary)', marginBottom: '4px' }}>搜索与组织</h3>
              <p style={{ fontSize: 'var(--text-subheadline)', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                使用顶部搜索栏快速查找提示词。通过标签系统对提示词进行分类，利用收藏和置顶功能突出重要内容。支持网格和列表两种视图模式。
              </p>
              <div className="flex flex-wrap" style={{ gap: '6px', marginTop: '8px' }}>
                <span className="tag"><Search size={12} /> 全文搜索</span>
                <span className="tag"><Tag size={12} /> 标签管理</span>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex" style={{ gap: '16px' }}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>4</div>
            <div>
              <h3 className="font-semibold" style={{ fontSize: 'var(--text-callout)', color: 'var(--text-primary)', marginBottom: '4px' }}>备份与迁移</h3>
              <p style={{ fontSize: 'var(--text-subheadline)', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                使用"导入导出"功能将数据导出为 JSON 文件进行备份，或从文件导入数据合并到现有数据库中。建议定期导出备份。
              </p>
              <div className="flex flex-wrap" style={{ gap: '6px', marginTop: '8px' }}>
                <span className="tag"><Download size={12} /> JSON 导出</span>
                <span className="tag"><ArrowRight size={12} /> 数据迁移</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-default)', textAlign: 'right' }}>
          <button type="button" onClick={onClose} className="btn-primary">我知道了</button>
        </div>
      </div>
    </div>
    </>
  )
}
