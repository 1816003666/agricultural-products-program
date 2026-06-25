# 舆情感知系统 - 设计规格文档

## 1. 项目概述

### 1.1 项目背景
开发一套面向中型企业的舆情感知系统，用于监控新闻网站的舆情动态，提供关键词追踪、情感分析、热度趋势等功能。

### 1.2 目标用户
- 系统管理员：用户管理、系统配置
- 舆情分析师：舆情监控、数据分析
- 普通访客：查看舆情数据（只读）

### 1.3 技术栈

| 层级 | 技术选型 | 版本 |
|------|---------|------|
| 前端框架 | React + Vite | React 18, Vite 5 |
| UI组件库 | Ant Design | 5.x |
| 图表库 | ECharts | 5.x |
| 状态管理 | React Context + useReducer | - |
| 路由 | React Router Dom | 6.x |
| HTTP客户端 | Axios | 1.x |
| 后端框架 | Express.js | 4.x |
| 数据库 | MongoDB + Mongoose ODM | MongoDB 6+, Mongoose 8 |
| 爬虫引擎 | Puppeteer + Cheerio | Puppeteer 22+, Cheerio 1.0 |
| 任务调度 | node-cron | 3.x |
| 认证 | JWT + bcryptjs | jsonwebtoken 9+, bcryptjs 2 |
| 安全中间件 | cors, helmet, express-rate-limit | - |

---

## 2. 系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        前端 (React)                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 仪表盘   │ │ 舆情监控 │ │ 数据分析 │ │ 系统管理 │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (Axios)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     后端 (Node.js + Express)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 认证模块 │ │ 舆情API  │ │ 爬虫调度 │ │ 用户管理 │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└──────────┬─────────────────────────────┬────────────────────┘
           │                             │
           ▼                             ▼
     ┌──────────┐                ┌──────────────┐
     │ MongoDB  │                │  爬虫引擎     │
     │  (数据)  │                │ (Puppeteer)   │
     └──────────┘                └──────┬───────┘
                                        │
                                ┌───────▼───────┐
                                │   新闻网站     │
                                │  / 第三方API   │
                                └───────────────┘
```

### 2.2 目录结构

```
opus-monitor/
├── backend/
│   ├── src/
│   │   ├── config/          # 配置文件
│   │   ├── models/          # Mongoose 数据模型
│   │   ├── routes/          # API 路由
│   │   ├── controllers/     # 业务逻辑控制器
│   │   ├── middleware/      # 中间件
│   │   ├── services/        # 业务服务层
│   │   ├── crawler/         # 爬虫模块
│   │   ├── utils/           # 工具函数
│   │   └── app.js           # Express 应用入口
│   ├── data/                # 模拟数据 / 种子数据
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # 通用组件
│   │   ├── pages/           # 页面组件
│   │   ├── layouts/         # 布局组件
│   │   ├── services/        # API 服务
│   │   ├── context/         # Context 状态管理
│   │   ├── hooks/           # 自定义 Hooks
│   │   ├── utils/           # 工具函数
│   │   ├── router/          # 路由配置
│   │   └── main.jsx         # 入口文件
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── docs/
    └── specs/
