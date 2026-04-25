const express = require("express");
const router = express.Router();
const couponController = require("../controllers/coupon");
const authMiddleware = require("../middlewares/auth");

// 管理员创建优惠券（需要认证）
router.post("/", authMiddleware, couponController.createCoupon);

// 管理员获取优惠券列表（需要认证）
router.get("/admin/list", authMiddleware, couponController.getCoupons);

// 用户领取优惠券（需要认证）
router.post("/claim", authMiddleware, couponController.claimCoupon);

// 用户通过优惠券码领取（需要认证）
router.post(
  "/claim-by-code",
  authMiddleware,
  couponController.claimCouponByCode,
);

// 获取用户的优惠券列表（需要认证）
router.get("/user", authMiddleware, couponController.getUserCoupons);

// 验证优惠券（需要认证）
router.post("/validate", authMiddleware, couponController.validateCoupon);

// 使用优惠券（需要认证）
router.post("/use", authMiddleware, couponController.useCoupon);

// 管理员更新优惠券（需要认证）
router.put("/:id", authMiddleware, couponController.updateCoupon);

// 管理员删除优惠券（需要认证）
router.delete("/:id", authMiddleware, couponController.deleteCoupon);

module.exports = router;
