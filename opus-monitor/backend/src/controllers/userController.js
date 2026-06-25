const { validationResult } = require('express-validator');
const User = require('../models/User');
const { success, error } = require('../utils/response');

const getUserList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const role = req.query.role || '';
    const status = req.query.status || '';
    const keyword = req.query.keyword || '';

    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (keyword) {
      query.$or = [
        { username: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const list = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    success(res, { list, total, page, pageSize });
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, 400, '参数错误', errors.array());
    }
    const { username, email, password, role } = req.body;
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return error(res, 409, '用户名或邮箱已存在');
    }
    const user = new User({
      username,
      email,
      password,
      role: role || 'viewer'
    });
    await user.save();
    success(res, user.toJSON(), '创建成功');
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return error(res, 404, '用户不存在');
    }
    const { email, role, status, password } = req.body;
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return error(res, 409, '邮箱已被使用');
      }
      user.email = email;
    }
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;
    if (password) user.password = password;
    await user.save();
    success(res, user.toJSON(), '更新成功');
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return error(res, 400, '不能删除自己');
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return error(res, 404, '用户不存在');
    }
    success(res, null, '删除成功');
  } catch (err) {
    next(err);
  }
};

module.exports = { getUserList, createUser, updateUser, deleteUser };
