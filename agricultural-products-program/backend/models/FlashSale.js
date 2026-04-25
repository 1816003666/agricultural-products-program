const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FlashSale = sequelize.define(
  "FlashSale",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "限时活动名称",
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "开始时间",
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "结束时间",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "expired"),
      defaultValue: "inactive",
      comment: "状态",
    },
  },
  {
    tableName: "flash_sales",
    timestamps: true,
    comment: "限时折扣活动表",
  },
);

module.exports = FlashSale;