const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment');
const authMiddleware = require('../middlewares/auth');

// 获取可用的支付方式
router.get('/methods', paymentController.getPaymentMethods);

// 创建支付订单（需要认证）
router.post('/create', authMiddleware, paymentController.createPayment);

// 查询支付状态（需要认证）
router.get('/status/:order_id', authMiddleware, paymentController.getPaymentStatus);

module.exports = router;
