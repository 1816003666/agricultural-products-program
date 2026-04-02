const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');

const History = sequelize.define('History', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'id'
    }
  }
}, {
  tableName: 'histories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// 关联关系
History.belongsTo(User, { foreignKey: 'user_id' });
History.belongsTo(Product, { foreignKey: 'product_id' });
User.hasMany(History, { foreignKey: 'user_id' });

module.exports = History;
