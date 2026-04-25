const FlashSale = require("../models/FlashSale");
const FlashSaleProduct = require("../models/FlashSaleProduct");
const Product = require("../models/Product");
const { Op } = require("sequelize");

// 创建限时折扣活动
exports.createFlashSale = async (req, res) => {
  try {
    const { name, start_date, end_date, products } = req.body;

    const flashSale = await FlashSale.create({
      name,
      start_date,
      end_date,
      status: "inactive",
    });

    // 添加活动商品
    if (products && products.length > 0) {
      for (const product of products) {
        await FlashSaleProduct.create({
          flash_sale_id: flashSale.id,
          product_id: product.product_id,
          discount: product.discount,
          stock: product.stock,
          sold: 0,
        });
      }
    }

    res.status(201).json({ message: "限时折扣活动创建成功", flashSale });
  } catch (error) {
    console.error("创建限时折扣活动失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 获取限时折扣活动列表
exports.getFlashSales = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const { count, rows: flashSales } = await FlashSale.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    res.json({
      flashSales,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("获取限时折扣活动列表失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 获取当前有效的限时折扣活动
exports.getActiveFlashSales = async (req, res) => {
  try {
    const now = new Date();

    const flashSales = await FlashSale.findAll({
      where: {
        status: "active",
        start_date: { [Op.lte]: now },
        end_date: { [Op.gte]: now },
      },
      include: [
        {
          model: FlashSaleProduct,
          include: [{ model: Product }],
        },
      ],
    });

    res.json({ flashSales });
  } catch (error) {
    console.error("获取有效限时折扣活动失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 获取限时折扣活动详情
exports.getFlashSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    const flashSale = await FlashSale.findByPk(id, {
      include: [
        {
          model: FlashSaleProduct,
          include: [{ model: Product }],
        },
      ],
    });

    if (!flashSale) {
      return res.status(404).json({ message: "限时折扣活动不存在" });
    }

    res.json({ flashSale });
  } catch (error) {
    console.error("获取限时折扣活动详情失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 更新限时折扣活动
exports.updateFlashSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, start_date, end_date, status, products } = req.body;

    const flashSale = await FlashSale.findByPk(id);
    if (!flashSale) {
      return res.status(404).json({ message: "限时折扣活动不存在" });
    }

    if (name) flashSale.name = name;
    if (start_date) flashSale.start_date = start_date;
    if (end_date) flashSale.end_date = end_date;
    if (status) flashSale.status = status;

    await flashSale.save();

    // 更新活动商品
    if (products && products.length > 0) {
      // 删除旧的商品关联
      await FlashSaleProduct.destroy({ where: { flash_sale_id: id } });
      // 添加新的商品关联
      for (const product of products) {
        await FlashSaleProduct.create({
          flash_sale_id: id,
          product_id: product.product_id,
          discount: product.discount,
          stock: product.stock,
          sold: 0,
        });
      }
    }

    res.json({ message: "限时折扣活动更新成功", flashSale });
  } catch (error) {
    console.error("更新限时折扣活动失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 删除限时折扣活动
exports.deleteFlashSale = async (req, res) => {
  try {
    const { id } = req.params;

    const flashSale = await FlashSale.findByPk(id);
    if (!flashSale) {
      return res.status(404).json({ message: "限时折扣活动不存在" });
    }

    // 删除相关的商品关联
    await FlashSaleProduct.destroy({ where: { flash_sale_id: id } });
    // 删除活动
    await flashSale.destroy();

    res.json({ message: "限时折扣活动删除成功" });
  } catch (error) {
    console.error("删除限时折扣活动失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 激活/停用限时折扣活动
exports.toggleFlashSaleStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const flashSale = await FlashSale.findByPk(id);
    if (!flashSale) {
      return res.status(404).json({ message: "限时折扣活动不存在" });
    }

    flashSale.status = flashSale.status === "active" ? "inactive" : "active";
    await flashSale.save();

    res.json({ message: "限时折扣活动状态更新成功", flashSale });
  } catch (error) {
    console.error("更新限时折扣活动状态失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};