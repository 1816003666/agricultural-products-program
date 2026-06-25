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
