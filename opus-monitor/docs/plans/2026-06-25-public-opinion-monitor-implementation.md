# 舆情感知系统 - 实施计划

> **For agentic workers:** Follow the tasks in order. Each task builds on the previous one. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个完整的舆情感知系统，包含新闻监控、情感分析、数据可视化和用户管理功能。

**Architecture:** 前后端分离架构。后端使用 Node.js + Express + MongoDB 提供 REST API 和爬虫服务；前端使用 React + Ant Design + ECharts 提供数据可视化界面。爬虫使用 Puppeteer + Cheerio 采集新闻网站数据，基于关键词规则进行情感分析。

**Tech Stack:**
- 前端：React 18, Vite 5, Ant Design 5, ECharts 5, React Router 6, Axios
- 后端：Node.js, Express 4, Mongoose 8, JWT, bcryptjs
- 数据库：MongoDB
- 爬虫：Puppeteer, Cheerio, node-cron

---

## 阶段一：项目初始化与基础架构

### Task 1: 后端项目初始化

**Files:**
- Create: `backend/package.json`
- Create: `backend/.env`
- Create: `backend/.env.example`
- Create: `backend/src/app.js`
- Create: `backend/src/server.js`
- Create: `backend/src/config/database.js`
- Create: `backend/src/config/index.js`
- Create: `backend/src/utils/response.js`
- Create: `backend/src/middleware/errorHandler.js`

- [ ] **Step 1: 创建后端 package.json**

```json
{
  "name": "opus-monitor-backend",
  "version": "1.0.0",
  "description": "舆情感知系统后端",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "seed": "node src/data/seed.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cheerio": "^1.0.0-rc.12",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-rate-limit": "^7.2.0",
    "express-validator": "^7.0.1",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.3.0",
    "node-cron": "^3.0.3",
    "puppeteer": "^22.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

- [ ] **Step 2: 创建 .env 和 .env.example**

`.env`:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/opus_monitor
JWT_SECRET=opus_monitor_secret_key_change_in_production
JWT_EXPIRES_IN=2h
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

`.env.example`:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/opus_monitor
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=2h
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

- [ ] **Step 3: 创建配置文件**

`backend/src/config/index.js`:
```javascript
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/opus_monitor',
  jwtSecret: process.env.JWT_SECRET || 'default_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173'
};
```

`backend/src/config/database.js`:
```javascript
const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

- [ ] **Step 4: 创建响应工具和错误处理中间件**

`backend/src/utils/response.js`:
```javascript
const success = (res, data = null, message = 'success') => {
  res.json({ code: 0, message, data });
};

const error = (res, code = 500, message = 'Internal Server Error', data = null) => {
  res.status(code >= 100 && code < 600 ? code : 500).json({
    code,
    message,
    data
  });
};

module.exports = { success, error };
```

`backend/src/middleware/errorHandler.js`:
```javascript
const config = require('../config');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (config.nodeEnv === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    code: statusCode,
    message,
    data: config.nodeEnv === 'development' ? { stack: err.stack } : null
  });
};

module.exports = errorHandler;
```

- [ ] **Step 5: 创建 Express 应用入口**

`backend/src/app.js`:
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: '请求过于频繁，请稍后再试'
});
app.use('/api', limiter);

