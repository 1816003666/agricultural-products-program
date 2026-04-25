const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const OperationLog = sequelize.define(
  "OperationLog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "操作用户ID",
      field: "user_id",
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "操作类型",
    },
    target_type: {
      type: DataTypes.STRING(50),
      comment: "操作对象类型",
    },
    target_id: {
      type: DataTypes.INTEGER,
      comment: "操作对象ID",
    },
    description: {
      type: DataTypes.TEXT,
      comment: "操作描述",
    },
    ip_address: {
      type: DataTypes.STRING(50),
      comment: "IP地址",
    },
    user_agent: {
      type: DataTypes.STRING(500),
      comment: "用户代理",
    },
  },
  {
    tableName: "operation_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
    comment: "操作日志表",
  },
);

// 关联关系
OperationLog.belongsTo(User, { foreignKey: "UserId" });
User.hasMany(OperationLog, { foreignKey: "UserId" });

module.exports = OperationLog;
