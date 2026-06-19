import type { IStorageAdapter } from '../storage/types'
import { generateId, now } from '../services/id-service'

export async function seedSampleData(adapter: IStorageAdapter): Promise<void> {
  // Check if data already exists
  const count = await adapter.selectOne<{ count: number }>('SELECT COUNT(*) as count FROM scenes')
  if (count && count.count > 0) return

  const ts = now()

  // === Scenes ===
  const sceneIds = {
    customerService: generateId(),
    codeReview: generateId(),
    dataAnalysis: generateId(),
    marketing: generateId(),
    finance: generateId(),
  }

  const scenes = [
    { id: sceneIds.customerService, name: '客服对话', description: '客户服务场景下的 AI 对话提示词，处理用户咨询、投诉和售后问题', icon: '💬', parentId: null, sortOrder: 0, isPinned: 0 },
    { id: sceneIds.codeReview, name: '代码审查', description: '代码审查助手提示词集合，支持多语言代码质量检查和安全审计', icon: '🔍', parentId: null, sortOrder: 1, isPinned: 1 },
    { id: sceneIds.dataAnalysis, name: '数据分析', description: '数据分析场景，涵盖报表生成、趋势预测和数据可视化', icon: '📊', parentId: null, sortOrder: 2, isPinned: 0 },
    { id: sceneIds.marketing, name: '营销文案', description: '营销推广场景下的文案生成提示词，适配多渠道传播需求', icon: '📢', parentId: null, sortOrder: 3, isPinned: 0 },
    { id: sceneIds.finance, name: '财务报告', description: '财务报表生成场景，支持资产负债表、利润表等标准财务文档', icon: '💰', parentId: null, sortOrder: 4, isPinned: 1 },
  ]

  for (const scene of scenes) {
    await adapter.execute(
      `INSERT INTO scenes (id, name, description, parent_id, icon, sort_order, is_pinned, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [scene.id, scene.name, scene.description, scene.parentId, scene.icon, scene.sortOrder, scene.isPinned, ts, ts]
    )
  }

  // === Prompts ===
  const prompts = [
    // Customer Service
    {
      sceneId: sceneIds.customerService,
      title: '通用客服应答',
      content: '你是一位专业的客服代表。请以友善、耐心的态度回答客户问题。遵循以下原则：\n\n1. 先确认客户的问题\n2. 提供清晰简洁的回答\n3. 如需更多信息，礼貌地请求\n4. 结束时确认问题是否已解决\n5. 始终保持专业和同理心',
      tags: '["客服","通用","FAQ"]',
      isFavorite: 1,
      isPinned: 0,
    },
    {
      sceneId: sceneIds.customerService,
      title: '投诉处理专家',
      content: '你是一位经验丰富的投诉处理专员。面对客户投诉时：\n\n1. 首先表示理解和歉意\n2. 认真倾听并记录问题细节\n3. 提出具体的解决方案和时间表\n4. 主动跟进确保满意\n5. 记录问题用于改进服务流程\n\n语气要真诚，避免推诿和敷衍。',
      tags: '["投诉","升级处理","客户满意度"]',
      isFavorite: 0,
      isPinned: 0,
    },
    {
      sceneId: sceneIds.customerService,
      title: '售后支持引导',
      content: '你是售后技术支持人员。帮助客户解决产品使用中的技术问题：\n\n1. 确认产品名称和型号\n2. 了解问题现象和发生时间\n3. 提供分步骤的排查方案\n4. 如无法远程解决，安排上门服务\n5. 记录技术案例供团队参考',
      tags: '["售后","技术支持","问题排查"]',
      isFavorite: 0,
      isPinned: 1,
    },
    // Code Review
    {
      sceneId: sceneIds.codeReview,
      title: '代码质量审查',
      content: '作为代码审查专家，请审查以下代码并关注：\n\n1. 代码规范和命名约定\n2. 潜在的 Bug 和边界情况\n3. 性能优化建议\n4. 安全漏洞检测\n5. 可维护性和可读性\n\n输出格式：\n- 严重问题（必须修复）\n- 建议改进（推荐修复）\n- 代码风格（可选优化）',
      tags: '["代码审查","质量","安全"]',
      isFavorite: 1,
      isPinned: 0,
    },
    {
      sceneId: sceneIds.codeReview,
      title: 'TypeScript 专项审查',
      content: '作为 TypeScript 专家审查代码：\n\n1. 类型安全：是否有 any 滥用、类型断言过多\n2. 接口设计：是否遵循单一职责原则\n3. 泛型使用：是否合理、是否有过度抽象\n4. 错误处理：是否使用类型安全的错误处理\n5. 工具类型：是否善用 Partial、Pick、Omit 等\n\n提供具体修改建议和示例代码。',
      tags: '["TypeScript","类型安全","最佳实践"]',
      isFavorite: 0,
      isPinned: 0,
    },
    // Data Analysis
    {
      sceneId: sceneIds.dataAnalysis,
      title: '数据报表生成',
      content: '作为数据分析师，根据以下要求生成数据报表：\n\n1. 确定数据源和时间范围\n2. 选择合适的可视化方式\n3. 计算关键指标（同比/环比）\n4. 标注异常值和趋势变化\n5. 提供数据解读和决策建议\n\n输出格式：摘要 → 数据表 → 可视化 → 分析 → 建议',
      tags: '["数据分析","报表","可视化"]',
      isFavorite: 1,
      isPinned: 0,
    },
    // Marketing
    {
      sceneId: sceneIds.marketing,
      title: '社交媒体文案',
      content: '作为资深营销文案，为以下平台撰写推广文案：\n\n要求：\n- 标题：吸引眼球，15字以内\n- 正文：简洁有力，突出卖点\n- 行动号召：明确引导用户行为\n- 标签：5-8个相关话题标签\n\n适配平台：微信、微博、小红书、抖音',
      tags: '["营销","社交媒体","文案"]',
      isFavorite: 0,
      isPinned: 0,
    },
    // Finance
    {
      sceneId: sceneIds.finance,
      title: '月度财务报告',
      content: '作为财务分析师，生成月度财务报告：\n\n1. 收入概览（主营业务收入、其他收入）\n2. 支出分析（运营成本、人力成本、营销费用）\n3. 利润率分析（毛利率、净利率、同比变化）\n4. 现金流状况\n5. 预算执行率\n6. 风险提示与建议\n\n确保数据准确，分析逻辑清晰，符合会计准则。',
      tags: '["财务","报告","月度分析"]',
      isFavorite: 1,
      isPinned: 1,
    },
    {
      sceneId: sceneIds.finance,
      title: '税务筹划助手',
      content: '作为税务顾问，提供合规的税务筹划建议：\n\n1. 分析当前税务结构\n2. 识别可用的税收优惠政策\n3. 计算节税空间\n4. 制定实施计划\n5. 风险评估和合规检查\n\n注意：所有建议必须符合现行税法规定。',
      tags: '["税务","筹划","合规"]',
      isFavorite: 0,
      isPinned: 0,
    },
  ]

  for (const prompt of prompts) {
    const id = generateId()
    const versionId = generateId()
    const promptTs = now()

    // Insert prompt
    await adapter.execute(
      `INSERT INTO prompts (id, scene_id, title, content, tags, is_favorite, is_pinned, current_version_id, version_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [id, prompt.sceneId, prompt.title, prompt.content, prompt.tags, prompt.isFavorite, prompt.isPinned, versionId, promptTs, promptTs]
    )

    // Insert initial version
    await adapter.execute(
      `INSERT INTO versions (id, prompt_id, version_number, content, change_note, created_at)
       VALUES (?, ?, 1, ?, ?, ?)`,
      [versionId, id, prompt.content, '初始版本', promptTs]
    )

    // Update search index
    try {
      await adapter.execute(
        `INSERT INTO search_index (entity_type, entity_id, title, content, tags) VALUES ('prompt', ?, ?, ?, ?)`,
        [id, prompt.title, prompt.content, prompt.tags]
      )
    } catch {
      // FTS5 may not be available
    }
  }
}