app.get('/api/health', (req, res) => {
  res.json({ code: 0, message: 'OK', data: { status: 'healthy' } });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/keywords', require('./routes/keywordRoutes'));
app.use('/api/sources', require('./routes/sourceRoutes'));
app.use('/api/crawl', require('./routes/crawlRoutes'));
app.use('/api/analysis', require('./routes/analysisRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

app.use(errorHandler);

module.exports = app;
```

`backend/src/server.js`:
```javascript
const app = require('./app');
const config = require('./config');
const connectDB = require('./config/database');

const startServer = async () => {
  try {
    await connectDB();
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
```

- [ ] **Step 6: 安装后端依赖**

```bash
cd backend && npm install
```

---

### Task 2: 数据模型定义

**Files:**
- Create: `backend/src/models/User.js`
- Create: `backend/src/models/News.js`
- Create: `backend/src/models/Keyword.js`
- Create: `backend/src/models/NewsSource.js`
- Create: `backend/src/models/CrawlTask.js`

- [ ] **Step 1: 创建 User 模型**

`backend/src/models/User.js`:
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['admin', 'analyst', 'viewer'],
    default: 'viewer'
  },
  avatar: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'disabled'],
    default: 'active'
  },
  lastLoginAt: {
    type: Date
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
```

- [ ] **Step 2: 创建 News 模型**

`backend/src/models/News.js`:
```javascript
const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    required: true,
    index: true
  },
  sourceUrl: {
    type: String,
    required: true,
    unique: true
  },
  author: {
    type: String,
    default: ''
  },
  publishTime: {
    type: Date,
    required: true,
    index: true
  },
  keywords: [{
    type: String
  }],
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral',
    index: true
  },
  sentimentScore: {
    type: Number,
    default: 0
  },
  heatIndex: {
    type: Number,
    default: 0,
    index: true
  },
  category: {
    type: String,
    enum: ['政治', '经济', '科技', '社会', '娱乐', '体育', '其他'],
    default: '其他',
    index: true
  },
  tags: [{
    type: String
  }],
  crawledAt: {
    type: Date,
    default: Date.now
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NewsSource'
  }
}, {
  timestamps: true
});

newsSchema.index({ title: 'text', content: 'text', summary: 'text' });

module.exports = mongoose.model('News', newsSchema);
```

- [ ] **Step 3: 创建 Keyword 模型**

`backend/src/models/Keyword.js`:
```javascript
const mongoose = require('mongoose');

const keywordSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    default: '默认'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Keyword', keywordSchema);
```

- [ ] **Step 4: 创建 NewsSource 模型**

`backend/src/models/NewsSource.js`:
```javascript
const mongoose = require('mongoose');

const selectorConfigSchema = new mongoose.Schema({
  listItem: { type: String, default: '' },
  title: { type: String, default: '' },
  content: { type: String, default: '' },
  publishTime: { type: String, default: '' },
  author: { type: String, default: '' }
}, { _id: false });

const newsSourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['rss', 'api', 'crawler'],
    default: 'crawler'
  },
  listUrl: {
    type: String,
    default: ''
  },
  selectorConfig: {
    type: selectorConfigSchema,
    default: () => ({})
  },
  crawlInterval: {
    type: String,
    default: '0 */2 * * *'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  lastCrawlTime: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NewsSource', newsSourceSchema);
```

- [ ] **Step 5: 创建 CrawlTask 模型**

`backend/src/models/CrawlTask.js`:
```javascript
const mongoose = require('mongoose');

const crawlTaskSchema = new mongoose.Schema({
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NewsSource',
    required: true
  },
  sourceName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  newsCount: {
    type: Number,
    default: 0
  },
  newCount: {
    type: Number,
    default: 0
  },
  errorMsg: {
    type: String,
    default: ''
  },
  triggeredBy: {
    type: String,
    enum: ['manual', 'schedule'],
    default: 'manual'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CrawlTask', crawlTaskSchema);
```

---

### Task 3: 认证中间件与权限控制

**Files:**
- Create: `backend/src/middleware/auth.js`
- Create: `backend/src/middleware/rbac.js`
- Create: `backend/src/routes/authRoutes.js`
- Create: `backend/src/controllers/authController.js`

- [ ] **Step 1: 创建认证中间件**

`backend/src/middleware/auth.js`:
```javascript
const jwt = require('jsonwebtoken');
const config = require('../config');
const { error } = require('../utils/response');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return error(res, 401, '未登录，请先登录');
    }
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      return error(res, 401, '用户不存在或已被禁用');
    }
    req.user = user;
    next();
  } catch (err) {
    return error(res, 401, 'Token无效或已过期');
  }
};

module.exports = auth;
```

- [ ] **Step 2: 创建 RBAC 权限中间件**

`backend/src/middleware/rbac.js`:
```javascript
const { error } = require('../utils/response');

const ROLE_HIERARCHY = {
  admin: ['admin', 'analyst', 'viewer'],
  analyst: ['analyst', 'viewer'],
  viewer: ['viewer']
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 401, '未登录');
    }
    const userRole = req.user.role;
    const hasPermission = allowedRoles.some(role => {
      return ROLE_HIERARCHY[userRole]?.includes(role);
    });
    if (!hasPermission) {
      return error(res, 403, '权限不足');
    }
    next();
  };
};

module.exports = { requireRole };
```

- [ ] **Step 3: 创建认证控制器**

`backend/src/controllers/authController.js`:
```javascript
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const config = require('../config');
const User = require('../models/User');
const { success, error } = require('../utils/response');

const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 400, '参数错误', errors.array());
    }
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return error(res, 401, '用户名或密码错误');
    }
    if (user.status !== 'active') {
      return error(res, 403, '账号已被禁用');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return error(res, 401, '用户名或密码错误');
    }
    user.lastLoginAt = new Date();
    await user.save();
    const token = generateToken(user._id);
    success(res, { token, user: user.toJSON() }, '登录成功');
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 400, '参数错误', errors.array());
    }
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return error(res, 409, '用户名或邮箱已存在');
    }
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'viewer';
    const user = new User({ username, email, password, role });
    await user.save();
    const token = generateToken(user._id);
    success(res, { token, user: user.toJSON() }, '注册成功');
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    success(res, req.user.toJSON());
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { email, avatar } = req.body;
    if (email && email !== req.user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return error(res, 409, '邮箱已被使用');
      }
      req.user.email = email;
    }
    if (avatar !== undefined) {
      req.user.avatar = avatar;
    }
    await req.user.save();
    success(res, req.user.toJSON(), '更新成功');
  } catch (err) {
    next(err);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const isMatch = await req.user.comparePassword(oldPassword);
    if (!isMatch) {
      return error(res, 400, '旧密码错误');
    }
    req.user.password = newPassword;
    await req.user.save();
    success(res, null, '密码修改成功');
  } catch (err) {
    next(err);
  }
};

module.exports = { login, register, getProfile, updateProfile, updatePassword };
```

- [ ] **Step 4: 创建认证路由**

`backend/src/routes/authRoutes.js`:
```javascript
const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const {
  login,
  register,
  getProfile,
  updateProfile,
  updatePassword
} = require('../controllers/authController');

const router = express.Router();

router.post('/login', [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
], login);

router.post('/register', [
  body('username').isLength({ min: 3, max: 30 }).withMessage('用户名长度3-30位'),
  body('email').isEmail().withMessage('邮箱格式不正确'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6位')
], register);

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/password', auth, updatePassword);

module.exports = router;
```

---

## 阶段二：核心业务功能

### Task 4: 新闻数据 API

**Files:**
- Create: `backend/src/routes/newsRoutes.js`
- Create: `backend/src/controllers/newsController.js`

- [ ] **Step 1: 创建新闻控制器**

`backend/src/controllers/newsController.js`:
```javascript
const { validationResult } = require('express-validator');
const News = require('../models/News');
const { success, error } = require('../utils/response');

const getNewsList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const keyword = req.query.keyword || '';
    const sentiment = req.query.sentiment || '';
    const source = req.query.source || '';
    const category = req.query.category || '';
    const startTime = req.query.startTime;
    const endTime = req.query.endTime;

    const query = {};
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { summary: { $regex: keyword, $options: 'i' } }
      ];
    }
    if (sentiment) query.sentiment = sentiment;
    if (source) query.source = source;
    if (category) query.category = category;
    if (startTime || endTime) {
      query.publishTime = {};
      if (startTime) query.publishTime.$gte = new Date(startTime);
      if (endTime) query.publishTime.$lte = new Date(endTime);
    }

    const total = await News.countDocuments(query);
    const list = await News.find(query)
      .select('title summary source sourceUrl publishTime sentiment sentimentScore heatIndex category keywords author crawledAt')
      .sort({ publishTime: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    success(res, { list, total, page, pageSize });
  } catch (err) {
    next(err);
  }
};

const getNewsDetail = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return error(res, 404, '新闻不存在');
    }
    success(res, news);
  } catch (err) {
    next(err);
  }
};

const deleteNews = async (req, res, next) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) {
      return error(res, 404, '新闻不存在');
    }
    success(res, null, '删除成功');
  } catch (err) {
    next(err);
  }
};

const getStatistics = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalCount, todayCount, positiveCount, negativeCount, neutralCount] = await Promise.all([
      News.countDocuments(),
      News.countDocuments({ publishTime: { $gte: todayStart } }),
      News.countDocuments({ sentiment: 'positive' }),
      News.countDocuments({ sentiment: 'negative' }),
      News.countDocuments({ sentiment: 'neutral' })
    ]);

    success(res, {
      totalCount,
      todayCount,
      positiveCount,
      negativeCount,
      neutralCount,
      positiveRate: totalCount > 0 ? (positiveCount / totalCount * 100).toFixed(1) : 0,
      negativeRate: totalCount > 0 ? (negativeCount / totalCount * 100).toFixed(1) : 0
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNewsList, getNewsDetail, deleteNews, getStatistics };
```

- [ ] **Step 2: 创建新闻路由**

`backend/src/routes/newsRoutes.js`:
```javascript
const express = require('express');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const {
  getNewsList,
  getNewsDetail,
  deleteNews,
  getStatistics
} = require('../controllers/newsController');

const router = express.Router();

router.get('/', auth, getNewsList);
router.get('/statistics', auth, getStatistics);
router.get('/:id', auth, getNewsDetail);
router.delete('/:id', auth, requireRole('admin'), deleteNews);

module.exports = router;
```

---

### Task 5: 关键词 API

**Files:**
- Create: `backend/src/routes/keywordRoutes.js`
- Create: `backend/src/controllers/keywordController.js`

- [ ] **Step 1: 创建关键词控制器**

`backend/src/controllers/keywordController.js`:
```javascript
const { validationResult } = require('express-validator');
const Keyword = require('../models/Keyword');
const { success, error } = require('../utils/response');

const getKeywordList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const status = req.query.status || '';

    const query = {};
    if (status) query.status = status;

    const total = await Keyword.countDocuments(query);
    const list = await Keyword.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    success(res, { list, total, page, pageSize });
  } catch (err) {
    next(err);
  }
};

const createKeyword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 400, '参数错误', errors.array());
    }
    const { word, category } = req.body;
    const existing = await Keyword.findOne({ word });
    if (existing) {
      return error(res, 409, '关键词已存在');
    }
    const keyword = new Keyword({
      word,
      category: category || '默认',
      createdBy: req.user._id
    });
    await keyword.save();
    success(res, keyword, '添加成功');
  } catch (err) {
    next(err);
  }
};

const updateKeyword = async (req, res, next) => {
  try {
    const { word, category, status } = req.body;
    const keyword = await Keyword.findById(req.params.id);
    if (!keyword) {
      return error(res, 404, '关键词不存在');
    }
    if (word && word !== keyword.word) {
      const existing = await Keyword.findOne({ word });
      if (existing) {
        return error(res, 409, '关键词已存在');
      }
      keyword.word = word;
    }
    if (category !== undefined) keyword.category = category;
    if (status !== undefined) keyword.status = status;
    await keyword.save();
    success(res, keyword, '更新成功');
  } catch (err) {
    next(err);
  }
};

const deleteKeyword = async (req, res, next) => {
  try {
    const keyword = await Keyword.findByIdAndDelete(req.params.id);
    if (!keyword) {
      return error(res, 404, '关键词不存在');
    }
    success(res, null, '删除成功');
  } catch (err) {
    next(err);
  }
};

module.exports = { getKeywordList, createKeyword, updateKeyword, deleteKeyword };
```

- [ ] **Step 2: 创建关键词路由**

`backend/src/routes/keywordRoutes.js`:
```javascript
const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const {
  getKeywordList,
  createKeyword,
  updateKeyword,
  deleteKeyword
} = require('../controllers/keywordController');

const router = express.Router();

router.get('/', auth, getKeywordList);
router.post('/', auth, requireRole('analyst'), [
  body('word').notEmpty().withMessage('关键词不能为空')
], createKeyword);
router.put('/:id', auth, requireRole('analyst'), updateKeyword);
router.delete('/:id', auth, requireRole('analyst'), deleteKeyword);

module.exports = router;
```

---

### Task 6: 新闻源 API

**Files:**
- Create: `backend/src/routes/sourceRoutes.js`
- Create: `backend/src/controllers/sourceController.js`

- [ ] **Step 1: 创建新闻源控制器**

`backend/src/controllers/sourceController.js`:
```javascript
const { validationResult } = require('express-validator');
const NewsSource = require('../models/NewsSource');
const { success, error } = require('../utils/response');

const getSourceList = async (req, res, next) => {
  try {
    const list = await NewsSource.find().sort({ createdAt: -1 });
    success(res, { list, total: list.length });
  } catch (err) {
    next(err);
  }
};

const createSource = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 400, '参数错误', errors.array());
    }
    const { name, url, type, listUrl, selectorConfig, crawlInterval } = req.body;
    const existing = await NewsSource.findOne({ name });
    if (existing) {
      return error(res, 409, '新闻源名称已存在');
    }
    const source = new NewsSource({
      name,
      url,
      type: type || 'crawler',
      listUrl: listUrl || '',
      selectorConfig: selectorConfig || {},
      crawlInterval: crawlInterval || '0 */2 * * *'
    });
    await source.save();
    success(res, source, '添加成功');
  } catch (err) {
    next(err);
  }
};

const updateSource = async (req, res, next) => {
  try {
    const source = await NewsSource.findById(req.params.id);
    if (!source) {
      return error(res, 404, '新闻源不存在');
    }
    const { name, url, type, listUrl, selectorConfig, crawlInterval, status } = req.body;
    if (name && name !== source.name) {
      const existing = await NewsSource.findOne({ name });
      if (existing) {
        return error(res, 409, '新闻源名称已存在');
      }
      source.name = name;
    }
    if (url !== undefined) source.url = url;
    if (type !== undefined) source.type = type;
    if (listUrl !== undefined) source.listUrl = listUrl;
    if (selectorConfig !== undefined) source.selectorConfig = selectorConfig;
    if (crawlInterval !== undefined) source.crawlInterval = crawlInterval;
    if (status !== undefined) source.status = status;
    await source.save();
    success(res, source, '更新成功');
  } catch (err) {
    next(err);
  }
};

const deleteSource = async (req, res, next) => {
  try {
    const source = await NewsSource.findByIdAndDelete(req.params.id);
    if (!source) {
      return error(res, 404, '新闻源不存在');
    }
    success(res, null, '删除成功');
  } catch (err) {
    next(err);
  }
};

module.exports = { getSourceList, createSource, updateSource, deleteSource };
```

- [ ] **Step 2: 创建新闻源路由**

`backend/src/routes/sourceRoutes.js`:
```javascript
const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const {
  getSourceList,
  createSource,
  updateSource,
  deleteSource
} = require('../controllers/sourceController');

const router = express.Router();

router.get('/', auth, getSourceList);
router.post('/', auth, requireRole('admin'), [
  body('name').notEmpty().withMessage('名称不能为空'),
  body('url').notEmpty().withMessage('URL不能为空')
], createSource);
router.put('/:id', auth, requireRole('admin'), updateSource);
router.delete('/:id', auth, requireRole('admin'), deleteSource);

module.exports = router;
```

---

### Task 7: 用户管理 API

**Files:**
- Create: `backend/src/routes/userRoutes.js`
- Create: `backend/src/controllers/userController.js`

- [ ] **Step 1: 创建用户管理控制器**

`backend/src/controllers/userController.js`:
```javascript
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { success, error } = require('../utils/response');

const getUserList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const role = req.query.role || '';
    const status = req.query.status || '';
    const keyword = req.query.keyword || '';

    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (keyword) {
      query.$or = [
        { username: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const list = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    success(res, { list, total, page, pageSize });
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 400, '参数错误', errors.array());
    }
    const { username, email, password, role } = req.body;
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return error(res, 409, '用户名或邮箱已存在');
    }
    const user = new User({
      username,
      email,
      password,
      role: role || 'viewer'
    });
    await user.save();
    success(res, user.toJSON(), '创建成功');
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return error(res, 404, '用户不存在');
    }
    const { email, role, status, password } = req.body;
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return error(res, 409, '邮箱已被使用');
      }
      user.email = email;
    }
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;
    if (password) user.password = password;
    await user.save();
    success(res, user.toJSON(), '更新成功');
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return error(res, 400, '不能删除自己');
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return error(res, 404, '用户不存在');
    }
    success(res, null, '删除成功');
  } catch (err) {
    next(err);
  }
};

module.exports = { getUserList, createUser, updateUser, deleteUser };
```

- [ ] **Step 2: 创建用户管理路由**

`backend/src/routes/userRoutes.js`:
```javascript
const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const {
  getUserList,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const router = express.Router();

router.use(auth, requireRole('admin'));

router.get('/', getUserList);
router.post('/', [
  body('username').isLength({ min: 3, max: 30 }).withMessage('用户名长度3-30位'),
  body('email').isEmail().withMessage('邮箱格式不正确'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6位')
], createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
```

---

### Task 8: 数据分析 API

**Files:**
- Create: `backend/src/routes/analysisRoutes.js`
- Create: `backend/src/controllers/analysisController.js`

- [ ] **Step 1: 创建数据分析控制器**

`backend/src/controllers/analysisController.js`:
```javascript
const News = require('../models/News');
const Keyword = require('../models/Keyword');
const { success } = require('../utils/response');

const getSentimentTrend = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    const result = await News.aggregate([
      {
        $match: {
          publishTime: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$publishTime' }
          },
          positive: { $sum: { $cond: [{ $eq: ['$sentiment', 'positive'] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $eq: ['$sentiment', 'negative'] }, 1, 0] } },
          neutral: { $sum: { $cond: [{ $eq: ['$sentiment', 'neutral'] }, 1, 0] } },
          total: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dateList = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      dateList.push(d.toISOString().split('T')[0]);
    }

    const dataMap = {};
    result.forEach(item => {
      dataMap[item._id] = item;
    });

    const trendData = dateList.map(date => ({
      date,
      positive: dataMap[date]?.positive || 0,
      negative: dataMap[date]?.negative || 0,
      neutral: dataMap[date]?.neutral || 0,
      total: dataMap[date]?.total || 0
    }));

    success(res, trendData);
  } catch (err) {
    next(err);
  }
};

const getHeatRanking = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const list = await News.find()
      .select('title source sentiment heatIndex publishTime sourceUrl')
      .sort({ heatIndex: -1, publishTime: -1 })
      .limit(limit);
    success(res, list);
  } catch (err) {
    next(err);
  }
};

const getSourceDistribution = async (req, res, next) => {
  try {
    const result = await News.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          positive: { $sum: { $cond: [{ $eq: ['$sentiment', 'positive'] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $eq: ['$sentiment', 'negative'] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const data = result.map(item => ({
      source: item._id,
      count: item.count,
      positive: item.positive,
      negative: item.negative
    }));

    success(res, data);
  } catch (err) {
    next(err);
  }
};

const getWordCloud = async (req, res, next) => {
  try {
    const activeKeywords = await Keyword.find({ status: 'active' }).select('word');
    const keywordList = activeKeywords.map(k => k.word);

    const wordData = [];
    for (const word of keywordList) {
      const count = await News.countDocuments({
        $or: [
          { title: { $regex: word, $options: 'i' } },
          { content: { $regex: word, $options: 'i' } }
        ]
      });
      if (count > 0) {
        wordData.push({ name: word, value: count });
      }
    }

    const titleWords = await News.aggregate([
      { $project: { title: 1 } },
      { $limit: 500 }
    ]);

    const wordCount = {};
    const commonWords = ['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'];
    titleWords.forEach(item => {
      const chars = item.title.split(/[\s，。、；：""''（）【】《》！？\.,;:!?\(\)\[\]""''<>]+/).filter(w => w.length >= 2);
      chars.forEach(w => {
        if (!commonWords.includes(w)) {
          wordCount[w] = (wordCount[w] || 0) + 1;
        }
      });
    });

    Object.entries(wordCount).forEach(([name, value]) => {
      if (value >= 2 && !wordData.find(d => d.name === name)) {
        wordData.push({ name, value });
      }
    });

    wordData.sort((a, b) => b.value - a.value);
    success(res, wordData.slice(0, 100));
  } catch (err) {
    next(err);
  }
};

const getCategoryStats = async (req, res, next) => {
  try {
    const result = await News.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          positive: { $sum: { $cond: [{ $eq: ['$sentiment', 'positive'] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $eq: ['$sentiment', 'negative'] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const data = result.map(item => ({
      category: item._id,
      count: item.count,
      positive: item.positive,
      negative: item.negative
    }));

    success(res, data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSentimentTrend,
  getHeatRanking,
  getSourceDistribution,
  getWordCloud,
  getCategoryStats
};
```

- [ ] **Step 2: 创建数据分析路由**

`backend/src/routes/analysisRoutes.js`:
```javascript
const express = require('express');
const auth = require('../middleware/auth');
const {
  getSentimentTrend,
  getHeatRanking,
  getSourceDistribution,
  getWordCloud,
  getCategoryStats
} = require('../controllers/analysisController');

const router = express.Router();

router.use(auth);

router.get('/sentiment-trend', getSentimentTrend);
router.get('/heat-ranking', getHeatRanking);
router.get('/source-distribution', getSourceDistribution);
router.get('/word-cloud', getWordCloud);
router.get('/category-stats', getCategoryStats);

module.exports = router;
```

---

## 阶段三：爬虫与情感分析

### Task 9: 情感分析服务

**Files:**
- Create: `backend/src/services/sentimentService.js`
- Create: `backend/src/data/sentimentDict.js`

- [ ] **Step 1: 创建情感词典**

`backend/src/data/sentimentDict.js`:
```javascript
const positiveWords = [
  '优秀', '卓越', '出色', '成功', '发展', '增长', '提升', '进步',
  '创新', '突破', '领先', '优质', '高效', '稳定', '安全', '健康',
  '繁荣', '和谐', '美好', '幸福', '满意', '认可', '支持', '赞赏',
  '鼓励', '希望', '光明', '积极', '正面', '有利', '良好', '改善',
  '扩大', '增加', '上涨', '盈利', '收益', '回报', '成就', '贡献',
  '合作', '共赢', '机遇', '潜力', '前景', '乐观', '信心', '动力',
  '改革', '升级', '转型', '跨越', '腾飞', '崛起', '强大', '富裕',
  '文明', '进步', '开放', '包容', '共享', '绿色', '可持续', '高质量'
];

const negativeWords = [
  '危机', '风险', '问题', '困难', '挑战', '下降', '减少', '下跌',
  '亏损', '失败', '衰退', '萧条', '通胀', '紧缩', '失业', '贫困',
  '污染', '破坏', '灾害', '事故', '伤亡', '疫情', '病毒', '疾病',
  '冲突', '战争', '制裁', '封锁', '打压', '歧视', '腐败', '丑闻',
  '骗局', '诈骗', '犯罪', '违法', '违规', '处罚', '警告', '调查',
  '质疑', '批评', '反对', '抗议', '不满', '失望', '悲观', '担忧',
  '焦虑', '恐慌', '混乱', '动荡', '不稳定', '恶化', '严重', '紧急',
  '停滞', '萎缩', '下滑', '缩水', '蒸发', '爆雷', '跑路', '倒闭'
];

module.exports = { positiveWords, negativeWords };
```

- [ ] **Step 2: 创建情感分析服务**

`backend/src/services/sentimentService.js`:
```javascript
const { positiveWords, negativeWords } = require('../data/sentimentDict');

const analyzeSentiment = (text) => {
  if (!text || typeof text !== 'string') {
    return { sentiment: 'neutral', score: 0 };
  }

  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    const matches = text.match(regex);
    if (matches) positiveCount += matches.length;
  });

  negativeWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    const matches = text.match(regex);
    if (matches) negativeCount += matches.length;
  });

  const total = positiveCount + negativeCount;
  let score = 0;
  let sentiment = 'neutral';

  if (total > 0) {
    score = (positiveCount - negativeCount) / total;
    if (score > 0.1) {
      sentiment = 'positive';
    } else if (score < -0.1) {
      sentiment = 'negative';
    }
  }

  return {
    sentiment,
    score: Math.round(score * 100) / 100,
    positiveCount,
    negativeCount
  };
};

const calculateHeatIndex = (news, sourceWeight = 1) => {
  const titleWeight = 1.5;
  const sentimentWeight = Math.abs(news.sentimentScore || 0) * 0.5;
  const timeDecay = 1;

  const now = new Date();
  const publishTime = new Date(news.publishTime || now);
  const hoursDiff = (now - publishTime) / (1000 * 60 * 60);
  const timeFactor = Math.max(0.1, 1 - hoursDiff / 72);

  const contentLength = (news.content?.length || 0) / 1000;
  const lengthFactor = Math.min(2, 1 + contentLength * 0.5);

  const heat = (titleWeight + sentimentWeight + lengthFactor) * sourceWeight * timeFactor * 10;

  return Math.round(heat * 10) / 10;
};

module.exports = { analyzeSentiment, calculateHeatIndex };
```

---

### Task 10: 爬虫核心模块

**Files:**
- Create: `backend/src/crawler/newsCrawler.js`
- Create: `backend/src/crawler/crawlScheduler.js`
- Create: `backend/src/routes/crawlRoutes.js`
- Create: `backend/src/controllers/crawlController.js`

- [ ] **Step 1: 创建新闻爬虫核心**

`backend/src/crawler/newsCrawler.js`:
```javascript
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const News = require('../models/News');
const NewsSource = require('../models/NewsSource');
const CrawlTask = require('../models/CrawlTask');
const { analyzeSentiment, calculateHeatIndex } = require('../services/sentimentService');

const defaultSelectors = {
  listItem: 'article, .news-item, .item, li',
  title: 'h1, .title, .news-title',
  content: '.content, .article-content, .news-content',
  publishTime: '.time, .date, .publish-time',
  author: '.author, .source'
};

class NewsCrawler {
  constructor() {
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async fetchPage(url) {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1366, height: 768 });
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      const html = await page.content();
      return html;
    } finally {
      await page.close();
    }
  }

  parseListPage(html, selectors) {
    const $ = cheerio.load(html);
    const items = [];
    const listSelector = selectors?.listItem || defaultSelectors.listItem;
    const titleSelector = selectors?.title || defaultSelectors.title;

    $(listSelector).each((i, el) => {
      const $el = $(el);
      const $title = $el.find(titleSelector);
      const title = $title.text().trim();
      let url = $el.find('a').attr('href') || $title.find('a').attr('href');
      if (title && url) {
        items.push({ title, url });
      }
    });

    return items.slice(0, 30);
  }

  parseDetailPage(html, selectors) {
    const $ = cheerio.load(html);
    const contentSelector = selectors?.content || defaultSelectors.content;
    const timeSelector = selectors?.publishTime || defaultSelectors.publishTime;
    const authorSelector = selectors?.author || defaultSelectors.author;

    const title = $('h1').first().text().trim();
    const content = $(contentSelector).text().trim() || $('article').text().trim();
    const publishTimeText = $(timeSelector).first().text().trim();
    const author = $(authorSelector).first().text().trim();

    let publishTime = new Date();
    if (publishTimeText) {
      const parsed = new Date(publishTimeText.replace(/年|月/g, '-').replace(/日/g, ''));
      if (!isNaN(parsed.getTime())) {
        publishTime = parsed;
      }
    }

    const summary = content.substring(0, 200).replace(/\s+/g, ' ');

    return { title, content, summary, publishTime, author };
  }

  resolveUrl(baseUrl, relativeUrl) {
    try {
      return new URL(relativeUrl, baseUrl).href;
    } catch {
      return relativeUrl;
    }
  }

  async crawlSource(sourceId, triggeredBy = 'manual') {
    const source = await NewsSource.findById(sourceId);
    if (!source) {
      throw new Error('新闻源不存在');
    }

    const task = new CrawlTask({
      sourceId: source._id,
      sourceName: source.name,
      status: 'running',
      startTime: new Date(),
      triggeredBy
    });
    await task.save();

    let newsCount = 0;
    let newCount = 0;

    try {
      const listUrl = source.listUrl || source.url;
      const listHtml = await this.fetchPage(listUrl);
      const items = this.parseListPage(listHtml, source.selectorConfig);

      for (const item of items) {
        try {
          const detailUrl = this.resolveUrl(source.url, item.url);
          const existing = await News.findOne({ sourceUrl: detailUrl });
          if (existing) continue;

          const detailHtml = await this.fetchPage(detailUrl);
          const detail = this.parseDetailPage(detailHtml, source.selectorConfig);

          const fullTitle = detail.title || item.title;
          const { sentiment, score } = analyzeSentiment(detail.content || fullTitle);

          const categories = ['政治', '经济', '科技', '社会', '娱乐', '体育', '其他'];
          const category = categories[Math.floor(Math.random() * (categories.length - 1))];

          const news = new News({
            title: fullTitle,
            content: detail.content || item.title,
            summary: detail.summary || fullTitle.substring(0, 100),
            source: source.name,
            sourceUrl: detailUrl,
            author: detail.author || '',
            publishTime: detail.publishTime,
            sentiment,
            sentimentScore: score,
            heatIndex: 0,
            category,
            keywords: [],
            tags: [],
            sourceId: source._id
          });

          news.heatIndex = calculateHeatIndex(news, 1.2);

          await news.save();
          newCount++;
          newsCount++;
        } catch (err) {
          console.error(`Crawl item error: ${err.message}`);
        }
      }

      task.status = 'completed';
      task.newsCount = newsCount;
      task.newCount = newCount;
      source.lastCrawlTime = new Date();
      await source.save();
    } catch (err) {
      task.status = 'failed';
      task.errorMsg = err.message;
      console.error(`Crawl source ${source.name} error:`, err);
    } finally {
      task.endTime = new Date();
      await task.save();
      await this.closeBrowser();
    }

    return task;
  }
}

const crawler = new NewsCrawler();

module.exports = crawler;
```

- [ ] **Step 2: 创建爬虫调度器**

`backend/src/crawler/crawlScheduler.js`:
```javascript
const cron = require('node-cron');
const NewsSource = require('../models/NewsSource');
const crawler = require('./newsCrawler');

class CrawlScheduler {
  constructor() {
    this.tasks = new Map();
  }

  async start() {
    try {
      const sources = await NewsSource.find({ status: 'active' });
      sources.forEach(source => {
        this.scheduleTask(source);
      });
      console.log(`Crawl scheduler started with ${sources.length} sources`);
    } catch (err) {
      console.error('Failed to start crawl scheduler:', err);
    }
  }

  scheduleTask(source) {
    if (this.tasks.has(source._id.toString())) {
      this.tasks.get(source._id.toString()).stop();
    }

    try {
      const task = cron.schedule(source.crawlInterval, async () => {
        console.log(`Scheduled crawl for: ${source.name}`);
        try {
          await crawler.crawlSource(source._id, 'schedule');
        } catch (err) {
          console.error(`Scheduled crawl error for ${source.name}:`, err);
        }
      });

      this.tasks.set(source._id.toString(), task);
    } catch (err) {
      console.error(`Failed to schedule task for ${source.name}:`, err);
    }
  }

  stopTask(sourceId) {
    const task = this.tasks.get(sourceId.toString());
    if (task) {
      task.stop();
      this.tasks.delete(sourceId.toString());
    }
  }

  stopAll() {
    this.tasks.forEach(task => task.stop());
    this.tasks.clear();
  }
}

const scheduler = new CrawlScheduler();

module.exports = scheduler;
```

- [ ] **Step 3: 创建采集控制器**

`backend/src/controllers/crawlController.js`:
```javascript
const crawler = require('../crawler/newsCrawler');
const CrawlTask = require('../models/CrawlTask');
const NewsSource = require('../models/NewsSource');
const { success, error } = require('../utils/response');

const triggerCrawl = async (req, res, next) => {
  try {
    const { sourceId } = req.body;
    if (!sourceId) {
      return error(res, 400, '缺少新闻源ID');
    }
    const source = await NewsSource.findById(sourceId);
    if (!source) {
      return error(res, 404, '新闻源不存在');
    }

    crawler.crawlSource(sourceId, 'manual').catch(err => {
      console.error('Crawl error:', err);
    });

    success(res, null, '采集任务已启动');
  } catch (err) {
    next(err);
  }
};

const getTaskList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const status = req.query.status || '';

    const query = {};
    if (status) query.status = status;

    const total = await CrawlTask.countDocuments(query);
    const list = await CrawlTask.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    success(res, { list, total, page, pageSize });
  } catch (err) {
    next(err);
  }
};

const getTaskDetail = async (req, res, next) => {
  try {
    const task = await CrawlTask.findById(req.params.id);
    if (!task) {
      return error(res, 404, '任务不存在');
    }
    success(res, task);
  } catch (err) {
    next(err);
  }
};

module.exports = { triggerCrawl, getTaskList, getTaskDetail };
```

- [ ] **Step 4: 创建采集路由**

`backend/src/routes/crawlRoutes.js`:
```javascript
const express = require('express');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const {
  triggerCrawl,
  getTaskList,
  getTaskDetail
} = require('../controllers/crawlController');

const router = express.Router();

router.post('/trigger', auth, requireRole('analyst'), triggerCrawl);
router.get('/tasks', auth, getTaskList);
router.get('/tasks/:id', auth, getTaskDetail);

module.exports = router;
```

---

### Task 11: 种子数据

**Files:**
- Create: `backend/src/data/seed.js`
- Create: `backend/src/data/mockNews.js`

- [ ] **Step 1: 创建模拟新闻数据生成器**

`backend/src/data/mockNews.js`:
```javascript
const newsTemplates = [
  {
    title: '国务院发布最新经济政策，推动高质量发展',
    category: '经济',
    source: '新华网',
    sentiment: 'positive',
    content: '国务院今日发布最新经济发展政策，强调推动高质量发展，促进产业升级转型。政策涵盖科技创新、绿色发展、数字经济等多个领域，将为经济增长注入新动能。专家表示，这一系列政策措施有助于稳定市场预期，增强发展信心。'
  },
  {
    title: '科技巨头发布新一代人工智能产品',
    category: '科技',
    source: '科技日报',
    sentiment: 'positive',
    content: '今日，多家科技巨头同时发布了新一代人工智能产品，涵盖大语言模型、计算机视觉、自动驾驶等多个领域。业内人士认为，这标志着人工智能技术进入了新的发展阶段，将深刻改变人们的生产生活方式。'
  },
  {
    title: '某地发生食品安全问题，相关部门介入调查',
    category: '社会',
    source: '民生周刊',
    sentiment: 'negative',
    content: '近日，某地曝出食品安全问题，涉及多家知名餐饮企业。市场监管部门已成立专项调查组，对涉事企业进行全面检查。专家提醒消费者注意饮食安全，遇到问题及时举报。'
  },
  {
    title: '全球气候变化峰会达成重要共识',
    category: '政治',
    source: '国际观察',
    sentiment: 'positive',
    content: '为期两周的全球气候变化峰会今日落下帷幕，与会各国就减排目标达成重要共识。会议通过了多项决议，包括加快可再生能源发展、加强气候融资等。各方表示将共同应对气候变化挑战。'
  },
  {
    title: '股市震荡下行，投资者需保持谨慎',
    category: '经济',
    source: '财经时报',
    sentiment: 'negative',
    content: '今日股市继续震荡下行，主要指数均出现不同程度下跌。分析人士指出，受多重因素影响，市场情绪偏谨慎。建议投资者关注基本面，合理控制仓位，避免追涨杀跌。'
  },
  {
    title: '新能源汽车销量创历史新高',
    category: '科技',
    source: '汽车之家',
    sentiment: 'positive',
    content: '据最新统计数据显示，上月新能源汽车销量创历史新高，同比增长超过50%。业内分析认为，随着技术成熟和价格下降，新能源汽车越来越受到消费者青睐，市场前景广阔。'
  },
  {
    title: '文化产业蓬勃发展，新业态不断涌现',
    category: '娱乐',
    source: '文化报',
    sentiment: 'positive',
    content: '近年来，我国文化产业蓬勃发展，数字文化、沉浸式体验等新业态不断涌现。数据显示，文化产业增加值持续增长，成为经济增长的新亮点。政策支持和技术创新为产业发展提供了强劲动力。'
  },
  {
    title: '体育赛事圆满落幕，中国队表现出色',
    category: '体育',
    source: '体育周刊',
    sentiment: 'positive',
    content: '经过激烈角逐，本次体育赛事今日圆满落幕。中国代表团表现出色，获得多枚金牌，展现了良好的竞技状态和精神风貌。运动员们的拼搏精神赢得了观众的热烈掌声。'
  },
  {
    title: '某企业被曝存在环境污染问题',
    category: '社会',
    source: '环保在线',
    sentiment: 'negative',
    content: '近日，有群众举报某企业存在环境污染问题。环保部门已迅速介入调查，对涉事企业进行了现场检测。经查，该企业确实存在超标排放行为，已被责令停产整改。'
  },
  {
    title: '教育改革取得新进展，学生负担减轻',
    category: '社会',
    source: '教育报',
    sentiment: 'positive',
    content: '教育改革持续推进，取得新的进展。各地积极落实双减政策，学生课业负担明显减轻。同时，素质教育得到更多重视，学生综合素质不断提升。家长和社会对改革成效给予肯定。'
  },
  {
    title: '房地产市场持续调整，房价稳中有降',
    category: '经济',
    source: '房产观察',
    sentiment: 'negative',
    content: '房地产市场持续调整，主要城市房价稳中有降。专家分析认为，在房住不炒的政策基调下，市场回归理性。房企积极转型，探索新的发展模式。预计未来市场将以平稳运行为主。'
  },
  {
    title: '5G网络覆盖率大幅提升，应用场景不断丰富',
    category: '科技',
    source: '通信世界',
    sentiment: 'positive',
    content: '我国5G网络建设取得显著成效，覆盖率大幅提升。截至目前，全国已建成5G基站超过300万个，覆盖所有地级市和县城城区。5G应用场景不断丰富，在工业、医疗、教育等领域发挥重要作用。'
  },
  {
    title: '知名艺人涉嫌违法被调查',
    category: '娱乐',
    source: '娱乐头条',
    sentiment: 'negative',
    content: '今日，有消息称某知名艺人涉嫌违法被调查。相关部门已介入，案件正在进一步审理中。业内人士表示，艺人应当遵纪守法，树立良好榜样。此事引发社会广泛关注和讨论。'
  },
  {
    title: '医疗改革深入推进，看病难问题缓解',
    category: '社会',
    source: '健康报',
    sentiment: 'positive',
    content: '医疗改革深入推进，取得积极成效。分级诊疗制度逐步完善，基层医疗服务能力不断提升。群众看病难、看病贵问题得到有效缓解。医保覆盖范围扩大，保障水平稳步提高。'
  },
  {
    title: '国际贸易摩擦加剧，出口企业面临压力',
    category: '经济',
    source: '外贸导报',
    sentiment: 'negative',
    content: '近期国际贸易摩擦有所加剧，部分出口企业面临较大压力。专家建议企业加快转型升级，拓展多元化市场，降低对单一市场的依赖。政府也出台了多项扶持政策，帮助企业渡过难关。'
  }
];

const generateMockNews = (count = 50) => {
  const news = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const template = newsTemplates[i % newsTemplates.length];
    const publishOffset = Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000);
    const publishTime = new Date(now - publishOffset);

    const heatBase = template.sentiment === 'positive' ? 60 : template.sentiment === 'negative' ? 70 : 50;
    const heatVariation = Math.random() * 40;

    news.push({
      ...template,
      sourceUrl: `https://example.com/news/${i + 1000}`,
      publishTime,
      summary: template.content.substring(0, 100) + '...',
      author: ['记者A', '编辑B', '通讯员C', '特约撰稿人'][i % 4],
      sentimentScore: template.sentiment === 'positive' ? 0.3 + Math.random() * 0.4 :
                      template.sentiment === 'negative' ? -(0.3 + Math.random() * 0.4) :
                      (Math.random() - 0.5) * 0.2,
      heatIndex: Math.round((heatBase + heatVariation) * 10) / 10,
      keywords: [template.category],
      tags: []
    });
  }

  return news.sort((a, b) => b.publishTime - a.publishTime);
};

module.exports = { generateMockNews, newsTemplates };
```

- [ ] **Step 2: 创建种子数据脚本**

`backend/src/data/seed.js`:
```javascript
const mongoose = require('mongoose');
const config = require('../config');
const User = require('../models/User');
const Keyword = require('../models/Keyword');
const NewsSource = require('../models/NewsSource');
const News = require('../models/News');
const { generateMockNews } = require('./mockNews');

const seed = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB');

    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user created: admin / admin123');
    }

    const analystExists = await User.findOne({ username: 'analyst' });
    if (!analystExists) {
      const analyst = new User({
        username: 'analyst',
        email: 'analyst@example.com',
        password: 'analyst123',
        role: 'analyst'
      });
      await analyst.save();
      console.log('Analyst user created: analyst / analyst123');
    }

    const viewerExists = await User.findOne({ username: 'viewer' });
    if (!viewerExists) {
      const viewer = new User({
        username: 'viewer',
        email: 'viewer@example.com',
        password: 'viewer123',
        role: 'viewer'
      });
      await viewer.save();
      console.log('Viewer user created: viewer / viewer123');
    }

    const defaultKeywords = [
      { word: '经济发展', category: '经济' },
      { word: '科技创新', category: '科技' },
      { word: '人工智能', category: '科技' },
      { word: '新能源', category: '科技' },
      { word: '环境保护', category: '社会' },
      { word: '教育改革', category: '社会' },
      { word: '医疗健康', category: '社会' },
      { word: '房地产', category: '经济' },
      { word: '股市', category: '经济' },
      { word: '国际贸易', category: '经济' }
    ];

    for (const kw of defaultKeywords) {
      const exists = await Keyword.findOne({ word: kw.word });
      if (!exists) {
        await Keyword.create(kw);
        console.log(`Keyword created: ${kw.word}`);
      }
    }

    const defaultSources = [
      {
        name: '新华网',
        url: 'http://www.xinhuanet.com',
        type: 'crawler',
        listUrl: 'http://www.xinhuanet.com/politics.htm',
        crawlInterval: '0 */2 * * *',
        status: 'active'
      },
      {
        name: '人民网',
        url: 'http://www.people.com.cn',
        type: 'crawler',
        listUrl: 'http://www.people.com.cn/GB/86800/index.html',
        crawlInterval: '0 */2 * * *',
        status: 'active'
      }
    ];

    for (const src of defaultSources) {
      const exists = await NewsSource.findOne({ name: src.name });
      if (!exists) {
        await NewsSource.create(src);
        console.log(`News source created: ${src.name}`);
      }
    }

    const newsCount = await News.countDocuments();
    if (newsCount === 0) {
      const mockNews = generateMockNews(50);
      await News.insertMany(mockNews);
      console.log(`${mockNews.length} mock news articles created`);
    } else {
      console.log(`News already exists: ${newsCount} articles`);
    }

    console.log('Seed data completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
```

---

## 阶段四：前端项目初始化

### Task 12: 前端项目初始化

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/.env`
- Create: `frontend/.env.example`
- Create: `frontend/index.html`
- Create: `frontend/src/main.jsx`
- Create: `frontend/src/App.jsx`
- Create: `frontend/src/router/index.jsx`

- [ ] **Step 1: 创建前端 package.json**

```json
{
  "name": "opus-monitor-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "antd": "^5.16.0",
    "axios": "^1.6.8",
    "dayjs": "^1.11.10",
    "echarts": "^5.5.0",
    "echarts-for-react": "^3.0.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.3"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.2.0"
  }
}
```

- [ ] **Step 2: 创建 Vite 配置和环境变量**

`frontend/vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
```

`.env`:
```
VITE_API_BASE_URL=/api
VITE_APP_TITLE=舆情感知系统
```

`.env.example`:
```
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_TITLE=舆情感知系统
```

- [ ] **Step 3: 创建 index.html**

`frontend/index.html`:
```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>舆情感知系统</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: 创建入口文件和 App**

`frontend/src/main.jsx`:
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} theme={{
      token: {
        colorPrimary: '#1677ff',
        borderRadius: 6
      }
    }}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
)
```

`frontend/src/App.jsx`:
```javascript
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import NewsList from './pages/monitor/NewsList'
import KeywordManage from './pages/monitor/KeywordManage'
import SentimentAnalysis from './pages/analysis/SentimentAnalysis'
import HeatAnalysis from './pages/analysis/HeatAnalysis'
import SourceAnalysis from './pages/analysis/SourceAnalysis'
import UserManage from './pages/system/UserManage'
import SourceManage from './pages/system/SourceManage'
import TaskManage from './pages/system/TaskManage'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="monitor/news" element={<NewsList />} />
          <Route path="monitor/keywords" element={<KeywordManage />} />
          <Route path="analysis/sentiment" element={<SentimentAnalysis />} />
          <Route path="analysis/heat" element={<HeatAnalysis />} />
          <Route path="analysis/source" element={<SourceAnalysis />} />
          <Route path="system/users" element={<UserManage />} />
          <Route path="system/sources" element={<SourceManage />} />
          <Route path="system/tasks" element={<TaskManage />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
```

`frontend/src/index.css`:
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f0f2f5;
}

#root {
  min-height: 100vh;
}
```

- [ ] **Step 5: 安装前端依赖**

```bash
cd frontend && npm install
```

---

### Task 13: 前端基础组件和服务

**Files:**
- Create: `frontend/src/services/api.js`
- Create: `frontend/src/context/AuthContext.jsx`
- Create: `frontend/src/components/ProtectedRoute.jsx`
- Create: `frontend/src/utils/index.js`

- [ ] **Step 1: 创建 API 服务**

`frontend/src/services/api.js`:
```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => {
    const { data } = response
    if (data.code === 0) {
      return data.data
    }
    return Promise.reject(new Error(data.message || '请求失败'))
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    const message = error.response?.data?.message || error.message || '网络错误'
    return Promise.reject(new Error(message))
  }
)

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data)
}

