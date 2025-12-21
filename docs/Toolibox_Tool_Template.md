# Toolibox · [工具名称] 技术规范模板

> 本文档为 Toolibox 微前端工具的通用技术规范模板
> **技术架构**: Next.js 14 (App Router) + TypeScript + Tailwind CSS

---

## 概述

本文档定义了 [工具名称] 工具的完整技术实现规范，包括页面结构、交互行为、SEO 优化和微前端架构集成。

### 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 14.x | React 框架（App Router） |
| React | 18.x | UI 库 |
| TypeScript | 5.x | 类型安全 |
| Tailwind CSS | 3.x | 样式框架 |
| next-intl | 3.x | 国际化（i18n） |
| Docker | - | 容器化部署 |

### 设计原则

- **单页面架构**: 所有使用场景在同一页面通过折叠区域呈现
- **固定操作区**: 核心工具区域位置固定，不受其他交互影响
- **SEO 友好**: 所有内容在 HTML 中存在，折叠不影响搜索引擎索引
- **用户体验**: 清晰的状态反馈和操作流程
- **微前端架构**: 作为独立微前端部署
- **导航一致性**: 所有页面提供返回 Main 应用的导航入口

---

## 1. 工具基本信息

| 属性 | 值 | 说明 |
|------|-----|------|
| Tool Name | [工具英文名] | 例: Merge PDF |
| Tool ID | `[tool-id]` | 例: `merge-pdf` (小写+连字符) |
| Category ID | `[category-id]` | 例: `pdf-tools`, `image-tools` |
| 所属微前端 | `frontend/[category-id]` | 例: `frontend/pdf-tools` |
| 端口 | [端口号] | 例: 3001 (PDF Tools) |
| Main 应用地址 | `http://82.29.67.124` | 固定值 |

### URL 路由

| 语言 | URL |
|------|-----|
| 英文 | `/[category-id]/en/[tool-id]` |
| 中文 | `/[category-id]/zh/[tool-id]` |
| 分类首页 | `/[category-id]/en` 或 `/[category-id]/zh` |

> **注意**: URL 包含语言前缀，因为微前端使用 `localePrefix: 'always'` 配置。

---

## 2. 微前端架构集成

### 2.1 目录结构

```
frontend/[category-id]/
├── src/
│   ├── app/
│   │   └── [locale]/
│   │       ├── page.tsx              # 分类首页（含 Header/Breadcrumb）
│   │       ├── [tool-id]/
│   │       │   └── page.tsx          # ★ 工具页面
│   │       └── [other-tools]/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx            # 页头（Logo + 语言切换）
│   │   │   └── Footer.tsx            # 页脚
│   │   ├── Breadcrumb.tsx            # ★ 面包屑导航（支持外部链接）
│   │   ├── CoreToolArea.tsx          # 核心操作区
│   │   └── ResultPage.tsx            # 结果页面（如需要）
│   ├── lib/
│   │   └── [toolLogic].ts            # 工具处理逻辑
│   └── locales/
│       ├── en.json                   # 英文翻译
│       └── zh.json                   # 中文翻译
├── public/                           # ★ 静态资源目录（必须存在）
├── next.config.js                    # basePath: '/[category-id]'
└── Dockerfile
```

### 2.2 关键配置文件

#### next.config.js

**位置**: `frontend/[category-id]/next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 微前端基础路径
  basePath: '/[category-id]',

  // 独立输出模式（Docker 部署必需）
  output: 'standalone',

  // 国际化配置（由 next-intl 处理）
  // 不需要在这里配置 i18n
};

module.exports = nextConfig;
```

**关键参数说明**:
- `basePath`: 微前端的路由前缀，必须与 Nginx 配置一致
- `output: 'standalone'`: 生成独立的 Node.js 服务器，适合 Docker 部署

#### i18n 配置

**位置**: `frontend/[category-id]/src/i18n/request.ts`

```typescript
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../locales/${locale}.json`)).default
}));
```

**位置**: `frontend/[category-id]/src/middleware.ts`

```typescript
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  localePrefix: 'always'  // ★ 所有路径都包含语言前缀
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```

#### package.json

**位置**: `frontend/[category-id]/package.json`

```json
{
  "name": "[category-id]",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p [port]",
    "build": "next build",
    "start": "next start -p [port]",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "next-intl": "^3.22.0",
    "tailwindcss": "^3.4.15"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5"
  }
}
```

#### Dockerfile

**位置**: `frontend/[category-id]/Dockerfile`

```dockerfile
# 多阶段构建
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产镜像
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# 复制构建产物
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE [port]

