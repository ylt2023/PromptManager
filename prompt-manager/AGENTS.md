# Prompt Manager — Agent 参考文档

## 项目定位

**PromptManager**，跨平台提示词管理工具，支持 Web 浏览器和 Tauri 桌面端（Windows exe）。

---

## 技术栈

| 层次 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript 5.7 |
| 构建 | Vite 6，pnpm workspace monorepo |
| 状态 | Zustand 5，selector 模式（避免无限渲染） |
| 样式 | Tailwind CSS v4（`@tailwindcss/vite` 插件），CSS 变量系统 |
| 数据库 | sql.js（Web SQLite WASM）/ Tauri SQLite 插件（桌面端） |
| 图标 | lucide-react |
| 桌面端 | Tauri 2.x + Rust |

---

## 目录结构

```
prompt-manager/
├── packages/
│   ├── core/              # 领域层：类型定义、Repository、迁移、服务
│   │   ├── src/domain/          # Prompt/Scene/Version 领域类型
│   │   ├── src/repositories/    # SceneRepository / PromptRepository / VersionRepository
│   │   ├── src/storage/         # IStorageAdapter 接口、migrations.ts
│   │   ├── src/adapters/        # sqljs-wasm 适配器（Web）
│   │   └── src/services/        # seed-service（首次启动示例数据）
│   ├── ui/                # UI 层：组件、hooks、样式、Zustand store
│   │   ├── src/components/      # layout/ prompt/ scene/ settings/ search/ version/
│   │   ├── src/hooks/           # usePrompts, useToast, useScenes 等
│   │   ├── src/stores/          # app-store.ts（唯一 Zustand store）
│   │   └── src/styles/          # globals.css（CSS 变量设计系统）
│   ├── web-dev/           # Web 开发入口
│   │   └── src/platform/        # web-adapter.ts（sql.js 适配器初始化）
│   └── desktop/           # Tauri 桌面端入口
│       ├── src/platform/        # tauri-adapter.ts（Tauri SQL 插件适配）
│       └── src-tauri/           # Rust 后端：Cargo.toml、tauri.conf.json、capabilities/
```

---

## 核心架构模式

### 存储适配器模式
所有数据库操作通过 `IStorageAdapter` 接口抽象：
```ts
interface IStorageAdapter {
  execute(sql: string, params?: any[]): Promise<any>
  select<T>(sql: string, params?: any[]): Promise<T[]>
  transaction(fn: (tx: IStorageAdapter) => Promise<void>): Promise<void>
}
```
Web 端用 `SqlJsWasmAdapter`，桌面端用 `TauriSqliteAdapter`。更换数据库只需换适配器，Repository 层不变。

### Zustand Store
唯一 store `useAppStore`，通过 selector 拆分订阅避免无限渲染：
```ts
// ✅ 正确：selector 模式
const promptRepo = useAppStore((s) => s.promptRepo)

// ❌ 错误：解构整个 store 会触发全量重渲染
const { promptRepo } = useAppStore()
```

### promptRepo 可能为 null
应用启动时 `promptRepo` 初始为 `null`，数据库初始化后才赋值。所有使用 `promptRepo` 的地方需做 null 检查。

---

## 常用命令

```bash
# 开发
pnpm dev                   # 启动 Web 开发服务器 (port 5173)
pnpm --filter @prompt-mgr/desktop dev  # 启动 Tauri 桌面端开发

# 构建
pnpm build                 # Web 生产构建
pnpm typecheck             # TypeScript 类型检查（检查所有 4 个包）

# Tauri 桌面端构建
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
npx tauri build --no-bundle  # 生成 exe（跳过安装包打包）
# exe 路径：packages/desktop/src-tauri/target/release/prompt-manager.exe
```

---

## 设计规范

UI 风格参考 Calendly 企业后台，极简商务：
- 主品牌色 `#0066FF`，页面背景 `#FAFAFB`
- CSS 变量系统定义在 `packages/ui/src/styles/globals.css`
- 所有颜色/间距/字号通过 CSS 变量引用，不要硬编码色值
- 卡片统一 8px 圆角、24px 内边距、hover 阴影

---

## 数据库

