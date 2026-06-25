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
