const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favorite");
const authMiddleware = require("../middlewares/auth");

// 添加收藏（需要认证）
router.post("/", authMiddleware, favoriteController.addFavorite);

// 取消收藏（需要认证）
router.delete("/:productId", authMiddleware, favoriteController.removeFavorite);

// 获取用户收藏列表（需要认证）
router.get("/", authMiddleware, favoriteController.getFavorites);

// 检查商品是否已收藏（需要认证）
router.get(
  "/check/:productId",
  authMiddleware,
  favoriteController.checkFavorite,
);

// 批量检查收藏状态（需要认证）
router.post(
  "/batch-check",
  authMiddleware,
  favoriteController.batchCheckFavorites,
);

module.exports = router;
