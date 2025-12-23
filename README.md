# Merge PDF - PDF 合并工具

基于微前端 + 后端 API 架构的 PDF 合并工具，作为 Toolibox 平台的子模块。

## 技术栈

- **前端框架**: Next.js 14 + React 18 + TypeScript
- **后端框架**: Express.js + TypeScript
- **PDF 处理**: pdf-lib (后端处理)
- **国际化**: next-intl (中英文支持)
- **样式**: Tailwind CSS
- **部署**: Docker + Nginx

## 项目结构

```
Merge-PDF/
├── frontend/pdf-tools/          # Next.js 前端
│   ├── src/
│   │   ├── app/[locale]/        # 国际化路由
│   │   ├── components/          # React 组件
│   │   ├── lib/
│   │   │   ├── api.ts          # 后端 API 调用
│   │   │   └── pdfMerger.ts    # 前端工具函数
│   │   └── locales/             # 翻译文件
│   └── Dockerfile
├── backend/                     # Express 后端
│   ├── src/
│   │   ├── app.ts              # 入口
│   │   └── routes/pdf.ts       # PDF 合并 API
│   └── Dockerfile
├── docs/                        # 文档
├── docker-compose.yml
└── README.md
```

## 架构说明

```
Nginx (VPS)
├── /                → frontend-main (3000)      # 主站首页
├── /pdf-tools       → frontend-pdf-tools (3001) # 本项目前端
└── /api/*           → backend-main (8000)       # 统一后端
```

## 核心特性

- ✅ **后端处理**: PDF 文件在服务端处理，支持大文件
- ✅ **隐私安全**: 文件处理后自动清理
- ✅ **国际化**: 支持中英文双语
- ✅ **页面范围选择**: 可选择特定页面进行合并
- ✅ **拖拽排序**: 支持拖拽调整文件顺序

## 快速开始

### 本地开发

```bash
# 启动后端
cd backend
npm install
npm run dev

# 启动前端（新终端）
cd frontend/pdf-tools
npm install
npm run dev
```

前端: http://localhost:3001/pdf-tools/en/merge-pdf
后端: http://localhost:8000/api/health

### Docker 部署

```bash
docker compose up -d --build
```

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/pdf/analyze` | POST | PDF 分析（页数、加密状态） |
| `/api/pdf/merge` | POST | PDF 合并 |

## 环境变量

### 前端 (.env.local)
```bash
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_MAIN_APP_URL=
```

### 后端
```bash
PORT=8000
NODE_ENV=production
```

## URL 路由

| 语言 | URL |
|------|-----|
| 英文 | `/pdf-tools/en/merge-pdf` |
| 中文 | `/pdf-tools/zh/merge-pdf` |

## 版本信息

- **版本**: 3.0
- **架构**: 微前端 + 后端 API
- **最后更新**: 2025-12-23

## 部署说明

详细部署步骤请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

## License

MIT
