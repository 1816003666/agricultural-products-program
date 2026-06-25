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
