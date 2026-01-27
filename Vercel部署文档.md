# 权重问卷系统 - Vercel部署文档

## 📋 项目概述

本项目是一个基于Next.js 12.3.4的权重问卷系统，支持项目-维度-选项三级权重计算模型。系统采用TypeScript开发，使用Prisma ORM管理SQLite数据库。

### 🎯 核心功能
- 权重问卷创建和管理
- 项目-维度-选项三级权重计算
- 实时得分统计和柱状图展示
- 微信扫码填写支持
- 图片上传功能

## 🚀 Vercel部署步骤

### 1. 准备工作

#### 1.1 项目检查
确保项目具备以下文件：
- `package.json` - 项目依赖配置
- `next.config.js` - Next.js配置
- `vercel.json` - Vercel部署配置（需要创建）
- `prisma/schema.prisma` - 数据库模型定义

#### 1.2 代码仓库准备
将项目推送到GitHub仓库：

```bash
# 初始化Git仓库
git init
git add .
git commit -m "Initial commit: 权重问卷系统"

# 关联GitHub远程仓库
git remote add origin https://github.com/lengshan-gao/mytypeform.git
git branch -M main
git push -u origin main
```

### 2. Vercel平台配置

#### 2.1 创建Vercel账户
1. 访问 [Vercel官网](https://vercel.com)
2. 使用GitHub账户登录
3. 完成账户设置

#### 2.2 连接GitHub仓库
1. 在Vercel控制台点击"New Project"
2. 选择"Import Git Repository"
3. 授权访问GitHub仓库
4. 选择您的权重问卷系统仓库

### 3. 项目配置

#### 3.1 创建Vercel配置文件
在项目根目录创建 `vercel.json`：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url"
  }
}
```

#### 3.2 创建环境变量文件
在项目根目录创建 `.env.example`：

```env
# 数据库配置
DATABASE_URL="file:./dev.db"

# JWT密钥
JWT_SECRET="your-jwt-secret-key-here"

# 应用配置
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-nextauth-secret"

# 文件上传配置（可选）
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"
```

### 4. Vercel环境变量配置

#### 4.1 在Vercel控制台设置环境变量
1. 进入项目设置 → Environment Variables
2. 添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | `file:./dev.db` | SQLite数据库文件路径 |
| `JWT_SECRET` | 随机生成的长字符串 | JWT加密密钥 |
| `NEXTAUTH_URL` | 您的Vercel应用URL | NextAuth配置 |
| `NEXTAUTH_SECRET` | 随机生成的长字符串 | NextAuth加密密钥 |

#### 4.2 生产环境变量设置
确保所有环境变量都添加到生产环境（Production）。

### 5. 数据库配置

#### 5.1 适配Vercel环境
由于Vercel是无服务器环境，需要适配SQLite数据库：

创建 `lib/db.ts`：

```typescript
import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

declare global {
  var __db: PrismaClient | undefined
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.__db) {
    global.__db = new PrismaClient()
  }
  prisma = global.__db
}

export { prisma }
```

#### 5.2 修改数据库连接
更新所有使用Prisma的文件，使用统一的数据库连接：

```typescript
// 替换原来的 import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()

import { prisma } from '@/lib/db'
```

### 6. 构建配置优化

#### 6.1 更新package.json构建脚本
确保 `package.json` 包含正确的构建脚本：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "prisma:generate": "prisma generate",
    "prisma:push": "prisma db push",
    "postinstall": "prisma generate"
  }
}
```

#### 6.2 创建Next.js配置文件
确保 `next.config.js` 配置正确：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: false, // 禁用App Router，使用Pages Router
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // 静态资源配置
  images: {
    domains: ['res.cloudinary.com'], // 如果使用Cloudinary
  },
}

module.exports = nextConfig
```

### 7. 部署流程

#### 7.1 首次部署
1. 在Vercel控制台点击"Deploy"
2. 等待构建过程完成
3. 检查构建日志是否有错误

#### 7.2 自动部署配置
- 每次推送到 `main` 分支都会触发自动部署
- 可以通过GitHub Actions配置更复杂的部署流程

### 8. 域名配置（可选）

#### 8.1 自定义域名
1. 进入Vercel项目设置 → Domains
2. 添加您的自定义域名
3. 按照提示配置DNS记录

#### 8.2 SSL证书
Vercel自动为所有域名提供SSL证书。

### 9. 监控和维护

#### 9.1 日志查看
- 在Vercel控制台的"Functions"标签查看API日志
- 使用Vercel Analytics监控性能

#### 9.2 错误监控
考虑集成Sentry进行错误监控：

```bash
npm install @sentry/nextjs
```

#### 9.3 性能优化
- 启用Vercel的Edge Functions提升性能
- 配置合适的缓存策略
- 使用Vercel Analytics分析用户行为

### 10. 故障排除

#### 10.1 常见问题

**问题1：数据库连接错误**
```bash
# 解决方案：检查环境变量是否正确设置
# 确保DATABASE_URL指向正确的文件路径
```

**问题2：构建失败**
```bash
# 解决方案：检查构建日志
# 常见原因：缺少依赖或TypeScript错误
```

**问题3：API路由404**
```bash
# 解决方案：检查文件路径和路由配置
# 确保API文件在pages/api目录下
```

#### 10.2 调试技巧

1. **本地测试**：使用 `vercel dev` 命令在本地模拟Vercel环境
2. **环境变量检查**：使用Vercel CLI检查环境变量
3. **构建日志分析**：仔细阅读构建日志中的警告和错误

### 11. 备份策略

#### 11.1 数据库备份
由于使用SQLite，需要定期备份数据库文件：

```javascript
// 创建备份API路由
// pages/api/backup.ts
```

#### 11.2 代码备份
- GitHub仓库自动备份代码
- 定期导出重要数据

### 12. 安全配置

#### 12.1 环境变量安全
- 不要在代码中硬编码敏感信息
- 使用Vercel的环境变量管理
- 定期轮换密钥

#### 12.2 网络安全
- 启用Vercel的Security Headers
- 配置CORS策略
- 实施速率限制

## 📊 部署检查清单

### 部署前检查
- [ ] 代码推送到GitHub
- [ ] 环境变量配置完成
- [ ] 数据库配置适配Vercel
- [ ] 构建脚本测试通过
- [ ] 所有依赖正确安装

### 部署后验证
- [ ] 应用可以正常访问
- [ ] API路由正常工作
- [ ] 数据库操作正常
- [ ] 静态资源加载正常
- [ ] 错误页面配置正确

## 🔄 持续集成/持续部署（CI/CD）

### GitHub Actions配置
创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 📞 技术支持

如果遇到部署问题，可以参考以下资源：
- [Vercel官方文档](https://vercel.com/docs)
- [Next.js部署指南](https://nextjs.org/docs/deployment)
- [项目GitHub Issues]

---

**文档版本**: 1.0  
**最后更新**: 2026-01-22  
**维护者**: 权重问卷系统开发团队