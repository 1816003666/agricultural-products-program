const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SalesRule = sequelize.define(
  "SalesRule",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "活动名称",
    },
    type: {
      type: DataTypes.ENUM("满减", "满折"),
      allowNull: false,
      comment: "活动类型",
    },
    min_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "最低消费金额",
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "优惠金额或折扣百分比",
    },
    max_discount: {
      type: DataTypes.DECIMAL(10, 2),
      comment: "最大优惠金额（满折时使用）",
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
    tableName: "sales_rules",
    timestamps: true,
    comment: "促销规则表",
  },
);

module.exports = SalesRule;