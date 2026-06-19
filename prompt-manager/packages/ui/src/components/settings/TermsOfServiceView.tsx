import { useAppStore } from '../../stores/app-store'
import { FileText, ArrowLeft } from 'lucide-react'

export function TermsOfServiceView() {
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
          <FileText size={24} style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
          <h1 className="font-bold" style={{ fontSize: 'var(--text-title-1)', color: 'var(--text-primary)' }}>服务条款</h1>
        </div>
        <p style={{ fontSize: 'var(--text-footnote)', color: 'var(--text-tertiary)', marginBottom: '32px' }}>
          最后更新日期：2026 年 6 月 19 日
        </p>

        <div className="flex flex-col" style={{ gap: '24px' }}>
          <section className="card" style={{ padding: '24px' }}>
            <h2 className="font-semibold" style={{ fontSize: 'var(--text-title-3)', color: 'var(--text-primary)', marginBottom: '12px' }}>1. 服务的接受</h2>
            <div style={{ fontSize: 'var(--text-subheadline)', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              <p>使用本提示词管理应用（以下简称"本应用"）即表示您同意本条款。如您不同意任何条款，请勿使用本应用。本应用是本地优先的工具，核心功能无需联网即可运行。</p>
            </div>
          </section>

          <section className="card" style={{ padding: '24px' }}>
            <h2 className="font-semibold" style={{ fontSize: 'var(--text-title-3)', color: 'var(--text-primary)', marginBottom: '12px' }}>2. 许可授予</h2>
            <div style={{ fontSize: 'var(--text-subheadline)', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              <p>我们授予您有限的、非排他性的、不可转让的许可，允许您在个人或企业设备上安装和使用本应用，用于管理和组织 AI 提示词及相关工作流程。本应用仅供内部使用，不得用于任何违法活动。</p>
            </div>
          </section>

          <section className="card" style={{ padding: '24px' }}>
            <h2 className="font-semibold" style={{ fontSize: 'var(--text-title-3)', color: 'var(--text-primary)', marginBottom: '12px' }}>3. 用户责任</h2>
            <div style={{ fontSize: 'var(--text-subheadline)', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '8px' }}>您同意在使用本应用时遵守以下规则：</p>
              <ul style={{ paddingLeft: '20px' }}>
                <li>不利用本应用存储或传播违法、侵权、骚扰、欺诈或其他不当内容</li>
                <li>不对本应用进行逆向工程、反编译或试图获取源代码（开源许可的除外）</li>
                <li>不试图破坏、干扰或滥用本应用的任何功能</li>
                <li>负责妥善备份导出数据，本应用不承担因数据丢失造成的损失</li>
                <li>遵守适用的法律法规</li>
              </ul>
            </div>
          </section>

          <section className="card" style={{ padding: '24px' }}>
            <h2 className="font-semibold" style={{ fontSize: 'var(--text-title-3)', color: 'var(--text-primary)', marginBottom: '12px' }}>4. 知识产权</h2>
            <div style={{ fontSize: 'var(--text-subheadline)', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              <p>本应用（包括其代码、设计、UI 组件和架构）的知识产权归开发团队所有。您存储在本应用中的提示词内容和数据归您所有。本条款不转让任何知识产权。</p>
            </div>
          </section>

          <section className="card" style={{ padding: '24px' }}>
            <h2 className="font-semibold" style={{ fontSize: 'var(--text-title-3)', color: 'var(--text-primary)', marginBottom: '12px' }}>5. 免责声明</h2>
            <div style={{ fontSize: 'var(--text-subheadline)', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              <p>本应用按"现状"提供，不提供任何明示或暗示的保证，包括但不限于适销性、特定用途适用性和非侵权性。我们不保证本应用的功能不会中断或没有错误。使用本应用所产生的一切风险由您自行承担。</p>
            </div>
          </section>

          <section className="card" style={{ padding: '24px' }}>
            <h2 className="font-semibold" style={{ fontSize: 'var(--text-title-3)', color: 'var(--text-primary)', marginBottom: '12px' }}>6. 责任限制</h2>
            <div style={{ fontSize: 'var(--text-subheadline)', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              <p>在法律允许的最大范围内，我们不对因使用或无法使用本应用而产生的任何间接、附带、特殊或后果性损害承担责任，包括但不限于数据丢失、业务中断或利润损失。</p>
            </div>
          </section>

          <section className="card" style={{ padding: '24px' }}>
            <h2 className="font-semibold" style={{ fontSize: 'var(--text-title-3)', color: 'var(--text-primary)', marginBottom: '12px' }}>7. 终止</h2>
            <div style={{ fontSize: 'var(--text-subheadline)', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              <p>我们保留在任何时候终止或暂停您使用本应用的权利，前提是您违反了本条款中的任何规定。终止后，您应停止使用本应用并删除所有本地数据。条款中有关知识产权和责任限制的部分在终止后继续有效。</p>
            </div>
          </section>

          <section className="card" style={{ padding: '24px' }}>
            <h2 className="font-semibold" style={{ fontSize: 'var(--text-title-3)', color: 'var(--text-primary)', marginBottom: '12px' }}>8. 适用法律</h2>
            <div style={{ fontSize: 'var(--text-subheadline)', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              <p>本条款受中华人民共和国法律管辖。如有争议，双方应首先友好协商解决；协商不成的，提交有管辖权的人民法院裁决。</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
