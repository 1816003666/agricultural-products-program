const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FlashSaleProduct = sequelize.define(
  "FlashSaleProduct",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    flash_sale_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "flash_sales",
        key: "id",
      },
      onDelete: "CASCADE",
      comment: "限时活动ID",
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
      onDelete: "CASCADE",
      comment: "商品ID",
    },
    discount: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      comment: "折扣百分比",
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "活动库存",
    },
    sold: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "已售数量",
    },
  },
  {
    tableName: "flash_sale_products",
    timestamps: true,
    comment: "限时折扣商品关联表",
  },
);

module.exports = FlashSaleProduct;