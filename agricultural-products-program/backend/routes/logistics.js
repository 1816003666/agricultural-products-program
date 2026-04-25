const express = require("express");
const router = express.Router();
const logisticsController = require("../controllers/logistics");
const authMiddleware = require("../middlewares/auth");

// 获取物流信息（需要认证）
router.get("/:id", authMiddleware, logisticsController.getTracking);

// 管理员更新物流信息（需要认证）
router.put("/:id", authMiddleware, logisticsController.updateTracking);

// 获取支持的物流公司列表（公开）
router.get("/companies/list", logisticsController.getLogisticsCompanies);

// 模拟物流轨迹更新（管理员使用，需要认证）
router.post("/simulate", authMiddleware, logisticsController.simulateTrace);

module.exports = router;
