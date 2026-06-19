import { useAppStore } from '../../stores/app-store'
import { Shield, ArrowLeft } from 'lucide-react'

export function PrivacyPolicyView() {
  const setSidebarView = useAppStore((s) => s.setSidebarView)

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      <div className="max-w-[var(--container-max)] w-full mx-auto" style={{ padding: '32px 24px 40px' }}>
        {/* Back button */}
        <button type="button"
          onClick={() => setSidebarView('preferences')}
          className="flex items-center text-sm transition-opacity hover:opacity-70"
          style={{ gap: '6px', color: 'var(--systemBlue)', marginBottom: '24px' }}
        >
          <ArrowLeft size={16} /> 返回设置
        </button>

        <div className="flex items-center" style={{ gap: '8px', marginBottom: '24px' }}>
          <Shield size={24} style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
          <h1 className="font-bold" style={{ fontSize: 'var(--text-title-1)', color: 'var(--text-primary)' }}>隐私政策</h1>
        </div>
        <p style={{ fontSize: 'var(--text-footnote)', color: 'var(--text-tertiary)', marginBottom: '32px' }}>
          最后更新日期：2026 年 6 月 19 日
        </p>

        <div className="flex flex-col" style={{ gap: '24px' }}>
          <section className="card" style={{ padding: '24px' }}>
            <h2 className="font-semibold" style={{ fontSize: 'var(--text-title-3)', color: 'var(--text-primary)', marginBottom: '12px' }}>1. 信息收集</h2>
            <div style={{ fontSize: 'var(--text-subheadline)', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '8px' }}>我们仅收集您主动存储的数据，包括：</p>
              <ul style={{ paddingLeft: '20px', marginBottom: '8px' }}>
                <li>提示词内容、标题、标签及版本历史</li>
                <li>场景名称、描述及其组织结构</li>
                <li>应用偏好设置（主题、视图模式、布局模式）</li>
              </ul>
              <p>所有数据存储在您设备的本地数据库（SQLite）中，不会自动上传至任何远程服务器。</p>
            </div>
          </section>

          <section className="card" style={{ padding: '24px' }}>
            <h2 className="font-semibold" style={{ fontSize: 'var(--text-title-3)', color: 'var(--text-primary)', marginBottom: '12px' }}>2. 数据使用</h2>
            <div style={{ fontSize: 'var(--text-subheadline)', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '8px' }}>收集的数据仅用于：</p>
              <ul style={{ paddingLeft: '20px' }}>
                <li>提供提示词管理、搜索和版本控制功能</li>
                <li>本地全文搜索索引的构建与重建</li>
                <li>应用的个性化显示（主题、布局偏好）</li>
                <li>导出备份文件（由您主动触发的导出操作）</li>
              </ul>
            </div>
          </section>

          <section className="card" style={{ padding: '24px' }}>
            <h2 className="font-semibold" style={{ fontSize: 'var(--text-title-3)', color: 'var(--text-primary)', marginBottom: '12px' }}>3. 数据存储与安全</h2>
            <div style={{ fontSize: 'var(--text-subheadline)', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              <p>数据存储在您设备的本地数据库中。我们采用行业标准的加密措施保护您的数据。导出文件为 JSON 格式，您应自行妥善保管导出文件。如使用 Tauri 桌面版本，数据存储在操作系统提供的应用沙盒目录中。</p>
            </div>
          </section>

          <section className="card" style={{ padding: '24px' }}>
            <h2 className="font-semibold" style={{ fontSize: 'var(--text-title-3)', color: 'var(--text-primary)', marginBottom: '12px' }}>4. 数据导出与删除</h2>
            <div style={{ fontSize: 'var(--text-subheadline)', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '8px' }}>您对自己的数据拥有完全的控制权：</p>
              <ul style={{ paddingLeft: '20px' }}>
                <li>可随时通过"导入导出"功能导出所有数据为 JSON 文件</li>
                <li>可删除单个提示词、场景或清空所有本地数据</li>
                <li>清除缓存将删除所有本地存储数据，此操作不可撤销</li>
                <li>卸载应用将彻底删除所有本地数据</li>
              </ul>
            </div>
          </section>

          <section className="card" style={{ padding: '24px' }}>
            <h2 className="font-semibold" style={{ fontSize: 'var(--text-title-3)', color: 'var(--text-primary)', marginBottom: '12px' }}>5. 第三方服务</h2>
            <div style={{ fontSize: 'var(--text-subheadline)', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              <p>本应用不集成任何第三方分析、广告或跟踪服务。不收集使用统计数据，不向第三方共享任何数据。如您使用 LLM API（如 OpenAI、Anthropic）调用提示词，相关请求将直接发往您配置的 API 端点，我们不会代理或记录这些请求的内容。</p>
            </div>
          </section>

          <section className="card" style={{ padding: '24px' }}>
            <h2 className="font-semibold" style={{ fontSize: 'var(--text-title-3)', color: 'var(--text-primary)', marginBottom: '12px' }}>6. 政策更新</h2>
            <div style={{ fontSize: 'var(--text-subheadline)', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              <p>本隐私政策可能适时更新。更新后的政策将在应用内显示，并注明最后更新日期。继续使用应用即表示您同意更新后的政策。</p>
            </div>
          </section>

          <section className="card" style={{ padding: '24px' }}>
            <h2 className="font-semibold" style={{ fontSize: 'var(--text-title-3)', color: 'var(--text-primary)', marginBottom: '12px' }}>7. 联系我们</h2>
            <div style={{ fontSize: 'var(--text-subheadline)', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              <p>如对本隐私政策有任何疑问，请通过以下方式联系我们：</p>
              <p style={{ marginTop: '8px' }}>
                📧 <a href="mailto:lantian_ye@outlook.com" style={{ color: 'var(--systemBlue)' }}>lantian_ye@outlook.com</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