export const newsApi = {
  getList: (params) => api.get('/news', { params }),
  getDetail: (id) => api.get(`/news/${id}`),
  delete: (id) => api.delete(`/news/${id}`),
  getStatistics: () => api.get('/news/statistics')
}

export const keywordApi = {
  getList: (params) => api.get('/keywords', { params }),
  create: (data) => api.post('/keywords', data),
  update: (id, data) => api.put(`/keywords/${id}`, data),
  delete: (id) => api.delete(`/keywords/${id}`)
}

export const sourceApi = {
  getList: () => api.get('/sources'),
  create: (data) => api.post('/sources', data),
  update: (id, data) => api.put(`/sources/${id}`, data),
  delete: (id) => api.delete(`/sources/${id}`)
}

export const crawlApi = {
  trigger: (sourceId) => api.post('/crawl/trigger', { sourceId }),
  getTasks: (params) => api.get('/crawl/tasks', { params }),
  getTaskDetail: (id) => api.get(`/crawl/tasks/${id}`)
}

export const analysisApi = {
  getSentimentTrend: (params) => api.get('/analysis/sentiment-trend', { params }),
  getHeatRanking: (params) => api.get('/analysis/heat-ranking', { params }),
  getSourceDistribution: () => api.get('/analysis/source-distribution'),
  getWordCloud: () => api.get('/analysis/word-cloud'),
  getCategoryStats: () => api.get('/analysis/category-stats')
}

