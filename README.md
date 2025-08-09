# 翻译助手

一个基于 Nuxt4 + NuxtUI 的翻译应用，支持实时翻译和 Markdown 格式。

## 技术栈

- **框架**: Nuxt 4
- **UI 组件库**: NuxtUI
- **编辑器**: Tiptap
- **样式**: Tailwind CSS
- **图标**: Lucide Icons

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 功能特性

- 实时翻译
- Markdown 格式支持
- 深色/浅色主题切换
- 响应式设计
- 本地存储消息历史

## 项目结构

```
├── app/                    # 应用目录 (Nuxt4 新结构)
│   ├── app.vue            # 应用入口
│   ├── pages/             # 页面
│   │   └── articles.vue   # 翻译页面
│   ├── components/        # 组件
│   │   ├── HtmlContent/   # Markdown 渲染组件
│   │   ├── Tiptap/       # 编辑器组件
│   │   ├── ScrollBottomButton.vue
│   │   └── TranslateNavigation.vue
│   ├── utils/             # 工具函数
│   └── assets/            # 静态资源
│       ├── css/          # 样式文件
│       └── MiSans/       # 字体文件
├── nuxt.config.ts         # Nuxt 配置
└── package.json           # 项目依赖
```
