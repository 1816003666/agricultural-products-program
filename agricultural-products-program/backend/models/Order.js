const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Address = require("./Address");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    address_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Address,
        key: "id",
      },
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "paid",
        "shipping",
        "delivered",
        "cancelled",
        "refunded",
      ),
      defaultValue: "pending",
    },
    tracking_number: {
      type: DataTypes.STRING(100),
    },
    paid_at: {
      type: DataTypes.DATE,
    },
    delivered_at: {
      type: DataTypes.DATE,
    },
    refunded_at: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

// 关联关系
Order.belongsTo(User, { foreignKey: "user_id" });
Order.belongsTo(Address, { foreignKey: "address_id" });
User.hasMany(Order, { foreignKey: "user_id" });

module.exports = Order;
