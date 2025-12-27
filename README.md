# Merge PDF 插件

Toolibox 主站的 PDF 合并插件，采用纯插件模式。

## 插件结构

```
merge-pdf/
├── plugin.json      # 插件配置
├── schema.json      # 表单定义
├── ui.json          # UI 国际化内容
└── handler/
    └── index.js     # 处理逻辑
```

## 功能特性

- 多文件合并（最多 20 个 PDF）
- 页面范围选择（如 1-3, 5, 8-10）
- 文件拖拽排序
- 加密文件检测
- 书签保留选项
- 打印优化选项
- 中英文双语支持

## 部署方式

```bash
# 复制插件目录到主站
cp -r merge-pdf/ /path/to/主站/backend/plugins/

# 重启主站后端
docker restart 后端容器名
```

## API 端点

部署后自动注册：
- `POST /api/pdf/merge-pdf` - 合并 PDF
- `POST /api/pdf/merge-pdf/analyze` - 分析 PDF

## 文档

详见 [插件工具接入主站部署指示文档v2.0](./docs/插件工具接入主站部署指示文档v2.0.md)
