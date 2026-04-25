const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Coupon = sequelize.define(
  "Coupon",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: "优惠券码",
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "优惠券名称",
    },
    type: {
      type: DataTypes.ENUM("percentage", "fixed"),
      allowNull: false,
      comment: "优惠券类型：percentage-百分比，fixed-固定金额",
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "优惠值（百分比或固定金额）",
    },
    min_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: "最低消费金额",
    },
    max_discount: {
      type: DataTypes.DECIMAL(10, 2),
      comment: "最大优惠金额（百分比类型时使用）",
    },
    total_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "优惠券总数",
    },
    used_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "已使用数量",
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "开始日期",
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "结束日期",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "expired"),
      defaultValue: "active",
      comment: "状态",
    },
  },
  {
    tableName: "coupons",
    timestamps: true,
    comment: "优惠券表",
  },
);

module.exports = Coupon;
