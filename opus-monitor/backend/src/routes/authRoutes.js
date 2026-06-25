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
