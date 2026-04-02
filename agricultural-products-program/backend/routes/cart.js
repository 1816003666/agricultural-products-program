const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart');
const authMiddleware = require('../middlewares/auth');

// 获取购物车（需要认证）
router.get('/', authMiddleware, cartController.getCart);

// 添加商品到购物车（需要认证）
router.post('/', authMiddleware, cartController.addToCart);

// 更新购物车商品（需要认证）
router.put('/:id', authMiddleware, cartController.updateCartItem);

// 删除购物车商品（需要认证）
router.delete('/:id', authMiddleware, cartController.removeCartItem);

module.exports = router;
