const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review");
const authMiddleware = require("../middlewares/auth");

// 用户提交评价（需要认证）
router.post("/", authMiddleware, reviewController.createReview);

// 获取当前用户的评价列表（需要认证）
router.get("/user", authMiddleware, reviewController.getUserReviews);

// 获取商品的所有评价（公开）
router.get("/product/:productId", reviewController.getProductReviews);

// 管理员获取所有评价
router.get("/admin/list", reviewController.getAllReviews);

// 管理员审核评价
router.put("/:id/status", authMiddleware, reviewController.updateReviewStatus);

// 用户删除自己的评价（需要认证）
router.delete("/:id", authMiddleware, reviewController.deleteReview);

module.exports = router;
