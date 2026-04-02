const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order");
const authMiddleware = require("../middlewares/auth");

// 创建订单（需要认证）
router.post("/", authMiddleware, orderController.createOrder);

// 获取订单列表（需要认证）
router.get("/", authMiddleware, orderController.getOrders);

// 获取订单详情（需要认证）
router.get("/:id", authMiddleware, orderController.getOrderById);

// 获取物流信息（需要认证）
router.get("/:id/tracking", authMiddleware, orderController.getTracking);

// 支付订单（需要认证）
router.put("/:id/pay", authMiddleware, orderController.payOrder);

// 确认收货（需要认证）
router.put("/:id/confirm", authMiddleware, orderController.confirmReceipt);

// 申请退款（需要认证）
router.put("/:id/refund", authMiddleware, orderController.requestRefund);

// 删除订单（需要认证）
router.delete("/:id", authMiddleware, orderController.deleteOrder);

// 管理员订单管理
router.get("/admin/list", orderController.getAllOrders);
router.get("/admin/:id", orderController.getOrderDetail);
router.put("/admin/:id/status", orderController.updateOrderStatus);
router.delete("/admin/:id", orderController.adminDeleteOrder);

// 获取销售数据（用于数据分析）
router.get("/data/analytics", orderController.getSalesData);

module.exports = router;
