const express = require("express");
const router = express.Router();
const salesRuleController = require("../controllers/salesRule");
const authMiddleware = require("../middlewares/auth");

// 创建促销规则（需要认证）
router.post("/", authMiddleware, salesRuleController.createSalesRule);

// 获取促销规则列表（需要认证）
router.get("/", authMiddleware, salesRuleController.getSalesRules);

// 获取当前有效的促销规则（无需认证）
router.get("/active", salesRuleController.getActiveSalesRules);

// 获取促销规则详情（需要认证）
router.get("/:id", authMiddleware, salesRuleController.getSalesRuleById);

// 更新促销规则（需要认证）
router.put("/:id", authMiddleware, salesRuleController.updateSalesRule);

// 删除促销规则（需要认证）
router.delete("/:id", authMiddleware, salesRuleController.deleteSalesRule);

// 激活/停用促销规则（需要认证）
router.patch("/:id/status", authMiddleware, salesRuleController.toggleSalesRuleStatus);

// 应用促销规则计算优惠（无需认证）
router.post("/apply", salesRuleController.applySalesRule);

module.exports = router;