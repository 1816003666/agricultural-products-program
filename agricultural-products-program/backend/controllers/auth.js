const User = require("../models/User");
const Cart = require("../models/Cart");
const { hashPassword, comparePassword } = require("../utils/password");
const { generateToken } = require("../utils/jwt");
const { successResponse, errorResponse } = require("../utils/response");

// 用户注册
const register = async (req, res) => {
  try {
    const { username, email, password, name, phone, employeeId, role } =
      req.body;

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return errorResponse(res, "用户名已存在");
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return errorResponse(res, "邮箱已存在");
    }

    // 加密密码
    const hashedPassword = await hashPassword(password);

    // 创建用户
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      name,
      phone,
      employeeId,
      role: role || "user",
    });

    // 为用户创建购物车
    await Cart.create({ user_id: user.id });

    // 生成token
    const token = generateToken(user.id);

    // 隐藏密码
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
    };

    return successResponse(res, { user: userData, token }, "注册成功");
  } catch (error) {
    console.error("注册错误:", error);
    return errorResponse(res, "注册失败");
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    const { username, password, employeeId } = req.body;

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return errorResponse(res, "用户名或密码错误");
    }

    // 验证密码
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, "用户名或密码错误");
    }

    // 验证职工号（如果提供）
    if (employeeId && user.employeeId !== employeeId) {
      return errorResponse(res, "职工号错误");
    }

    // 生成token
    const token = generateToken(user.id);

    // 隐藏密码
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
    };

    return successResponse(res, { user: userData, token }, "登录成功");
  } catch (error) {
    console.error("登录错误:", error);
    return errorResponse(res, "登录失败");
  }
};

// 获取用户信息
const getProfile = async (req, res) => {
  try {
    const user = req.user;

    // 隐藏密码
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
    };

    return successResponse(res, userData, "获取用户信息成功");
  } catch (error) {
    console.error("获取用户信息错误:", error);
    return errorResponse(res, "获取用户信息失败");
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
