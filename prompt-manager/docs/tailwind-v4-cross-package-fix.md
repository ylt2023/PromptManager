# Tailwind CSS v4 跨包编译盲区修复记录

## 故障现象

UI 组件的内边距、间距、外边距完全不生效。所有 `p-*`、`m-*`、`gap-*`、`space-y-*` 等 Tailwind 间距工具类在浏览器中没有任何效果，导致页面布局坍缩。

看似随机——某些页面正常、某些失效；HMR 重启后又可能变化。实际是因为 className 从未被编译成 CSS。

## 项目结构

```
prompt-manager/
├── packages/
│   ├── ui/          ← 所有 UI 组件（React TSX）
│   ├── core/        ← 核心逻辑
│   ├── web-dev/     ← Web 消费端（Vite 项目根）
│   └── desktop/     ← Tauri 桌面端（Vite 项目根）
```

`web-dev` 和 `desktop` 通过 Vite alias 引用 `ui`：
```ts
// vite.config.ts
resolve: {
  alias: {
    '@prompt-mgr/ui': path.resolve(__dirname, '../ui/src'),
  },
}
```

## 根因分析

### `@tailwindcss/vite` 的编译范围限制

Tailwind CSS v4 使用 `@tailwindcss/vite` 插件编译工具类。该插件**只扫描 Vite 项目根目录内的文件**来收集 className 使用情况。

当 `packages/web-dev/` 启动 Vite 时：
- ✅ `packages/web-dev/src/**/*.tsx` —— 被扫描
- ❌ `packages/ui/src/**/*.tsx` —— **不被扫描**（在项目根之外，即使通过 Vite alias 引用）

### `@source` 指令（需重启 Vite 后方可生效）

```css
/* globals.css */
@import "tailwindcss";
@source "../../../ui/src/**/*.{ts,tsx}";  /* 指向 ui 包 */
```

`@source` 语法正确，路径解析到正确位置，**但在 Vite 启动时只读取一次**。如果在 `@source` 添加后首次启动 Vite，它会正确编译跨包文件中的 Tailwind 类名。

> **⚠️ 实测经验**：添加或修改 `@source` 后，必须**完全停止并重启 Vite 开发服务器**（仅 HMR 热更新不够），跨包扫描才会生效。建议在修改 `@source` 后执行 `npm run dev` 全量重启。

### 错误的混淆来源

- 部分组件在 Apple HIG 视觉改造时已被零散转换为 `style` 内联
- 其余组件仍依赖 Tailwind className
- HMR 重启后部分重新渲染，给人"修好了又坏了"的错觉

## 修复方案：全量内联化

放弃通过 Tailwind className 控制 `packages/ui/src/` 中组件的间距。将所有间距工具类转换为 React `style` 内联属性。

### 换算规则

Tailwind v4 默认 `--spacing: 0.25rem` = **4px**：

| 类名 | 值 | 内联写法 |
|------|-----|---------|
| `p-1` | 4px | `padding: '4px'` |
| `p-2` | 8px | `padding: '8px'` |
| `p-3` | 12px | `padding: '12px'` |
| `p-4` | 16px | `padding: '16px'` |
| `p-5` | 20px | `padding: '20px'` |
| `p-6` | 24px | `padding: '24px'` |
| `p-7` | 28px | `padding: '28px'` |
| `p-8` | 32px | `padding: '32px'` |
| `gap-2` | 8px | `gap: '8px'` |
| `gap-4` | 16px | `gap: '16px'` |
| `gap-6` | 24px | `gap: '24px'` |
| `mt-4` | 16px | `marginTop: '16px'` |
| `mb-8` | 32px | `marginBottom: '32px'` |
| `py-2` | 8px | `paddingTop/Bottom: '8px'` |
| `px-4` | 16px | `paddingLeft/Right: '16px'` |
| `pt-8` | 32px | `paddingTop: '32px'` |
| `pb-10` | 40px | `paddingBottom: '40px'` |

### 操作要点

1. **已存在 `style` 属性的元素**：合并新旧 style，不产生重复 `style` prop
2. **`!py-2` 等 important 类**：内联 style 天生具有最高优先级，无需 `!important`
3. **非 spacing 类保留 className**：布局（`flex`、`grid`、`hidden`）、排版（`truncate`、`font-semibold`）、颜色等保留为 className——它们由自定义 CSS（globals.css）控制，不走 Tailwind 编译
4. **`animate-fade-in` 等动画类**：保留 className，已在 globals.css 中定义 `@keyframes`

### 受影响的组件（18 个文件）