CMD ["node", "server.js"]
```

#### Tailwind CSS 配置

**位置**: `frontend/[category-id]/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
      },
    },
  },
  plugins: [],
}
```

#### TypeScript 配置

**位置**: `frontend/[category-id]/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### Main 应用配置

**toolRoutes.ts** (`frontend/main/src/config/`):
```typescript
// 已部署的微前端列表
export const DEPLOYED_MICROSERVICES: string[] = [
  '[category-id]',  // ✅ 已部署
];

// 分类到子路径的映射
export const CATEGORY_ROUTES: Record<string, string> = {
  '[category-id]': '/[category-id]',
};
```

**tools.json** (`frontend/main/src/data/`):
```json
{
  "id": "[tool-id]",
  "slug": "[tool-id]",
  "categoryId": "[category-id]",
  "icon": "[emoji]",
  "name": { "en": "[English Name]", "zh": "[中文名称]" },
  "description": { "en": "[English description]", "zh": "[中文描述]" },
  "comingSoon": false,   // ★ 必须为 false
  "isPopular": true      // 可选
}
```

### 2.3 导航集成

#### Main 应用 → 工具

Main 应用通过以下方式链接到工具：

```typescript
import { getToolUrl, isMicroserviceDeployed } from '@/config/toolRoutes';

// 获取工具 URL
const toolHref = getToolUrl('[category-id]', '[tool-id]', locale);
// 结果: /[category-id]/en/[tool-id] 或 /[category-id]/zh/[tool-id]

// 判断是否使用外部链接
const isExternal = isMicroserviceDeployed('[category-id]') && !tool.comingSoon;
// 结果: true

// 渲染链接 (使用 <a> 标签实现完整页面跳转)
if (isExternal) {
  return <a href={toolHref}>[Tool Name]</a>;
}
```

#### 工具 → Main 应用（Breadcrumb 组件）

微前端通过 Breadcrumb 组件提供返回 Main 应用的导航：

```typescript
// Breadcrumb.tsx - 支持外部链接
interface BreadcrumbItem {
  label: string;
  href?: string;
  external?: boolean;  // ★ 标记是否跳转到 Main 应用
}

const MAIN_APP_URL = 'http://82.29.67.124';

// 使用示例
const breadcrumbItems = [
  { label: 'Home', href: '/', external: true },  // ★ 跳转到 Main 应用
  { label: '[Category Name]', href: '/' },       // 内部链接
  { label: '[Tool Name]' },                      // 当前页面
];
```

**外部链接渲染逻辑**:
```tsx
{item.external ? (
  <a href={`${MAIN_APP_URL}/${locale}`}>
    {item.label}
  </a>
) : (
  <Link href={`/${locale}${item.href}`}>
    {item.label}
  </Link>
)}
```

### 2.4 导航入口位置

| 入口 | 组件 | 链接方式 | 目标 |
|------|------|----------|------|
| Main 首页热门工具 | `PopularTools.tsx` | `<a>` | → 微前端 |
| Main 分类页 | `[categoryId]/page.tsx` | `<a>` | → 微前端 |
| 分类首页 | `page.tsx` | `<Link>` | → 工具页面 |
| 工具 Breadcrumb | `Breadcrumb.tsx` | `<a>` | → Main 应用 |

---

## 2.5 Next.js App Router 页面结构

### 根布局 (Root Layout)

**位置**: `frontend/[category-id]/src/app/[locale]/layout.tsx`

```typescript
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import './globals.css';

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // 验证语言
  if (!['en', 'zh'].includes(locale)) {
    notFound();
  }

  // 加载翻译消息
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### 分类首页

**位置**: `frontend/[category-id]/src/app/[locale]/page.tsx`

```typescript
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Breadcrumb from '@/components/Breadcrumb';
import ToolCard from '@/components/ToolCard';