export const userApi = {
  getList: (params) => api.get('/users', { params }),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`)
}

export default api
```

- [ ] **Step 2: 创建 Auth Context**

`frontend/src/context/AuthContext.jsx`:
```javascript
import { createContext, useContext, useState, useEffect } from 'react'
import { message } from 'antd'
import { authApi } from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      loadProfile()
    } else {
      setLoading(false)
    }
  }, [])

  const loadProfile = async () => {
    try {
      const profile = await authApi.getProfile()
      setUser(profile)
    } catch (err) {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    const data = await authApi.login({ username, password })
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    message.success('登录成功')
    return data
  }

  const register = async (userData) => {
    const data = await authApi.register(userData)
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    message.success('注册成功')
    return data
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const hasRole = (...roles) => {
    if (!user) return false
    const roleHierarchy = {
      admin: ['admin', 'analyst', 'viewer'],
      analyst: ['analyst', 'viewer'],
      viewer: ['viewer']
    }
    return roles.some(role => roleHierarchy[user.role]?.includes(role))
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      hasRole,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

- [ ] **Step 3: 创建路由守卫组件**

`frontend/src/components/ProtectedRoute.jsx`:
```javascript
import { Navigate, useLocation } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
```

- [ ] **Step 4: 创建工具函数**

`frontend/src/utils/index.js`:
```javascript
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

export const formatTime = (time, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!time) return '-'
  return dayjs(time).format(format)
}

