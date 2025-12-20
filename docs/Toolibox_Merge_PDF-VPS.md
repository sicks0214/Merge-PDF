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
| 代码来源 | 本地打包上传 | **GitHub 克隆** |

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
   └─ /pdf-tools/*          → 127.0.0.1:3001  (PDF 工具前端) ✅ 已部署
       ├─ /pdf-tools/en            (PDF Tools 首页)
       ├─ /pdf-tools/en/merge-pdf  (英文版)
       └─ /pdf-tools/zh/merge-pdf  (中文版)
```

**注意**：新版本 **不再需要后端服务**，所有 PDF 处理在浏览器端完成。

### 服务信息

| 组件 | 技术栈 | 容器名 | 端口 | 访问路径 |
|------|--------|--------|------|---------|
| 前端 | Next.js 14 (standalone) | pdf-tools | 3001 | /pdf-tools/* |

### GitHub 仓库

```
https://github.com/sicks0214/Merge-PDF
```

---

## 二、项目结构

### 目录结构

```
frontend/pdf-tools/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   └── [locale]/
│   │       ├── layout.tsx           # 国际化布局
│   │       ├── page.tsx             # PDF Tools 首页（含 Header/Breadcrumb）
│   │       └── merge-pdf/
│   │           └── page.tsx         # Merge PDF 页面
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx           # 页头（Logo + 语言切换）
│   │   │   └── Footer.tsx           # 页脚
│   │   ├── Breadcrumb.tsx           # ★ 面包屑导航（支持外部链接到 Main）
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
├── public/                          # ★ 静态资源目录（必须存在）
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

**Breadcrumb.tsx** (外部链接配置):
```typescript
// Main 应用的基础 URL
const MAIN_APP_URL = 'http://82.29.67.124';

// Home 链接使用 external: true 跳转到 Main 应用
const breadcrumbItems = [
  { label: 'Home', href: '/', external: true },  // → Main 应用
  { label: 'PDF Tools' },
];
```

---

## 三、VPS Nginx 配置

### 宿主机 Nginx 配置

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
    location /pdf-tools {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 四、部署步骤

### 快速部署（完整命令）

```bash
# 1. SSH 登录 VPS
ssh toolibox@82.29.67.124

# 2. 进入工作目录
cd /var/www/toolibox

# 3. 克隆代码（首次）或拉取更新
git clone https://github.com/sicks0214/Merge-PDF.git
# 或更新: cd Merge-PDF && git pull

# 4. 进入项目目录
cd Merge-PDF

# 5. 确保 public 目录存在
mkdir -p frontend/pdf-tools/public

# 6. 构建 Docker 镜像
docker build -t toolibox/pdf-tools ./frontend/pdf-tools

# 7. 停止旧容器（如果存在）
docker rm -f pdf-tools 2>/dev/null

# 8. 启动新容器
docker run -d --name pdf-tools -p 3001:3001 --restart unless-stopped toolibox/pdf-tools

# 9. 验证部署
docker ps | grep pdf-tools
curl -s http://127.0.0.1:3001/pdf-tools/en/merge-pdf | grep -o "<title>.*</title>"
```

---

### 详细步骤说明

#### 步骤 1：克隆代码

```bash
# SSH 登录 VPS
ssh toolibox@82.29.67.124

# 进入工作目录
cd /var/www/toolibox

# 从 GitHub 克隆项目
git clone https://github.com/sicks0214/Merge-PDF.git

# 验证克隆成功
ls -la Merge-PDF/frontend/pdf-tools/
```

#### 步骤 2：构建前准备

```bash
cd /var/www/toolibox/Merge-PDF

# ★ 创建 public 目录（Docker 构建必需）
mkdir -p frontend/pdf-tools/public
touch frontend/pdf-tools/public/.gitkeep

# 验证目录结构
ls -la frontend/pdf-tools/
```

#### 步骤 3：构建 Docker 镜像

```bash
# 构建镜像（约 3-5 分钟）
docker build -t toolibox/pdf-tools ./frontend/pdf-tools

# 验证镜像
docker images | grep pdf-tools
```

**预期输出**：
```
toolibox/pdf-tools    latest    xxx    ~220MB
```

#### 步骤 4：启动容器

```bash
# 停止并删除旧容器（如果存在）
docker rm -f pdf-tools 2>/dev/null

# 启动新容器
docker run -d --name pdf-tools -p 3001:3001 --restart unless-stopped toolibox/pdf-tools

# 查看运行状态
docker ps | grep pdf-tools

# 查看启动日志
docker logs pdf-tools
```

#### 步骤 5：验证部署

```bash
# 测试本地访问
curl -s http://127.0.0.1:3001/pdf-tools/en/merge-pdf | grep -o "<title>.*</title>"
curl -s http://127.0.0.1:3001/pdf-tools/zh/merge-pdf | grep -o "<title>.*</title>"

# 测试 Nginx 代理
curl -s http://82.29.67.124/pdf-tools/en/merge-pdf | grep -o "<title>.*</title>"

# 验证 Home 链接指向 Main 应用
curl -s http://127.0.0.1:3001/pdf-tools/en/merge-pdf | grep -o 'href="http://82.29.67.124[^"]*"'
```

#### 步骤 6：浏览器测试

打开浏览器访问：
- PDF Tools 首页: `http://82.29.67.124/pdf-tools/en`
- Merge PDF 英文版: `http://82.29.67.124/pdf-tools/en/merge-pdf`
- Merge PDF 中文版: `http://82.29.67.124/pdf-tools/zh/merge-pdf`

功能测试清单：
1. ✅ 页面正常显示（含 Header 和 Breadcrumb）
2. ✅ 点击 Breadcrumb Home → 跳转到 Main 应用
3. ✅ 语言切换正常
4. ✅ 上传 PDF 文件
5. ✅ 拖拽排序文件
6. ✅ 选择使用场景（打印优化/保留书签/页面范围）
7. ✅ 合并 PDF 文件
8. ✅ 下载合并后的 PDF

---

## 五、故障排查

### 问题 1：Docker 构建失败 - `/app/public` not found

**症状**:
```
ERROR [runner 5/7] COPY --from=builder /app/public ./public
"/app/public": not found
```

**原因**: Next.js standalone 模式需要 `public/` 目录存在

**解决方法**:
```bash
mkdir -p frontend/pdf-tools/public
touch frontend/pdf-tools/public/.gitkeep
docker build -t toolibox/pdf-tools ./frontend/pdf-tools
```

### 问题 2：TypeScript 编译错误 - Uint8Array 类型

**症状**:
```
Type error: Type 'Uint8Array<ArrayBufferLike>' is not assignable to type 'BlobPart'
```

**原因**: TypeScript 5.x + Node 20 对 ArrayBuffer 类型检查更严格

**解决方法**:
```bash
# 修改 merge-pdf/page.tsx 第 140 行
# 将:
const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
# 改为:
const blob = new Blob([new Uint8Array(mergedPdfBytes)], { type: 'application/pdf' });
```

### 问题 3：端口已被占用

**症状**:
```
Bind for :::3001 failed: port is already allocated
```

**解决方法**:
```bash
# 查找占用端口的容器
docker ps | grep 3001

# 停止旧容器
docker rm -f <container_name>

# 重新启动
docker run -d --name pdf-tools -p 3001:3001 --restart unless-stopped toolibox/pdf-tools
```

### 问题 4：Home 链接不跳转到 Main 应用

**症状**: 点击 Breadcrumb 的 Home 链接停留在 PDF Tools 内部

**原因**: Breadcrumb 组件未配置 `external` 属性

**解决方法**: 确保 `Breadcrumb.tsx` 包含外部链接逻辑，且 breadcrumbItems 中 Home 有 `external: true`

```typescript
// merge-pdf/page.tsx
const breadcrumbItems = [
  { label: t('breadcrumb.home'), href: '/', external: true },  // ★ 必须有 external: true
  { label: t('breadcrumb.pdfTools'), href: '/' },
  { label: t('breadcrumb.mergePdf') },
];
```

### 问题 5：502 Bad Gateway

**症状**: 访问 `/pdf-tools/` 返回 502 错误

**解决方法**:
```bash
# 检查容器状态
docker ps -a | grep pdf-tools

# 查看容器日志
docker logs pdf-tools

# 重启容器
docker rm -f pdf-tools
docker run -d --name pdf-tools -p 3001:3001 --restart unless-stopped toolibox/pdf-tools
```

---

## 六、运维操作

### 日常操作

```bash
# 查看运行状态
docker ps | grep pdf-tools

# 查看实时日志
docker logs -f pdf-tools

# 重启容器
docker restart pdf-tools

# 停止容器
docker stop pdf-tools

# 启动容器
docker start pdf-tools
```

### 更新部署

```bash
# 1. 进入项目目录
cd /var/www/toolibox/Merge-PDF

# 2. 拉取最新代码
git pull origin master

# 3. 重新构建镜像
docker build -t toolibox/pdf-tools ./frontend/pdf-tools

# 4. 重启容器
docker rm -f pdf-tools
docker run -d --name pdf-tools -p 3001:3001 --restart unless-stopped toolibox/pdf-tools

# 5. 验证更新
docker ps | grep pdf-tools
curl http://82.29.67.124/pdf-tools/en/merge-pdf
```

### 日志管理

```bash
# 查看最近 100 行日志
docker logs --tail=100 pdf-tools

# 查看特定时间段日志
docker logs --since=2h pdf-tools

# 导出日志到文件
docker logs pdf-tools > pdf-tools.log 2>&1
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
location /pdf-tools/_next/static/ {
    proxy_pass http://127.0.0.1:3001/pdf-tools/_next/static/;
    expires 365d;
    add_header Cache-Control "public, immutable";
}
```

### 资源限制

可以在启动容器时添加资源限制：

```bash
docker run -d --name pdf-tools \
  -p 3001:3001 \
  --memory=512m \
  --cpus=1 \
  --restart unless-stopped \
  toolibox/pdf-tools
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

## 九、部署检查清单

### 部署前确认
- [ ] GitHub 仓库可访问
- [ ] VPS SSH 可登录
- [ ] Docker 已安装
- [ ] Nginx 配置已更新

### 构建检查
- [ ] `public/` 目录存在
- [ ] Docker 镜像构建成功
- [ ] 镜像大小约 220MB

### 部署后验证
- [ ] 容器正常运行 (`docker ps`)
- [ ] 端口正确监听 (`netstat -tlnp | grep 3001`)
- [ ] PDF Tools 首页可访问
- [ ] Merge PDF 页面可访问
- [ ] Home 链接跳转到 Main 应用
- [ ] 语言切换功能正常
- [ ] 文件上传和合并功能正常
- [ ] 合并结果可下载

---

## 十、联系与支持

| 项目 | 值 |
|------|-----|
| VPS IP | 82.29.67.124 |
| SSH 用户 | toolibox |
| 项目目录 | /var/www/toolibox/Merge-PDF |
| GitHub | https://github.com/sicks0214/Merge-PDF |
| 容器名 | pdf-tools |
| 容器端口 | 3001 |
| Nginx 配置 | /etc/nginx/sites-available/toolibox.conf |

---

## 版本信息

- **版本**: 2.1
- **最后更新**: 2025-12-21
- **维护者**: Toolibox Team

### 更新日志

#### v2.1 (2025-12-21)
- 部署方式改为从 GitHub 克隆
- 新增 Breadcrumb 外部链接支持（Home → Main 应用）
- PDF Tools 首页添加 Header/Breadcrumb/Footer
- 新增 TypeScript 类型修复说明
- 新增 public 目录说明
- 更新故障排查章节
- 优化部署命令流程

#### v2.0 (2025-12-20)
- 迁移到 Next.js 14 框架
- 实现客户端 PDF 处理（pdf-lib）
- 添加中英文国际化支持
- 移除后端服务依赖
- 简化部署架构

---

**部署完成后，Merge PDF 工具将作为 Toolibox 微前端架构的第一个独立工具服务正式上线！**
