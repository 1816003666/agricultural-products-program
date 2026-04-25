const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Product = require("./Product");

const Favorite = sequelize.define(
  "Favorite",
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
      references: {
        model: User,
        key: "id",
      },
      field: "user_id",
    },
    ProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "商品ID",
      references: {
        model: Product,
        key: "id",
      },
      field: "product_id",
    },
  },
  {
    tableName: "favorites",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
    comment: "商品收藏表",
  },
);

// 关联关系
Favorite.belongsTo(User, { foreignKey: "UserId" });
Favorite.belongsTo(Product, { foreignKey: "ProductId" });
User.hasMany(Favorite, { foreignKey: "UserId" });
Product.hasMany(Favorite, { foreignKey: "ProductId" });

module.exports = Favorite;