// 生成元数据（SEO）
export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'home' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function CategoryHome() {
  const t = useTranslations('home');

  const breadcrumbItems = [
    { label: 'Home', href: '/', external: true },
    { label: t('categoryName') },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />

      <h1 className="text-4xl font-bold mt-8 mb-4">
        {t('title')}
      </h1>

      <p className="text-lg text-gray-600 mb-12">
        {t('description')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 工具卡片列表 */}
      </div>
    </div>
  );
}
```

### 工具页面

**位置**: `frontend/[category-id]/src/app/[locale]/[tool-id]/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Breadcrumb from '@/components/Breadcrumb';
import CoreToolArea from '@/components/CoreToolArea';
import UseCaseCards from '@/components/UseCaseCards';
import HowToSection from '@/components/HowToSection';
import FAQSection from '@/components/FAQSection';

export default function ToolPage() {
  const t = useTranslations('[tool-id]');
  const [useCaseOptions, setUseCaseOptions] = useState({
    option1: false,
    option2: false,
    option3: false,
  });

  const breadcrumbItems = [
    { label: 'Home', href: '/', external: true },
    { label: t('categoryName'), href: '/' },
    { label: t('toolName') },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 面包屑导航 */}
      <Breadcrumb items={breadcrumbItems} />

      {/* 标题和介绍 */}
      <h1 className="text-4xl font-bold mt-8 mb-4">
        {t('title')}
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        {t('description')}
      </p>

      {/* 核心操作区 */}
      <CoreToolArea options={useCaseOptions} />

      {/* 使用场景卡片 */}
      <UseCaseCards
        options={useCaseOptions}
        onOptionChange={setUseCaseOptions}
      />

      {/* 使用说明 */}
      <HowToSection />

      {/* FAQ */}
      <FAQSection />
    </div>
  );
}
```

---

## 2.6 Next.js 组件实现模板

### Breadcrumb 组件

**位置**: `frontend/[category-id]/src/components/Breadcrumb.tsx`

```typescript
'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

