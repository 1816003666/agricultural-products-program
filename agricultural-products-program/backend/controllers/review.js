const Review = require("../models/Review");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// 创建评价
exports.createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;
    const userId = req.user.id;

    // 检查订单是否属于该用户且已收货
    const order = await Order.findOne({
      where: { id: orderId, UserId: userId, status: "delivered" },
    });

    if (!order) {
      return res.status(400).json({ message: "订单不存在或未收货" });
    }

    // 检查是否已经评价过该商品
    const existingReview = await Review.findOne({
      where: { UserId: userId, ProductId: productId, OrderId: orderId },
    });

    if (existingReview) {
      return res.status(400).json({ message: "该商品已评价" });
    }

    const review = await Review.create({
      UserId: userId,
      ProductId: productId,
      OrderId: orderId,
      rating,
      comment,
      status: "approved", // 自动通过审核
    });

    res.status(201).json({ message: "评价成功", review });
  } catch (error) {
    console.error("创建评价失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 获取商品的所有评价
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { ProductId: productId, status: "approved" },
      include: [
        {
          model: User,
          attributes: ["id", "username", "avatar"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    // 计算平均评分
    const avgRating = await Review.sum("rating", {
      where: { ProductId: productId, status: "approved" },
    });
    const reviewCount = await Review.count({
      where: { ProductId: productId, status: "approved" },
    });

    res.json({
      reviews,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
      statistics: {
        averageRating:
          reviewCount > 0 ? (avgRating / reviewCount).toFixed(1) : 0,
        totalReviews: reviewCount,
      },
    });
  } catch (error) {
    console.error("获取评价失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 获取当前用户的评价列表
exports.getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { UserId: userId },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "image", "price"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    res.json({
      reviews,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("获取用户评价失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 管理员获取所有评价
exports.getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, productId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (productId) where.ProductId = productId;

    const { count, rows: reviews } = await Review.findAndCountAll({
      where,
      include: [
        { model: User, attributes: ["id", "username", "avatar"] },
        { model: Product, attributes: ["id", "name", "image"] },
        { model: Order, attributes: ["id", "total_amount"] },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    res.json({
      reviews,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("获取所有评价失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 管理员审核评价
exports.updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ message: "评价不存在" });
    }

    review.status = status;
    await review.save();

    res.json({ message: "审核成功", review });
  } catch (error) {
    console.error("审核评价失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 删除评价
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findOne({
      where: { id, UserId: userId },
    });

    if (!review) {
      return res.status(404).json({ message: "评价不存在" });
    }

    await review.destroy();
    res.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除评价失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};
