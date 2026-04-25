require("dotenv").config();
const app = require("./app");
const sequelize = require("./config/database");
const https = require("https");
const fs = require("fs");

const PORT = process.env.PORT || 3001;

// 同步数据库并启动服务器
const startServer = async () => {
  try {
    // 同步数据库（开发环境下）
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ force: true });
      console.log("数据库同步完成");
    }

    // 读取SSL证书和密钥
    const options = {
      key: fs.readFileSync("./key.pem"),
      cert: fs.readFileSync("./cert.pem")
    };

    // 启动HTTPS服务器
    https.createServer(options, app).listen(PORT, () => {
      console.log(`服务器运行在 https://localhost:${PORT}`);
      console.log("API文档:");
      console.log("  - 健康检查: GET /api/health");
      console.log(
        "  - 认证相关: POST /api/auth/register, POST /api/auth/login, GET /api/auth/profile",
      );
      console.log("  - 产品相关: GET /api/products, GET /api/products/:id");
      console.log("  - 购物车相关: GET /api/cart, POST /api/cart");
      console.log("  - 订单相关: POST /api/orders, GET /api/orders");
      console.log(
        "  - 用户相关: GET /api/users/addresses, GET /api/users/history",
      );
    });
  } catch (error) {
    console.error("启动服务器失败:", error);
    process.exit(1);
  }
};

startServer();
