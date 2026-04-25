const express = require("express");
const cors = require("cors");
const path = require("path");

// 导入路由
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");
const userRoutes = require("./routes/user");
const reviewRoutes = require("./routes/review");
const favoriteRoutes = require("./routes/favorite");
const couponRoutes = require("./routes/coupon");
const logisticsRoutes = require("./routes/logistics");
const operationLogRoutes = require("./routes/operationLog");

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API路由
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/logistics", logisticsRoutes);
app.use("/api/operation-logs", operationLogRoutes);

// 健康检查
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "服务器运行正常" });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "接口不存在",
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error("错误:", err);
  res.status(500).json({
    success: false,
    message: "服务器内部错误",
  });
});

module.exports = app;
