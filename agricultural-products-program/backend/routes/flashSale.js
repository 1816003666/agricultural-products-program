const express = require("express");
const router = express.Router();
const flashSaleController = require("../controllers/flashSale");
const authMiddleware = require("../middlewares/auth");

// 创建限时折扣活动（需要认证）
router.post("/", authMiddleware, flashSaleController.createFlashSale);

// 获取限时折扣活动列表（需要认证）
router.get("/", authMiddleware, flashSaleController.getFlashSales);

// 获取当前有效的限时折扣活动（无需认证）
router.get("/active", flashSaleController.getActiveFlashSales);

// 获取限时折扣活动详情（需要认证）
router.get("/:id", authMiddleware, flashSaleController.getFlashSaleById);

// 更新限时折扣活动（需要认证）
router.put("/:id", authMiddleware, flashSaleController.updateFlashSale);

// 删除限时折扣活动（需要认证）
router.delete("/:id", authMiddleware, flashSaleController.deleteFlashSale);

// 激活/停用限时折扣活动（需要认证）
router.patch("/:id/status", authMiddleware, flashSaleController.toggleFlashSaleStatus);

module.exports = router;