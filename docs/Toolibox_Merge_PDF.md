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
│ Use Case Sections (Grid Cards)    │
│ [Card 1] [Card 2] [Card 3]         │
│ Printing | Bookmarks | Page Range  │
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

## 5. Use Case Sections (使用场景卡片区)

使用场景通过并排卡片实现，兼顾 SEO 和用户体验。

### 5.1 通用规则

- **标题级别**: 使用 `<h2>` 标签
- **布局方式**: 响应式网格布局 (desktop: 3列, mobile: 1列)
- **默认状态**: 展开显示 (always visible)
- **内容可见性**: 所有内容在 HTML 中完整存在
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

#### 卡片内容结构

```
Title: Merge PDF for Printing

Description:
Merge PDF for Printing lets you combine multiple PDF files into a single
document optimized for printing...

Features (列表):
- ✓ Optimized for print output
- ✓ Unified paper size and layout
- ✓ Ideal for printing and offline use

Action:
[ Use this setting ]
```

#### 点击行为（状态变化）

```typescript
useCaseOptions = {
  optimizeForPrint: true,
  keepBookmarks: false,
  usePageRange: false
}
```

---

### 5.3 Use Case 2: Merge PDF Keep Bookmarks

#### HTML 标记

```html
<h2>Merge PDF Keep Bookmarks</h2>
```

#### 卡片内容结构

```
Title: Merge PDF Keep Bookmarks

Description:
Merge PDF Keep Bookmarks lets you combine multiple PDF files while
preserving the original bookmarks from each document...

Features (列表):
- ✓ Preserve original bookmarks
- ✓ Maintain document structure
- ✓ Ideal for long or structured PDFs

Action:
[ Use this setting ]
```

#### 点击行为（状态变化）

```typescript
useCaseOptions = {
  ...prevOptions,
  keepBookmarks: true
}
```

---

### 5.4 Use Case 3: Merge PDF by Page Range

#### HTML 标记

```html
<h2>Merge PDF by Page Range</h2>
```

#### 卡片内容结构

```
Title: Merge PDF by Page Range

Description:
Merge PDF by Page Range allows you to select specific pages from each
PDF file before merging...

Features (列表):
- ✓ Select custom page ranges (e.g. 1-3, 5, 8-10)
- ✓ Merge only required pages from each PDF
- ✓ Reduce the final PDF file size

Action:
[ Apply page range ]
```

#### 点击行为（状态变化）

```typescript
useCaseOptions = {
  ...prevOptions,
  usePageRange: true
}

// 启用后，每个文件显示页面范围输入框
// 用户可为每个文件设置: file.pageRange = "1-3,5"
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
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div class="card">
    <div class="step-number">1</div>
    <h3>Upload PDF Files</h3>
    <p>Select or drag and drop multiple PDF files you want to merge.</p>
  </div>
  <div class="card">
    <div class="step-number">2</div>
    <h3>Arrange Files</h3>
    <p>Drag and drop files to reorder them in your desired sequence.</p>
  </div>
  <div class="card">
    <div class="step-number">3</div>
    <h3>Choose Options</h3>
    <p>Optionally select merge options like keeping bookmarks or page ranges.</p>
  </div>
  <div class="card">
    <div class="step-number">4</div>
    <h3>Download Result</h3>
    <p>Click "Merge PDF" and download your combined document instantly.</p>
  </div>
</div>
```

### 要求

- 必须包含明确的步骤说明（4个步骤）
- 使用网格卡片布局 (2x2 grid on desktop, 1 column on mobile)
- 每个步骤包含：编号、标题 (h3)、说明文本
- 语言简洁清晰

---

## 8. FAQ 区块（SEO 必需）

提供常见问题解答，采用可折叠的交互式设计。

### HTML 结构示例

```html
<h2>Frequently Asked Questions</h2>

<div class="faq-item">
  <button class="faq-question">
    <span class="number">1</span>
    <span class="question-text">Is Merge PDF free?</span>
    <svg class="chevron">...</svg>
  </button>
  <div class="faq-answer">
    Yes, this tool is completely free to use. You can merge unlimited PDF files without any charges or subscriptions.
  </div>
</div>

<div class="faq-item">
  <button class="faq-question">
    <span class="number">2</span>
    <span class="question-text">Are my files secure?</span>
    <svg class="chevron">...</svg>
  </button>
  <div class="faq-answer">
    All files are processed securely on our servers and are automatically deleted after processing...
  </div>
</div>

<!-- 更多问题... -->
```

