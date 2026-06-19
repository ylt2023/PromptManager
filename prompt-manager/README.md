# PromptManager

跨平台提示词管理工具，支持 Web 浏览器和 Tauri 桌面端。

## 功能特性

- **场景管理** — 场景分层组织，支持子场景嵌套
- **提示词 CRUD** — 创建、编辑、删除、搜索提示词
- **版本管理** — 版本历史、差异对比、一键回滚
- **标签系统** — 多标签分类、按标签筛选
- **收藏与置顶** — 快速访问常用内容
- **批量操作** — 批量收藏、置顶、删除
- **全文搜索** — FTS5 搜索引擎 + LIKE 回退
- **命令面板** — `Ctrl+K` 快捷操作
- **导入导出** — JSON 备份与恢复，冲突解决
- **主题切换** — 深色/浅色主题
- **多视图** — 网格/列表布局
- **双端支持** — 浏览器 Web 版 + Tauri 桌面版 (Windows)

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 6 |
| 样式 | Tailwind CSS v4 + CSS Variables (Apple HIG) |
| 状态管理 | Zustand |
| 存储引擎 | SQLite (sql.js / Tauri SQL plugin) |
| 桌面端 | Tauri v2 (Rust) |
| 包管理 | pnpm workspace monorepo |

## 快速开始

### 前置依赖

- Node.js >= 20
- pnpm >= 9
- Rust (仅桌面端构建需要)

### 安装与运行

```bash
# 安装依赖
pnpm install

# 启动 Web 开发版
pnpm --filter @prompt-mgr/web-dev dev

# 启动桌面开发版
pnpm --filter @prompt-mgr/desktop dev

# 构建桌面发布版
pnpm --filter @prompt-mgr/desktop tauri build
```

### 访问

- Web 版启动后访问 `http://localhost:5173`
- 桌面版构建产物位于 `packages/desktop/src-tauri/target/release/`

## 项目结构

```
prompt-manager/
├── packages/
│   ├── core/           # 领域层：实体、仓储、服务、存储
│   ├── ui/             # UI 组件库：通用组件、hooks、stores
│   ├── desktop/        # Tauri 桌面端入口
│   └── web-dev/        # Web 开发版入口
├── package.json        # 根 workspace 配置
├── pnpm-workspace.yaml
├── tsconfig.base.json  # 共享 TypeScript 配置
└── .gitignore
```

## 许可

[MIT](LICENSE)
