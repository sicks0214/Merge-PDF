# Merge PDF 工具 - VPS 部署指南

## 概述

本文档说明如何将 Merge PDF 工具部署到 VPS (82.29.67.124)，作为 Toolibox 微前端架构中的 PDF Tools 子应用。

### 架构变更说明

**重大变更**：新版本已从 Vite + React + 后端 API 架构迁移到 **Next.js + 客户端处理**架构：

| 项目 | 旧版本 | 新版本 |
|------|--------|--------|
| 前端框架 | Vite + React | **Next.js 14** |
| PDF 处理 | 服务端 PyMuPDF | **客户端 pdf-lib** |
| 后端需求 | 需要 FastAPI 后端 | **无需后端** |
| 国际化 | 无 | **中英文支持** |
| 目录位置 | `tools/pdf-tools/` | **`frontend/pdf-tools/`** |

---

## 一、部署架构

### 在微前端架构中的位置

```
Internet
   │
   ▼
Nginx (宿主机) - 82.29.67.124:80
   │
   ├─ /                     → 127.0.0.1:3000  (Main 应用) ✅ 已部署
   ├─ /api/*                → 127.0.0.1:8000  (Main 后端) ✅ 已部署
   │
   └─ /pdf-tools/*          → 127.0.0.1:3001  (PDF 工具前端) ⏳ 本项目
       ├─ /pdf-tools/en/merge-pdf  (英文版)
       └─ /pdf-tools/zh/merge-pdf  (中文版)
```

**注意**：新版本 **不再需要后端服务**，所有 PDF 处理在浏览器端完成。

### 服务信息

