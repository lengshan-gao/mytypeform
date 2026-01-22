# 调查问卷系统 (Survey System)

一个基于 Next.js 13 的全栈调查问卷系统，支持微信扫码填写、图片上传、数据统计和可视化分析。

## 功能特性

- **问卷管理**：创建、编辑、发布、暂停和删除问卷
- **问题管理**：支持打分题（1-5分），可设置分数权重，添加问题图片
- **微信适配**：完美适配微信浏览器，支持微信扫码填写和分享
- **二维码生成**：自动生成问卷二维码，方便打印和分享
- **数据统计**：实时数据统计，可视化图表展示
- **响应式设计**：适配桌面、平板和手机设备
- **用户认证**：支持邮箱登录和微信登录
- **图片上传**：集成 Cloudinary 图片存储服务
- **导出功能**：支持导出 Excel 和 PDF 报告

## 技术栈

- **前端**：Next.js 13 (App Router), React 18, TypeScript, Tailwind CSS
- **后端**：Next.js API Routes, Prisma ORM, PostgreSQL
- **数据库**：PostgreSQL (支持 Supabase、Vercel Postgres)
- **认证**：JWT, bcryptjs
- **图片存储**：Cloudinary
- **图表**：Chart.js, react-chartjs-2
- **二维码**：qrcode
- **图标**：react-icons

## 项目结构

```
survey-system/
├── app/                    # Next.js 13 App Router
│   ├── (auth)/            # 认证相关页面
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/         # 仪表盘
│   ├── survey/            # 问卷填写
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── thank-you/
│   ├── surveys/           # 问卷管理
│   │   ├── create/
│   │   └── [id]/
│   ├── api/               # API 路由
│   │   └── auth/
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   └── globals.css        # 全局样式
├── components/            # 可复用组件
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── QrCodeGenerator.tsx
│   ├── StatsChart.tsx
│   └── SurveyStats.tsx
├── lib/                   # 工具函数
│   ├── prisma.ts         # Prisma 客户端
│   ├── api.ts            # API 客户端
│   ├── auth.ts           # 认证工具
│   ├── middleware.ts     # API 中间件
│   └── wechat.ts         # 微信适配工具
├── prisma/               # 数据库配置
│   └── schema.prisma     # Prisma 数据模型
├── public/               # 静态资源
└── config/               # 配置文件
    ├── next.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── tsconfig.json
```

## 数据模型

### 用户 (User)
- id: 用户ID (cuid)
- openid: 微信OpenID (唯一)
- nickname: 昵称
- avatar: 头像
- surveys: 创建的问卷列表

### 问卷 (Survey)
- id: 问卷ID (cuid)
- title: 标题
- description: 描述
- creatorId: 创建者ID
- status: 状态 (草稿/已发布/已暂停/已关闭)
- questions: 问题列表
- responses: 回答列表
- expiresAt: 截止时间

### 问题 (Question)
- id: 问题ID (cuid)
- surveyId: 问卷ID
- content: 问题内容
- type: 问题类型 (打分题)
- weight: 分数权重
- imageUrl: 图片URL
- order: 排序序号

### 回答 (Response)
- id: 回答ID (cuid)
- surveyId: 问卷ID
- userId: 用户ID
- questionId: 问题ID
- score: 分数 (1-5分)
- submittedAt: 提交时间

## 快速开始

### 环境要求
- Node.js 14+
- PostgreSQL 数据库 (或 Supabase)
- npm 或 yarn

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd survey-system
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **环境配置**
   复制 `.env.example` 为 `.env.local` 并填写配置：
   ```bash
   cp .env.example .env.local
   ```
   
   编辑 `.env.local` 文件：
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/survey_system"
   JWT_SECRET="your-jwt-secret-key"
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```

4. **数据库设置**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **运行开发服务器**
   ```bash
   npm run dev
   ```

6. **访问应用**
   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 部署

### Vercel 部署（推荐）

1. 将代码推送到 GitHub/GitLab
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署完成

### 腾讯云部署

1. 构建项目：
   ```bash
   npm run build
   npm run start
   ```

2. 使用 PM2 进程管理：
   ```bash
   npm install -g pm2
   pm2 start npm --name "survey-system" -- start
   pm2 save
   pm2 startup
   ```

## API 文档

### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/wechat` - 微信登录
- `GET /api/auth/me` - 获取当前用户信息

### 问卷管理
- `GET /api/surveys` - 获取问卷列表
- `POST /api/surveys` - 创建问卷
- `GET /api/surveys/:id` - 获取问卷详情
- `PUT /api/surveys/:id` - 更新问卷
- `DELETE /api/surveys/:id` - 删除问卷
- `POST /api/surveys/:id/publish` - 发布问卷
- `POST /api/surveys/:id/close` - 关闭问卷

### 问题管理
- `POST /api/surveys/:id/questions` - 添加问题
- `PUT /api/questions/:id` - 更新问题
- `DELETE /api/questions/:id` - 删除问题
- `POST /api/questions/:id/image` - 上传问题图片

### 回答管理
- `POST /api/surveys/:id/responses` - 提交问卷回答
- `GET /api/surveys/:id/responses` - 获取问卷回答
- `GET /api/surveys/:id/stats` - 获取问卷统计

## 微信适配说明

### 微信浏览器检测
系统会自动检测微信浏览器并优化显示效果：
- 修复 iOS 微信下拉黑边
- 优化输入框体验
- 适配微信分享功能

### 微信登录配置
1. 在微信公众平台注册并获取 AppID 和 AppSecret
2. 在 `.env.local` 中配置：
   ```
   WECHAT_APP_ID=your-app-id
   WECHAT_APP_SECRET=your-app-secret
   ```
3. 配置微信网页授权域名

### 微信分享
系统支持微信分享功能，需要后端配置微信 JS-SDK 签名。

## 图片上传配置

### Cloudinary 配置
1. 注册 [Cloudinary](https://cloudinary.com/) 账号
2. 获取 Cloud Name、API Key 和 API Secret
3. 在 `.env.local` 中配置
4. 在 Cloudinary 控制台创建上传预设 (Upload Preset)

### 图片处理
- 自动压缩和优化
- 支持 JPG、PNG 格式
- 最大文件大小 5MB
- 生成多种尺寸的缩略图

## 开发指南

### 添加新功能
1. 在 `app/` 目录下创建页面或 API 路由
2. 在 `components/` 目录下创建可复用组件
3. 在 `lib/` 目录下添加工具函数
4. 如需新的数据模型，更新 `prisma/schema.prisma`

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 组件使用函数式组件和 React Hooks

### 测试
运行测试：
```bash
npm test
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 DATABASE_URL 配置
   - 确认数据库服务正在运行
   - 检查网络连接和防火墙设置

2. **图片上传失败**
   - 检查 Cloudinary 配置
   - 确认上传预设是否正确
   - 检查文件大小和格式限制

3. **微信登录失败**
   - 检查微信配置参数
   - 确认域名已备案并配置到微信平台
   - 检查网络连通性

4. **构建失败**
   - 检查 TypeScript 类型错误
   - 确认依赖安装完整
   - 检查 Node.js 版本兼容性

### 日志查看
```bash
# 查看开发服务器日志
npm run dev

# 查看构建日志
npm run build

# 查看 Prisma 日志
npx prisma studio
```

## 许可证

MIT License

## 联系方式

如有问题或建议，请联系项目维护者。

---

**项目状态**：开发中

**最后更新**：2023年10月