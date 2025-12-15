
# TooliBox — 后端需求与实施计划

## 概述
后端服务提供：
- 为需要服务器端处理的工具提供集中式 API 网关
- AI 代理端点（安全存储 API 密钥）
- 认证、用户管理、配额/速率限制
- 上传文件、日志和持久化数据的存储
- 服务健康检查端点

## 目标
- 前后端分离
- 每个后端服务可独立部署和打包（Docker）
- 一个 API 网关或反向代理路由 API 调用；每个工具的后端（如需要）可以独立
- 安全存储凭证和各服务的环境变量

## 技术栈（推荐）
- 语言：Node.js（Express/Fastify）或 Python（FastAPI）。示例中使用 Node.js/Express
- 数据库：PostgreSQL（用于用户/账户数据），Redis（速率限制、队列）
- 文件存储：MinIO（S3 兼容）或云端 S3
- AI：代理模式连接 OpenAI/其他提供商（API 密钥仅存于后端环境变量）
- 容器：Docker + docker-compose（或 Kubernetes，如有需要）

## 服务布局
```
backend/
├─ gateway/                # API 网关（反向代理 + 认证）
├─ services/
│  ├─ auth-service/        # 认证、用户、会话
│  ├─ tools-api/           # 通用工具端点 (/api/tools/...)
│  ├─ ai-service/          # AI 编排和代理
│  └─ file-service/        # 上传、转换工作器（如需要）
├─ infra/                  # docker-compose、脚本
```

## API 设计原则
- 所有工具相关的服务端点位于 `/api/tools/{tool-name}/...`
- 网关处理认证和速率限制
- 后端提供：
  - `/health`
  - `/metrics`
  - `/version`
- 使用 JSON Schema 验证请求（AJV / pydantic）

## 认证与速率限制
- 认证：由 `auth-service` 签发 JWT，网关验证令牌
- 速率限制：基于 Redis 的令牌桶算法，按用户/IP 限制
- 敏感端点需要更严格的速率限制（如 AI 调用）

## AI 代理
- 后端 `ai-service` 封装对外部 AI 提供商的调用
- 密钥存储在环境变量中（永不暴露给前端）
- 实现指数退避重试和熔断器机制

## 文件处理
- 对于大文件转换，使用后台工作器模式：
  - 上传端点将文件存储到 MinIO
  - 工作器从队列（Redis / BullMQ）获取文件并处理
  - 工作器将结果上传到 MinIO；前端轮询状态

## 部署与 Docker
- 每个服务运行在独立的 Docker 容器中
- 示例 `docker-compose.yml`（简化版）：
```yaml
version: '3.8'
services:
  nginx:
    image: nginx:stable
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d

  portal:
    image: registry/toolibox/portal:latest
    restart: unless-stopped

  pdf-tools:
    image: registry/toolibox/pdf-tools:latest
    restart: unless-stopped

  ai-service:
    image: registry/toolibox/ai-service:latest
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=toolibox
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

## CI/CD
- 构建/测试 -> 构建 Docker 镜像 -> 推送到镜像仓库 -> 更新部署（ssh + docker-compose pull/restart 或 Kubernetes 滚动更新）
- 保留迁移脚本并在部署时运行
- 使用 GitHub Actions 或 GitLab CI

## 监控与日志
- 监控：Prometheus（node exporter）+ Grafana 仪表盘
- 日志：通过 Fluentd 集中日志，或使用主机收集的文件日志（或使用云日志服务）
- 告警：CPU、内存、错误率、网关/服务的 5xx 峰值

## 安全与密钥管理
- 将密钥存储在主机管理的环境变量中（或使用 Vault）
- 使用 HTTPS；通过 certbot 自动续期证书
- 配置防火墙（ufw）仅开放 22、80、443 端口，可选 SSH 堡垒机
- 在容器内以非 root 用户运行服务

## 备份与恢复
- 定期备份 PostgreSQL（pg_dump）、MinIO（同步）和重要配置文件
- 保持每日备份；根据保留策略保留 7-30 天
- 每月测试恢复流程

## 健康检查与就绪检查
- 每个服务必须提供 HTTP 端点：
  - `/health` — 就绪时返回 200
  - `/ready` — 就绪检查
  - `/metrics` — Prometheus 指标（可选）

## 示例端点
- `POST /api/tools/ai-writer/generate`
- `POST /api/tools/pdf/merge`
- `GET /api/tools/{tool}/status/{id}`

## 交付清单
- [ ] 网关服务已实现
- [ ] 认证服务已实现
- [ ] AI 代理服务已实现
- [ ] 文件工作器服务已实现
- [ ] Docker 镜像与 docker-compose 基础设施
- [ ] 数据库 + Redis 基础设施
- [ ] 备份脚本
