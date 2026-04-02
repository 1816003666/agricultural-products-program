# 前后端集成指南

## 一、后端配置

### 1.1 安装依赖并初始化数据库

1. 进入后端目录
```bash
cd backend
```

2. 安装依赖
```bash
npm install
```

3. 配置数据库
- 确保MySQL已安装并运行
- 编辑 `.env` 文件，配置数据库连接信息：
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=agricultural_products
JWT_SECRET=your_jwt_secret_key_here
```

4. 运行数据库脚本创建表
```bash
mysql -u root -p < database.sql
```

5. 启动后端服务器
```bash
npm start
# 或开发模式
npm run dev
```

服务器将在 http://localhost:3000 运行

## 二、前端配置

### 2.1 安装HTTP客户端
```bash
npm install axios
```

### 2.2 创建API服务层
在 `src/services/` 目录下创建 `api.js` 文件

### 2.3 更新前端组件以使用API

## 三、API使用示例

### 3.1 用户注册
```javascript
POST /api/auth/register
{
  "username": "user1",
  "email": "user@example.com",
  "password": "password123",
  "name": "张三",
  "phone": "13800138000"
}
```

### 3.2 用户登录
```javascript
POST /api/auth/login
{
  "username": "user1",
  "password": "password123"
}
```

### 3.3 获取产品列表
```javascript
GET /api/products
GET /api/products?page=1&limit=10
GET /api/products?category_id=1
```

### 3.4 添加到购物车（需要登录）
```javascript
POST /api/cart
Headers: { Authorization: Bearer <token> }
{
  "product_id": 1,
  "quantity": 2
}
```

### 3.5 创建订单（需要登录）
```javascript
POST /api/orders
Headers: { Authorization: Bearer <token> }
{
  "address_id": 1
}
```

## 四、功能清单

### 4.1 已实现的功能
- ✅ 用户注册和登录（JWT认证）
- ✅ 产品列表和搜索
- ✅ 购物车管理
- ✅ 订单创建和管理
- ✅ 地址管理
- ✅ 浏览记录

### 4.2 待前端集成
- 登录/注册页面
- 个人中心页面
- 订单历史页面
- 物流跟踪页面
- 地址管理页面
- 浏览记录页面

## 五、下一步

1. 配置MySQL数据库并运行SQL脚本
2. 启动后端服务器
3. 在前端添加API调用代码
4. 创建用户界面组件
5. 测试完整流程
