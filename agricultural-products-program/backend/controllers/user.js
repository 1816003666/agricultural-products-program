const Address = require("../models/Address");
const History = require("../models/History");
const Product = require("../models/Product");
const {
  successResponse,
  errorResponse,
  notFoundResponse,
} = require("../utils/response");

// 获取用户地址列表
const getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;

    const addresses = await Address.findAll({
      where: { user_id: userId },
      order: [
        ["is_default", "DESC"],
        ["created_at", "DESC"],
      ],
    });

    return successResponse(res, addresses, "获取地址列表成功");
  } catch (error) {
    console.error("获取地址列表错误:", error);
    return errorResponse(res, "获取地址列表失败");
  }
};

// 创建地址
const createAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, province, city, district, detail, is_default } =
      req.body;

    // 如果设置为默认地址，取消其他默认地址
    if (is_default) {
      await Address.update(
        { is_default: false },
        { where: { user_id: userId } },
      );
    }

    const address = await Address.create({
      user_id: userId,
      name,
      phone,
      province,
      city,
      district,
      detail,
      is_default: is_default || false,
    });

    return successResponse(res, address, "创建地址成功");
  } catch (error) {
    console.error("创建地址错误:", error);
    return errorResponse(res, "创建地址失败");
  }
};

// 更新地址
const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, phone, province, city, district, detail, is_default } =
      req.body;

    const address = await Address.findOne({
      where: { id, user_id: userId },
    });

    if (!address) {
      return notFoundResponse(res, "地址不存在");
    }

    // 如果设置为默认地址，取消其他默认地址
    if (is_default && !address.is_default) {
      await Address.update(
        { is_default: false },
        { where: { user_id: userId } },
      );
    }

    await address.update({
      name,
      phone,
      province,
      city,
      district,
      detail,
      is_default: is_default !== undefined ? is_default : address.is_default,
    });

    return successResponse(res, address, "更新地址成功");
  } catch (error) {
    console.error("更新地址错误:", error);
    return errorResponse(res, "更新地址失败");
  }
};

// 删除地址
const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const address = await Address.findOne({
      where: { id, user_id: userId },
    });

    if (!address) {
      return notFoundResponse(res, "地址不存在");
    }

    await address.destroy();

    return successResponse(res, null, "删除地址成功");
  } catch (error) {
    console.error("删除地址错误:", error);
    return errorResponse(res, "删除地址失败");
  }
};

// 获取浏览记录
const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const histories = await History.findAll({
      where: { user_id: userId },
      include: [{ model: Product }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    const total = await History.count({ where: { user_id: userId } });

    return successResponse(
      res,
      {
        histories,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
      "获取浏览记录成功",
    );
  } catch (error) {
    console.error("获取浏览记录错误:", error);
    return errorResponse(res, "获取浏览记录失败");
  }
};

// 添加浏览记录
const addHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;

    // 检查商品是否存在
    const product = await Product.findByPk(product_id);
    if (!product) {
      return notFoundResponse(res, "商品不存在");
    }

    // 检查是否已存在该商品的浏览记录
    const existingHistory = await History.findOne({
      where: { user_id: userId, product_id },
    });

    if (existingHistory) {
      // 更新浏览时间
      await existingHistory.update({ created_at: new Date() });
    } else {
      // 创建新的浏览记录
      await History.create({
        user_id: userId,
        product_id,
      });
    }

    return successResponse(res, null, "添加浏览记录成功");
  } catch (error) {
    console.error("添加浏览记录错误:", error);
    return errorResponse(res, "添加浏览记录失败");
  }
};

// 清空浏览记录
const clearHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    await History.destroy({ where: { user_id: userId } });

    return successResponse(res, null, "清空浏览记录成功");
  } catch (error) {
    console.error("清空浏览记录错误:", error);
    return errorResponse(res, "清空浏览记录失败");
  }
};

// 获取用户列表（管理员）
const getUsers = async (req, res) => {
  try {
    const User = require('../models/User');
    
    const users = await User.findAll({
      order: [['created_at', 'DESC']]
    });
    
    return successResponse(res, users, '获取用户列表成功');
  } catch (error) {
    console.error('获取用户列表错误:', error);
    return errorResponse(res, '获取用户列表失败');
  }
};

// 获取用户详情（管理员）
const getUserById = async (req, res) => {
  try {
    const User = require('../models/User');
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return notFoundResponse(res, '用户不存在');
    }
    
    return successResponse(res, user, '获取用户详情成功');
  } catch (error) {
    console.error('获取用户详情错误:', error);
    return errorResponse(res, '获取用户详情失败');
  }
};

// 更新用户状态（管理员）
const updateUserStatus = async (req, res) => {
  try {
    const User = require('../models/User');
    const { id } = req.params;
    const { status } = req.body;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return notFoundResponse(res, '用户不存在');
    }
    
    await user.update({ status });
    
    return successResponse(res, user, '更新用户状态成功');
  } catch (error) {
    console.error('更新用户状态错误:', error);
    return errorResponse(res, '更新用户状态失败');
  }
};

// 删除用户（管理员）
const deleteUser = async (req, res) => {
  try {
    const User = require('../models/User');
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return notFoundResponse(res, '用户不存在');
    }
    
    await user.destroy();
    
    return successResponse(res, null, '删除用户成功');
  } catch (error) {
    console.error('删除用户错误:', error);
    return errorResponse(res, '删除用户失败');
  }
};

// 获取用户数据（用于数据分析）
const getUserData = async (req, res) => {
  try {
    const User = require('../models/User');
    
    const users = await User.findAll({
      order: [['created_at', 'DESC']]
    });
    
    return successResponse(res, users, '获取用户数据成功');
  } catch (error) {
    console.error('获取用户数据错误:', error);
    return errorResponse(res, '获取用户数据失败');
  }
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getHistory,
  addHistory,
  clearHistory,
  getUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getUserData,
};
