const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  artworkId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: true },
  }, 
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      isEmail: true,
      notEmpty: true,
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
}, {
  tableName: 'comments',
  timestamps: true,
});

module.exports = Comment;