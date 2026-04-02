const { verifyToken } = require('../utils/jwt');
const { unauthorizedResponse } = require('../utils/response');
const User = require('../models/User');

// 认证中间件
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return unauthorizedResponse(res, '请先登录');
  }
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return unauthorizedResponse(res, '登录已过期，请重新登录');
  }
  
  const user = await User.findByPk(decoded.id);
  
  if (!user) {
    return unauthorizedResponse(res, '用户不存在');
  }
  
  req.user = user;
  next();
};

module.exports = authMiddleware;
