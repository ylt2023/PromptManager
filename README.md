<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Tauri-2-FFC131?logo=tauri&logoColor=white" alt="Tauri 2" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" />
</p>

<h1 align="center">PromptManager</h1>

<p align="center">
  <strong>跨平台提示词管理工具 · Web 版 + Tauri 桌面端</strong>
  <br />
  场景化组织 · 版本管理 · 全文搜索 · 导入导出
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> ·
  <a href="#快速开始">快速开始</a> ·
  <a href="#项目结构">项目结构</a> ·
  <a href="#技术栈">技术栈</a> ·
  <a href="#截图">截图</a> ·
  <a href="#开源协议">开源协议</a>
</p>

<br />

## 功能特性

<details open>
<summary><strong>📂 场景管理</strong></summary>

- 场景分层组织，支持子场景嵌套
- 场景图标选择、名称与描述自定义
- 仪表盘总览统计
</details>

<details open>
<summary><strong>📝 提示词管理</strong></summary>

- 完整的 CRUD 操作：创建、编辑、删除
- 标签系统：多标签分类，按标签筛选
- 收藏 (★) 和置顶 (📌) 用于快速定位
- 批量操作：批量收藏、置顶、删除
- 网格 / 列表双视图
</details>

<details open>
<summary><strong>🔄 版本管理</strong></summary>

- 自动保存历史版本
- 版本时间线可视化
- Diff 对比：逐行查看版本差异
- 一键回滚到任意历史版本
</details>

<details open>
<summary><strong>🔍 全文搜索</strong></summary>

- FTS5 全文搜索引擎（`like` 模糊搜索回退）
- 搜索标题、内容、标签
- 命令面板：`Ctrl+K` 快速操作
</details>

<details open>
<summary><strong>💾 数据安全</strong></summary>

- SQLite 本地存储，数据不上传云端
- JSON 导入导出，支持备份与迁移
- 导入冲突解决策略（最新优先 / 保留本地 / 使用导入）
- 支持清除本地缓存
</details>

<details open>
<summary><strong>🎨 界面主题</strong></summary>

- Apple HIG 设计规范
- 深色 / 浅色主题切换
- 紧凑布局模式
- 毛玻璃质感设计
</details>

<br />

## 截图

> *(截图待补充)*

<br />

## 快速开始

### 前置依赖

| 工具 | 版本要求 | 用途 |
|------|---------|------|
| [Node.js](https://nodejs.org/) | >= 20 | 前端开发与构建 |
| [pnpm](https://pnpm.io/) | >= 9 | 依赖管理（monorepo） |
| [Rust](https://www.rust-lang.org/) | latest | 仅构建桌面端时需要 |

### 安装

```bash
git clone https://github.com/你的用户名/prompt-manager.git
cd prompt-manager
pnpm install
```

### 运行 Web 版（浏览器）

```bash
pnpm --filter @prompt-mgr/web-dev dev
```

浏览器打开 `http://localhost:5173`

### 运行桌面版（Tauri 开发模式）

```bash
pnpm --filter @prompt-mgr/desktop dev
```

### 构建桌面安装包

```bash
pnpm --filter @prompt-mgr/desktop tauri build
```

产物位于：

| 类型 | 路径 |
|------|------|
| 绿色版 exe | `packages/desktop/src-tauri/target/release/prompt-manager.exe` |
| MSI 安装包 | `packages/desktop/src-tauri/target/release/bundle/msi/` |
| NSIS 安装包 | `packages/desktop/src-tauri/target/release/bundle/nsis/` |

<br />

## 项目结构

```
prompt-manager/
├── packages/
│   ├── core/                      # 领域层
│   │   └── src/
│   │       ├── domain/            # 实体：Prompt, Scene, Version
│   │       ├── repositories/      # 仓储接口与实现
│   │       ├── services/          # 业务服务：同步、种子、ID生成
│   │       └── storage/           # SQLite 存储：迁移、连接
│   │
│   ├── ui/                        # UI 组件库
│   │   └── src/
│   │       ├── components/        # 组件：弹窗、面板、搜索、版本
│   │       ├── hooks/             # 自定义 hooks
│   │       ├── stores/            # Zustand 状态管理
│   │       ├── lib/               # 工具函数
│   │       └── styles/            # 全局样式 tokens
│   │
│   ├── desktop/                   # Tauri 桌面端
│   │   ├── src/                   # React 入口 + 平台适配
│   │   └── src-tauri/             # Rust 后端 (Tauri v2)
│   │
│   └── web-dev/                   # Web 开发版
│       ├── src/                   # React 入口 + 平台适配
│       └── public/                # sql.js WASM 运行时
│
├── package.json                   # 根 workspace 配置
├── pnpm-workspace.yaml            # pnpm 工作空间配置
├── tsconfig.base.json             # 共享 TypeScript 配置
└── .gitignore
```

<br />

## 技术栈

| 层级 | 技术 |
|------|------|
| **前端框架** | React 19 + TypeScript 5.7 |
| **构建工具** | Vite 6 |
| **样式方案** | Tailwind CSS v4 + CSS Custom Properties (Apple HIG) |
| **状态管理** | Zustand |
| **存储引擎** | SQLite（浏览器: sql.js / 桌面: Tauri SQL Plugin） |
| **桌面框架** | Tauri v2 (Rust) |
| **包管理** | pnpm workspace (Monorepo) |

<br />

## 开源协议

[MIT](LICENSE)

Copyright (c) 2026 Ye Lantian
