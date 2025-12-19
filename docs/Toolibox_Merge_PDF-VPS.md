# Merge PDF 工具 - VPS 部署指南

## 概述

本文档说明如何将 Merge PDF 工具部署到 VPS (82.29.67.124)，作为 Toolibox 微前端架构中的 PDF Tools 子应用。

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
   ├─ /pdf-tools/*          → 127.0.0.1:3001  (PDF 工具前端) ⏳ 本项目
   └─ /api/pdf/*            → 127.0.0.1:4001  (PDF 工具后端) ⏳ 本项目
```

### 服务信息

| 组件 | 技术栈 | 容器端口 | 宿主机端口 | 访问路径 |
|------|--------|---------|-----------|---------|
| 前端 | React + Vite | 80 | 3001 | /pdf-tools/* |
| 后端 | FastAPI + PyMuPDF | 8000 | 4001 | /api/pdf/* |

---

## 二、架构调整说明

### 已完成的架构调整

为了融入微前端架构，项目已进行以下调整：

#### 1. **端口映射调整**

**修改文件**: `docker-compose.yml`

```yaml
# 前端：保持不变
pdf-tools-frontend:
  ports:
    - "3001:80"  # ✅ 符合 VPS 端口规划

# 后端：调整端口
pdf-tools-backend:
  ports:
    - "4001:8000"  # ✅ 调整：外部 4001，内部 8000
```

**原因**: 避免与 Main 应用后端（端口 8000）冲突

#### 2. **移除独立 Nginx 容器**

**修改**: 删除 `docker-compose.yml` 中的 nginx 服务

**原因**: VPS 使用宿主机 Nginx 统一管理所有流量路由

#### 3. **更新开发代理配置**

**修改文件**: `tools/pdf-tools/vite.config.ts`

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:4001',  // ✅ 更新：从 8000 改为 4001
      changeOrigin: true,
    },
  },
}
```

### 无需调整的配置

以下配置已完美匹配 VPS 架构，无需修改：

- ✅ 前端基础路径：`base: '/pdf-tools/'` (vite.config.ts)
- ✅ API 基础路径：`const API_BASE = '/api/pdf'` (merge.ts)
- ✅ 后端路由定义：`@app.post("/api/pdf/analyze")` (main.py)
- ✅ 前端容器端口：3001

---

## 三、VPS Nginx 配置

### 宿主机 Nginx 已预留配置

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

    # PDF 工具（待部署）
    location /pdf-tools/ {
        proxy_pass http://127.0.0.1:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /api/pdf/ {
        proxy_pass http://127.0.0.1:4001/api/pdf/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        client_max_body_size 100M;
    }
}
```

**注意事项**：
- ✅ 宿主机 Nginx 配置已就绪，**无需修改**
- ✅ 路径配置已预留，只需启动容器即可生效
- ✅ `client_max_body_size 100M` 已配置，支持大文件上传

---

## 四、部署步骤

### 步骤 1：准备代码包

在本地（Windows）执行：

```bash
# 进入项目目录
cd E:\codelibrary\Merge-PDF

# 打包项目文件（排除不需要的文件）
tar -czf merge-pdf.tar.gz \
  tools/pdf-tools \
  backend/services/pdf-tools \
  docker-compose.yml \
  docs/

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
ls -la
# 应该看到：
# - tools/pdf-tools/
# - backend/services/pdf-tools/
# - docker-compose.yml
```

### 步骤 3：构建 Docker 镜像

```bash
cd /var/www/toolibox

# 构建前端镜像
docker build -t toolibox/frontend-pdf ./tools/pdf-tools

# 构建后端镜像
docker build -t toolibox/backend-pdf ./backend/services/pdf-tools

# 验证镜像构建成功
docker images | grep pdf
```

**预期输出**：
```
toolibox/frontend-pdf    latest    abc123    200MB
toolibox/backend-pdf     latest    def456    150MB
```

**构建时间估计**：
- 前端：2-3 分钟（Node.js 依赖 + Vite 构建）
- 后端：1-2 分钟（Python 依赖 + PyMuPDF）

### 步骤 4：启动容器

```bash
# 启动 PDF 工具服务
docker compose up -d pdf-tools-frontend pdf-tools-backend

# 查看运行状态
docker ps

# 应该看到：
# CONTAINER ID   IMAGE                      STATUS
# abc123         toolibox/frontend-pdf      Up X seconds
# def456         toolibox/backend-pdf       Up X seconds

# 查看容器日志
docker compose logs -f pdf-tools-frontend
docker compose logs -f pdf-tools-backend
```

### 步骤 5：验证部署

#### 5.1 检查容器状态

```bash
# 检查容器是否运行
docker ps | grep pdf-tools

# 检查端口监听
sudo netstat -tlnp | grep -E '3001|4001'
```

#### 5.2 测试本地访问

```bash
# 测试前端（应该返回 HTML）
curl http://127.0.0.1:3001/

# 测试后端健康检查
curl http://127.0.0.1:4001/health
# 预期输出: {"status":"ok"}

# 测试后端 API
curl http://127.0.0.1:4001/api/pdf/health
```

#### 5.3 测试外部访问

```bash
# 通过 Nginx 访问前端
curl http://82.29.67.124/pdf-tools/

# 通过 Nginx 访问后端
curl http://82.29.67.124/api/pdf/health
```

#### 5.4 浏览器测试

打开浏览器访问：
- 前端页面: `http://82.29.67.124/pdf-tools/`
- 测试上传和合并功能

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
docker compose logs pdf-tools-frontend
docker compose logs pdf-tools-backend

# 重启容器
docker compose restart pdf-tools-frontend pdf-tools-backend
```

### 问题 2：API 请求失败

**症状**: 前端无法调用后端 API

**可能原因**:
- 后端容器未运行
- 端口配置错误
- Nginx 配置问题

**解决方法**:
```bash
# 检查后端是否响应
curl http://127.0.0.1:4001/health

# 检查 Nginx 配置
sudo nginx -t

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# 检查后端日志
docker compose logs -f pdf-tools-backend
```

### 问题 3：文件上传失败

**症状**: 上传 PDF 文件时报错

**可能原因**:
- 文件大小超过限制
- Nginx 上传限制未配置

**解决方法**:
```bash
# 确认 Nginx 配置包含：
cat /etc/nginx/sites-available/toolibox.conf | grep client_max_body_size
# 应该看到: client_max_body_size 100M;

# 如果没有，添加配置并重载
sudo nano /etc/nginx/sites-available/toolibox.conf
# 在 location /api/pdf/ 块中添加：
# client_max_body_size 100M;

sudo nginx -t && sudo systemctl reload nginx
```

### 问题 4：前端资源加载失败

**症状**: 页面打开但样式错乱，JS 文件 404

**可能原因**:
- 基础路径配置错误
- Nginx 代理配置问题

**解决方法**:
```bash
# 检查前端容器配置
docker exec -it merge-pdf-pdf-tools-frontend-1 cat /etc/nginx/conf.d/default.conf

# 检查 vite 构建输出
docker exec -it merge-pdf-pdf-tools-frontend-1 ls -la /usr/share/nginx/html/

# 查看浏览器控制台，确认资源请求路径
# 正确的资源路径应该是：/pdf-tools/assets/...
```

### 问题 5：容器启动失败

**症状**: `docker compose up` 后容器立即退出

**解决方法**:
```bash
# 查看详细日志
docker compose logs pdf-tools-frontend
docker compose logs pdf-tools-backend

# 检查镜像构建是否成功
docker images | grep pdf

# 重新构建镜像
docker compose build --no-cache pdf-tools-frontend
docker compose build --no-cache pdf-tools-backend
```

---

## 六、运维操作

### 日常操作

```bash
# 查看运行状态
docker ps | grep pdf-tools

# 查看实时日志
docker compose logs -f pdf-tools-frontend pdf-tools-backend

# 重启服务
docker compose restart pdf-tools-frontend
docker compose restart pdf-tools-backend

# 停止服务
docker compose stop pdf-tools-frontend pdf-tools-backend

# 启动服务
docker compose start pdf-tools-frontend pdf-tools-backend
```

### 更新部署

```bash
# 1. 上传新代码
scp merge-pdf.tar.gz toolibox@82.29.67.124:/var/www/toolibox/

# 2. 在 VPS 上解压
cd /var/www/toolibox
tar -xzf merge-pdf.tar.gz

# 3. 重新构建镜像
docker compose build pdf-tools-frontend pdf-tools-backend

# 4. 重启容器（零停机更新）
docker compose up -d --no-deps pdf-tools-frontend
docker compose up -d --no-deps pdf-tools-backend

# 5. 验证更新
docker ps | grep pdf-tools
curl http://82.29.67.124/pdf-tools/
```

### 日志管理

```bash
# 查看最近 100 行日志
docker compose logs --tail=100 pdf-tools-backend

# 查看特定时间段日志
docker compose logs --since=2h pdf-tools-backend

# 导出日志到文件
docker compose logs pdf-tools-backend > backend.log
```

### 资源监控

```bash
# 查看容器资源使用
docker stats merge-pdf-pdf-tools-frontend-1 merge-pdf-pdf-tools-backend-1

# 查看磁盘使用
docker system df

# 清理未使用的镜像
docker image prune -a
```

---

## 七、性能优化

### Docker 镜像优化

当前镜像已采用多阶段构建：

**前端 Dockerfile**:
- Builder 阶段：Node.js 编译
- Runner 阶段：仅包含静态文件
- 最终大小：~200MB

**后端 Dockerfile**:
- 基于 Python 3.12-slim
- 仅安装必要依赖
- 最终大小：~150MB

### Nginx 缓存配置

可以在宿主机 Nginx 中添加静态资源缓存：

```nginx
location /pdf-tools/ {
    proxy_pass http://127.0.0.1:3001/;

    # 添加缓存头
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        proxy_pass http://127.0.0.1:3001;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 资源限制

可以在 `docker-compose.yml` 中添加资源限制：

```yaml
pdf-tools-frontend:
  deploy:
    resources:
      limits:
        cpus: '0.5'
        memory: 256M

pdf-tools-backend:
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 512M
```

---

## 八、安全建议

1. **文件上传限制**
   - 已配置 100MB 限制
   - 后端验证文件类型

2. **CORS 配置**
   - 生产环境建议限制来源域名
   - 当前允许所有来源（开发便利）

3. **日志记录**
   - 启用访问日志
   - 记录错误信息
   - 定期清理日志

4. **防火墙配置**
   ```bash
   # 确认端口 3001, 4001 不对外开放
   sudo ufw status
   # 应该只看到 22, 80, 443 端口开放
   ```

---

## 九、架构优势总结

✅ **模块化部署**
- PDF 工具独立运行，不影响 Main 应用
- 可随时启动/停止/更新

✅ **路径隔离**
- `/pdf-tools/*` 前端路径独立
- `/api/pdf/*` API 路径独立

✅ **技术栈灵活**
- 前端：React + Vite（轻量级）
- 后端：FastAPI + PyMuPDF（专业 PDF 处理）
- 与 Main 应用（Next.js + Express）互补

✅ **易于扩展**
- 未来可添加更多 PDF 工具（拆分、压缩等）
- 遵循相同的部署模式

---

## 十、部署检查清单

部署前确认：
- [ ] docker-compose.yml 端口配置为 3001 和 4001
- [ ] docker-compose.yml 已删除 nginx 服务
- [ ] vite.config.ts 代理配置为 4001
- [ ] VPS 宿主机 Nginx 配置已就绪

部署后验证：
- [ ] 容器正常运行 (`docker ps`)
- [ ] 端口正确监听 (`netstat -tlnp`)
- [ ] 前端可访问 (`curl http://82.29.67.124/pdf-tools/`)
- [ ] 后端 API 可用 (`curl http://82.29.67.124/api/pdf/health`)
- [ ] 浏览器功能测试（上传、合并、下载）

---

## 联系与支持

- **VPS IP**: 82.29.67.124
- **SSH 用户**: toolibox
- **项目目录**: /var/www/toolibox/
- **前端容器端口**: 3001
- **后端容器端口**: 4001
- **Nginx 配置**: /etc/nginx/sites-available/toolibox.conf

---

**部署完成后，Merge PDF 工具将作为 Toolibox 微前端架构的第一个独立工具服务正式上线！**