interface BreadcrumbItem {
  label: string;
  href?: string;
  external?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const MAIN_APP_URL = 'http://82.29.67.124';

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const locale = useLocale();

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <span className="mx-2">→</span>}

          {item.href ? (
            item.external ? (
              <a
                href={`${MAIN_APP_URL}/${locale}`}
                className="hover:text-primary-600"
              >
                {item.label}
              </a>
            ) : (
              <Link
                href={`/${locale}${item.href}`}
                className="hover:text-primary-600"
              >
                {item.label}
              </Link>
            )
          ) : (
            <span className="text-gray-900 font-medium">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
```

### Header 组件

**位置**: `frontend/[category-id]/src/components/layout/Header.tsx`

```typescript
'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function Header() {
  const locale = useLocale();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    window.location.href = newPath;
  };

  return (
    <header className="border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href={`/${locale}`} className="text-xl font-bold">
          [Category Name]
        </Link>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => switchLocale('en')}
            className={`px-3 py-1 rounded ${
              locale === 'en' ? 'bg-primary-500 text-white' : 'text-gray-600'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => switchLocale('zh')}
            className={`px-3 py-1 rounded ${
              locale === 'zh' ? 'bg-primary-500 text-white' : 'text-gray-600'
            }`}
          >
            中文
          </button>
        </div>
      </div>
    </header>
  );
}
```

### CoreToolArea 组件模板

**位置**: `frontend/[category-id]/src/components/CoreToolArea.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface CoreToolAreaProps {
  options: {
    option1: boolean;
    option2: boolean;
    option3: boolean;
  };
}

export default function CoreToolArea({ options }: CoreToolAreaProps) {
  const t = useTranslations('[tool-id]');
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      // 处理逻辑
      // await processFiles(files, options);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
      {/* 文件上传区 */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
        <input
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="text-gray-600">
            {t('uploadPrompt')}
          </div>
        </label>
      </div>

      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="mb-6">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded mb-2">
              <span>{file.name}</span>
              <button onClick={() => setFiles(files.filter((_, i) => i !== index))}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 主操作按钮 */}
      <button
        onClick={handleProcess}
        disabled={files.length === 0 || isProcessing}
        className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 disabled:bg-gray-300"
      >
        {isProcessing ? t('processing') : t('mainAction')}
      </button>
    </div>
  );
}
```

---

## 2.7 国际化（i18n）使用

### 翻译文件结构

**位置**: `frontend/[category-id]/src/locales/en.json`

```json
{
  "home": {
    "title": "[Category Name]",
    "description": "[Category description]",
    "categoryName": "[Category Name]"
  },
  "[tool-id]": {
    "title": "[Tool Name]",
    "description": "[Tool description]",
    "categoryName": "[Category Name]",
    "toolName": "[Tool Name]",
    "uploadPrompt": "Click to upload or drag and drop",
    "mainAction": "[Main Action]",
    "processing": "Processing...",
    "howTo": {
      "title": "How to use [Tool Name]",
      "step1": {
        "title": "Step 1",
        "description": "Description"
      }
    },
    "faq": {
      "title": "Frequently Asked Questions",
      "q1": {
        "question": "Is [Tool Name] free?",
        "answer": "Yes, it's completely free."
      }
    }
  }
}
```

### 在组件中使用翻译

```typescript
// 客户端组件
'use client';
import { useTranslations } from 'next-intl';

export default function Component() {
  const t = useTranslations('[tool-id]');
  return <h1>{t('title')}</h1>;
}

// 服务端组件
import { getTranslations } from 'next-intl/server';

export default async function Component() {
  const t = await getTranslations('[tool-id]');
  return <h1>{t('title')}</h1>;
}
```



**重要**: 每个工具只有一个页面，所有使用场景都在同一页面内通过折叠区呈现。

### 页面架构规范

使用状态管理在同一页面切换场景，不创建独立的场景页面。所有场景通过组件状态控制在同一 URL 下呈现

---

## 4. 页面整体布局

页面采用固定的从上到下结构，各部分顺序不可调整。

```
┌────────────────────────────────────┐
│ Header                              │
│ [Logo: Category Name]  [EN] [中文] │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ Breadcrumb                          │
│ Home → [Category] → [Tool Name]     │
│   ↑                                 │
│   └── 跳转到 Main 应用              │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ H1: [Tool Name]                    │
│ Intro paragraph                    │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ Core Tool Area  ← 固定位置，不移动  │
│  - [主要交互元素]                   │
│  - [文件列表/预览等]                │
│  - Primary button: [主操作]        │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ Inline Feedback (optional)          │
│ e.g. "Settings applied ✔"          │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ Use Case Sections (Grid Cards)    │
│ [Card 1] [Card 2] [Card 3]         │
│ [场景1] [场景2] [场景3]             │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ How to [Use This Tool]             │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ FAQ                                │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ Footer                             │
└────────────────────────────────────┘
```

---

## 5. Core Tool Area (核心操作区规范)

核心操作区是页面的锚点，任何交互都不能改变它的位置。

### 必须包含的元素

1. **主要输入组件**
   - [根据工具类型定义，例如：文件上传、文本输入、图片选择等]
   - 支持的交互方式
   - 支持的文件格式/输入类型

2. **内容展示区**
   - 显示已上传/输入的内容
   - 支持的操作（排序、删除、编辑等）
   - 显示相关信息（大小、格式、状态等）

3. **主操作按钮**
   ```
   [ [主要操作名称] ]
   ```

### 行为规则

| 交互行为 | 对 Core Tool Area 的影响 |
|---------|------------------------|
| Use Case 展开 / 折叠 | 不影响位置和布局 |
| 参数状态变化 | 只影响内部状态 |
| 内容添加 / 删除 | 更新内容列表 |

---

## 6. Use Case Sections (使用场景卡片区)

使用场景通过并排卡片实现，兼顾 SEO 和用户体验。

### 6.1 通用规则

- **标题级别**: 使用 `<h2>` 标签
- **布局方式**: 响应式网格布局 (desktop: 3列, mobile: 1列)
- **默认状态**: 展开显示 (always visible)
- **内容可见性**: 所有内容在 HTML 中完整存在
- **交互行为**:
  - 在同一页面内切换场景
  - 保持当前 URL 不变
  - 通过修改参数状态实现场景切换

---

### 6.2 Use Case 定义模板

#### Use Case 1: [场景名称]

**标题**: [场景标题]

**描述**: [场景描述文本]

**点击行为（状态变化）**:

```typescript
useCaseOptions = {
  [option1]: [value],
  [option2]: [value],
  [option3]: [value]
}
```

**UI 变化**: [描述点击后界面的变化]

---

#### Use Case 2: [场景名称]

[重复上述结构]

---

#### Use Case 3: [场景名称]

[重复上述结构]

---

## 7. Inline Feedback 区域

用于显示操作状态提示。

### 示例文本

```
✓ [操作成功提示]
✓ [设置已应用提示]
⚠ [警告信息]
✗ [错误信息]
```

### 设计规则

- **位置**: 固定在 Core Tool Area 下方
- **行为**: 可出现 / 消失
- **布局影响**: 不影响其他区域布局
- **显示时机**: 用户操作后即时反馈

---

## 8. How-to 区块（SEO 必需）

提供步骤说明，提升 SEO 和用户体验。

### 要求

- 必须包含明确的步骤说明（3-5个步骤）
- 使用网格卡片布局 (2x2 grid on desktop, 1 column on mobile)
- 每个步骤包含：编号、标题 (h3)、说明文本
- 语言简洁清晰

### 步骤模板

1. **[步骤1标题]**: [步骤1说明]
2. **[步骤2标题]**: [步骤2说明]
3. **[步骤3标题]**: [步骤3说明]
4. **[步骤4标题]**: [步骤4说明]

---

## 9. FAQ 区块（SEO 必需）

提供常见问题解答，采用可折叠的交互式设计。

### FAQ 内容清单模板

1. Is [Tool Name] free?
2. Are my files secure?
3. [工具特定问题1]
4. [工具特定问题2]
5. [工具特定问题3]
6. [工具特定问题4]

### 实现要求

- 使用 `<details>` 和 `<summary>` 标签或自定义折叠组件
- 默认状态可折叠
- 所有内容在 HTML 中完整存在（SEO）
- 支持键盘导航

---

## 10. 客户端处理（如适用）

### 10.1 技术选型

根据工具类型选择合适的客户端处理库：

| 工具类型 | 推荐库 | 用途 |
|---------|--------|------|
| PDF 工具 | pdf-lib | PDF 操作 |
| 图片工具 | browser-image-compression | 图片压缩 |
| 文本工具 | 原生 JS | 文本处理 |

### 10.2 实现模板

```typescript
// lib/[toolLogic].ts

async function processFile(file: File, options: Options): Promise<Result> {
  // 1. 读取文件
  const arrayBuffer = await file.arrayBuffer();

  // 2. 处理逻辑
  const processed = await [processingFunction](arrayBuffer, options);

  // 3. 返回结果
  return processed;
}
```

### 10.3 Blob 对象创建规范

在 TypeScript 5.x + Node 20 环境中创建 Blob 对象时，使用 Uint8Array 包装以确保类型兼容：

```typescript
// 使用 Uint8Array 包装确保类型兼容
const blob = new Blob([new Uint8Array(result)], { type: 'application/[type]' });
```

### 10.4 优势

- **隐私安全**: 文件不上传到服务器
- **速度快**: 无需网络传输
- **离线可用**: 处理完全在本地完成

### 10.5 依赖

```json
{
  "[library-name]": "^[version]",
  "react-dropzone": "^14.2.3"  // 如需文件上传
}
```

---

## 11. 后端接口规范（可选扩展）

> **注意**: 优先使用客户端处理。以下为可选的后端扩展规范。

### API Endpoint

```
POST /api/[category]/[action]
```

### 请求格式

使用 `multipart/form-data` 格式（非 JSON）。

### 响应格式

```json
{
  "success": true,
  "data": {
    "fileUrl": "string",
    "fileName": "string"
  },
  "error": null
}
```

---

## 12. 核心设计原则总结

### 页面架构

- **一个页面**: 所有功能在单一页面实现
- **一个工具**: 专注单一核心功能
- **多个场景**: 通过并排卡片展示不同使用场景
- **固定操作区**: 核心交互区域位置固定

### SEO 优化

- **内容可见**: 所有内容在 HTML 中完整存在且默认可见
- **场景 ≠ 新页面**: 使用状态切换而非页面跳转
- **语义化标签**: 正确使用 H1、H2、H3 等标题标签
- **结构化数据**: 使用有意义的 HTML 结构（卡片、列表、标题层级）

### 用户体验

- **清晰反馈**: 及时的状态提示（Inline Feedback）
- **固定锚点**: 操作区域不移动
- **流畅交互**: 无页面刷新的状态切换
- **直观呈现**: 使用卡片布局，所有选项一目了然
- **响应式设计**: 适配桌面端（3列）和移动端（1列）

### 导航一致性

- **双向导航**: Main ↔ 微前端可互相跳转
- **面包屑导航**: 所有页面提供清晰的层级路径
- **外部链接**: 使用 `<a>` 标签实现跨应用跳转
- **内部链接**: 使用 `<Link>` 组件实现 SPA 导航

---

## 13. 验证清单

部署后验证工具是否无缝接入：

### Main 应用配置
- [ ] `tools.json` 中 `comingSoon: false`
- [ ] `DEPLOYED_MICROSERVICES` 包含 `'[category-id]'`

### 微前端服务
- [ ] Docker 容器运行中 (端口 [port])
- [ ] Nginx 正确转发 `/[category-id]/*`
- [ ] `public/` 目录存在（Docker 构建需要）

### 导航跳转
- [ ] Main 首页 → 微前端跳转正确
- [ ] 微前端首页显示 Header 和 Breadcrumb
- [ ] 微前端 Breadcrumb Home → Main 应用跳转正确
- [ ] 工具页面 Breadcrumb Home → Main 应用跳转正确
- [ ] 语言切换功能正常

### 功能验证
- [ ] 主要功能正常工作
- [ ] 结果可下载/显示
- [ ] 交互功能正常（拖拽、排序等）
- [ ] 错误处理正确
- [ ] 移动端适配正常

---

## 14. Nginx 反向代理配置

### 14.1 基础配置

**位置**: `/etc/nginx/sites-available/toolibox.conf`

```nginx
server {
    listen 80;
    server_name [your-domain-or-ip];

    # Main 应用
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 后端 API
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 微前端工具（根据实际分类调整）
    location /[category-id] {
        proxy_pass http://127.0.0.1:[port];
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 14.2 性能优化配置

#### 静态资源缓存

```nginx
# Next.js 静态资源缓存
location /[category-id]/_next/static/ {
    proxy_pass http://127.0.0.1:[port]/[category-id]/_next/static/;
    expires 365d;
    add_header Cache-Control "public, immutable";
}

# 图片资源缓存
location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
    proxy_pass http://127.0.0.1:[port];
    expires 30d;
    add_header Cache-Control "public";
}
```

#### Gzip 压缩

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript
           application/json application/javascript application/xml+rss
           application/rss+xml font/truetype font/opentype
           application/vnd.ms-fontobject image/svg+xml;
```

### 14.3 安全配置

```nginx
# 隐藏 Nginx 版本
server_tokens off;

# 防止点击劫持
add_header X-Frame-Options "SAMEORIGIN" always;

# XSS 保护
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;

# HTTPS 重定向（如使用 SSL）
# server {
#     listen 80;
#     server_name [your-domain];
#     return 301 https://$server_name$request_uri;
# }
```


## 16. 常见问题

### Q: Docker 构建失败，提示 `/app/public` not found

**原因**: Next.js standalone 模式需要 `public/` 目录存在

**解决**:
```bash
mkdir -p frontend/[category-id]/public
touch frontend/[category-id]/public/.gitkeep
```

### Q: TypeScript 编译报错类型不兼容

**原因**: TypeScript 5.x 对类型检查更严格

**解决**: 参考 [10.3 TypeScript 类型兼容性](#103-typescript-类型兼容性)

### Q: 点击 Home 链接没有跳转到 Main 应用

**原因**: Breadcrumb 组件未正确配置 `external` 属性

**解决**: 确保 breadcrumbItems 中 Home 项有 `external: true`:
```typescript
{ label: 'Home', href: '/', external: true }
```

### Q: 语言切换后路径重复

不要手动添加 basePath，Next.js 会自动处理。路径构造使用以下模式：

```typescript
const path = `/${locale}/${tool.slug}`;
```

### Q: 端口已被占用

**症状**: `Bind for :::port failed: port is already allocated`

**解决**:
```bash
# 查找占用端口的容器
docker ps | grep [port]

# 停止旧容器
docker rm -f [container_name]

# 重新启动
docker run -d --name [category-id] -p [port]:[port] --restart unless-stopped toolibox/[category-id]
```

### Q: 502 Bad Gateway

**症状**: 访问微前端返回 502 错误

**解决**:
```bash
# 检查容器状态
docker ps -a | grep [category-id]

# 查看容器日志
docker logs [category-id]

# 重启容器
docker rm -f [category-id]
docker run -d --name [category-id] -p [port]:[port] --restart unless-stopped toolibox/[category-id]

# 检查 Nginx 配置
sudo nginx -t
sudo systemctl restart nginx
```

### Q: Home 链接不跳转到 Main 应用

**原因**: Breadcrumb 组件未配置 `external` 属性

**解决**: 确保 breadcrumbItems 中 Home 项有 `external: true`
```typescript
const breadcrumbItems = [
  { label: 'Home', href: '/', external: true },  // ★ 必须有 external: true
  { label: t('categoryName'), href: '/' },
  { label: t('toolName') },
];
```

### Q: 静态资源 404

**症状**: `_next/static/` 下的资源无法加载

**解决**:
1. 确认 `basePath` 配置正确
2. 确认 Nginx 代理配置包含完整路径
3. 检查 Docker 构建是否正确复制了 `.next/static` 目录

```bash
# 验证静态资源
curl http://localhost:[port]/[category-id]/_next/static/
```

---



## 版本信息

- **版本**: 2.0
- **创建日期**: 2025-12-21
- **维护者**: Toolibox Team
- **基于**: Merge PDF 技术规范 v2.1
- **技术架构**: Next.js 14 (App Router) + TypeScript + Tailwind CSS

### 更新日志

#### v2.0 (2025-12-21)
- 明确设定为 Next.js 14 架构
- 新增完整的配置文件示例（next.config.js, tsconfig.json, tailwind.config.js等）
- 新增 Next.js App Router 页面结构和组件实现模板
- 新增国际化（i18n）使用指南
- 新增 Nginx 反向代理配置（基础、性能优化、安全）
- 新增 Docker 部署配置（运行、资源限制、日志管理）
- 新增部署验证清单（构建、运行、测试）
- 新增更新部署流程和回滚策略
- 新增监控与维护指南
- 新增安全最佳实践
- 扩展常见问题解答（端口占用、502错误、静态资源404等）

#### v1.0 (2025-12-21)
- 初始版本
- 基于 Merge PDF 技术规范创建通用模板
- 包含基础架构和设计原则

---

## 附录：快速参考

### 必需文件清单

```
frontend/[category-id]/
├── src/
│   ├── app/[locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── [tool-id]/page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── Breadcrumb.tsx
│   │   ├── CoreToolArea.tsx
│   │   ├── UseCaseCards.tsx
│   │   ├── HowToSection.tsx
│   │   └── FAQSection.tsx
│   ├── lib/[toolLogic].ts
│   ├── locales/
│   │   ├── en.json
│   │   └── zh.json
│   ├── i18n/request.ts
│   └── middleware.ts
├── public/.gitkeep
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── Dockerfile
```

### 关键配置值

| 配置项 | 位置 | 值 |
|--------|------|-----|
| basePath | next.config.js | `/[category-id]` |
| localePrefix | middleware.ts | `'always'` |
| output | next.config.js | `'standalone'` |
| MAIN_APP_URL | Breadcrumb.tsx | `'http://[main-app-url]'` |
| 端口 | package.json, Dockerfile | `[port]` |



**使用说明**:
1. 将所有 `[category-id]` 替换为实际分类 ID（如 `pdf-tools`, `image-tools`）
2. 将所有 `[tool-id]` 替换为实际工具 ID（如 `merge-pdf`, `compress-image`）
3. 将所有 `[Tool Name]` 替换为实际工具名称
4. 将所有 `[port]` 替换为实际端口号（如 `3001`, `3002`）
5. 将所有 `[your-domain]` 替换为实际域名或 IP
6. 将所有 `[main-app-url]` 替换为 Main 应用的 URL
7. 根据具体工具类型填充 Use Case 和 FAQ 内容
8. 根据技术需求选择客户端或服务端处理方案

---

**文档完整性**: 本模板涵盖从开发到部署的完整流程，包括：
- ✅ Next.js 14 架构配置
- ✅ TypeScript 和 Tailwind CSS 配置
- ✅ 国际化（i18n）实现
- ✅ 组件开发模板
- ✅ Docker 容器化
- ✅ Nginx 反向代理
- ✅ 部署验证流程
- ✅ 监控与维护
- ✅ 安全最佳实践
- ✅ 故障排查指南
