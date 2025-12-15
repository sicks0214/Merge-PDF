
# TooliBox — 前端需求与实现计划

## 概述
本文档定义了 TooliBox 的前端架构、开发、构建和部署需求（微前端 + 子路径路由）。
前端负责主门户（导航、搜索）以及托管轻量级外壳，通过反向代理或 iframe 加载独立的工具应用。

## 目标
- 主门户（Next.js）提供全局布局、搜索、账户和路由功能。
- 每个工具保持独立的 SPA（Vite + React + TypeScript），可在本地使用 `npm run dev` 独立开发和测试。
- 生产环境：每个工具独立构建和服务，通过 Nginx 在 `/tool-slug/` 下进行代理。
- 工具代码不会打包到主门户中。门户仅链接/代理到工具。
- 保留主门户页面的 SEO。

## 技术栈
- 主门户：Next.js（React 18，TypeScript）— SSR 用于 SEO
- 工具应用：Vite + React 18 + TypeScript
- 样式：Tailwind CSS（共享配置）
- 构建：`npm run build` 为工具生成静态资源（如适用）
- CI：GitHub Actions（推荐）
- 本地开发：`npm run dev`（Vite/Next 开发服务器）
- 容器：Docker 用于生产镜像

## 仓库布局（推荐）
```
toolibox/
├─ portal/                  # Next.js 主门户（独立仓库或 monorepo 包）
├─ tools/
│  ├─ pdf-tools/            # Vite 应用（推荐独立仓库）
│  ├─ image-tools/
│  ├─ color-tools/
│  └─ ai-tools/
```

## 开发指南
- 每个工具必须可独立运行：`npm run dev` 启动开发服务器（默认端口 3001、3002...）。
- 通过小型私有包共享设计令牌（可选）或复制 Tailwind 配置。
- 工具内的组件必须自包含，不能导入 Next.js 专用模块。
- 国际化：工具接受 `labels` 属性；主门户提供翻译。
- 无全局 CSS 泄漏：使用 Tailwind 工具类和组件作用域样式。

## 构建与输出
- 工具构建命令：`npm run build` → 输出到 `dist/` 或 `build/`。
- 提供静态构建：在容器内使用简单的静态服务器（nginx）或 Node 服务器（`serve`/`http-server`）。
- 每个工具容器应暴露内部端口（如 3000）并进行反向代理。

## 本地集成（开发）
- 门户开发运行在 `localhost:3000`。
- 工具开发：
  - pdf-tools：`localhost:3001`
  - image-tools：`localhost:3002`
- 门户本地开发使用 `next.config.js rewrites` 或本地反向代理将 `/pdf-tools/*` 代理到 `http://localhost:3001/`（推荐：在工具的 Vite 中使用 `proxy` 或 `本地 Nginx`）。
- 示例 `next.config.js` 开发重写规则：
```js
module.exports = {
  async rewrites() {
    return [
      { source: '/pdf-tools/:path*', destination: 'http://localhost:3001/:path*' },
      { source: '/image-tools/:path*', destination: 'http://localhost:3002/:path*' },
    ]
  }
}
```

## 生产集成
- 每个工具作为独立的 Docker 容器部署，由 Nginx 提供服务。
- Nginx 映射 `/pdf-tools/` -> `http://127.0.0.1:9001/` 等（见基础设施文档）。
- 推荐在 Vite 中配置 `basename` 或 `base`，使工具的资源在子路径下正确解析：
  - `vite.config.ts`：`base: '/pdf-tools/'`

## CI/CD（推荐）
- 每个仓库的 GitHub Actions 流水线：
  - 推送到 main 分支时：
    - 运行测试、代码检查
    - 构建（Vite/Next）
    - 构建 Docker 镜像
    - 推送镜像到镜像仓库
    - 通过 `ssh` 部署或更新 Kubernetes / docker-compose 堆栈
- 标记发布版本并保留回滚标签。

## 健康检查与指标
- 每个工具暴露 `/health` 端点，返回 200。
- 指标：暴露 Prometheus 兼容的 `/metrics`（可选）或依赖主机级监控。

## 安全与速率限制
- 调用后端 API 的工具应使用门户 API 代理端点（`/api/tools/...`）以避免 CORS 并集中认证。
- 所有工具页面应通过 HTTPS 提供服务（由 Nginx + certbot 处理）。

## Vite 配置示例
```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/pdf-tools/',
  plugins: [react()],
  server: {
    port: 3001,
  },
});
```

## 交付清单
- [ ] 门户仓库初始化（Next.js）
- [ ] 工具骨架仓库创建（Vite+TS）
- [ ] 共享 Tailwind 配置可用
- [ ] 门户和每个工具的 CI 流水线
- [ ] 每个工具的 Dockerfile
- [ ] Nginx 反向代理配置