| 组件 | 技术栈 | 容器端口 | 宿主机端口 | 访问路径 |
|------|--------|---------|-----------|---------|
| 前端 | Next.js 14 (standalone) | 3001 | 3001 | /pdf-tools/* |

---

## 二、项目结构

### 新版目录结构

```
frontend/pdf-tools/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   └── [locale]/
│   │       ├── layout.tsx           # 国际化布局
│   │       ├── page.tsx             # PDF Tools 首页
│   │       └── merge-pdf/
│   │           └── page.tsx         # Merge PDF 页面
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx           # 页头（含语言切换）
│   │   │   └── Footer.tsx           # 页脚
│   │   ├── CoreToolArea.tsx         # 文件上传区域
│   │   ├── UseCaseCards.tsx         # 使用场景卡片
│   │   ├── HowToSection.tsx         # 使用步骤
│   │   ├── FAQSection.tsx           # 常见问题
│   │   └── ResultPage.tsx           # 结果页面
│   ├── lib/
│   │   └── pdfMerger.ts             # 客户端 PDF 处理 (pdf-lib)
│   ├── locales/
│   │   ├── en.json                  # 英文翻译
│   │   └── zh.json                  # 中文翻译
│   └── i18n/
│       └── request.ts               # 国际化配置
├── package.json
├── next.config.js                   # basePath: '/pdf-tools'
├── tailwind.config.js
├── tsconfig.json
└── Dockerfile
```

### 关键配置

**next.config.js**:
```javascript
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
  basePath: '/pdf-tools',
  output: 'standalone',
};

module.exports = withNextIntl(nextConfig);
```

---

## 三、VPS Nginx 配置

### 宿主机 Nginx 配置（简化版）

**位置**: `/etc/nginx/sites-available/toolibox.conf`

```nginx
server {
    listen 80;
    server_name 82.29.67.124;

    # Main 应用（已部署）
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # PDF 工具（Next.js 应用）
    location /pdf-tools/ {
        proxy_pass http://127.0.0.1:3001/pdf-tools/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**变更说明**：
- ✅ 移除了 `/api/pdf/*` 路由配置（不再需要后端）
- ✅ 简化了 proxy 配置
- ✅ 添加了 WebSocket 支持（Next.js 开发模式需要）

---

## 四、部署步骤

### 步骤 1：准备代码包

在本地（Windows）执行：

```bash
# 进入项目目录
cd E:\codelibrary\Merge-PDF

# 打包项目文件
tar -czf merge-pdf.tar.gz frontend/pdf-tools docs/

# 上传到 VPS
scp merge-pdf.tar.gz toolibox@82.29.67.124:/var/www/toolibox/
```

### 步骤 2：在 VPS 上解压

```bash
# SSH 登录 VPS
ssh toolibox@82.29.67.124

# 进入工作目录
cd /var/www/toolibox

# 解压文件
tar -xzf merge-pdf.tar.gz

# 验证文件结构
ls -la frontend/pdf-tools/
# 应该看到：
# - src/
# - package.json
# - next.config.js
# - Dockerfile
```

### 步骤 3：构建 Docker 镜像

```bash
cd /var/www/toolibox

# 构建前端镜像
docker build -t toolibox/pdf-tools ./frontend/pdf-tools

# 验证镜像构建成功
docker images | grep pdf-tools
```

**预期输出**：
```
toolibox/pdf-tools    latest    abc123    ~300MB
```

**构建时间估计**：3-5 分钟（Next.js 构建 + standalone 输出）

### 步骤 4：创建 docker-compose.yml

在 `/var/www/toolibox/` 创建或更新 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  pdf-tools:
    image: toolibox/pdf-tools
    container_name: pdf-tools
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    restart: unless-stopped
```

### 步骤 5：启动容器

```bash
# 启动 PDF 工具服务
docker compose up -d pdf-tools

# 查看运行状态
docker ps

# 应该看到：
# CONTAINER ID   IMAGE                 STATUS         PORTS
# abc123         toolibox/pdf-tools    Up X seconds   0.0.0.0:3001->3001/tcp

# 查看容器日志
docker compose logs -f pdf-tools
```

### 步骤 6：验证部署

#### 6.1 检查容器状态

```bash
# 检查容器是否运行
docker ps | grep pdf-tools

# 检查端口监听
sudo netstat -tlnp | grep 3001
```

#### 6.2 测试本地访问

```bash
# 测试前端（应该返回 HTML）
curl http://127.0.0.1:3001/pdf-tools/en/merge-pdf

# 测试中文版
curl http://127.0.0.1:3001/pdf-tools/zh/merge-pdf
```

#### 6.3 测试外部访问

```bash
# 通过 Nginx 访问
curl http://82.29.67.124/pdf-tools/en/merge-pdf
curl http://82.29.67.124/pdf-tools/zh/merge-pdf
```

#### 6.4 浏览器测试

打开浏览器访问：
- 英文版: `http://82.29.67.124/pdf-tools/en/merge-pdf`
- 中文版: `http://82.29.67.124/pdf-tools/zh/merge-pdf`

功能测试：
1. ✅ 页面正常显示
2. ✅ 语言切换正常
3. ✅ 上传 PDF 文件
4. ✅ 拖拽排序文件
5. ✅ 选择使用场景（打印优化/保留书签/页面范围）
6. ✅ 合并 PDF 文件
7. ✅ 下载合并后的 PDF

---

## 五、故障排查

### 问题 1：502 Bad Gateway

**症状**: 访问 `/pdf-tools/` 返回 502 错误

**可能原因**:
- 容器未运行
- 端口未正确映射

**解决方法**:
```bash
# 检查容器状态
docker ps -a | grep pdf-tools

# 查看容器日志
docker compose logs pdf-tools

# 重启容器
docker compose restart pdf-tools
```

### 问题 2：页面空白或样式错乱

**症状**: 页面打开但无内容，或 CSS/JS 404

**可能原因**:
- basePath 配置问题
- Nginx 代理配置问题

**解决方法**:
```bash
# 检查 Nginx 配置
sudo nginx -t

# 查看浏览器控制台，确认资源请求路径
# 正确的资源路径应该是：/pdf-tools/_next/static/...

# 检查 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

### 问题 3：语言切换不工作

**症状**: 点击语言切换无响应或 404

**可能原因**:
- 国际化配置问题
- 路由配置问题

**解决方法**:
```bash
# 直接访问测试
curl http://127.0.0.1:3001/pdf-tools/en/merge-pdf
curl http://127.0.0.1:3001/pdf-tools/zh/merge-pdf

# 查看容器日志
docker compose logs -f pdf-tools
```

### 问题 4：PDF 合并失败

**症状**: 上传文件后合并报错

**可能原因**:
- 浏览器不支持（需要现代浏览器）
- 文件过大导致内存不足

**解决方法**:
- 使用 Chrome/Firefox/Edge 最新版本
- 减少单次合并的文件数量或大小
- 检查浏览器控制台错误信息

---

## 六、运维操作

### 日常操作

```bash
# 查看运行状态
docker ps | grep pdf-tools

# 查看实时日志
docker compose logs -f pdf-tools

# 重启服务
docker compose restart pdf-tools

# 停止服务
docker compose stop pdf-tools

# 启动服务
docker compose start pdf-tools
```

### 更新部署

```bash
# 1. 上传新代码
scp merge-pdf.tar.gz toolibox@82.29.67.124:/var/www/toolibox/

# 2. 在 VPS 上解压
cd /var/www/toolibox
tar -xzf merge-pdf.tar.gz

# 3. 重新构建镜像
docker build -t toolibox/pdf-tools ./frontend/pdf-tools

# 4. 重启容器
docker compose up -d --force-recreate pdf-tools

# 5. 验证更新
docker ps | grep pdf-tools
curl http://82.29.67.124/pdf-tools/en/merge-pdf
```

### 日志管理

```bash
# 查看最近 100 行日志
docker compose logs --tail=100 pdf-tools

# 查看特定时间段日志
docker compose logs --since=2h pdf-tools

# 导出日志到文件
docker compose logs pdf-tools > pdf-tools.log
```

### 资源监控

```bash
# 查看容器资源使用
docker stats pdf-tools

# 查看磁盘使用
docker system df

# 清理未使用的镜像
docker image prune -a
```

---

## 七、性能优化

### Nginx 缓存配置

可以在宿主机 Nginx 中添加静态资源缓存：

```nginx
location /pdf-tools/ {
    proxy_pass http://127.0.0.1:3001/pdf-tools/;
    # ... 其他配置 ...

    # 静态资源缓存
    location /pdf-tools/_next/static/ {
        proxy_pass http://127.0.0.1:3001/pdf-tools/_next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 资源限制

可以在 `docker-compose.yml` 中添加资源限制：

```yaml
pdf-tools:
  image: toolibox/pdf-tools
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 512M
```

---

## 八、安全说明

### 隐私保护

✅ **客户端处理**：所有 PDF 文件在用户浏览器中处理，**不会上传到服务器**

这意味着：
- 用户文件保持私密
- 无需担心数据泄露
- 服务器不存储任何用户文件

### 防火墙配置

```bash
# 确认端口 3001 不对外直接开放（只通过 Nginx 代理）
sudo ufw status
# 应该只看到 22, 80, 443 端口开放
```

---

## 九、架构优势总结

✅ **无后端依赖**
- 不再需要 FastAPI 后端
- 减少服务器资源消耗
- 简化部署和运维

✅ **隐私安全**
- PDF 文件在浏览器本地处理
- 不上传到服务器

✅ **国际化支持**
- 中英文双语
- URL 包含语言前缀
- 易于扩展更多语言

✅ **模块化部署**
- PDF 工具独立运行
- 不影响 Main 应用
- 可随时启动/停止/更新

✅ **Next.js 优势**
- SSR 支持，SEO 友好
- standalone 输出，镜像更小
- 内置路由和国际化

---

## 十、部署检查清单

部署前确认：
- [ ] `frontend/pdf-tools/` 目录存在
- [ ] `next.config.js` 配置 `basePath: '/pdf-tools'`
- [ ] `Dockerfile` 使用 standalone 模式
- [ ] VPS 宿主机 Nginx 配置已更新

部署后验证：
- [ ] 容器正常运行 (`docker ps`)
- [ ] 端口正确监听 (`netstat -tlnp | grep 3001`)
- [ ] 英文版可访问 (`curl http://82.29.67.124/pdf-tools/en/merge-pdf`)
- [ ] 中文版可访问 (`curl http://82.29.67.124/pdf-tools/zh/merge-pdf`)
- [ ] 浏览器功能测试（上传、合并、下载）
- [ ] 语言切换正常

---

## 联系与支持

- **VPS IP**: 82.29.67.124
- **SSH 用户**: toolibox
- **项目目录**: /var/www/toolibox/frontend/pdf-tools/
- **容器端口**: 3001
- **Nginx 配置**: /etc/nginx/sites-available/toolibox.conf

---

## 版本信息

- **版本**: 2.0
- **最后更新**: 2025-12-20
- **主要变更**:
  - 迁移到 Next.js 14 框架
  - 实现客户端 PDF 处理（pdf-lib）
  - 添加中英文国际化支持
  - 移除后端服务依赖
  - 简化部署架构

---

**部署完成后，Merge PDF 工具将作为 Toolibox 微前端架构的第一个独立工具服务正式上线！**
