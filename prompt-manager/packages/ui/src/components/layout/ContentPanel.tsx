import { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '../../stores/app-store'
import { usePrompts } from '../../hooks/usePrompts'
import { useScenes } from '../../hooks/useScenes'
import { useDashboardStats } from '../../hooks/useDashboardStats'
import { PromptCard } from '../prompt/PromptCard'
import { PromptEditor } from '../prompt/PromptEditor'
import { SceneCreateDialog } from '../scene/SceneCreateDialog'
import { TutorialDialog } from '../common/TutorialDialog'
import { HelpCenterDialog } from '../common/HelpCenterDialog'
import { TagManager } from '../settings/TagManager'
import { PreferencesView } from '../settings/PreferencesView'
import { ImportExportView } from '../settings/ImportExportView'
import { PrivacyPolicyView } from '../settings/PrivacyPolicyView'
import { TermsOfServiceView } from '../settings/TermsOfServiceView'
import {
  Plus, Search, FolderOpen, Star, Pin, FolderPlus,
  FileText, Grid3X3, List,
  ArrowRight, HelpCircle, ChevronRight,
  Layers, Heart, CheckSquare, Trash2, X,
} from 'lucide-react'
import { toast } from '../../hooks/useToast'

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.max(0, now - then)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚更新'
  if (mins < 60) return `${mins} 分钟前更新`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} 小时前更新`
  const days = Math.floor(hours / 24)
  if (days === 1) return '昨天更新'
  if (days < 7) return `${days} 天前更新`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks} 周前更新`
  return `${Math.floor(days / 30)} 个月前更新`
}

