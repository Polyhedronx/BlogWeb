# 前端设计规范

## 色彩体系

### 亮色模式

| Token | 色值 | 用途 |
|--------|------|------|
| `--color-bg` | `#fafafa` | 页面背景 |
| `--color-surface` | `#ffffff` | 卡片/容器背景 |
| `--color-primary` | `#1a1a2e` | L1 — 正文、用户名 |
| `--color-muted` | `#6b7280` | L2 — 默认图标、次要文字 |
| `--color-faint` | `#9ca3af` | L3 — 时间戳、分割线 |
| `--color-accent` | `#e94560` | 主色 — 按钮背景、点赞激活、OP 标签 |
| `--color-danger` | `#ef4444` | 警示红 — 点踩激活 |
| `--color-border` | `#e5e7eb` | 边框、分割线 |

### 暗色模式（Google Material You）

| Token | 色值 | 对比度 |
|-------|------|--------|
| `--color-bg` | `#0f172a` | — |
| `--color-surface` | `#1e293b` | 层级提升 |
| `--color-primary` | `#f1f5f9` | 15:1 AAA |
| `--color-muted` | `#94a3b8` | ~7:1 AA |
| `--color-faint` | `#64748b` | ~4.5:1 |
| `--color-accent` | `#f4727a` | 白字可读 |
| `--color-border` | `#334155` | — |

### 色彩分离原则
- `--color-primary` 仅用于文字，禁用于按钮背景
- `--color-accent` 用于所有按钮背景 `text-white`
- 全界面色彩控制在 主色 + 三级中性灰 + 警示红 范围内

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
/login                        登录
/register                     注册
/about                        关于页（待实现）
/notes                        笔记列表（待实现）
*                             404
```

---

## SEO

### 文章页 `<head>` 注入
- OpenGraph: `og:title`, `og:description`, `og:type=article`, `og:url`, `og:site_name`, `og:locale`, `article:published_time`, `article:tag`
- Twitter Card: `twitter:card=summary`
- JSON-LD: `BlogPosting` schema（headline, description, datePublished, url, author, keywords）
- Canonical URL: 分类前缀完整 URL

### 首页 `<head>` 注入
- OpenGraph: `og:type=website` 全套标签
- JSON-LD: `WebSite`（含 SearchAction）+ `Blog` schema
- Canonical URL

### 搜索/404 页
- `<meta name="robots" content="noindex">` 防止搜索引擎索引
- 搜索结果使用列表式卡片（`SearchResultCard`），含正文片段预览
- 片段中关键词用 `<mark>` 标签高亮：亮色 `#fde047` 底色 + 暗色 `#854d0e` 底色

- `vendor-react`：React/Router/Query（每页必加载，长期缓存）
- `vendor-markdown`：react-markdown + highlight.js（仅文章详情页加载）
- `vendor-icons`：lucide-react
- 路由级 lazy loading：除 Home 外全部 `React.lazy`

---

## 响应式规范

### 断点
| 前缀 | 宽度 | 用途 |
|------|------|------|
| 默认 | <640px | 手机 |
| `sm:` | ≥640px | 平板及以上 |

### 移动端规则
- 文章正文：`overflow-wrap: break-word`，图片 `max-width: 100%`，表格 `overflow-x: auto`
- 代码块：padding 0.75rem，字号 0.8125rem
- 搜索框三档宽度：`w-28`（默认）→ `xs:w-36` → `sm:w-48`
- 分类按钮 `flex-wrap` 自动换行
- 评论操作栏 `flex-wrap` 防止按钮重叠
- 所有文本容器添加 `break-words` 或 `overflow-wrap: break-word`

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
