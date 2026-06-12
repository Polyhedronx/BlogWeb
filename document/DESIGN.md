# 前端设计规范

## 色彩体系

| Token | 色值 | 用途 |
|--------|------|------|
| `--color-primary` | `#1a1a2e` | L1 深灰 — 正文、用户名等核心阅读内容 |
| `--color-muted` | `#6b7280` | L2 中灰 — 默认态操作图标、次要文字 |
| `--color-faint` | `#9ca3af` | L3 浅灰 — 时间戳、分割线等背景类元素 |
| `--color-accent` | `#e94560` | 主色 — 仅用于点赞激活、OP 标签、重点强调 |
| `--color-danger` | `#ef4444` | 警示红 — 仅用于点踩激活等负面状态 |
| `--color-bg` | `#fafafa` | 页面背景 |
| `--color-surface` | `#ffffff` | 卡片/容器背景 |
| `--color-border` | `#e5e7eb` | 边框、分割线 |

**原则**：全界面色彩控制在 主色 + 三级中性灰 + 警示红 范围内，禁随意使用绿色等杂色。

---

## 间距与布局

### 评论组件
```
[头像 32px] ← 12px → [内容区]
                         ├ 用户名 — 0.5 间距
                         ├ 正文 (行高 1.75) — 1.5 间距
                         └ 操作栏 (按钮间距 4px)
```
- 评论条目间：1px 浅灰分割线 + 1.5rem 外边距
- 嵌套回复：左侧 2px 浅灰竖线 + 16px 缩进

### 操作按钮
- 统一 `.comment-action-btn` 类
- 最小触摸区域 32×32px（`min-height: 2rem; min-width: 2rem`）
- 图标 16px + 后置数字/文字，间距 4px
- 按钮间横向间距 4px

---

## 交互状态

| 状态 | 样式 |
|------|------|
| 默认 | L2 中灰图标 + 文字，透明背景 |
| Hover | 浅灰圆形底色 `rgba(107,114,128,0.08)` |
| 点击 | `transform: scale(0.92)` 微缩放 + 反弹 |
| 点赞激活 | L1 深灰背景底 + 白色文字 |
| 点踩激活 | 警示红色图标 + 文字 |
| 投票动效 | `vote-pop` 关键帧动画 250ms |

---

## 组件规范

### 头像 Avatar
- 纯 CSS 文字首字母，无网络请求
- 中文取前两字，英文取单词首字母大写
- 背景色按名字 hash 生成 HSL（`nameToColor`）
- Gravatar 异步兜底：成功加载后 fade-in 替换

### 抽屉 Drawer
- 右侧滑出，宽度 288px
- 打开时 body `overflow: hidden`（`scrollbar-gutter: stable` 已预留空间）
- Escape / 点击遮罩关闭

### 分页 Pagination
- 始终渲染占位（`invisible` 而非 `null`），避免布局跳动
- 当前页：深色底白字；其他：边框按钮

### Markdown 渲染
- `react-markdown` + `remark-gfm` + `rehype-highlight`
- `.prose` 自定义：代码块深色背景、表格带边框、引用左侧灰竖线

---

## 路由结构

```
/                             首页（分类筛选 + 文章列表 + 分页）
/tech/:slug                   技术文章
/essay/:slug                  随笔文章
/daily/:year/:month/:dateSlug 日常文章
/tags                         标签列表
/tags/:tag                    按标签筛选
/login                        登录
/register                     注册
/about                        关于页（待实现）
/notes                        笔记列表（待实现）
*                             404
```

---

## 代码分割

- `vendor-react`：React/Router/Query（每页必加载，长期缓存）
- `vendor-markdown`：react-markdown + highlight.js（仅文章详情页加载）
- `vendor-icons`：lucide-react
- 路由级 lazy loading：除 Home 外全部 `React.lazy`

---

## 文件组织

```
src/
├── lib/           # 工具与状态
│   ├── api.ts     # 类型化 API 客户端（自动带 Auth header）
│   ├── auth.tsx   # AuthContext + useAuth hook
│   └── utils.ts   # formatDate, postUrl, gravatarUrl
├── types/         # TypeScript 接口
├── pages/         # 路由页面组件
├── components/
│   ├── layout/    # Layout, Header, Footer, SettingsDrawer
│   ├── comment/   # CommentSection, CommentForm, CommentItem
│   ├── post/      # PostCard, MarkdownRenderer
│   └── ui/        # Avatar, Drawer, Pagination, LoadingSpinner
└── index.css      # Tailwind + @theme 变量 + 组件样式
```