| 文件 | 路径 |
|---|---|
| AppShell | `packages/ui/src/components/layout/AppShell.tsx` |
| SidebarPanel | `packages/ui/src/components/layout/SidebarPanel.tsx` |
| ContentPanel | `packages/ui/src/components/layout/ContentPanel.tsx` |
| DetailPanel | `packages/ui/src/components/layout/DetailPanel.tsx` |
| AppBootstrap | `packages/ui/src/components/layout/AppBootstrap.tsx` |
| PromptCard | `packages/ui/src/components/prompt/PromptCard.tsx` |
| PromptEditor | `packages/ui/src/components/prompt/PromptEditor.tsx` |
| SceneCreateDialog | `packages/ui/src/components/scene/SceneCreateDialog.tsx` |
| SceneItem | `packages/ui/src/components/scene/SceneItem.tsx` |
| ConfirmDialog | `packages/ui/src/components/common/ConfirmDialog.tsx` |
| ErrorBoundary | `packages/ui/src/components/common/ErrorBoundary.tsx` |
| ToastContainer | `packages/ui/src/components/common/ToastContainer.tsx` |
| TagManager | `packages/ui/src/components/settings/TagManager.tsx` |
| PreferencesView | `packages/ui/src/components/settings/PreferencesView.tsx` |
| ImportExportView | `packages/ui/src/components/settings/ImportExportView.tsx` |
| VersionForm | `packages/ui/src/components/version/VersionForm.tsx` |
| VersionDiff | `packages/ui/src/components/version/VersionDiff.tsx` |
| VersionTimeline | `packages/ui/src/components/version/VersionTimeline.tsx` |
| CommandPalette | `packages/ui/src/components/search/CommandPalette.tsx` |
| ConflictResolver | `packages/ui/src/components/sync/ConflictResolver.tsx` |
| ExportImportBar | `packages/ui/src/components/sync/ExportImportBar.tsx` |

## 相关配置变更

### Vite watch（跨包 HMR）

```ts
// packages/web-dev/vite.config.ts
server: {
  watch: {
    ignored: ['!**/packages/ui/src/**'],  // 监视 ui 包的文件变化
  },
}
```

### CSS 文件调整

`packages/web-dev/src/styles/globals.css` 和 `packages/desktop/src/styles/globals.css` 各自独立持有完整的 Tailwind 主题定义（Apple HIG 变量、glassmorphism 工具类、按钮样式等），不再依赖 `packages/ui/src/styles/globals.css`。

入口文件改为引入本地 CSS：
```ts
// main.tsx
import './styles/globals.css'  // 不再 import '@prompt-mgr/ui/styles/globals.css'
```

## 经验教训

1. **Tailwind v4 `@source` 在重启 Vite 后可跨包编译**——但依赖全量重启而非 HMR，且消费端 CSS 中必须用 `@utility` 而非普通 CSS 类来定义跨包组件的样式，否则跨包组件中的 Tailwind 类名依然不生效。
2. **monorepo 中的 UI 包应考虑 CSS 方案的独立性**——要么完全不用 Tailwind 工具类，要么把消费端的 Tailwind 编译配置指向共享目录。
3. **`@tailwindcss/vite` 的 className 收集只发生在 Vite 项目根内**——这是架构层面的硬限制。使用 `@source` 可以解决，但需注意上述重启要求。

## 后续更新（2026-06-19）

本次扫描后更新的内容：
- ✅ `@source` 经重启测试已确认可跨包编译 Tailwind 类名
- ✅ `btn-danger` 补齐 `line-height: 1` + `user-select: none`（三文件同步修复）
- ✅ SearchBar 清空按钮尺寸从 20×20 增至 24×24，去掉 `!important`

## 架构优化（2026-06-19）：消除 CSS 三重复

### 问题
按钮、卡片、输入框等组件样式在三份 `globals.css` 中各自定义，且语法不同（ui 包用普通 CSS，web-dev/desktop 用 `@utility`）。改一处设计需要改三处。

### 方案
提取共享组件样式到 `packages/ui/src/styles/components.css`，作为**单一来源**：

```
packages/ui/src/styles/
├── globals.css      ← Tailwind + 主题变量 + reset + @import "./components.css"
└── components.css   ← 所有组件样式（按钮/卡片/输入框/导航/动画/工具类…）
```

消费端通过 JS import 引入：
```tsx
// packages/web-dev/src/main.tsx
import '@prompt-mgr/ui/styles/components.css'   // 共享组件样式
import './styles/globals.css'                     // 自身 Tailwind + 主题
```

### 变更总结
| 文件 | 变更 |
|------|------|
| `packages/ui/src/styles/components.css` | **新建** — 从 ui/globals.css 提取的组件样式 |
| `packages/ui/src/styles/globals.css` | 删除组件样式，改为 `@import "./components.css"` |
| `packages/web-dev/src/styles/globals.css` | 删除 ~340 行重复组件样式 |
| `packages/desktop/src/styles/globals.css` | 删除 ~130 行重复组件样式 |
| `packages/web-dev/src/main.tsx` | 新增 `import '@prompt-mgr/ui/styles/components.css'` |
| `packages/desktop/src/main.tsx` | 同上 |

### 收益
- 组件样式只有一个来源，改设计只需改 `components.css`
- 消除了 `@utility` vs 普通 CSS 的语法不一致
- web-dev/desktop 的 globals.css 各减少数百行
- 构建验证通过（`vite build` 成功，1756 modules）