```

---

## 3. 数据模型设计

### 3.1 User（用户集合）

```javascript
{
  _id: ObjectId,
  username: String,       // 用户名，唯一
  password: String,       // 密码（bcrypt加密）
  email: String,          // 邮箱
  role: String,           // 角色：admin / analyst / viewer
  avatar: String,         // 头像URL（可选）
  status: String,         // 状态：active / disabled
  lastLoginAt: Date,      // 最后登录时间
  createdAt: Date,
  updatedAt: Date
}
```

### 3.2 News（新闻集合）

```javascript
{
  _id: ObjectId,
  title: String,          // 新闻标题
  content: String,        // 正文内容
  summary: String,        // 内容摘要（前200字）
  source: String,         // 来源网站名称
  sourceUrl: String,      // 原文链接
  author: String,         // 作者（可选）
  publishTime: Date,      // 发布时间
  keywords: [String],     // 关键词标签
  sentiment: String,      // 情感倾向：positive / negative / neutral
  sentimentScore: Number, // 情感置信度分数 (0-1)
  heatIndex: Number,      // 热度指数
  category: String,       // 分类：政治/经济/科技/社会/娱乐/体育
  tags: [String],         // 自定义标签
  crawledAt: Date,        // 采集时间
  sourceId: ObjectId      // 关联的新闻源ID
}
```

### 3.3 Keyword（关键词集合）

```javascript
{
  _id: ObjectId,
  word: String,           // 关键词
  category: String,       // 分类
  status: String,         // 状态：active / inactive
  createdBy: ObjectId,    // 创建人ID
  createdAt: Date,
  updatedAt: Date
}
```

### 3.4 NewsSource（新闻源集合）

```javascript
{
  _id: ObjectId,
  name: String,           // 新闻源名称
  url: String,            // 网站主页URL
  type: String,           // 类型：rss / api / crawler
  listUrl: String,        // 列表页URL模板
  selectorConfig: {       // 爬虫选择器配置
    listItem: String,     // 列表项选择器
    title: String,        // 标题选择器
    content: String,      // 正文选择器
    publishTime: String,  // 发布时间选择器
    author: String        // 作者选择器
  },
  crawlInterval: String,  // 采集间隔（cron表达式）
  status: String,         // 状态：active / inactive
  lastCrawlTime: Date,    // 最后采集时间
  createdAt: Date,
  updatedAt: Date
}
```

### 3.5 CrawlTask（采集任务集合）

```javascript
{
  _id: ObjectId,
  sourceId: ObjectId,     // 关联新闻源ID
  sourceName: String,     // 新闻源名称（冗余）
  status: String,         // 状态：pending / running / completed / failed
  startTime: Date,        // 开始时间
  endTime: Date,          // 结束时间
  newsCount: Number,      // 采集到的新闻数量
  newCount: Number,       // 新增新闻数量
  errorMsg: String,       // 错误信息
  triggeredBy: String,    // 触发方式：manual / schedule
  createdAt: Date
}
```

---

## 4. API 接口设计

### 4.1 统一响应格式

```javascript
// 成功响应
{
  code: 0,
  message: 'success',
  data: { ... }
}

// 失败响应
{
  code: 400,              // 错误码
  message: '错误描述',
  data: null
}
```

### 4.2 认证接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/auth/login | 用户登录 | 公开 |
| POST | /api/auth/register | 用户注册 | 公开 |
| GET | /api/auth/profile | 获取当前用户信息 | 已登录 |
| PUT | /api/auth/profile | 更新个人信息 | 已登录 |
| PUT | /api/auth/password | 修改密码 | 已登录 |

### 4.3 新闻数据接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/news | 获取新闻列表（分页+筛选） | 已登录 |
| GET | /api/news/:id | 获取新闻详情 | 已登录 |
| DELETE | /api/news/:id | 删除新闻 | admin |
| GET | /api/news/statistics | 新闻统计概览 | 已登录 |

### 4.4 关键词接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/keywords | 获取关键词列表 | 已登录 |
| POST | /api/keywords | 添加关键词 | analyst+ |
| PUT | /api/keywords/:id | 更新关键词 | analyst+ |
| DELETE | /api/keywords/:id | 删除关键词 | analyst+ |

### 4.5 新闻源接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/sources | 获取新闻源列表 | 已登录 |
| POST | /api/sources | 添加新闻源 | admin |
| PUT | /api/sources/:id | 更新新闻源 | admin |
| DELETE | /api/sources/:id | 删除新闻源 | admin |

### 4.6 采集任务接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/crawl/trigger | 手动触发采集 | analyst+ |
| GET | /api/crawl/tasks | 获取任务列表 | 已登录 |
| GET | /api/crawl/tasks/:id | 获取任务详情 | 已登录 |

### 4.7 数据分析接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/analysis/sentiment-trend | 情感趋势数据 | 已登录 |
| GET | /api/analysis/heat-ranking | 热度排行榜 | 已登录 |
| GET | /api/analysis/source-distribution | 来源分布 | 已登录 |
| GET | /api/analysis/word-cloud | 词云数据 | 已登录 |
| GET | /api/analysis/category-stats | 分类统计 | 已登录 |

### 4.8 用户管理接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/users | 获取用户列表 | admin |
| POST | /api/users | 创建用户 | admin |
| PUT | /api/users/:id | 更新用户 | admin |
| DELETE | /api/users/:id | 删除用户 | admin |

---

## 5. 前端模块设计

### 5.1 页面路由结构

```
/                        # 重定向到 /dashboard
/login                   # 登录页
/register                # 注册页
/dashboard               # 仪表盘
/monitor                 # 舆情监控
  /monitor/news          # 新闻列表
  /monitor/keywords      # 关键词管理
/analysis                # 数据分析
  /analysis/sentiment    # 情感分析
  /analysis/heat         # 热度分析
  /analysis/source       # 来源分析
/system                  # 系统管理
  /system/users          # 用户管理
  /system/sources        # 新闻源管理
  /system/tasks          # 采集任务
