const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const authMiddleware = require('../middlewares/auth');

// 注册
router.post('/register', authController.register);

// 登录
router.post('/login', authController.login);

// 获取用户信息（需要认证）
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
