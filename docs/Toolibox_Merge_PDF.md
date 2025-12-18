# Toolibox · Merge PDF 工具技术规范

## 概述

本文档定义了 Merge PDF 工具的完整技术实现规范，包括页面结构、交互行为、SEO 优化和后端接口设计。

### 设计原则

- **单页面架构**: 所有使用场景在同一页面通过折叠区域呈现
- **固定操作区**: 核心工具区域位置固定，不受其他交互影响
- **SEO 友好**: 所有内容在 HTML 中存在，折叠不影响搜索引擎索引
- **用户体验**: 清晰的状态反馈和操作流程

---

## 1. 工具基本信息

| 属性 | 值 |
|------|-----|
| Tool Name | Merge PDF |
| Category | PDF Tools |
| URL | /pdf-tools/merge-pdf |

---

## 2. 页面唯一性规则

**重要**: Merge PDF 只有一个页面，所有使用场景都在同一页面内通过折叠区呈现。

### 禁止的页面

以下页面不应存在:

- ❌ `/merge-pdf-printing`
- ❌ `/merge-pdf-keep-bookmarks`
- ❌ `/merge-pdf-by-page-range`

---

## 3. 页面整体布局

页面采用固定的从上到下结构，各部分顺序不可调整。

```
┌────────────────────────────────────┐
│ Breadcrumb                          │
│ Home / PDF Tools / Merge PDF        │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ H1: Merge PDF                      │
│ Intro paragraph                    │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ Core Tool Area  ← 固定位置，不移动  │
│  - Upload PDF files                │
│  - File list (drag reorder)        │
│  - Primary button: Merge PDF       │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ Inline Feedback (optional)          │
│ e.g. "Printing settings applied ✔" │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ Use Case Sections (Accordion)      │
│ ▼ Merge PDF for Printing           │
│ ▼ Merge PDF Keep Bookmarks         │
│ ▼ Merge PDF by Page Range          │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ How to Merge PDF Files             │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ FAQ                                │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ Footer                             │
└────────────────────────────────────┘
```

---

## 4. Core Tool Area (核心操作区规范)

核心操作区是页面的锚点，任何交互都不能改变它的位置。

### 必须包含的元素

1. **文件上传组件**
   - 支持拖拽上传 (Drag & Drop)
   - 支持点击选择文件
   - 支持多文件上传

2. **文件列表**
   - 显示已上传的文件
   - 支持拖拽排序
   - 显示文件信息（名称、页数、大小等）

3. **主操作按钮**
   ```
   [ Merge PDF ]
   ```

### 行为规则

| 交互行为 | 是否影响 Core Tool Area |
|---------|------------------------|
| Use Case 展开 / 折叠 | ❌ 不影响 |
| 参数状态变化 | ✅ 只影响内部状态 |
| 文件添加 / 删除 | ✅ 更新文件列表 |

---

## 5. Use Case Sections (使用场景折叠区)

使用场景通过折叠区域实现，兼顾 SEO 和用户体验。

### 5.1 通用规则

- **标题级别**: 使用 `<h2>` 标签
- **默认状态**: 折叠 (collapsed)
- **内容可见性**: 内容必须在 HTML 中存在
- **交互行为**:
  - ❌ 不跳转页面
  - ❌ 不生成新 URL
  - ✅ 只修改参数状态

---

### 5.2 Use Case 1: Merge PDF for Printing

#### HTML 标记

```html
<h2>Merge PDF for Printing</h2>
```

#### 展开后的内容结构

```
Description:
- Optimized for print output
- Unified paper size (A4 / Letter)

Action:
[ Use this setting ]
```

#### 点击行为（状态变化）

```typescript
optimizeForPrint = true
keepBookmarks = false
pageRange = null
```

---

### 5.3 Use Case 2: Merge PDF Keep Bookmarks

#### HTML 标记

```html
<h2>Merge PDF Keep Bookmarks</h2>
```

#### 展开后的内容结构

```
Description:
- Preserve bookmarks from original PDFs

Action:
[ Use this setting ]
```

#### 点击行为（状态变化）

```typescript
keepBookmarks = true
```

---

### 5.4 Use Case 3: Merge PDF by Page Range

#### HTML 标记

```html
<h2>Merge PDF by Page Range</h2>
```

#### 展开后的内容结构

```
Description:
- Select specific pages from each PDF

Inputs:
- Page range input per file (e.g. 1-3,5)

Action:
[ Apply ]
```

#### 点击行为（状态变化）

```typescript
pageRange = "user-defined"
```

---

## 6. Inline Feedback 区域

用于显示操作状态提示。

### 示例文本

```
✓ Printing settings applied
✓ Bookmarks will be preserved
```

### 设计规则

- **位置**: 固定在 Core Tool Area 下方
- **行为**: 可出现 / 消失
- **布局影响**: 不影响其他区域布局

---

## 7. How-to 区块（SEO 必需）

提供步骤说明，提升 SEO 和用户体验。

### HTML 结构示例

```html
<h2>How to Merge PDF Files</h2>
<ol>
  <li>Upload multiple PDF files.</li>
  <li>Arrange files in the desired order.</li>
  <li>Choose merge options if needed.</li>
  <li>Click "Merge PDF" to download the result.</li>
</ol>
```

### 要求

- 必须包含明确的步骤说明
- 使用有序列表 `<ol>`
- 语言简洁清晰

---

## 8. FAQ 区块（SEO 必需）

提供常见问题解答。

### HTML 结构示例

```html
<h2>FAQ</h2>

<p><strong>Is Merge PDF free?</strong><br>
Yes, this tool is free to use.</p>

<p><strong>Are my files secure?</strong><br>
All files are processed securely and deleted automatically.</p>

<p><strong>Can I merge large PDF files?</strong><br>
Yes, within the supported size limits.</p>
```

### 要求

- 至少包含 3 个问题
- 使用 `<strong>` 标签标记问题
- 回答简洁明了

---

## 9. 后端接口规范

### API Endpoint

```
POST /api/pdf/merge
```

### 请求参数

```json
{
  "files": [
    { "file": "pdf1", "pageRange": "1-3" },
    { "file": "pdf2", "pageRange": "" }
  ],
  "options": {
    "optimizeForPrint": true,
    "keepBookmarks": false
  }
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| files | Array | ✅ | 文件列表 |
| files[].file | File | ✅ | PDF 文件对象 |
| files[].pageRange | String | ❌ | 页码范围，如 "1-3,5"，空表示全部 |
| options | Object | ❌ | 合并选项 |
| options.optimizeForPrint | Boolean | ❌ | 是否优化打印（统一纸张大小） |
| options.keepBookmarks | Boolean | ❌ | 是否保留书签 |

### 响应

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="merged.pdf"

[PDF Binary Data]
```

---

## 10. 核心设计原则总结

### 页面架构

- **一个页面**: 所有功能在单一页面实现
- **一个工具**: 专注 PDF 合并功能
- **多个场景**: 通过折叠区域展示不同使用场景
- **固定操作区**: 核心交互区域位置固定

### SEO 优化

- **折叠 ≠ 隐藏**: 内容在 HTML 中完整存在
- **场景 ≠ 新页面**: 使用状态切换而非页面跳转
- **语义化标签**: 正确使用 H1、H2 等标题标签

### 用户体验

- **清晰反馈**: 及时的状态提示
- **固定锚点**: 操作区域不移动
- **流畅交互**: 无页面刷新的状态切换

---

## 版本信息

- **版本**: 1.0
- **最后更新**: 2024-12
- **维护者**: Toolibox Team