/profile                 # 个人中心
```

### 5.2 核心页面功能

#### 仪表盘 Dashboard
- 数据概览卡片（总新闻数、今日新增、正面占比、负面占比）
- 情感趋势折线图（近7天/30天切换）
- 热度排行榜 Top10（条形图）
- 来源分布饼图
- 分类统计环形图
- 最新舆情快讯列表

#### 舆情监控 - 新闻列表
- 搜索框（标题关键词搜索）
- 筛选条件（时间范围、情感倾向、来源、分类）
- 新闻列表表格（标题、来源、发布时间、情感、热度、操作）
- 新闻详情抽屉/弹窗
- 分页组件

#### 舆情监控 - 关键词管理
- 关键词列表表格
- 添加关键词弹窗
- 编辑关键词
- 删除确认
- 启用/禁用开关

#### 数据分析
- 多维度情感趋势对比图
- 关键词热度变化曲线
- 媒体来源对比柱状图
- 词云可视化
- 数据导出功能

#### 系统管理 - 用户管理
- 用户列表表格
- 新增用户弹窗
- 编辑用户
- 删除用户
- 角色分配

#### 系统管理 - 新闻源管理
- 新闻源列表
- 新增/编辑新闻源（含选择器配置）
- 启用/禁用
- 手动触发采集

#### 系统管理 - 采集任务
- 任务列表（状态筛选）
- 任务详情
- 重新执行

---

## 6. 爬虫模块设计

### 6.1 爬虫架构

```
CrawlScheduler (node-cron)
    │
    ├── CrawlTaskManager (任务状态管理)
    │
    └── NewsCrawler (爬虫核心)
         ├── PuppeteerService (页面渲染)
         ├── HtmlParser (Cheerio解析)
         ├── SentimentAnalyzer (情感分析)
         └── NewsDeduplicator (去重判断)
```

### 6.2 爬虫流程

1. 触发采集（定时/手动）
2. 创建 CrawlTask 记录
3. 使用 Puppeteer 访问列表页
4. 解析列表页获取新闻链接
5. 逐个访问详情页，提取内容
6. 情感分析（基于关键词规则 + 第三方API可选）
7. 去重判断（标题+来源URL唯一索引）
8. 存入 MongoDB
9. 更新任务状态和统计

### 6.3 情感分析策略

采用**基于规则的关键词匹配**作为基础方案：
- 维护正面/负面情感词典
- 计算情感得分 = (正面词数 - 负面词数) / 总词数
- 得分 > 0.05 为 positive，< -0.05 为 negative，中间为 neutral

后续可扩展接入第三方 NLP API（百度AI、阿里云等）提升准确率。

---

## 7. 权限设计

### 7.1 角色定义

| 角色 | 权限 |
|------|------|
| admin | 全部权限 |
| analyst | 查看数据 + 关键词管理 + 触发采集 + 新闻源查看 |
| viewer | 仅查看数据 |

### 7.2 权限实现

- 后端：JWT 中间件解析用户信息，RBAC 中间件校验角色权限
- 前端：路由守卫 + 按钮级权限控制（根据用户角色隐藏/禁用）

---

## 8. 安全设计

### 8.1 认证安全
- JWT Token 认证，有效期 2 小时
- bcryptjs 密码哈希（salt rounds = 10）
- 登录失败限流（5次/15分钟）

### 8.2 接口安全
- CORS 跨域配置（仅允许前端域名）
- Helmet 安全响应头
- express-rate-limit 请求限流
- 请求参数校验（express-validator）
- SQL注入防护（Mongoose ODM）

### 8.3 数据安全
- 敏感字段不返回前端（如 password）
- 用户操作日志记录
- 输入内容 XSS 转义

---

## 9. 错误处理

### 9.1 错误码规范

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未登录 / Token 无效 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如用户名已存在） |
| 500 | 服务器内部错误 |

### 9.2 全局错误处理
- Express 全局错误处理中间件
- 统一错误响应格式
- 开发环境返回错误堆栈，生产环境隐藏

---

## 10. 部署说明

### 10.1 环境变量

**后端 (.env):**
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/opus_monitor
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=2h
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**前端 (.env):**
```
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_TITLE=舆情感知系统
```

### 10.2 初始化步骤

1. 启动 MongoDB 服务
2. 后端安装依赖并启动
3. 前端安装依赖并启动
4. 访问前端页面，注册管理员账号
5. 添加新闻源和关键词
6. 手动触发首次采集

---

## 11. 未来扩展方向

- 接入更多数据源（社交媒体、论坛、电商评论）
- 引入 AI 大模型进行深度语义分析
- 实时推送告警（WebSocket + 邮件/钉钉/企业微信）
- 舆情报告自动生成
- 多租户支持
- 移动端适配
