const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const authMiddleware = require("../middlewares/auth");

// 地址管理
router.get("/addresses", authMiddleware, userController.getAddresses);
router.post("/addresses", authMiddleware, userController.createAddress);
router.put("/addresses/:id", authMiddleware, userController.updateAddress);
router.delete("/addresses/:id", authMiddleware, userController.deleteAddress);

// 浏览记录
router.get("/history", authMiddleware, userController.getHistory);
router.post("/history", authMiddleware, userController.addHistory);
router.delete("/history", authMiddleware, userController.clearHistory);

// 管理员用户管理
router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.put("/:id/status", userController.updateUserStatus);
router.delete("/:id", userController.deleteUser);

// 获取用户数据（用于数据分析）
router.get("/data/analytics", userController.getUserData);

module.exports = router;
