# Merge PDF - PDF 合并工具

基于 Next.js 14 的 PDF 合并工具，支持客户端 PDF 处理，无需后端服务。

## 技术栈

- **前端框架**: Next.js 14 + React 18 + TypeScript
- **PDF 处理**: pdf-lib (客户端处理)
- **国际化**: next-intl (中英文支持)
- **样式**: Tailwind CSS
- **部署**: Docker + Nginx

## 项目结构

```
Merge-PDF/
├── frontend/pdf-tools/          # Next.js 应用
│   ├── src/
│   │   ├── app/
│   │   │   └── [locale]/        # 国际化路由
│   │   │       ├── page.tsx     # PDF Tools 首页
│   │   │       └── merge-pdf/
│   │   │           └── page.tsx # Merge PDF 页面
│   │   ├── components/          # React 组件
│   │   ├── lib/                 # 工具库
│   │   │   └── pdfMerger.ts    # PDF 处理逻辑
│   │   ├── locales/             # 翻译文件
│   │   └── i18n/                # 国际化配置
│   ├── package.json
│   ├── next.config.js
│   └── Dockerfile
├── docs/                        # 文档
│   ├── Toolibox_Merge_PDF.md   # 技术规范
│   └── Toolibox_Merge_PDF-VPS.md # VPS 部署指南
├── docker-compose.yml           # Docker Compose 配置
└── README.md                    # 本文件
```

## 核心特性

- ✅ **客户端处理**: 所有 PDF 文件在浏览器中处理，不上传到服务器
- ✅ **隐私安全**: 用户文件保持私密，无数据泄露风险
- ✅ **国际化**: 支持中英文双语
- ✅ **页面范围选择**: 可选择特定页面进行合并
- ✅ **书签保留**: 保留原始 PDF 的书签（有限支持）
- ✅ **打印优化**: 优化合并后的 PDF 用于打印
- ✅ **拖拽排序**: 支持拖拽调整文件顺序

## 快速开始

### 本地开发

```bash
cd frontend/pdf-tools
npm install
npm run dev
```

访问: http://localhost:3001/pdf-tools/en/merge-pdf

### Docker 部署

```bash
# 构建镜像
docker compose build

# 启动服务
docker compose up -d

# 查看日志
docker compose logs -f
```

访问: http://localhost:3001/pdf-tools/en/merge-pdf

## 配置说明

### Next.js 配置 (next.config.js)

```javascript
const nextConfig = {
  basePath: '/pdf-tools',      // 基础路径
  output: 'standalone',         // 独立输出模式
};
```

### Docker Compose 配置

```yaml
services:
  pdf-tools:
    build:
      context: ./frontend/pdf-tools
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
```

## URL 路由

| 语言 | URL |
|------|-----|
| 英文 | `/pdf-tools/en/merge-pdf` |
| 中文 | `/pdf-tools/zh/merge-pdf` |

## 部署到 VPS

详细部署步骤请参考: [docs/Toolibox_Merge_PDF-VPS.md](docs/Toolibox_Merge_PDF-VPS.md)

## 技术规范

完整技术规范请参考: [docs/Toolibox_Merge_PDF.md](docs/Toolibox_Merge_PDF.md)

## 版本信息

- **版本**: 2.0
- **最后更新**: 2025-12-20
- **架构**: Next.js 14 + 客户端 PDF 处理

## License

MIT
