const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Product = require("./Product");
const Order = require("./Order");

const Review = sequelize.define(
  "Review",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "用户ID",
    },
    ProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "商品ID",
    },
    OrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "订单ID",
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
      comment: "评分 1-5",
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "评价内容",
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
      comment: "审核状态",
    },
  },
  {
    tableName: "reviews",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    comment: "商品评价表",
  },
);

// 关联关系
Review.belongsTo(User, { foreignKey: "UserId" });
Review.belongsTo(Product, { foreignKey: "ProductId" });
Review.belongsTo(Order, { foreignKey: "OrderId" });

User.hasMany(Review, { foreignKey: "UserId" });
Product.hasMany(Review, { foreignKey: "ProductId" });
Order.hasMany(Review, { foreignKey: "OrderId" });

module.exports = Review;