export const formatRelativeTime = (time) => {
  if (!time) return '-'
  return dayjs(time).fromNow()
}

export const formatDate = (date) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD')
}

export const sentimentText = {
  positive: '正面',
  negative: '负面',
  neutral: '中性'
}

export const sentimentColor = {
  positive: '#52c41a',
  negative: '#ff4d4f',
  neutral: '#faad14'
}

export const roleText = {
  admin: '管理员',
  analyst: '分析师',
  viewer: '访客'
}

export const roleColor = {
  admin: 'red',
  analyst: 'blue',
  viewer: 'default'
}

export const statusText = {
  active: '启用',
  inactive: '禁用',
  disabled: '禁用',
  pending: '待执行',
  running: '执行中',
  completed: '已完成',
  failed: '失败'
}

export const statusColor = {
  active: 'green',
  inactive: 'default',
  disabled: 'red',
  pending: 'default',
  running: 'processing',
  completed: 'success',
  failed: 'error'
}

export const categoryList = ['政治', '经济', '科技', '社会', '娱乐', '体育', '其他']

export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
```

---

## 阶段五：前端页面开发

### Task 14: 登录注册页和主布局

**Files:**
- Create: `frontend/src/pages/Login.jsx`
- Create: `frontend/src/pages/Register.jsx`
- Create: `frontend/src/layouts/MainLayout.jsx`

- [ ] **Step 1: 创建登录页**

`frontend/src/pages/Login.jsx`:
```javascript
import { useState } from 'react'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const { Title, Text } = Typography

