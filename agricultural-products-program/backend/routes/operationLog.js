const express = require("express");
const router = express.Router();
const operationLogController = require("../controllers/operationLog");
const authMiddleware = require("../middlewares/auth");

// 获取操作日志列表（需要管理员权限）
router.get("/", authMiddleware, operationLogController.getLogs);

// 获取操作类型统计（需要管理员权限）
router.get("/stats", authMiddleware, operationLogController.getActionStats);

// 获取日志详情（需要管理员权限）
router.get("/:id", authMiddleware, operationLogController.getLogById);

// 删除日志（需要管理员权限）
router.delete("/:id", authMiddleware, operationLogController.deleteLog);

// 清空日志（需要管理员权限）
router.delete("/", authMiddleware, operationLogController.clearLogs);

module.exports = router;
