const Favorite = require("../models/Favorite");
const Product = require("../models/Product");

// 添加收藏
exports.addFavorite = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    // 检查商品是否存在
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "商品不存在" });
    }

    // 检查是否已经收藏
    const existingFavorite = await Favorite.findOne({
      where: { UserId: userId, ProductId: productId },
    });

    if (existingFavorite) {
      return res.status(400).json({ message: "已经收藏过该商品" });
    }

    const favorite = await Favorite.create({
      UserId: userId,
      ProductId: productId,
    });

    res.status(201).json({ message: "收藏成功", favorite });
  } catch (error) {
    console.error("添加收藏失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 取消收藏
exports.removeFavorite = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const favorite = await Favorite.findOne({
      where: { UserId: userId, ProductId: productId },
    });

    if (!favorite) {
      return res.status(404).json({ message: "收藏不存在" });
    }

    await favorite.destroy();
    res.json({ message: "取消收藏成功" });
  } catch (error) {
    console.error("取消收藏失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 获取用户收藏列表
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows: favorites } = await Favorite.findAndCountAll({
      where: { UserId: userId },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price", "image", "stock"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    res.json({
      favorites,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("获取收藏列表失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 检查商品是否已收藏
exports.checkFavorite = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const favorite = await Favorite.findOne({
      where: { UserId: userId, ProductId: productId },
    });

    res.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error("检查收藏状态失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 批量获取收藏状态
exports.batchCheckFavorites = async (req, res) => {
  try {
    const { productIds } = req.body;
    const userId = req.user.id;

    const favorites = await Favorite.findAll({
      where: {
        UserId: userId,
        ProductId: productIds,
      },
    });

    const favoriteProductIds = favorites.map((f) => f.ProductId);

    res.json({
      favorites: favoriteProductIds,
    });
  } catch (error) {
    console.error("批量检查收藏状态失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};