### 迁移
迁移脚本在 `packages/core/src/storage/migrations.ts`，通过 `_migrations` 表追踪版本。FTS5 全文搜索为可选功能，不支持时降级为 LIKE 查询。

### 表结构
- `scenes` — 场景（支持父子层级）
- `prompts` — 提示词（关联 scene，含 tags JSON、is_favorite、is_pinned）
- `versions` — 版本历史（关联 prompt，自动创建初始版本）
- `search_index` — FTS5 全文索引（可选）

---

## 已知注意事项

1. **React Hooks 顺序**：所有 hooks 必须在 early return 之前调用（避免 hooks 顺序违规）
2. **Tailwind v4 @source**：monorepo 需在 `globals.css` 里配置 `@source` 扫描路径
3. **PowerShell 环境**：Windows 下用 `;` 替代 `&&` 作为命令分隔符
4. **Tauri capabilities**：必须在 `src-tauri/capabilities/` 目录声明权限文件
5. **CSS 变量引号**：JSX style 中 CSS 变量必须加引号，如 `background: 'var(--bg-surface)'`
6. **`initWebAdapter` 防重入**：Web/Tauri 适配器初始化函数必须用 `initializing` promise 守卫，防止 React StrictMode 双调用导致创建两个独立数据库实例

---

## 更新日志

### 2026-06-17

- **修复 initWebAdapter 重复初始化 Bug**：[packages/web-dev/src/platform/web-adapter.ts](packages/web-dev/src/platform/web-adapter.ts) — 添加 `initializing` promise 守卫，防止 `React.StrictMode` 开发模式下 `useEffect` 双调用创建多个独立的 sql.js 数据库实例。原代码中 `adapterInstance` 标记在异步初始化完成后才赋值，StrictMode 两次并发调用均绕过 null 检查，各自 seed 不同的 UUID 数据，导致 UI 展示的场景 ID 与最终 store 中的仓库指向的数据库不一致，创建提示词时外键约束失败。
- **同步修复 Tauri 适配器**：[packages/desktop/src/platform/tauri-adapter.ts](packages/desktop/src/platform/tauri-adapter.ts) — 同样的 `initializing` 防重入模式。

### 2026-06-17 (v2)

- **全局缩放至 125%**：[packages/ui/src/styles/globals.css](packages/ui/src/styles/globals.css) — `#root` 添加 `zoom: 1.25`，整体 UI 放大 25%，解决默认比例过小问题。
- **建立间距规范系统**：`globals.css` 新增 `--space-1` ~ `--space-10` 间距变量（4px 基数），全局间距统一为规范的倍数。
- **优化左侧边栏**：[SidebarPanel.tsx](packages/ui/src/components/layout/SidebarPanel.tsx) — 导航区左右内边距 `px-3` → `px-4`，分组标题增加间距，品牌区紧凑化，`nav-item` 增加左边缘选中蓝条指示器。
- **优化中间主内容区**：[ContentPanel.tsx](packages/ui/src/components/layout/ContentPanel.tsx) — 标题与统计卡片间距拉开（`mb-6` → `mb-8`）；统计卡片统一 24px 内边距（`py-7 px-6` → `p-6`），图标容器加大（`h-9 w-9` → `h-10 w-10`）；卡片视图网格间距统一（`gap-5` → `gap-6`）；工具栏和搜索框增大点击区域。
- **优化提示词卡片**：[PromptCard.tsx](packages/ui/src/components/prompt/PromptCard.tsx) — 卡片内边距 `p-5` → `p-6`，各区块间距从 `mb-3` 拉开至 `mb-4`，底部 `pt-3` → `pt-4`。
- **优化详情抽屉**：[DetailPanel.tsx](packages/ui/src/components/layout/DetailPanel.tsx) — 统一固定内边距 `px-6`，分段间距从 `mb-6` 拉开至 `mb-8`，内容展示区 `p-4` → `p-5`。
- **改进基础组件**：`.card` 圆角增大至 `var(--radius-lg)`，hover 增加上浮动效；`.btn-primary/.btn-secondary` 增大内边距；`.tag` 增大内边距和行高；`.nav-item.active` 添加左侧蓝条指示器。
