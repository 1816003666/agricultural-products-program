const express = require("express");
const router = express.Router();
const productController = require("../controllers/product");

// 获取产品列表
router.get("/", productController.getProducts);

// 搜索产品
router.get("/search", productController.searchProducts);

// 按分类获取产品
router.get("/category/:id", productController.getProductsByCategory);

// 获取产品详情
router.get("/:id", productController.getProductById);

// 添加产品
router.post("/", productController.addProduct);

// 更新产品
router.put("/:id", productController.updateProduct);

// 删除产品
router.delete("/:id", productController.deleteProduct);

// 获取产品数据（用于数据分析）
router.get("/data/analytics", productController.getProductData);

module.exports = router;