### 要求

- 至少包含 6 个问题（实际实现了6个）
- 使用可折叠交互组件（点击展开/收起）
- 默认状态为折叠
- 问题使用加粗样式（font-semibold）
- 回答简洁明了，支持多行文本
- 包含编号标识（1, 2, 3...）

### FAQ 内容清单

1. Is Merge PDF free?
2. Are my files secure?
3. Can I merge large PDF files?
4. Can I merge encrypted PDF files?
5. Will bookmarks be preserved in the merged PDF?
6. Can I select specific pages from each PDF?

---

## 9. 后端接口规范

### API Endpoint

```
POST /api/pdf/merge
```

### 请求格式

使用 `multipart/form-data` 格式（非 JSON）。

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| files | File[] | ✅ | PDF 文件数组，通过 FormData 上传 |
| commands | String | ✅ | 命令字符串，定义合并规则和选项 |

### Commands 命令字符串格式

命令字符串采用类命令行语法，每行一个指令，用换行符 `\n` 分隔。

**基本语法**:
```
<file_index>:<page_range>
--<option_flag>
```

**示例 1：基本合并（所有页面）**
```
1:all
2:all
3:all
```

**示例 2：指定页面范围**
```
1:1-3
2:5,7-10
3:all
```

**示例 3：带选项的合并**
```
1:all
2:all
--keep-bookmarks
--print
```

### 选项标志

| 标志 | 说明 |
|-----|------|
| `--keep-bookmarks` | 保留原始 PDF 的书签 |
| `--print` | 优化打印输出（移除空白页） |

### 页面范围语法

| 格式 | 说明 | 示例 |
|-----|------|------|
| `all` | 所有页面 | `1:all` |
| `n` | 单页 | `1:3` (第3页) |
| `m-n` | 范围 | `1:1-5` (第1-5页) |
| `m,n` | 多个 | `1:1,3,5` (第1,3,5页) |
| `m-n,p-q` | 组合 | `1:1-3,7-10` |

### 前端发送示例

```typescript
const formData = new FormData()

// 添加文件
files.forEach((pdfFile, index) => {
  formData.append('files', pdfFile.file, `${index + 1}_${pdfFile.name}`)
})

// 构建命令字符串
const commands = [
  '1:all',
  '2:1-3',
  '3:all',
  '--keep-bookmarks',
  '--print'
].join('\n')

formData.append('commands', commands)

// 发送请求
const response = await fetch('/api/pdf/merge', {
  method: 'POST',
  body: formData
})
```

### 后端接收示例 (FastAPI)

```python
@app.post("/api/pdf/merge")
async def merge(
    files: list[UploadFile] = File(...),
    commands: str = Form(...)
):
    # 解析命令字符串
    parsed = parse_commands(commands, len(files))

    # 读取文件内容
    file_contents = [await f.read() for f in files]

    # 执行合并
    result = merge_pdfs(file_contents, parsed)

    # 返回 PDF
    return StreamingResponse(
        io.BytesIO(result),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=merged.pdf"}
    )
```

### 响应

```
Content-Type: application/pdf
Content-Disposition: attachment; filename=merged.pdf

[PDF Binary Data]
```

### 错误响应

```json
{
  "detail": "错误信息描述"
}
```

HTTP 状态码:
- `400`: 参数错误（文件格式错误、命令语法错误）
- `500`: 服务器错误（合并失败）

---

## 10. 核心设计原则总结

### 页面架构

- **一个页面**: 所有功能在单一页面实现
- **一个工具**: 专注 PDF 合并功能
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

---

## 版本信息

- **版本**: 1.1
- **最后更新**: 2024-12
- **维护者**: Toolibox Team
- **更新说明**: 根据实际实现更新规范（Use Case 卡片化、命令字符串 API、交互式 FAQ）
