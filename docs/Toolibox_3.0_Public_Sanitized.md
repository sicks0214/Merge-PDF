
# Toolibox 3.0 技术文档（已脱敏 · 可公开）

> 免费在线工具聚合平台 - 微前端 + 后端 API 架构  
> ⚠️ 本文档中的 IP、账号、密钥、路径均为示例或占位符，不对应任何真实生产环境。

---

## 一、项目概述

### 1.1 项目信息（脱敏）

| 项目 | 值 |
|------|----|
| 项目名称 | Toolibox 3.0 |
| VPS IP | <VPS_IP> |
| SSH 用户 | <SSH_USER> |
| 项目目录 | <PROJECT_PATH> |
| GitHub | https://github.com/sicks0214/toolibox-2.0 |

### 1.2 技术栈

- 前端：Next.js 14 / TypeScript / Tailwind CSS / next-intl
- 后端：Express.js / TypeScript / Prisma
- 数据库：PostgreSQL（生产）/ SQLite（开发）
- 存储：Cloudflare R2
- 基础设施：Docker / Docker Compose / Nginx

---

## 二、系统架构

### 2.1 架构说明（示意）

```
Internet
   |
[Nginx]
   |
[Frontend] —— [Backend API]
```

> 所有端口、路由、反向代理配置均已做抽象化处理，仅用于架构说明。

---

## 三、关键参数配置（示例）

### 3.1 环境变量示例

```bash
DATABASE_URL="<DATABASE_URL>"
JWT_SECRET="<JWT_SECRET>"
R2_ACCESS_KEY_ID="<R2_ACCESS_KEY_ID>"
R2_SECRET_ACCESS_KEY="<R2_SECRET_ACCESS_KEY>"
DEEPSEEK_API_KEY="<DEEPSEEK_API_KEY>"
NODE_ENV="production"
```

---

## 四、目录结构（不含真实路径）

```
toolibox/
├── frontend/
├── backend/
├── nginx/
├── docker-compose.yml
└── docs/
```

---

## 五、部署流程（抽象示例）

```bash
# 登录服务器
ssh <SSH_USER>@<VPS_IP>

# 启动服务
docker compose up -d
```

---

## 六、开发与架构规范

- 前端仅负责 UI 与交互
- 所有 PDF / Image / Text 处理统一在后端完成
- 不在客户端暴露任何密钥或核心逻辑

---

## 七、更新日志（节选）

### v3.0
- 微前端 + 后端 API 架构升级
- PDF 处理逻辑迁移至后端
- 支持大文件上传与对象存储

---

## 八、声明

本文档为 **已脱敏公开版本**，可安全用于：
- GitHub 仓库
- 技术博客
- 对外技术交流
- 文档评审

如需内部运维或部署版本，请使用私有文档。
