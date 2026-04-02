# 农产品直销网站后端

## 技术栈

- **后端框架**: Express.js (Node.js)
- **数据库**: MySQL
- **认证**: JWT (JSON Web Token)
- **ORM**: Sequelize
- **缓存**: Redis (可选)
- **文件存储**: 本地存储

## 架构设计

### 目录结构

```
backend/
├── config/           # 配置文件
│   ├── database.js   # 数据库配置
│   └── jwt.js        # JWT配置
├── controllers/      # 控制器
│   ├── auth.js       # 认证相关
│   ├── product.js    # 产品相关
│   ├── order.js      # 订单相关
│   ├── user.js       # 用户相关
│   └── cart.js       # 购物车相关
├── middlewares/      # 中间件
│   ├── auth.js       # 认证中间件
│   ├── error.js      # 错误处理
│   └── logger.js     # 日志中间件
├── models/           # 数据模型
│   ├── User.js       # 用户模型
│   ├── Product.js    # 产品模型
│   ├── Category.js   # 分类模型
│   ├── Order.js      # 订单模型
│   ├── OrderItem.js  # 订单商品模型
│   ├── Cart.js       # 购物车模型
│   └── History.js    # 浏览记录模型
├── routes/           # 路由
│   ├── auth.js       # 认证路由
│   ├── product.js    # 产品路由
│   ├── order.js      # 订单路由
│   ├── user.js       # 用户路由
│   └── cart.js       # 购物车路由
├── services/         # 业务逻辑
│   ├── auth.js       # 认证服务
│   ├── product.js    # 产品服务
│   ├── order.js      # 订单服务
│   ├── user.js       # 用户服务
│   └── cart.js       # 购物车服务
├── utils/            # 工具函数
│   ├── password.js   # 密码处理
│   ├── validator.js  # 数据验证
│   └── response.js   # 响应处理
├── uploads/          # 上传文件
├── app.js            # 应用入口
├── server.js         # 服务器启动
├── package.json      # 依赖管理
└── .env.example      # 环境变量示例
```

## 主要功能

1. **用户管理**
   - 注册、登录、登出
   - 个人信息管理
   - 地址管理

2. **产品管理**
   - 产品列表、详情
   - 产品分类
   - 搜索功能

3. **购物车**
   - 添加、删除、更新商品
   - 购物车结算

4. **订单管理**
   - 创建订单
   - 订单列表、详情
   - 订单状态管理
   - 物流跟踪

5. **浏览记录**
   - 记录用户浏览历史
   - 查看浏览记录

## API设计

### 认证相关
- POST /api/auth/register - 用户注册
- POST /api/auth/login - 用户登录
- POST /api/auth/logout - 用户登出
- GET /api/auth/profile - 获取用户信息

### 产品相关
- GET /api/products - 获取产品列表
- GET /api/products/:id - 获取产品详情
- GET /api/products/category/:id - 按分类获取产品
- GET /api/products/search - 搜索产品

### 购物车相关
- GET /api/cart - 获取购物车
- POST /api/cart - 添加商品到购物车
- PUT /api/cart/:id - 更新购物车商品
- DELETE /api/cart/:id - 删除购物车商品

### 订单相关
- POST /api/orders - 创建订单
- GET /api/orders - 获取订单列表
- GET /api/orders/:id - 获取订单详情
- PUT /api/orders/:id - 更新订单状态
- GET /api/orders/:id/tracking - 获取物流信息

### 用户相关
- GET /api/users/profile - 获取用户信息
- PUT /api/users/profile - 更新用户信息
- GET /api/users/history - 获取浏览记录
