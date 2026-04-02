// 成功响应
const successResponse = (res, data = null, message = '操作成功') => {
  return res.status(200).json({
    success: true,
    message,
    data
  });
};

// 错误响应
const errorResponse = (res, message = '操作失败', statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};

// 未授权响应
const unauthorizedResponse = (res, message = '未授权') => {
  return res.status(401).json({
    success: false,
    message
  });
};

// 禁止访问响应
const forbiddenResponse = (res, message = '禁止访问') => {
  return res.status(403).json({
    success: false,
    message
  });
};

// 资源不存在响应
const notFoundResponse = (res, message = '资源不存在') => {
  return res.status(404).json({
    success: false,
    message
  });
};

module.exports = {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse
};