const Login = () => {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      await login(values.username, values.password)
      navigate(from, { replace: true })
    } catch (err) {
      message.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={3} style={{ marginBottom: 8 }}>舆情感知系统</Title>
          <Text type="secondary">新闻舆情智能监控平台</Text>
        </div>
        <Form
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              还没有账号？<Link to="/register">立即注册</Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default Login
```

- [ ] **Step 2: 创建注册页**

`frontend/src/pages/Register.jsx`:
```javascript
import { useState } from 'react'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const { Title, Text } = Typography

const Register = () => {
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      await register(values)
      message.success('注册成功')
      navigate('/dashboard')
    } catch (err) {
      message.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={3} style={{ marginBottom: 8 }}>用户注册</Title>
          <Text type="secondary">创建您的舆情感知账号</Text>
        </div>
        <Form
          name="register"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, max: 30, message: '用户名长度3-30位' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                }
              })
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              注册
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              已有账号？<Link to="/login">立即登录</Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default Register
```

- [ ] **Step 3: 创建主布局**

`frontend/src/layouts/MainLayout.jsx`:
```javascript
import { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Space, Typography } from 'antd'
import {
  DashboardOutlined,
  MonitorOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  ProfileOutlined,
  CaretDownOutlined,
  FireOutlined
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const getSelectedKeys = () => {
    const path = location.pathname
    if (path.startsWith('/dashboard')) return ['/dashboard']
    if (path.startsWith('/monitor')) return ['/monitor']
    if (path.startsWith('/analysis')) return ['/analysis']
    if (path.startsWith('/system')) return ['/system']
    if (path.startsWith('/profile')) return ['/profile']
    return []
  }

  const getOpenKeys = () => {
    const path = location.pathname
    if (path.startsWith('/monitor')) return ['/monitor']
    if (path.startsWith('/analysis')) return ['/analysis']
    if (path.startsWith('/system')) return ['/system']
    return []
  }

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
      onClick: () => navigate('/dashboard')
    },
    {
      key: '/monitor',
      icon: <MonitorOutlined />,
      label: '舆情监控',
      children: [
        { key: '/monitor/news', label: '新闻列表', onClick: () => navigate('/monitor/news') },
        { key: '/monitor/keywords', label: '关键词管理', onClick: () => navigate('/monitor/keywords') }
      ]
    },
    {
      key: '/analysis',
      icon: <BarChartOutlined />,
      label: '数据分析',
      children: [
        { key: '/analysis/sentiment', label: '情感分析', onClick: () => navigate('/analysis/sentiment') },
        { key: '/analysis/heat', label: '热度分析', onClick: () => navigate('/analysis/heat') },
        { key: '/analysis/source', label: '来源分析', onClick: () => navigate('/analysis/source') }
      ]
    },
    hasRole('admin') && {
      key: '/system',
      icon: <SettingOutlined />,
      label: '系统管理',
      children: [
        { key: '/system/users', label: '用户管理', onClick: () => navigate('/system/users') },
        { key: '/system/sources', label: '新闻源管理', onClick: () => navigate('/system/sources') },
        { key: '/system/tasks', label: '采集任务', onClick: () => navigate('/system/tasks') }
      ]
    }
  ].filter(Boolean)

  const userMenuItems = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile')
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout()
        navigate('/login')
      }
    }
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 14 : 18,
          fontWeight: 'bold',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <FireOutlined style={{ marginRight: collapsed ? 0 : 8, color: '#faad14' }} />
          {!collapsed && '舆情感知系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,0.08)'
        }}>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} src={user?.avatar} />
              <Space direction="vertical" size={0}>
                <Text strong>{user?.username}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {user?.role === 'admin' ? '管理员' : user?.role === 'analyst' ? '分析师' : '访客'}
                </Text>
              </Space>
              <CaretDownOutlined style={{ fontSize: 12 }} />
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
```

---

### Task 15: 仪表盘页面

**Files:**
- Create: `frontend/src/pages/Dashboard.jsx`

- [ ] **Step 1: 创建仪表盘页面**

`frontend/src/pages/Dashboard.jsx`:
```javascript
import { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, List, Tag, Typography, Spin } from 'antd'
import {
  RiseOutlined,
  FallOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
  LikeOutlined,
  DislikeOutlined
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { newsApi, analysisApi } from '../services/api'
import { formatTime, sentimentColor, sentimentText, truncateText } from '../utils'

const { Title, Text } = Typography

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [statistics, setStatistics] = useState({})
  const [trendData, setTrendData] = useState([])
  const [heatRanking, setHeatRanking] = useState([])
  const [sourceData, setSourceData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [latestNews, setLatestNews] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [stats, trend, heat, source, category, news] = await Promise.all([
        newsApi.getStatistics(),
        analysisApi.getSentimentTrend({ days: 7 }),
        analysisApi.getHeatRanking({ limit: 10 }),
        analysisApi.getSourceDistribution(),
        analysisApi.getCategoryStats(),
        newsApi.getList({ page: 1, pageSize: 8 })
      ])
      setStatistics(stats)
      setTrendData(trend)
      setHeatRanking(heat)
      setSourceData(source)
      setCategoryData(category)
      setLatestNews(news.list || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const trendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['正面', '负面', '中性'] },
    grid: { left: 50, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: trendData.map(d => d.date?.substring(5) || '')
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '正面',
        type: 'line',
        smooth: true,
        data: trendData.map(d => d.positive),
        itemStyle: { color: '#52c41a' },
        areaStyle: { opacity: 0.1 }
      },
      {
        name: '负面',
        type: 'line',
        smooth: true,
        data: trendData.map(d => d.negative),
        itemStyle: { color: '#ff4d4f' },
        areaStyle: { opacity: 0.1 }
      },
      {
        name: '中性',
        type: 'line',
        smooth: true,
        data: trendData.map(d => d.neutral),
        itemStyle: { color: '#faad14' },
        areaStyle: { opacity: 0.1 }
      }
    ]
  }

  const heatOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 120, right: 20, top: 10, bottom: 30 },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: heatRanking.map(d => d.title?.substring(0, 15) || '').reverse()
    },
    series: [{
      type: 'bar',
      data: heatRanking.map(d => d.heatIndex).reverse(),
      itemStyle: {
        color: (params) => {
          const item = heatRanking[heatRanking.length - 1 - params.dataIndex]
          return sentimentColor[item?.sentiment] || '#1677ff'
        }
      },
      barWidth: 16
    }]
  }

  const sourceOption = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' }
      },
      data: sourceData.map(d => ({ name: d.source, value: d.count }))
    }]
  }

  const categoryOption = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: '65%',
      data: categoryData.map(d => ({ name: d.category, value: d.count })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: {
        formatter: '{b}: {c} ({d}%)'
      }
    }]
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <Title level={4} style={{ marginTop: 0 }}>数据概览</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="新闻总数"
              value={statistics.totalCount || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日新增"
              value={statistics.todayCount || 0}
              prefix={<PlusCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="正面占比"
              value={statistics.positiveRate || 0}
              suffix="%"
              prefix={<LikeOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="负面占比"
              value={statistics.negativeRate || 0}
              suffix="%"
              prefix={<DislikeOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="情感趋势（近7天）">
            <ReactECharts option={trendOption} style={{ height: 320 }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="热度排行榜">
            <ReactECharts option={heatOption} style={{ height: 320 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12} lg={8}>
          <Card title="来源分布">
            <ReactECharts option={sourceOption} style={{ height: 280 }} />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Card title="分类统计">
            <ReactECharts option={categoryOption} style={{ height: 280 }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="最新舆情">
            <List
              size="small"
              dataSource={latestNews}
              renderItem={(item) => (
                <List.Item style={{ paddingLeft: 0, paddingRight: 0 }}>
                  <List.Item.Meta
                    title={
                      <Text
                        ellipsis
                        style={{ fontSize: 13, cursor: 'pointer' }}
                        title={item.title}
                      >
                        {item.title}
                      </Text>
                    }
                    description={
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Tag color={sentimentColor[item.sentiment]} style={{ marginRight: 8 }}>
                          {sentimentText[item.sentiment]}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatTime(item.publishTime, 'MM-DD HH:mm')}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
```

---

### Task 16: 舆情监控页面

**Files:**
- Create: `frontend/src/pages/monitor/NewsList.jsx`
- Create: `frontend/src/pages/monitor/KeywordManage.jsx`

- [ ] **Step 1: 创建新闻列表页**

`frontend/src/pages/monitor/NewsList.jsx`:
```javascript
import { useState, useEffect } from 'react'
import {
  Card, Table, Input, Select, DatePicker, Button, Space, Tag,
  Drawer, Descriptions, Divider, message, Spin
} from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { newsApi } from '../../services/api'
import { formatTime, sentimentText, sentimentColor, truncateText, categoryList } from '../../utils'

const { RangePicker } = DatePicker
const { Option } = Select

const NewsList = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [keyword, setKeyword] = useState('')
  const [sentiment, setSentiment] = useState('')
  const [category, setCategory] = useState('')
  const [dateRange, setDateRange] = useState(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentNews, setCurrentNews] = useState(null)

  useEffect(() => {
    loadData()
  }, [page, pageSize])

  const loadData = async () => {
    setLoading(true)
    try {
      const params = { page, pageSize }
      if (keyword) params.keyword = keyword
      if (sentiment) params.sentiment = sentiment
      if (category) params.category = category
      if (dateRange && dateRange.length === 2) {
        params.startTime = dateRange[0].startOf('day').toISOString()
        params.endTime = dateRange[1].endOf('day').toISOString()
      }
      const res = await newsApi.getList(params)
      setData(res.list || [])
      setTotal(res.total || 0)
    } catch (err) {
      message.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    loadData()
  }

  const handleReset = () => {
    setKeyword('')
    setSentiment('')
    setCategory('')
    setDateRange(null)
    setPage(1)
    setTimeout(() => loadData(), 0)
  }

  const handleViewDetail = async (record) => {
    try {
      const detail = await newsApi.getDetail(record._id)
      setCurrentNews(detail)
      setDetailVisible(true)
    } catch (err) {
      message.error(err.message)
    }
  }

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      width: 300,
      render: (text, record) => (
        <a onClick={() => handleViewDetail(record)} title={text}>{text}</a>
      )
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 100
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 80
    },
    {
      title: '情感倾向',
      dataIndex: 'sentiment',
      key: 'sentiment',
      width: 100,
      render: (val) => (
        <Tag color={sentimentColor[val]}>{sentimentText[val]}</Tag>
      )
    },
    {
      title: '热度指数',
      dataIndex: 'heatIndex',
      key: 'heatIndex',
      width: 100,
      sorter: (a, b) => a.heatIndex - b.heatIndex,
      defaultSortOrder: 'descend'
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
      key: 'publishTime',
      width: 160,
      render: (val) => formatTime(val),
      sorter: (a, b) => new Date(a.publishTime) - new Date(b.publishTime)
    }
  ]

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="搜索关键词"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
            onPressEnter={handleSearch}
          />
          <Select
            placeholder="情感倾向"
            value={sentiment || undefined}
            onChange={setSentiment}
            style={{ width: 120 }}
            allowClear
          >
            <Option value="positive">正面</Option>
            <Option value="negative">负面</Option>
            <Option value="neutral">中性</Option>
          </Select>
          <Select
            placeholder="分类"
            value={category || undefined}
            onChange={setCategory}
            style={{ width: 120 }}
            allowClear
          >
            {categoryList.map(c => (
              <Option key={c} value={c}>{c}</Option>
            ))}
          </Select>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="YYYY-MM-DD"
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </Space>
      </Card>

      <Card>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (p, ps) => {
              setPage(p)
              setPageSize(ps)
            }
          }}
        />
      </Card>

      <Drawer
        title="新闻详情"
        width={720}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
      >
        {currentNews ? (
          <>
            <h2 style={{ marginBottom: 8 }}>{currentNews.title}</h2>
            <div style={{ marginBottom: 16 }}>
              <Tag color={sentimentColor[currentNews.sentiment]}>
                {sentimentText[currentNews.sentiment]} ({currentNews.sentimentScore?.toFixed(2)})
              </Tag>
              <Tag>热度: {currentNews.heatIndex}</Tag>
              <Tag>{currentNews.category}</Tag>
            </div>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="来源">{currentNews.source}</Descriptions.Item>
              <Descriptions.Item label="作者">{currentNews.author || '-'}</Descriptions.Item>
              <Descriptions.Item label="发布时间">
                {formatTime(currentNews.publishTime)}
              </Descriptions.Item>
              <Descriptions.Item label="采集时间">
                {formatTime(currentNews.crawledAt)}
              </Descriptions.Item>
              <Descriptions.Item label="原文链接" span={2}>
                <a href={currentNews.sourceUrl} target="_blank" rel="noreferrer">
                  {currentNews.sourceUrl}
                </a>
              </Descriptions.Item>
            </Descriptions>
            <Divider>正文</Divider>
            <div style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {currentNews.content}
            </div>
          </>
        ) : (
          <Spin />
        )}
      </Drawer>
    </div>
  )
}

export default NewsList
```

- [ ] **Step 2: 创建关键词管理页**

`frontend/src/pages/monitor/KeywordManage.jsx`:
```javascript
import { useState, useEffect } from 'react'
import {
  Card, Table, Button, Space, Modal, Form, Input, Select, Switch,
  message, Popconfirm, Tag
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { keywordApi } from '../../services/api'
import { formatTime, statusText, statusColor } from '../../utils'
import { useAuth } from '../../context/AuthContext'

const { Option } = Select

const KeywordManage = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form] = Form.useForm()
  const { hasRole } = useAuth()

  useEffect(() => {
    loadData()
  }, [page, pageSize])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await keywordApi.getList({ page, pageSize })
      setData(res.list || [])
      setTotal(res.total || 0)
    } catch (err) {
      message.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingItem(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await keywordApi.delete(id)
      message.success('删除成功')
      loadData()
    } catch (err) {
      message.error(err.message)
    }
  }

  const handleToggleStatus = async (record, checked) => {
    try {
      await keywordApi.update(record._id, { status: checked ? 'active' : 'inactive' })
      message.success('状态已更新')
      loadData()
    } catch (err) {
      message.error(err.message)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingItem) {
        await keywordApi.update(editingItem._id, values)
        message.success('更新成功')
      } else {
        await keywordApi.create(values)
        message.success('添加成功')
      }
      setModalVisible(false)
      loadData()
    } catch (err) {
      if (err.errorFields) return
      message.error(err.message)
    }
  }

  const columns = [
    {
      title: '关键词',
      dataIndex: 'word',
      key: 'word',
      width: 200
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (val) => (
        <Tag color={statusColor[val]}>{statusText[val]}</Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (val) => formatTime(val)
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Switch
            checked={record.status === 'active'}
            onChange={(checked) => handleToggleStatus(record, checked)}
            size="small"
            disabled={!hasRole('analyst')}
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={!hasRole('analyst')}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此关键词？"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              disabled={!hasRole('analyst')}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Card
        title="关键词管理"
        extra={
          hasRole('analyst') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加关键词
            </Button>
          )
        }
      >
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (p, ps) => {
              setPage(p)
              setPageSize(ps)
            }
          }}
        />
      </Card>

      <Modal
        title={editingItem ? '编辑关键词' : '添加关键词'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="word"
            label="关键词"
            rules={[{ required: true, message: '请输入关键词' }]}
          >
            <Input placeholder="请输入关键词" />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Select placeholder="请选择分类" allowClear>
              <Option value="默认">默认</Option>
              <Option value="经济">经济</Option>
              <Option value="科技">科技</Option>
              <Option value="社会">社会</Option>
              <Option value="政治">政治</Option>
              <Option value="娱乐">娱乐</Option>
              <Option value="体育">体育</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="active">
            <Select>
              <Option value="active">启用</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default KeywordManage
```

---

### Task 17: 数据分析页面

**Files:**
- Create: `frontend/src/pages/analysis/SentimentAnalysis.jsx`
- Create: `frontend/src/pages/analysis/HeatAnalysis.jsx`
- Create: `frontend/src/pages/analysis/SourceAnalysis.jsx`

- [ ] **Step 1: 创建情感分析页**

`frontend/src/pages/analysis/SentimentAnalysis.jsx`:
```javascript
import { useState, useEffect } from 'react'
import { Card, Radio, Row, Col, Statistic, Spin } from 'antd'
import ReactECharts from 'echarts-for-react'
import { analysisApi, newsApi } from '../../services/api'

const SentimentAnalysis = () => {
  const [days, setDays] = useState(7)
  const [loading, setLoading] = useState(false)
  const [trendData, setTrendData] = useState([])
  const [statistics, setStatistics] = useState({})

  useEffect(() => {
    loadData()
  }, [days])

  const loadData = async () => {
    setLoading(true)
    try {
      const [trend, stats] = await Promise.all([
        analysisApi.getSentimentTrend({ days }),
        newsApi.getStatistics()
      ])
      setTrendData(trend)
      setStatistics(stats)
    } finally {
      setLoading(false)
    }
  }

  const trendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['正面', '负面', '中性', '总量'] },
    grid: { left: 50, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: trendData.map(d => d.date?.substring(5) || '')
    },
    yAxis: [
      { type: 'value', name: '数量' },
      { type: 'value', name: '总量', position: 'right' }
    ],
    series: [
      {
        name: '正面',
        type: 'bar',
        stack: 'sentiment',
        data: trendData.map(d => d.positive),
        itemStyle: { color: '#52c41a' }
      },
      {
        name: '负面',
        type: 'bar',
        stack: 'sentiment',
        data: trendData.map(d => d.negative),
        itemStyle: { color: '#ff4d4f' }
      },
      {
        name: '中性',
        type: 'bar',
        stack: 'sentiment',
        data: trendData.map(d => d.neutral),
        itemStyle: { color: '#faad14' }
      },
      {
        name: '总量',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: trendData.map(d => d.total),
        itemStyle: { color: '#1677ff' },
        lineStyle: { width: 3 }
      }
    ]
  }

  const pieOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      data: [
        { value: statistics.positiveCount || 0, name: '正面', itemStyle: { color: '#52c41a' } },
        { value: statistics.negativeCount || 0, name: '负面', itemStyle: { color: '#ff4d4f' } },
        { value: statistics.neutralCount || 0, name: '中性', itemStyle: { color: '#faad14' } }
      ],
      label: {
        formatter: '{b}: {c} ({d}%)'
      }
    }]
  }

  return (
    <div>
      <Card
        title="情感趋势分析"
        extra={
          <Radio.Group value={days} onChange={(e) => setDays(e.target.value)}>
            <Radio.Button value={7}>近7天</Radio.Button>
            <Radio.Button value={15}>近15天</Radio.Button>
            <Radio.Button value={30}>近30天</Radio.Button>
          </Radio.Group>
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 100 }}><Spin /></div>
        ) : (
          <ReactECharts option={trendOption} style={{ height: 400 }} />
        )}
      </Card>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title="情感占比分布">
            {loading ? (
              <div style={{ textAlign: 'center', padding: 60 }}><Spin /></div>
            ) : (
              <ReactECharts option={pieOption} style={{ height: 320 }} />
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="情感统计数据">
            <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
              <Col span={12}>
                <Statistic
                  title="正面新闻"
                  value={statistics.positiveCount || 0}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="负面新闻"
                  value={statistics.negativeCount || 0}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="中性新闻"
                  value={statistics.neutralCount || 0}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="新闻总数"
                  value={statistics.totalCount || 0}
                  valueStyle={{ color: '#1677ff' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default SentimentAnalysis
```

- [ ] **Step 2: 创建热度分析页**

`frontend/src/pages/analysis/HeatAnalysis.jsx`:
```javascript
import { useState, useEffect } from 'react'
import { Card, Radio, Spin, Tag, List, Typography } from 'antd'
import ReactECharts from 'echarts-for-react'
import { analysisApi } from '../../services/api'
import { sentimentText, sentimentColor, formatTime } from '../../utils'

const { Text } = Typography

const HeatAnalysis = () => {
  const [limit, setLimit] = useState(20)
  const [loading, setLoading] = useState(false)
  const [heatData, setHeatData] = useState([])

  useEffect(() => {
    loadData()
  }, [limit])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await analysisApi.getHeatRanking({ limit })
      setHeatData(data || [])
    } finally {
      setLoading(false)
    }
  }

  const barOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 200, right: 40, top: 20, bottom: 30 },
    xAxis: { type: 'value', name: '热度指数' },
    yAxis: {
      type: 'category',
      data: heatData.map(d => d.title?.substring(0, 20) || '').reverse(),
      axisLabel: { interval: 0 }
    },
    series: [{
      type: 'bar',
      data: heatData.map(d => d.heatIndex).reverse(),
      itemStyle: {
        color: (params) => {
          const idx = heatData.length - 1 - params.dataIndex
          return sentimentColor[heatData[idx]?.sentiment] || '#1677ff'
        },
        borderRadius: [0, 4, 4, 0]
      },
      barWidth: 18,
      label: {
        show: true,
        position: 'right',
        formatter: '{c}'
      }
    }]
  }

  const lineOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 30, bottom: 60 },
    xAxis: {
      type: 'category',
      data: heatData.slice(0, 15).map((_, i) => `TOP${i + 1}`),
      axisLabel: { rotate: 45 }
    },
    yAxis: { type: 'value', name: '热度指数' },
    series: [{
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      data: heatData.slice(0, 15).map(d => d.heatIndex),
      itemStyle: { color: '#1677ff' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(22, 119, 255, 0.5)' },
            { offset: 1, color: 'rgba(22, 119, 255, 0.05)' }
          ]
        }
      }
    }]
  }

  return (
    <div>
      <Card
        title="热度排行分析"
        extra={
          <Radio.Group value={limit} onChange={(e) => setLimit(e.target.value)}>
            <Radio.Button value={10}>TOP 10</Radio.Button>
            <Radio.Button value={20}>TOP 20</Radio.Button>
            <Radio.Button value={50}>TOP 50</Radio.Button>
          </Radio.Group>
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 100 }}><Spin /></div>
        ) : (
          <ReactECharts option={barOption} style={{ height: 500 }} />
        )}
      </Card>

      <Card title="热度趋势（TOP15）" style={{ marginTop: 16 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Spin /></div>
        ) : (
          <ReactECharts option={lineOption} style={{ height: 350 }} />
        )}
      </Card>

      <Card title="热点新闻详情" style={{ marginTop: 16 }}>
        <List
          dataSource={heatData.slice(0, 10)}
          renderItem={(item, index) => (
            <List.Item key={item._id}>
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Tag color={index < 3 ? 'red' : 'blue'} style={{ marginRight: 12 }}>
                      TOP {index + 1}
                    </Tag>
                    <Text strong>{item.title}</Text>
                  </div>
                }
                description={
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <Tag color={sentimentColor[item.sentiment]}>
                      {sentimentText[item.sentiment]}
                    </Tag>
                    <Tag>热度: {item.heatIndex}</Tag>
                    <Tag>{item.source}</Tag>
                    <Text type="secondary">{formatTime(item.publishTime)}</Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}

export default HeatAnalysis
```

- [ ] **Step 3: 创建来源分析页**

`frontend/src/pages/analysis/SourceAnalysis.jsx`:
```javascript
import { useState, useEffect } from 'react'
import { Card, Row, Col, Spin } from 'antd'
import ReactECharts from 'echarts-for-react'
import { analysisApi } from '../../services/api'

const SourceAnalysis = () => {
  const [loading, setLoading] = useState(false)
  const [sourceData, setSourceData] = useState([])
  const [wordCloudData, setWordCloudData] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [source, wordCloud] = await Promise.all([
        analysisApi.getSourceDistribution(),
        analysisApi.getWordCloud()
      ])
      setSourceData(source || [])
      setWordCloudData(wordCloud || [])
    } finally {
      setLoading(false)
    }
  }

  const pieOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} 篇 ({d}%)' },
    legend: { orient: 'vertical', left: 'left', top: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['65%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%' },
      data: sourceData.map(d => ({ name: d.source, value: d.count }))
    }]
  }

  const barOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['总量', '正面', '负面'] },
    grid: { left: 50, right: 20, top: 40, bottom: 40 },
    xAxis: {
      type: 'category',
      data: sourceData.map(d => d.source),
      axisLabel: { rotate: 30 }
    },
    yAxis: { type: 'value', name: '数量' },
    series: [
      {
        name: '总量',
        type: 'bar',
        data: sourceData.map(d => d.count),
        itemStyle: { color: '#1677ff' }
      },
      {
        name: '正面',
        type: 'bar',
        data: sourceData.map(d => d.positive),
        itemStyle: { color: '#52c41a' }
      },
      {
        name: '负面',
        type: 'bar',
        data: sourceData.map(d => d.negative),
        itemStyle: { color: '#ff4d4f' }
      }
    ]
  }

  const wordCloudOption = {
    tooltip: { show: true },
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      left: 'center',
      top: 'center',
      width: '90%',
      height: '90%',
      sizeRange: [12, 60],
      rotationRange: [-45, 45],
      rotationStep: 15,
      gridSize: 8,
      drawOutOfBound: false,
      textStyle: {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        color: () => {
          const colors = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96']
          return colors[Math.floor(Math.random() * colors.length)]
        }
      },
      emphasis: {
        textStyle: { textShadowBlur: 10, textShadowColor: '#333' }
      },
      data: wordCloudData
    }]
  }

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="来源分布">
            {loading ? (
              <div style={{ textAlign: 'center', padding: 80 }}><Spin /></div>
            ) : (
              <ReactECharts option={pieOption} style={{ height: 350 }} />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="各来源情感对比">
            {loading ? (
              <div style={{ textAlign: 'center', padding: 80 }}><Spin /></div>
            ) : (
              <ReactECharts option={barOption} style={{ height: 350 }} />
            )}
          </Card>
        </Col>
      </Row>

      <Card title="关键词云">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 100 }}><Spin /></div>
        ) : (
          <ReactECharts option={wordCloudOption} style={{ height: 450 }} />
        )}
      </Card>
    </div>
  )
}

