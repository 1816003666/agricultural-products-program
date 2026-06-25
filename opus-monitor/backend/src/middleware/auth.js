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
