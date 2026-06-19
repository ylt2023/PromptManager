import { useState } from 'react'
import { X, HelpCircle, ChevronDown, ChevronRight, ExternalLink, Mail } from 'lucide-react'

interface FAQItem {
  q: string
  a: string
}

const faqs: FAQItem[] = [
  {
    q: '提示词存储在哪里？数据安全吗？',
    a: '所有提示词数据存储在您设备的本地 SQLite 数据库中，不会自动上传至任何远程服务器。应用不会收集分析数据或使用统计信息。导出备份为 JSON 文件，请妥善保管。',
  },
  {
    q: '如何在不同设备之间同步数据？',
    a: '目前应用为本地优先架构，暂不支持自动云同步。您可以通过"导入导出"功能手动备份数据（导出为 JSON 文件），然后在另一台设备上导入。',
  },
  {
    q: '场景和提示词的关系是什么？',
    a: '场景是组织提示词的工作区。一个场景包含多个提示词，用于特定业务领域。例如您可以为"客服对话"和"代码审查"分别创建不同的场景，每个场景下管理对应的提示词集合。',
  },
  {
    q: '标签系统如何使用？',
    a: '标签用于对提示词进行分类和筛选。在编辑提示词时可以添加标签。您可以在侧边栏的"标签管理"中查看所有标签、重命名或删除标签。在全部场景/收藏/置顶视图中可按标签筛选提示词。',
  },
  {
    q: '收藏和置顶有什么区别？',
    a: '收藏（★）用于标记您最常使用的提示词，可在侧边栏"我的收藏"中集中查看。置顶（📌）用于将重要提示词固定在列表顶部，可在"已置顶"视图中查看。两者可以同时设置。',
  },
  {
    q: '版本管理如何工作？',
    a: '每次编辑提示词内容时，系统会自动保存上一个版本。您可以在提示词详情面板中查看版本历史、比较版本差异（diff 视图），以及恢复到任意历史版本。',
  },
  {
    q: '搜索功能支持哪些方式？',
    a: '应用提供全文搜索，支持按标题、内容、标签关键词搜索。搜索使用 SQLite FTS5 全文搜索引擎（若不可用则自动回退到 LIKE 模糊搜索）。在搜索框中输入关键词即可实时过滤。',
  },
  {
    q: '如何恢复误删的数据？',
    a: '如果之前导出了备份文件，可以通过"导入导出"功能导入恢复。如果没有备份，已删除的数据无法恢复。建议定期导出备份。',
  },
  {
    q: '桌面版和 Web 版有什么区别？',
    a: '桌面版使用 Tauri 框架，提供原生窗口体验和操作系统级的文件访问，数据存储在系统应用沙盒目录中。Web 版运行在浏览器中，使用相同的底层存储引擎(sql.js)，功能一致。',
  },
]

export function HelpCenterDialog({ onClose }: { onClose: () => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'var(--bg-overlay)', transform: 'translateZ(0)' }} onClick={onClose} />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ padding: '32px', pointerEvents: 'none', transform: 'translateZ(0)' }}
      >
      <div
        className="w-full max-w-[600px] rounded-xl overflow-y-auto"
        style={{
          pointerEvents: 'auto',
          maxHeight: '80vh',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          animation: 'scaleIn 200ms ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-default)' }}>
          <div className="flex items-center" style={{ gap: '8px' }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ background: 'var(--warning-bg)' }}>
              <HelpCircle size={16} style={{ color: 'var(--systemOrange)' }} />
            </div>
            <h2 className="font-semibold" style={{ fontSize: 'var(--text-title-3)', color: 'var(--text-primary)' }}>
              帮助中心
            </h2>
          </div>
          <button type="button" onClick={onClose} className="btn-icon" title="关闭"><X size={16} /></button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: 'var(--text-subheadline)', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            浏览以下常见问题，了解应用的使用方法。
          </p>

          {/* FAQ accordion */}
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={idx}
                className="rounded-lg transition-colors"
                style={{
                  border: '1px solid var(--border-default)',
                  overflow: 'hidden',
                }}
              >
                <button type="button"
                  onClick={() => toggleFAQ(idx)}
                  className="flex items-center justify-between w-full text-left transition-colors hover:bg-[var(--bg-hover)]"
                  style={{
                    padding: '14px 16px',
                    gap: '12px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <span className="font-medium" style={{ fontSize: 'var(--text-subheadline)', color: 'var(--text-primary)' }}>
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronDown size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                  ) : (
                    <ChevronRight size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                  )}
                </button>
                {isOpen && (
                  <div style={{ padding: '0 16px 14px', fontSize: 'var(--text-subheadline)', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-default)' }}>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            仍有疑问？请通过{' '}
            <a href="mailto:lantian_ye@outlook.com" style={{ color: 'var(--systemBlue)' }}>
              <Mail size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />
              lantian_ye@outlook.com
            </a>
            {' '}联系我们。
          </p>
        </div>
      </div>
    </div>
    </>
  )
}