export function ContentPanel() {
  const selectedSceneId = useAppStore((s) => s.selectedSceneId)
  const sidebarView = useAppStore((s) => s.sidebarView)
  const viewMode = useAppStore((s) => s.viewMode)
  const setViewMode = useAppStore((s) => s.setViewMode)
  const { prompts, loading } = usePrompts(selectedSceneId)
  const { scenes } = useScenes()
  const dashStats = useDashboardStats()
  const setSelectedScene = useAppStore((s) => s.setSelectedScene)
  const setSidebarView = useAppStore((s) => s.setSidebarView)
  const [showEditor, setShowEditor] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showHelpCenter, setShowHelpCenter] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const currentScene = scenes.find((s) => s.id === selectedSceneId)
  const compactLayout = useAppStore((s) => s.compactLayout)

  const filteredPrompts = useMemo(() => {
    if (!searchQuery.trim()) return prompts
    const q = searchQuery.toLowerCase()
    return prompts.filter((p) =>
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    )
  }, [prompts, searchQuery])

  if (!selectedSceneId && sidebarView === 'import-export') {
    return <div className="flex h-full w-full flex-col overflow-y-auto"><ImportExportView /></div>
  }
  if (!selectedSceneId && sidebarView === 'tags') {
    return <div className="flex h-full w-full flex-col overflow-y-auto"><TagManager /></div>
  }
  if (!selectedSceneId && sidebarView === 'preferences') {
    return <div className="flex h-full w-full flex-col overflow-y-auto"><PreferencesView /></div>
  }
  if (!selectedSceneId && sidebarView === 'privacy-policy') {
    return <PrivacyPolicyView />
  }
  if (!selectedSceneId && sidebarView === 'terms-of-service') {
    return <TermsOfServiceView />
  }
  if (!selectedSceneId && (sidebarView === 'favorites' || sidebarView === 'pinned' || sidebarView === 'all-scenes')) {
    return <FilteredPromptsView view={sidebarView} scenes={scenes} />
  }

  /* ===== Dashboard ===== */
  if (!selectedSceneId) {
    return (
      <>
        <div className="flex h-full w-full flex-col overflow-y-auto">
          <div className="max-w-[var(--container-max)] w-full mx-auto" style={{ padding: compactLayout ? '24px 20px 32px' : '32px 24px 40px' }}>
          <div className="flex items-start justify-between" style={{ marginBottom: compactLayout ? '24px' : '32px' }}>
            <div>
              <h1 className="font-bold" style={{ fontSize: 'var(--text-large-title)', color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>仪表盘总览</h1>
              <p style={{ fontSize: 'var(--text-body)', color: 'var(--text-secondary)', marginTop: '4px' }}>查看您的提示词使用情况和最新工作空间动态。</p>
            </div>
            <button type="button" onClick={() => setShowCreate(true)} className="btn-primary shrink-0"><FolderPlus size={15} strokeWidth={2} /> 新建场景</button>
          </div>

          {/* ── Bento 引导卡片（始终显示） ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: compactLayout ? '16px' : '24px', marginBottom: compactLayout ? '24px' : '32px' }}>
            <div className="lg:col-span-2 relative overflow-hidden group cursor-pointer mac-shadow" style={{ padding: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)', animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full" style={{ background: 'rgba(0,122,255,0.1)', filter: 'blur(40px)' }} />
              <div className="flex items-start relative z-10" style={{ gap: '16px' }}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--blue-bg)' }}>
                  <Layers size={24} style={{ color: 'var(--systemBlue)' }} />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ fontSize: 'var(--text-title-2)', color: 'var(--text-primary)', marginBottom: '4px' }}>如何创建场景？</h3>
                  <p style={{ fontSize: 'var(--text-callout)', color: 'var(--text-secondary)', maxWidth: 480, marginBottom: '16px' }}>场景是组织和运行复杂提示词链的独立工作区。通过将多个相关的提示词组合在一起，您可以构建强大的自动化金融分析流程。</p>
                  <button type="button" className="btn-link" style={{ fontSize: 'var(--text-subheadline)' }} onClick={() => setShowTutorial(true)}>查看教程 <ArrowRight size={16} /></button>
                </div>
              </div>
            </div>
            <div className="card flex flex-col justify-between cursor-pointer" style={{ padding: '28px', animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) 0.05s both' }}>
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--warning-bg)', marginBottom: '16px' }}>
                  <HelpCircle size={18} style={{ color: 'var(--systemOrange)' }} />
                </div>
                <h3 className="font-semibold" style={{ fontSize: 'var(--text-title-3)', color: 'var(--text-primary)', marginBottom: '4px' }}>需要帮助？</h3>
                <p className="truncate-2" style={{ fontSize: 'var(--text-subheadline)', color: 'var(--text-secondary)' }}>浏览我们的知识库或联系支持团队获取技术协助。</p>
              </div>
              <button type="button" className="btn-secondary w-full" style={{ marginTop: '16px' }} onClick={() => setShowHelpCenter(true)}>访问帮助中心</button>
            </div>
          </div>

          <h2 className="font-semibold" style={{ fontSize: 'var(--text-title-2)', color: 'var(--text-primary)', marginBottom: '16px' }}>关键指标</h2>
          <div className="grid grid-cols-3" style={{ gap: compactLayout ? '16px' : '24px', marginBottom: compactLayout ? '24px' : '32px' }}>
            {[
              { label: '场景总数', value: scenes.length, icon: Layers, iconBg: 'rgba(166,73,213,0.1)', iconColor: '#a649d5' },
              { label: '提示词总数', value: dashStats.totalPrompts, icon: FileText, iconBg: 'var(--blue-bg)', iconColor: 'var(--systemBlue)' },
              { label: '收藏提示词', value: dashStats.favoritePrompts, icon: Heart, iconBg: 'var(--warning-bg)', iconColor: 'var(--systemOrange)' },
            ].map((stat, i) => (
              <div key={i} className="card flex items-center" style={{ padding: '24px', gap: '20px', animation: `slideUp 200ms ease-out ${i * 50}ms both` }}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: stat.iconBg }}>
                  <stat.icon size={22} style={{ color: stat.iconColor }} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-medium uppercase tracking-wider" style={{ fontSize: 'var(--text-caption)', color: 'var(--text-secondary)', marginBottom: '2px' }}>{stat.label}</p>
                  <div className="flex items-baseline" style={{ gap: '8px' }}>
                    <span className="font-bold tabular-nums" style={{ fontSize: 'var(--text-large-title)', color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>{stat.value}</span>
                    {stat.value > 0 && <span className="flex items-center" style={{ fontSize: 'var(--text-caption)', color: 'var(--systemGreen)' }}>↑ 本周活跃</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {scenes.length > 0 && (
            <>
              <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                <h2 className="font-semibold" style={{ fontSize: 'var(--text-title-2)', color: 'var(--text-primary)' }}>最近场景</h2>
                <button type="button" className="btn-link" style={{ fontSize: 'var(--text-subheadline)' }} onClick={() => { setSidebarView('all-scenes'); setSelectedScene(null) }}>查看全部</button>
              </div>
              <div className="card overflow-hidden">
                {scenes.slice(0, 5).map((scene, i) => (
                  <button type="button"
                    key={scene.id}
                    onClick={() => useAppStore.getState().setSelectedScene(scene.id)}
                    className="flex items-center justify-between w-full text-left group transition-colors"
                    style={{ padding: '16px 24px', borderBottom: i < Math.min(scenes.length, 5) - 1 ? '1px solid var(--border-default)' : 'none', animation: `slideUp 200ms ease-out ${i * 40}ms both` }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    <div className="flex items-center" style={{ gap: '16px' }}>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'var(--bg-hover)' }}>
                        <span className="text-lg">{scene.icon || '📁'}</span>
                      </div>
                      <div>
                        <div className="font-semibold" style={{ fontSize: 'var(--text-headline)', color: 'var(--text-primary)' }}>{scene.name}</div>
                        <div style={{ fontSize: 'var(--text-footnote)', color: 'var(--text-secondary)', marginTop: '2px' }}>{scene.description ? scene.description.slice(0, 40) : `包含 0 个提示词节点`} · {relativeTime(scene.updatedAt)}</div>
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} className="transition-colors group-hover:text-[var(--systemBlue)]" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      {showCreate && <SceneCreateDialog onClose={() => setShowCreate(false)} />}
      {showTutorial && <TutorialDialog onClose={() => setShowTutorial(false)} />}
      {showHelpCenter && <HelpCenterDialog onClose={() => setShowHelpCenter(false)} />}
      </>
    )
  }

  /* ===== 场景详情 ===== */
  const favoriteCount = prompts.filter((p) => p.isFavorite).length
  const pinnedCount = prompts.filter((p) => p.isPinned).length

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      <div className="max-w-[var(--container-max)] w-full mx-auto" style={{ padding: compactLayout ? '24px 20px 32px' : '32px 24px 40px' }}>
        <div className="flex items-start justify-between" style={{ marginBottom: compactLayout ? '24px' : '32px' }}>
          <div>
            <h1 className="font-bold flex items-center" style={{ fontSize: 'var(--text-large-title)', color: 'var(--text-primary)', letterSpacing: '-0.4px', gap: '8px' }}>
              <span>{currentScene?.icon || '📁'}</span>{currentScene?.name || '提示词'}
            </h1>
            {currentScene?.description && (
              <p className="truncate-2" style={{ fontSize: 'var(--text-callout)', color: 'var(--text-secondary)', maxWidth: 600, marginTop: '4px' }}>{currentScene.description}</p>
            )}
          </div>
          <button type="button" onClick={() => setShowEditor(true)} className="btn-primary shrink-0"><Plus size={15} strokeWidth={2} /> 新建提示词</button>
        </div>

        <section className="grid grid-cols-3" style={{ gap: compactLayout ? '16px' : '24px', marginBottom: compactLayout ? '24px' : '32px' }}>
          {[
            { label: '提示词总数', value: prompts.length, icon: FileText, iconBg: 'var(--blue-bg)', iconColor: 'var(--systemBlue)' },
            { label: '收藏', value: favoriteCount, icon: Star, iconBg: 'var(--warning-bg)', iconColor: 'var(--systemOrange)' },
            { label: '已置顶', value: pinnedCount, icon: Pin, iconBg: 'var(--success-bg)', iconColor: 'var(--systemGreen)' },
          ].map((m, i) => (
            <div key={i} className="rounded-xl border" style={{ padding: '24px', background: 'var(--bg-surface)', borderColor: 'var(--border-default)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', animation: `slideUp 200ms ease-out ${i * 50}ms both` }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: m.iconBg, marginBottom: '8px' }}>
                <m.icon size={18} style={{ color: m.iconColor }} strokeWidth={1.5} />
              </div>
              <div className="font-bold tabular-nums" style={{ fontSize: 'var(--text-title-1)', color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: '2px' }}>{m.value}</div>
              <div style={{ fontSize: 'var(--text-subheadline)', color: 'var(--text-secondary)' }}>{m.label}</div>
            </div>
          ))}
        </section>

        <div className="flex flex-wrap items-center justify-between" style={{ gap: '16px', marginBottom: '24px' }}>
          <div className="segmented-control">
            <button type="button" onClick={() => setViewMode('grid')} className={`segmented-btn ${viewMode === 'grid' ? 'active' : ''}`}><Grid3X3 size={14} /> 卡片视图</button>
            <button type="button" onClick={() => setViewMode('list')} className={`segmented-btn ${viewMode === 'list' ? 'active' : ''}`}><List size={14} /> 列表视图</button>
          </div>
          <div className="flex items-center flex-1 max-w-72" style={{ gap: '8px' }}>
            <div className="flex items-center flex-1 rounded-lg" style={{ gap: '8px', padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
              <Search size={14} style={{ color: 'var(--text-tertiary)' }} strokeWidth={1.5} />
              <input type="text" aria-label="搜索提示词" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="搜索标题、内容、标签..." maxLength={200} className="flex-1 bg-transparent outline-none" style={{ fontSize: 'var(--text-subheadline)', color: 'var(--text-primary)' }} />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center" style={{ padding: '96px 0', gap: '16px' }}>
            <div className="h-6 w-6 rounded-full border-2 border-[var(--systemBlue)] border-t-transparent" style={{ animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontSize: 'var(--text-callout)', color: 'var(--text-secondary)' }}>加载中...</span>
          </div>
        ) : filteredPrompts.length === 0 && searchQuery ? (
          <div className="flex flex-col items-center justify-center" style={{ padding: '96px 0', gap: '16px' }}>
            <Search size={32} style={{ color: 'var(--text-tertiary)' }} strokeWidth={1.5} />
            <div className="text-center">
              <p className="font-medium" style={{ fontSize: 'var(--text-body)', color: 'var(--text-primary)' }}>未找到匹配结果</p>
              <p style={{ fontSize: 'var(--text-footnote)', color: 'var(--text-secondary)', marginTop: '4px' }}>尝试使用不同的关键词</p>
            </div>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center" style={{ padding: '96px 0', gap: '16px' }}>
            <div className="flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: 'var(--bg-hover)' }}><FileText size={24} style={{ color: 'var(--text-tertiary)' }} /></div>
            <div className="text-center max-w-xs">
              <p className="font-medium" style={{ fontSize: 'var(--text-body)', color: 'var(--text-primary)' }}>这个场景还没有提示词</p>
              <p style={{ fontSize: 'var(--text-footnote)', color: 'var(--text-secondary)', marginTop: '4px' }}>创建第一个 AI 提示词来开始使用</p>
            </div>
            <button type="button" onClick={() => setShowEditor(true)} className="btn-primary"><Plus size={15} /> 创建提示词</button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 xl:grid-cols-3" style={{ gap: compactLayout ? '16px' : '24px' }}>
            {filteredPrompts.map((prompt, i) => (<PromptCard key={prompt.id} prompt={prompt} index={i} />))}
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: compactLayout ? '12px' : '24px' }}>
            {filteredPrompts.map((prompt, i) => (<PromptCard key={prompt.id} prompt={prompt} listView index={i} />))}
          </div>
        )}

        {!loading && filteredPrompts.length > 0 && (
          <div className="flex items-center" style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-default)' }}>
            <span style={{ fontSize: 'var(--text-footnote)', color: 'var(--text-secondary)' }}>共 {filteredPrompts.length} 个提示词{searchQuery && filteredPrompts.length !== prompts.length && (<span>（共 {prompts.length} 个）</span>)}</span>
          </div>
        )}
      </div>
      {showEditor && <PromptEditor sceneId={selectedSceneId} onClose={() => setShowEditor(false)} />}
    </div>
  )
}

