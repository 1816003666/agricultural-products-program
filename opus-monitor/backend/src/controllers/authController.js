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