export default SourceAnalysis
```

---

### Task 18: 系统管理页面

**Files:**
- Create: `frontend/src/pages/system/UserManage.jsx`
- Create: `frontend/src/pages/system/SourceManage.jsx`
- Create: `frontend/src/pages/system/TaskManage.jsx`

- [ ] **Step 1: 创建用户管理页**

`frontend/src/pages/system/UserManage.jsx`:
```javascript
import { useState, useEffect } from 'react'
import {
  Card, Table, Button, Space, Modal, Form, Input, Select,
  message, Popconfirm, Tag
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { userApi } from '../../services/api'
import { formatTime, roleText, roleColor, statusText, statusColor } from '../../utils'

const { Option } = Select

const UserManage = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [page, pageSize])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await userApi.getList({ page, pageSize })
      setData(res.list || [])
      setTotal(res.total || 0)
    } catch (err) {
      message.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingItem(record)
    form.setFieldsValue({ ...record, password: '' })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await userApi.delete(id)
      message.success('删除成功')
      loadData()
    } catch (err) {
      message.error(err.message)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingItem) {
        const updateData = { ...values }
        if (!updateData.password) delete updateData.password
        await userApi.update(editingItem._id, updateData)
        message.success('更新成功')
      } else {
        await userApi.create(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadData()
    } catch (err) {
      if (err.errorFields) return
      message.error(err.message)
    }
  }

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 150
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (val) => <Tag color={roleColor[val]}>{roleText[val]}</Tag>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (val) => <Tag color={statusColor[val]}>{statusText[val]}</Tag>
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 180,
      render: (val) => val ? formatTime(val) : '-'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (val) => formatTime(val)
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除此用户？"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Card
        title="用户管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增用户
          </Button>
        }
      >
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (p, ps) => {
              setPage(p)
              setPageSize(ps)
            }
          }}
        />
      </Card>

      <Modal
        title={editingItem ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" disabled={!!editingItem} />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="password"
            label={editingItem ? '新密码（留空不修改）' : '密码'}
            rules={editingItem ? [] : [{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder={editingItem ? '留空不修改' : '请输入密码'} />
          </Form.Item>
          <Form.Item name="role" label="角色" initialValue="viewer">
            <Select>
              <Option value="admin">管理员</Option>
              <Option value="analyst">分析师</Option>
              <Option value="viewer">访客</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="active">
            <Select>
              <Option value="active">启用</Option>
              <Option value="disabled">禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserManage
```

- [ ] **Step 2: 创建新闻源管理页**

`frontend/src/pages/system/SourceManage.jsx`:
```javascript
import { useState, useEffect } from 'react'
import {
  Card, Table, Button, Space, Modal, Form, Input, Select, Switch,
  message, Popconfirm, Tag, Collapse
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { sourceApi, crawlApi } from '../../services/api'
import { formatTime, statusText, statusColor } from '../../utils'

const { Option } = Select
const { Panel } = Collapse

const SourceManage = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await sourceApi.getList()
      setData(res.list || [])
    } catch (err) {
      message.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingItem(record)
    form.setFieldsValue({
      ...record,
      selectorConfig: record.selectorConfig || {}
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await sourceApi.delete(id)
      message.success('删除成功')
      loadData()
    } catch (err) {
      message.error(err.message)
    }
  }

  const handleCrawl = async (sourceId) => {
    try {
      await crawlApi.trigger(sourceId)
      message.success('采集任务已启动')
    } catch (err) {
      message.error(err.message)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingItem) {
        await sourceApi.update(editingItem._id, values)
        message.success('更新成功')
      } else {
        await sourceApi.create(values)
        message.success('添加成功')
      }
      setModalVisible(false)
      loadData()
    } catch (err) {
      if (err.errorFields) return
      message.error(err.message)
    }
  }

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '网址',
      dataIndex: 'url',
      key: 'url',
      ellipsis: true,
      render: (val) => (
        <a href={val} target="_blank" rel="noreferrer">{val}</a>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (val) => <Tag color={statusColor[val]}>{statusText[val]}</Tag>
    },
    {
      title: '最后采集',
      dataIndex: 'lastCrawlTime',
      key: 'lastCrawlTime',
      width: 180,
      render: (val) => val ? formatTime(val) : '-'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (val) => formatTime(val)
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<PlayCircleOutlined />}
            onClick={() => handleCrawl(record._id)}
          >
            立即采集
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除此新闻源？"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Card
        title="新闻源管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增新闻源
          </Button>
        }
      >
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title={editingItem ? '编辑新闻源' : '新增新闻源'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="请输入新闻源名称" />
          </Form.Item>
          <Form.Item
            name="url"
            label="主页URL"
            rules={[{ required: true, message: '请输入URL' }]}
          >
            <Input placeholder="https://example.com" />
          </Form.Item>
          <Form.Item
            name="listUrl"
            label="列表页URL"
          >
            <Input placeholder="新闻列表页面地址" />
          </Form.Item>
          <Form.Item name="type" label="类型" initialValue="crawler">
            <Select>
              <Option value="crawler">爬虫</Option>
              <Option value="rss">RSS</Option>
              <Option value="api">API</Option>
            </Select>
          </Form.Item>
          <Form.Item name="crawlInterval" label="采集间隔（cron表达式）" initialValue="0 */2 * * *">
            <Input placeholder="0 */2 * * *" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="active">
            <Select>
              <Option value="active">启用</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>

          <Collapse ghost>
            <Panel header="爬虫选择器配置（高级）" key="selectors">
              <Form.Item name={['selectorConfig', 'listItem']} label="列表项选择器">
                <Input placeholder="article, .news-item" />
              </Form.Item>
              <Form.Item name={['selectorConfig', 'title']} label="标题选择器">
                <Input placeholder="h1, .title" />
              </Form.Item>
              <Form.Item name={['selectorConfig', 'content']} label="正文选择器">
                <Input placeholder=".content, .article-content" />
              </Form.Item>
              <Form.Item name={['selectorConfig', 'publishTime']} label="发布时间选择器">
                <Input placeholder=".time, .date" />
              </Form.Item>
              <Form.Item name={['selectorConfig', 'author']} label="作者选择器">
                <Input placeholder=".author" />
              </Form.Item>
            </Panel>
          </Collapse>
        </Form>
      </Modal>
    </div>
  )
}

export default SourceManage
```

- [ ] **Step 3: 创建采集任务页**

`frontend/src/pages/system/TaskManage.jsx`:
```javascript
import { useState, useEffect } from 'react'
import { Card, Table, Tag, Select, Space, Button, message, Spin, Drawer, Descriptions } from 'antd'
import { ReloadOutlined, EyeOutlined } from '@ant-design/icons'
import { crawlApi } from '../../services/api'
import { formatTime, statusText, statusColor } from '../../utils'

const { Option } = Select

const TaskManage = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [status, setStatus] = useState('')
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentTask, setCurrentTask] = useState(null)

  useEffect(() => {
    loadData()
  }, [page, pageSize, status])

  const loadData = async () => {
    setLoading(true)
    try {
      const params = { page, pageSize }
      if (status) params.status = status
      const res = await crawlApi.getTasks(params)
      setData(res.list || [])
      setTotal(res.total || 0)
    } catch (err) {
      message.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = async (record) => {
    try {
      const detail = await crawlApi.getTaskDetail(record._id)
      setCurrentTask(detail)
      setDetailVisible(true)
    } catch (err) {
      message.error(err.message)
    }
  }

  const columns = [
    {
      title: '新闻源',
      dataIndex: 'sourceName',
      key: 'sourceName',
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (val) => <Tag color={statusColor[val]}>{statusText[val]}</Tag>
    },
    {
      title: '触发方式',
      dataIndex: 'triggeredBy',
      key: 'triggeredBy',
      width: 100,
      render: (val) => val === 'manual' ? '手动触发' : '定时任务'
    },
    {
      title: '采集数量',
      dataIndex: 'newsCount',
      key: 'newsCount',
      width: 100
    },
    {
      title: '新增数量',
      dataIndex: 'newCount',
      key: 'newCount',
      width: 100
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 180,
      render: (val) => val ? formatTime(val) : '-'
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 180,
      render: (val) => val ? formatTime(val) : '-'
    },
    {
      title: '错误信息',
      dataIndex: 'errorMsg',
      key: 'errorMsg',
      ellipsis: true,
      render: (val) => val || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
          详情
        </Button>
      )
    }
  ]

  return (
    <div>
      <Card
        title="采集任务"
        extra={
          <Space>
            <Select
              placeholder="状态筛选"
              value={status || undefined}
              onChange={setStatus}
              style={{ width: 140 }}
              allowClear
            >
              <Option value="pending">待执行</Option>
              <Option value="running">执行中</Option>
              <Option value="completed">已完成</Option>
              <Option value="failed">失败</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={loadData}>刷新</Button>
          </Space>
        }
      >
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (p, ps) => {
              setPage(p)
              setPageSize(ps)
            }
          }}
        />
      </Card>

      <Drawer
        title="任务详情"
        width={500}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
      >
        {currentTask ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="新闻源">{currentTask.sourceName}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusColor[currentTask.status]}>{statusText[currentTask.status]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="触发方式">
              {currentTask.triggeredBy === 'manual' ? '手动触发' : '定时任务'}
            </Descriptions.Item>
            <Descriptions.Item label="采集数量">{currentTask.newsCount}</Descriptions.Item>
            <Descriptions.Item label="新增数量">{currentTask.newCount}</Descriptions.Item>
            <Descriptions.Item label="开始时间">
              {currentTask.startTime ? formatTime(currentTask.startTime) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="结束时间">
              {currentTask.endTime ? formatTime(currentTask.endTime) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {formatTime(currentTask.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="错误信息">
              {currentTask.errorMsg || '-'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Spin />
        )}
      </Drawer>
    </div>
  )
}

export default TaskManage
```

---

### Task 19: 个人中心页面

**Files:**
- Create: `frontend/src/pages/Profile.jsx`

- [ ] **Step 1: 创建个人中心页**

`frontend/src/pages/Profile.jsx`:
```javascript
import { useState } from 'react'
import {
  Card, Form, Input, Button, message, Tabs, Avatar, Descriptions, Tag, Space
} from 'antd'
import { UserOutlined, EditOutlined, LockOutlined } from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../services/api'
import { formatTime, roleText, roleColor, statusText, statusColor } from '../utils'

const { TabPane } = Tabs

const Profile = () => {
  const { user, setUser } = useAuth()
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const handleUpdateProfile = async () => {
    try {
      const values = await profileForm.validateFields()
      setProfileLoading(true)
      const updated = await authApi.updateProfile(values)
      setUser(updated)
      message.success('个人信息更新成功')
    } catch (err) {
      if (err.errorFields) return
      message.error(err.message)
    } finally {
      setProfileLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    try {
      const values = await passwordForm.validateFields()
      setPasswordLoading(true)
      await authApi.updatePassword(values)
      message.success('密码修改成功')
      passwordForm.resetFields()
    } catch (err) {
      if (err.errorFields) return
      message.error(err.message)
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #f0f0f0' }}>
          <Avatar size={80} icon={<UserOutlined />} src={user?.avatar} />
          <div style={{ marginLeft: 24 }}>
            <h2 style={{ marginBottom: 8 }}>{user?.username}</h2>
            <Space>
              <Tag color={roleColor[user?.role]}>{roleText[user?.role]}</Tag>
              <Tag color={statusColor[user?.status]}>{statusText[user?.status]}</Tag>
            </Space>
          </div>
        </div>

        <Descriptions column={2} size="small" style={{ marginBottom: 24 }}>
          <Descriptions.Item label="用户名">{user?.username}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{user?.email}</Descriptions.Item>
          <Descriptions.Item label="注册时间">{formatTime(user?.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="最后登录">{formatTime(user?.lastLoginAt)}</Descriptions.Item>
        </Descriptions>

        <Tabs defaultActiveKey="profile">
          <TabPane
            tab={
              <span>
                <EditOutlined />
                修改信息
              </span>
            }
            key="profile"
          >
            <Form
              form={profileForm}
              layout="vertical"
              initialValues={{ email: user?.email, avatar: user?.avatar }}
              style={{ maxWidth: 400 }}
            >
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '邮箱格式不正确' }
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
              <Form.Item name="avatar" label="头像URL">
                <Input placeholder="头像图片地址（可选）" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={handleUpdateProfile} loading={profileLoading}>
                  保存修改
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane
            tab={
              <span>
                <LockOutlined />
                修改密码
              </span>
            }
            key="password"
          >
            <Form
              form={passwordForm}
              layout="vertical"
              style={{ maxWidth: 400 }}
            >
              <Form.Item
                name="oldPassword"
                label="当前密码"
                rules={[{ required: true, message: '请输入当前密码' }]}
              >
                <Input.Password placeholder="请输入当前密码" />
              </Form.Item>
              <Form.Item
                name="newPassword"
                label="新密码"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码至少6位' }
                ]}
              >
                <Input.Password placeholder="请输入新密码" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="确认新密码"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请确认新密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'))
                    }
                  })
                ]}
              >
                <Input.Password placeholder="请再次输入新密码" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={handleUpdatePassword} loading={passwordLoading}>
                  修改密码
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

export default Profile
```

---

## 阶段六：启动和验证

### Task 20: 启动后端并填充数据

- [ ] **Step 1: 安装后端依赖**

```bash
cd backend
npm install
```

- [ ] **Step 2: 确保 MongoDB 可用或使用内存模式**

如果 MongoDB 不可用，修改为内存模式。优先使用真实 MongoDB。

- [ ] **Step 3: 运行种子数据**

```bash
npm run seed
```

- [ ] **Step 4: 启动后端服务**

```bash
npm run dev
```

- [ ] **Step 5: 验证健康检查接口**

```bash
curl http://localhost:3001/api/health
```

预期返回：`{"code":0,"message":"OK","data":{"status":"healthy"}}`

---

### Task 21: 启动前端并验证

- [ ] **Step 1: 安装前端依赖**

```bash
cd frontend
npm install
```

- [ ] **Step 2: 启动前端开发服务器**

```bash
npm run dev
```

- [ ] **Step 3: 验证登录功能**

访问 http://localhost:5173/login
使用 admin / admin123 登录

- [ ] **Step 4: 验证各页面功能**

- 仪表盘数据展示
- 新闻列表浏览和搜索
- 关键词管理
- 数据分析图表
- 系统管理页面

---

## 总结

本实施计划包含 21 个任务，分为六个阶段：
1. 项目初始化与基础架构（Task 1-3）
2. 核心业务功能（Task 4-8）
3. 爬虫与情感分析（Task 9-11）
4. 前端项目初始化（Task 12-13）
5. 前端页面开发（Task 14-19）
6. 启动和验证（Task 20-21）

每个任务都有明确的文件路径和代码实现，可以按顺序执行。
