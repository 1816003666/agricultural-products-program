const { Op } = require("sequelize");
const Product = require("../models/Product");
const Category = require("../models/Category");
const {
  successResponse,
  errorResponse,
  notFoundResponse,
} = require("../utils/response");

// 获取产品列表
const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category_id, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (category_id) {
      where.category_id = category_id;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const products = await Product.findAll({
      where,
      include: [{ model: Category }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    const total = await Product.count({ where });

    return successResponse(
      res,
      {
        products,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
      "获取产品列表成功",
    );
  } catch (error) {
    console.error("获取产品列表错误:", error);
    return errorResponse(res, "获取产品列表失败");
  }
};

// 获取产品详情
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [{ model: Category }],
    });

    if (!product) {
      return notFoundResponse(res, "产品不存在");
    }

    return successResponse(res, product, "获取产品详情成功");
  } catch (error) {
    console.error("获取产品详情错误:", error);
    return errorResponse(res, "获取产品详情失败");
  }
};

// 按分类获取产品
const getProductsByCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const products = await Product.findAll({
      where: { category_id: id },
      include: [{ model: Category }],
      order: [["created_at", "DESC"]],
    });

    return successResponse(res, products, "按分类获取产品成功");
  } catch (error) {
    console.error("按分类获取产品错误:", error);
    return errorResponse(res, "按分类获取产品失败");
  }
};

// 搜索产品
const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return errorResponse(res, "搜索关键词不能为空");
    }

    const products = await Product.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } },
        ],
      },
      include: [{ model: Category }],
      order: [["created_at", "DESC"]],
    });

    return successResponse(res, products, "搜索产品成功");
  } catch (error) {
    console.error("搜索产品错误:", error);
    return errorResponse(res, "搜索产品失败");
  }
};

// 添加产品
const addProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category_id, image } = req.body;

    if (!name || !price || !stock) {
      return errorResponse(res, "产品名称、价格和库存不能为空");
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category_id,
      image,
    });

    return successResponse(res, product, "添加产品成功");
  } catch (error) {
    console.error("添加产品错误:", error);
    return errorResponse(res, "添加产品失败");
  }
};

// 更新产品
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category_id, image } = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      return notFoundResponse(res, "产品不存在");
    }

    await product.update({
      name,
      description,
      price,
      stock,
      category_id,
      image,
    });

    return successResponse(res, product, "更新产品成功");
  } catch (error) {
    console.error("更新产品错误:", error);
    return errorResponse(res, "更新产品失败");
  }
};

// 删除产品
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return notFoundResponse(res, "产品不存在");
    }

    await product.destroy();

    return successResponse(res, null, "删除产品成功");
  } catch (error) {
    console.error("删除产品错误:", error);
    return errorResponse(res, "删除产品失败");
  }
};

// 获取产品数据（用于数据分析）
const getProductData = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category }],
      order: [["created_at", "DESC"]],
    });

    return successResponse(res, products, "获取产品数据成功");
  } catch (error) {
    console.error("获取产品数据错误:", error);
    return errorResponse(res, "获取产品数据失败");
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductData,
};