/* ===== Filtered prompts sub-component ===== */
function FilteredPromptsView({ view, scenes }: { view: 'all-scenes' | 'favorites' | 'pinned'; scenes: ReturnType<typeof useScenes>['scenes'] }) {
  const promptRepo = useAppStore((s) => s.promptRepo)
  const refreshKey = useAppStore((s) => s.refreshKey)
  const compactLayout = useAppStore((s) => s.compactLayout)
  const [prompts, setPrompts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [allTags, setAllTags] = useState<string[]>([])
  const [filterTag, setFilterTag] = useState('')
  const [sortKey, setSortKey] = useState<'updated' | 'created' | 'title'>('updated')
  const [batchMode, setBatchMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const refresh = useAppStore((s) => s.refresh)
  const setSelectedPrompt = useAppStore((s) => s.setSelectedPrompt)
  const setSelectedScene = useAppStore((s) => s.setSelectedScene)

  const toggleSelection = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const batchAction = async (action: 'favorite' | 'pinned' | 'delete') => {
    if (!promptRepo || selected.size === 0) return
    const ids = Array.from(selected)
    try {
      if (action === 'delete') {
        for (const id of ids) await promptRepo.delete(id)
        toast.success(`已删除 ${ids.length} 个提示词`)
      } else {
        const val = action === 'favorite' ? 'is_favorite' : 'is_pinned'
        for (const id of ids) { await promptRepo.update(id, { [val === 'is_favorite' ? 'isFavorite' : 'isPinned']: true } as any) }
        toast.success(`已${action === 'favorite' ? '收藏' : '置顶'} ${ids.length} 个提示词`)
      }
      setSelected(new Set())
      setBatchMode(false)
      refresh()
    } catch { toast.error('批量操作失败') }
  }

  const config = {
    'all-scenes': { title: '全部场景', icon: FolderOpen, desc: '浏览所有场景下的提示词' },
    'favorites': { title: '我的收藏', icon: Star, desc: '查看所有已收藏的提示词' },
    'pinned': { title: '已置顶', icon: Pin, desc: '查看所有已置顶的提示词' },
  }[view]

  useEffect(() => {
    if (!promptRepo) return
    let cancelled = false
    setLoading(true)
    const opts = view === 'favorites' ? { onlyFavorite: true } : view === 'pinned' ? { onlyPinned: true } : undefined
    promptRepo.findAll(opts).then((data) => { if (!cancelled) setPrompts(data) }).catch((err) => { console.error('[FilteredPromptsView]', err); if (!cancelled) setPrompts([]) }).finally(() => { if (!cancelled) setLoading(false) })
    promptRepo.findAllTags().then((tags) => { if (!cancelled) setAllTags(tags) }).catch(() => {})
    return () => { cancelled = true }
  }, [promptRepo, view, refreshKey])

  const filteredPrompts = useMemo(() => {
    let result = prompts
    if (filterTag) result = result.filter((p: any) => p.tags?.includes(filterTag))
    result = [...result].sort((a: any, b: any) => {
      if (sortKey === 'title') return (a.title || '').localeCompare(b.title || '')
      if (sortKey === 'created') return (b.createdAt || '').localeCompare(a.createdAt || '')
      return (b.updatedAt || '').localeCompare(a.updatedAt || '')
    })
    return result
  }, [prompts, filterTag, sortKey])

  const Icon = config.icon

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      <div className="max-w-[var(--container-max)] w-full mx-auto" style={{ padding: compactLayout ? '24px 20px 32px' : '32px 24px 40px' }}>
        <div className="flex items-center" style={{ gap: '8px', marginBottom: '8px' }}>
          <Icon size={22} style={{ color: 'var(--systemBlue)' }} strokeWidth={1.5} />
          <h1 className="font-bold" style={{ fontSize: 'var(--text-large-title)', color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>{config.title}</h1>
        </div>
        <p style={{ fontSize: 'var(--text-body)', color: 'var(--text-secondary)', marginBottom: '24px' }}>{config.desc}</p>

        <div className="flex flex-wrap items-center" style={{ gap: '16px', marginBottom: '24px' }}>
          <div className="flex items-center" style={{ gap: '8px' }}>
            <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)} className="input-field !w-auto" style={{ fontSize: 'var(--text-subheadline)', paddingTop: '8px', paddingBottom: '8px' }}>
              <option value="">所有标签</option>
              {allTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
            </select>
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as any)} className="input-field !w-auto" style={{ fontSize: 'var(--text-subheadline)', paddingTop: '8px', paddingBottom: '8px' }}>
              <option value="updated">最近更新</option>
              <option value="created">创建时间</option>
              <option value="title">按标题</option>
            </select>
          </div>
          <button type="button" onClick={() => { setBatchMode(!batchMode); setSelected(new Set()) }} className={`btn-secondary ${batchMode ? '!border-[var(--systemBlue)] !text-[var(--systemBlue)] !bg-[var(--blue-bg)]' : ''}`} style={{ fontSize: 'var(--text-subheadline)', marginLeft: 'auto' }}>
            <CheckSquare size={14} strokeWidth={1.5} />{batchMode ? '取消选择' : '批量操作'}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center" style={{ padding: '96px 0' }}><div className="h-6 w-6 rounded-full border-2 border-[var(--systemBlue)] border-t-transparent" style={{ animation: 'spin 0.8s linear infinite' }} /></div>
        ) : filteredPrompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center" style={{ padding: '96px 0', gap: '16px' }}>
            <Icon size={32} style={{ color: 'var(--text-tertiary)' }} strokeWidth={1.5} />
            <p style={{ fontSize: 'var(--text-body)', color: 'var(--text-secondary)' }}>暂无{config.title}数据</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            {filteredPrompts.map((prompt: any, i: number) => {
              const scene = scenes.find((s) => s.id === prompt.sceneId)
              return (
                <div key={prompt.id} onClick={() => { if (batchMode) toggleSelection(prompt.id); else { setSelectedScene(prompt.sceneId); setSelectedPrompt(prompt.id) } }}
                  className="flex items-center cursor-pointer transition-colors"
                  style={{ gap: compactLayout ? '12px' : '16px', padding: compactLayout ? '12px' : '16px', borderBottom: i < filteredPrompts.length - 1 ? '1px solid var(--border-default)' : 'none', animation: `slideUp 200ms ease-out ${Math.min(i, 20) * 30}ms both` }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                >
                  {batchMode && <input type="checkbox" checked={selected.has(prompt.id)} onChange={() => toggleSelection(prompt.id)} onClick={(e) => e.stopPropagation()} className="shrink-0 w-4 h-4 rounded" />}
                  <span className="text-lg">{scene?.icon || '📁'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center" style={{ gap: '8px' }}>
                      <span className="font-semibold truncate" style={{ fontSize: 'var(--text-headline)', color: 'var(--text-primary)' }}>{prompt.title}</span>
                      {prompt.isFavorite && <Star size={12} fill="var(--systemOrange)" style={{ color: 'var(--systemOrange)' }} />}
                      {prompt.isPinned && <Pin size={12} style={{ color: 'var(--systemBlue)' }} />}
                    </div>
                    <p className="truncate" style={{ fontSize: 'var(--text-footnote)', color: 'var(--text-secondary)', marginTop: '2px' }}>{prompt.content || '（空内容）'}</p>
                  </div>
                  <div className="hidden md:flex items-center shrink-0" style={{ gap: '8px' }}>{(prompt.tags || []).slice(0, 2).map((tag: string) => <span key={tag} className="tag-accent">{tag}</span>)}</div>
                  <span style={{ fontSize: 'var(--text-footnote)', color: 'var(--text-tertiary)' }}>{scene?.name}</span>
                  <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              )
            })}
          </div>
        )}

        {!loading && filteredPrompts.length > 0 && (
          <div className="flex items-center" style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-default)' }}>
            <span style={{ fontSize: 'var(--text-footnote)', color: 'var(--text-secondary)' }}>共 {filteredPrompts.length} 个提示词{filterTag && filteredPrompts.length !== prompts.length && (<span>（共 {prompts.length} 个）</span>)}</span>
          </div>
        )}
      </div>

      {batchMode && selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center rounded-xl" style={{ gap: '16px', padding: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow-lg)', animation: 'slideUp 200ms ease-out' }}>
          <span style={{ fontSize: 'var(--text-subheadline)', color: 'var(--text-primary)', fontWeight: 'var(--weight-semibold)' }}>已选 {selected.size} 项</span>
          <div className="h-4 w-px" style={{ background: 'var(--border-default)' }} />
          <button type="button" onClick={() => batchAction('favorite')} className="btn-secondary" style={{ fontSize: 'var(--text-subheadline)' }}><Star size={14} /> 批量收藏</button>
          <button type="button" onClick={() => batchAction('pinned')} className="btn-secondary" style={{ fontSize: 'var(--text-subheadline)' }}><Pin size={14} /> 批量置顶</button>
          <button type="button" onClick={() => batchAction('delete')} className="btn-danger" style={{ fontSize: 'var(--text-subheadline)' }}><Trash2 size={14} /> 删除</button>
          <button type="button" onClick={() => setSelected(new Set())} className="btn-icon !w-7 !h-7" title="清空选择"><X size={14} /></button>
        </div>
      )}
    </div>
  )
}
