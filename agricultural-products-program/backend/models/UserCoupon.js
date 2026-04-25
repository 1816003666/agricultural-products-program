const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserCoupon = sequelize.define(
  "UserCoupon",
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
    CouponId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "优惠券ID",
    },
    status: {
      type: DataTypes.ENUM("unused", "used", "expired"),
      defaultValue: "unused",
      comment: "使用状态",
    },
    used_at: {
      type: DataTypes.DATE,
      comment: "使用时间",
    },
    order_id: {
      type: DataTypes.INTEGER,
      comment: "使用的订单ID",
    },
  },
  {
    tableName: "user_coupons",
    timestamps: true,
    comment: "用户优惠券表",
  },
);

module.exports = UserCoupon;
