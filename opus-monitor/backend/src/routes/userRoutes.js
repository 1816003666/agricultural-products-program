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
